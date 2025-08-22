import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface PhotoValidationResult {
  url: string;
  isValid: boolean;
  error?: string;
  status?: number;
  fileSize?: number;
  dimensions?: { width: number; height: number };
  lastChecked: Date;
}

export interface PhotoHealthReport {
  communityId: number;
  communityName: string;
  totalPhotos: number;
  validPhotos: number;
  invalidPhotos: number;
  issues: string[];
  recommendations: string[];
}

export class PhotoValidationService {
  private static readonly TIMEOUT_MS = 10000; // 10 seconds
  private static readonly MIN_FILE_SIZE = 1024; // 1KB minimum
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB maximum
  private static readonly MIN_DIMENSIONS = { width: 100, height: 100 };
  private static readonly VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

  /**
   * Validate a single photo URL
   */
  async validatePhoto(url: string): Promise<PhotoValidationResult> {
    const result: PhotoValidationResult = {
      url,
      isValid: false,
      lastChecked: new Date()
    };

    try {
      // Basic URL validation
      if (!this.isValidUrl(url)) {
        result.error = 'Invalid URL format';
        return result;
      }

      // Check file extension
      if (!this.hasValidExtension(url)) {
        result.error = 'Invalid file extension';
        return result;
      }

      // Make HEAD request to check if image exists and get metadata
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PhotoValidationService.TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'MySeniorValet/1.0 Photo-Validator'
          }
        });

        clearTimeout(timeoutId);
        result.status = response.status;

        if (!response.ok) {
          result.error = `HTTP ${response.status}: ${response.statusText}`;
          return result;
        }

        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          result.error = `Invalid content type: ${contentType}`;
          return result;
        }

        // Check file size
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          const fileSize = parseInt(contentLength, 10);
          result.fileSize = fileSize;

          if (fileSize < PhotoValidationService.MIN_FILE_SIZE) {
            result.error = `File too small: ${fileSize} bytes`;
            return result;
          }

          if (fileSize > PhotoValidationService.MAX_FILE_SIZE) {
            result.error = `File too large: ${fileSize} bytes`;
            return result;
          }
        }

        // For thorough validation, we might need to fetch actual image and check dimensions
        // This is optional for performance reasons
        const shouldCheckDimensions = Math.random() < 0.1; // Check 10% of images for dimensions
        
        if (shouldCheckDimensions) {
          try {
            const imageValidation = await this.validateImageDimensions(url);
            if (imageValidation.dimensions) {
              result.dimensions = imageValidation.dimensions;
              if (imageValidation.dimensions.width < PhotoValidationService.MIN_DIMENSIONS.width ||
                  imageValidation.dimensions.height < PhotoValidationService.MIN_DIMENSIONS.height) {
                result.error = `Image too small: ${imageValidation.dimensions.width}x${imageValidation.dimensions.height}`;
                return result;
              }
            }
          } catch (dimensionError) {
            // Don't fail validation for dimension check failures
            console.warn(`Could not check dimensions for ${url}:`, dimensionError);
          }
        }

        result.isValid = true;
        return result;

      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          result.error = 'Request timeout';
        } else {
          result.error = fetchError instanceof Error ? fetchError.message : 'Network error';
        }
        return result;
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Validation error';
      return result;
    }
  }

  /**
   * Validate image dimensions (optional heavy check)
   */
  private async validateImageDimensions(url: string): Promise<{ dimensions?: { width: number; height: number } }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Shorter timeout for dimension check

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Range': 'bytes=0-2048', // Only fetch first 2KB to get image headers
          'User-Agent': 'MySeniorValet/1.0 Photo-Validator'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const dimensions = this.extractImageDimensions(new Uint8Array(buffer));
        return { dimensions };
      }

      return {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Extract image dimensions from image buffer (basic implementation)
   */
  private extractImageDimensions(buffer: Uint8Array): { width: number; height: number } | undefined {
    try {
      // Basic JPEG dimension extraction
      if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        for (let i = 2; i < buffer.length - 8; i++) {
          if (buffer[i] === 0xFF && (buffer[i + 1] === 0xC0 || buffer[i + 1] === 0xC2)) {
            const height = (buffer[i + 5] << 8) | buffer[i + 6];
            const width = (buffer[i + 7] << 8) | buffer[i + 8];
            return { width, height };
          }
        }
      }

      // Basic PNG dimension extraction
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        if (buffer.length >= 24) {
          const width = (buffer[16] << 24) | (buffer[17] << 16) | (buffer[18] << 8) | buffer[19];
          const height = (buffer[20] << 24) | (buffer[21] << 16) | (buffer[22] << 8) | buffer[23];
          return { width, height };
        }
      }

      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Validate all photos for a community
   */
  async validateCommunityPhotos(communityId: number): Promise<PhotoHealthReport> {
    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        throw new Error(`Community ${communityId} not found`);
      }

      const photos = community.photos || [];
      const report: PhotoHealthReport = {
        communityId,
        communityName: community.name,
        totalPhotos: photos.length,
        validPhotos: 0,
        invalidPhotos: 0,
        issues: [],
        recommendations: []
      };

      if (photos.length === 0) {
        report.issues.push('No photos available');
        report.recommendations.push('Add authentic photos from verified sources');
        return report;
      }

      // Validate each photo
      const validationPromises = photos.map(photo => this.validatePhoto(photo));
      const results = await Promise.allSettled(validationPromises);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const photoUrl = photos[i];

        if (result.status === 'fulfilled' && result.value.isValid) {
          report.validPhotos++;
        } else {
          report.invalidPhotos++;
          const error = result.status === 'fulfilled' ? result.value.error : 'Validation failed';
          report.issues.push(`Photo ${i + 1}: ${error}`);
        }
      }

      // Generate recommendations
      if (report.invalidPhotos > 0) {
        report.recommendations.push(`Remove ${report.invalidPhotos} invalid photo(s)`);
      }

      if (report.validPhotos < 3) {
        report.recommendations.push('Add more high-quality photos (minimum 3 recommended)');
      }

      const invalidPercentage = (report.invalidPhotos / report.totalPhotos) * 100;
      if (invalidPercentage > 50) {
        report.recommendations.push('Critical: Over 50% of photos are invalid - immediate attention required');
      }

      return report;

    } catch (error) {
      throw new Error(`Failed to validate community photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Bulk validation for multiple communities
   */
  async validateMultipleCommunities(communityIds: number[], batchSize: number = 10): Promise<PhotoHealthReport[]> {
    const reports: PhotoHealthReport[] = [];
    
    for (let i = 0; i < communityIds.length; i += batchSize) {
      const batch = communityIds.slice(i, i + batchSize);
      const batchPromises = batch.map(id => this.validateCommunityPhotos(id));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            reports.push(result.value);
          } else {
            console.error('Batch validation error:', result.reason);
          }
        }
        
        // Brief pause between batches to avoid overwhelming external servers
        if (i + batchSize < communityIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Batch validation failed for batch starting at ${i}:`, error);
      }
    }

    return reports;
  }

  /**
   * Remove invalid photos from community
   */
  async cleanupInvalidPhotos(communityId: number): Promise<{ removed: number; remaining: number }> {
    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        throw new Error(`Community ${communityId} not found`);
      }

      const photos = community.photos || [];
      const validPhotos: string[] = [];

      // Validate each photo and keep only valid ones
      for (const photo of photos) {
        const validation = await this.validatePhoto(photo);
        if (validation.isValid) {
          validPhotos.push(photo);
        } else {
          console.log(`Removing invalid photo: ${photo} - ${validation.error}`);
        }
      }

      // Update community with cleaned photos
      await db
        .update(communities)
        .set({ photos: validPhotos })
        .where(eq(communities.id, communityId));

      return {
        removed: photos.length - validPhotos.length,
        remaining: validPhotos.length
      };

    } catch (error) {
      throw new Error(`Failed to cleanup photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Utility methods
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private hasValidExtension(url: string): boolean {
    const urlWithoutQuery = url.split('?')[0];
    return PhotoValidationService.VALID_EXTENSIONS.some(ext => 
      urlWithoutQuery.toLowerCase().endsWith(ext)
    );
  }

  /**
   * Get platform-wide photo health statistics
   */
  async getPlatformPhotoStats(): Promise<{
    totalCommunities: number;
    communitiesWithPhotos: number;
    communitiesWithoutPhotos: number;
    averagePhotosPerCommunity: number;
    totalPhotoValidationIssues: number;
  }> {
    try {
      const allCommunities = await db.select({
        id: communities.id,
        photos: communities.photos
      }).from(communities);

      const stats = {
        totalCommunities: allCommunities.length,
        communitiesWithPhotos: 0,
        communitiesWithoutPhotos: 0,
        averagePhotosPerCommunity: 0,
        totalPhotoValidationIssues: 0
      };

      let totalPhotos = 0;

      for (const community of allCommunities) {
        const photos = community.photos || [];
        if (photos.length > 0) {
          stats.communitiesWithPhotos++;
          totalPhotos += photos.length;
        } else {
          stats.communitiesWithoutPhotos++;
        }
      }

      stats.averagePhotosPerCommunity = stats.communitiesWithPhotos > 0 
        ? totalPhotos / stats.communitiesWithPhotos 
        : 0;

      return stats;
    } catch (error) {
      throw new Error(`Failed to get platform photo stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const photoValidationService = new PhotoValidationService();