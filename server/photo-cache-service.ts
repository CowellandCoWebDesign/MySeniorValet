import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { apiCostProtection } from './api-cost-protection';

export interface PhotoCacheResult {
  success: boolean;
  permanentUrl?: string;
  attribution?: string;
  error?: string;
  cached?: boolean;
}

export class PhotoCacheService {
  private static readonly PHOTOS_DIR = path.join(process.cwd(), 'client/public/photos');
  private static readonly BASE_URL = '/photos';

  constructor() {
    // Ensure photos directory exists
    this.ensurePhotosDirectory();
  }

  private ensurePhotosDirectory(): void {
    if (!fs.existsSync(PhotoCacheService.PHOTOS_DIR)) {
      fs.mkdirSync(PhotoCacheService.PHOTOS_DIR, { recursive: true });
      console.log(`📁 Created photos directory: ${PhotoCacheService.PHOTOS_DIR}`);
    }
  }

  /**
   * Download and cache a Google Places photo
   */
  async downloadAndCacheGooglePhoto(
    photoReference: string, 
    communityId: number, 
    index: number,
    attribution?: string
  ): Promise<PhotoCacheResult> {
    try {
      // Check if photo already exists
      const filename = `${communityId}-${index}.jpg`;
      const filepath = path.join(PhotoCacheService.PHOTOS_DIR, filename);
      const permanentUrl = `${PhotoCacheService.BASE_URL}/${filename}`;

      if (fs.existsSync(filepath)) {
        console.log(`📷 Photo already cached: ${filename}`);
        return {
          success: true,
          permanentUrl,
          attribution,
          cached: true
        };
      }

      // Check API cost protection before downloading
      const protection = await apiCostProtection.checkBeforeOperation(1, 0.007); // ~$0.007 per photo
      if (!protection.allowed) {
        return {
          success: false,
          error: `API protection blocked photo download: ${protection.reason}`
        };
      }

      // Build Google Places Photo API URL
      const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
      if (!googleApiKey) {
        return {
          success: false,
          error: 'Google Places API key not configured'
        };
      }

      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoReference}&maxwidth=800&key=${googleApiKey}`;

      // Download the photo
      const buffer = await this.downloadPhoto(photoUrl);
      
      // Save to local file system
      fs.writeFileSync(filepath, buffer);
      
      // Record API usage
      await apiCostProtection.recordUsage(1, 0.007, `Photo download for community ${communityId}`);

      console.log(`💾 Photo cached successfully: ${filename}`);
      
      return {
        success: true,
        permanentUrl,
        attribution,
        cached: false
      };

    } catch (error) {
      console.error(`❌ Failed to cache photo for community ${communityId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Download photo from URL and return as buffer
   */
  private downloadPhoto(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      
      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const chunks: Buffer[] = [];
        
        response.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
        
        response.on('error', (error) => {
          reject(error);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Get cached photo stats
   */
  async getCacheStats(): Promise<{
    totalPhotos: number;
    totalSize: number;
    cacheDirectory: string;
  }> {
    const files = fs.readdirSync(PhotoCacheService.PHOTOS_DIR);
    const photoFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'));
    
    let totalSize = 0;
    for (const file of photoFiles) {
      const filepath = path.join(PhotoCacheService.PHOTOS_DIR, file);
      const stats = fs.statSync(filepath);
      totalSize += stats.size;
    }

    return {
      totalPhotos: photoFiles.length,
      totalSize,
      cacheDirectory: PhotoCacheService.PHOTOS_DIR
    };
  }

  /**
   * Clean up old cached photos
   */
  async cleanupOldPhotos(maxAgeInDays: number = 30): Promise<number> {
    const files = fs.readdirSync(PhotoCacheService.PHOTOS_DIR);
    const cutoffDate = new Date(Date.now() - (maxAgeInDays * 24 * 60 * 60 * 1000));
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filepath = path.join(PhotoCacheService.PHOTOS_DIR, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filepath);
        deletedCount++;
      }
    }

    console.log(`🗑️ Cleaned up ${deletedCount} old photos`);
    return deletedCount;
  }
}

export const photoCacheService = new PhotoCacheService();