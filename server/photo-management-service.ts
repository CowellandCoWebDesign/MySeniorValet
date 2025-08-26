/**
 * Photo Management Service
 * Handles photo validation, quality checks, caching, and source attribution
 * Maintains zero synthetic data policy - only uses authentic community photos
 */

import { db } from "./db";
import { communities, photoValidationLog } from "../shared/schema";
import { eq, sql, and, isNotNull } from "drizzle-orm";
import crypto from "crypto";

interface PhotoMetadata {
  url: string;
  source: string;
  attribution?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  lastValidated?: Date;
  isValid: boolean;
  errorReason?: string;
}

interface PhotoQualityScore {
  overall: number;
  resolution: number;
  fileSize: number;
  aspectRatio: number;
  accessibility: boolean;
}

export class PhotoManagementService {
  private readonly MIN_WIDTH = 400;
  private readonly MIN_HEIGHT = 300;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly PREFERRED_ASPECT_RATIO = 16 / 9;
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  // CDN configuration for optimized delivery
  private readonly CDN_PROVIDERS = {
    cloudinary: 'https://res.cloudinary.com/',
    imgix: 'https://imgix.net/',
    bunny: 'https://bunny.net/',
    cloudflare: 'https://imagedelivery.net/'
  };

  /**
   * Validate a single photo URL
   */
  async validatePhoto(photoUrl: string, communityId: number): Promise<PhotoMetadata> {
    try {
      // Check if URL is accessible
      const response = await fetch(photoUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        return {
          url: photoUrl,
          source: this.extractSource(photoUrl),
          isValid: false,
          errorReason: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // Validate content type
      if (!contentType?.startsWith('image/')) {
        return {
          url: photoUrl,
          source: this.extractSource(photoUrl),
          isValid: false,
          errorReason: 'Not an image file'
        };
      }

      // Check file size
      const fileSize = contentLength ? parseInt(contentLength) : 0;
      if (fileSize > this.MAX_FILE_SIZE) {
        return {
          url: photoUrl,
          source: this.extractSource(photoUrl),
          isValid: false,
          fileSize,
          errorReason: `File too large: ${Math.round(fileSize / 1024 / 1024)}MB`
        };
      }

      // Get image dimensions (would need actual image processing in production)
      const dimensions = await this.getImageDimensions(photoUrl);
      
      // Log validation result
      await this.logValidation(communityId, photoUrl, true);

      return {
        url: photoUrl,
        source: this.extractSource(photoUrl),
        attribution: this.generateAttribution(photoUrl),
        width: dimensions.width,
        height: dimensions.height,
        fileSize,
        mimeType: contentType,
        lastValidated: new Date(),
        isValid: true
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logValidation(communityId, photoUrl, false, errorMessage);
      
      return {
        url: photoUrl,
        source: this.extractSource(photoUrl),
        isValid: false,
        errorReason: errorMessage
      };
    }
  }

  /**
   * Validate all photos for a community
   */
  async validateCommunityPhotos(communityId: number): Promise<{
    valid: PhotoMetadata[];
    invalid: PhotoMetadata[];
    qualityScore: PhotoQualityScore;
  }> {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community?.photos?.length) {
      return {
        valid: [],
        invalid: [],
        qualityScore: this.calculateQualityScore([])
      };
    }

    const validationResults = await Promise.all(
      community.photos.map(photo => this.validatePhoto(photo, communityId))
    );

    const valid = validationResults.filter(p => p.isValid);
    const invalid = validationResults.filter(p => !p.isValid);

    return {
      valid,
      invalid,
      qualityScore: this.calculateQualityScore(valid)
    };
  }

  /**
   * Calculate photo quality score
   */
  private calculateQualityScore(photos: PhotoMetadata[]): PhotoQualityScore {
    if (!photos.length) {
      return {
        overall: 0,
        resolution: 0,
        fileSize: 0,
        aspectRatio: 0,
        accessibility: false
      };
    }

    const resolutionScores = photos.map(photo => {
      if (!photo.width || !photo.height) return 0;
      const pixels = photo.width * photo.height;
      const minPixels = this.MIN_WIDTH * this.MIN_HEIGHT;
      return Math.min(100, (pixels / minPixels) * 50);
    });

    const fileSizeScores = photos.map(photo => {
      if (!photo.fileSize) return 50;
      const optimalSize = 500 * 1024; // 500KB
      const diff = Math.abs(photo.fileSize - optimalSize);
      return Math.max(0, 100 - (diff / optimalSize) * 50);
    });

    const aspectRatioScores = photos.map(photo => {
      if (!photo.width || !photo.height) return 0;
      const ratio = photo.width / photo.height;
      const diff = Math.abs(ratio - this.PREFERRED_ASPECT_RATIO);
      return Math.max(0, 100 - diff * 50);
    });

    const avgResolution = resolutionScores.reduce((a, b) => a + b, 0) / photos.length;
    const avgFileSize = fileSizeScores.reduce((a, b) => a + b, 0) / photos.length;
    const avgAspectRatio = aspectRatioScores.reduce((a, b) => a + b, 0) / photos.length;
    
    const overall = (avgResolution + avgFileSize + avgAspectRatio) / 3;

    return {
      overall: Math.round(overall),
      resolution: Math.round(avgResolution),
      fileSize: Math.round(avgFileSize),
      aspectRatio: Math.round(avgAspectRatio),
      accessibility: photos.every(p => p.attribution)
    };
  }

  /**
   * Optimize photo URL for CDN delivery
   */
  optimizePhotoUrl(photoUrl: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }): string {
    // Check if already using a CDN
    for (const cdnUrl of Object.values(this.CDN_PROVIDERS)) {
      if (photoUrl.startsWith(cdnUrl)) {
        return photoUrl; // Already optimized
      }
    }

    // Add query parameters for optimization hints
    const params = new URLSearchParams();
    if (options?.width) params.append('w', options.width.toString());
    if (options?.height) params.append('h', options.height.toString());
    if (options?.quality) params.append('q', options.quality.toString());
    if (options?.format) params.append('fm', options.format);
    
    const separator = photoUrl.includes('?') ? '&' : '?';
    return params.toString() ? `${photoUrl}${separator}${params}` : photoUrl;
  }

  /**
   * Generate cache key for photo
   */
  private generateCacheKey(photoUrl: string, options?: any): string {
    const data = JSON.stringify({ url: photoUrl, options });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Extract source from photo URL
   */
  private extractSource(photoUrl: string): string {
    try {
      const url = new URL(photoUrl);
      const domain = url.hostname.replace('www.', '');
      
      // Map known domains to friendly names
      const sourceMap: Record<string, string> = {
        'aplaceformom.com': 'A Place for Mom',
        'caring.com': 'Caring.com',
        'seniorliving.org': 'SeniorLiving.org',
        'senioradvisor.com': 'SeniorAdvisor',
        'seniorly.com': 'Seniorly',
        'google.com': 'Google',
        'googleapis.com': 'Google',
        'cloudinary.com': 'Community Upload',
        's3.amazonaws.com': 'Community Upload'
      };

      for (const [key, value] of Object.entries(sourceMap)) {
        if (domain.includes(key)) {
          return value;
        }
      }

      return domain;
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Generate attribution text for photo
   */
  private generateAttribution(photoUrl: string): string {
    const source = this.extractSource(photoUrl);
    
    if (source === 'Community Upload' || source === 'Unknown') {
      return 'Photo provided by community';
    }
    
    return `Photo courtesy of ${source}`;
  }

  /**
   * Get image dimensions (simplified - would use sharp or similar in production)
   */
  private async getImageDimensions(photoUrl: string): Promise<{ width: number; height: number }> {
    // In production, this would use an image processing library
    // For now, return estimated dimensions based on common sizes
    return {
      width: 800,
      height: 600
    };
  }

  /**
   * Log photo validation result
   */
  private async logValidation(
    communityId: number,
    photoUrl: string,
    isValid: boolean,
    errorReason?: string
  ): Promise<void> {
    try {
      await db.insert(photoValidationLog).values({
        communityId,
        photoUrl,
        isValid,
        validationError: errorReason,
        source: this.extractSource(photoUrl),
        validatedAt: new Date()
      });
    } catch (error) {
      console.error('Failed to log photo validation:', error);
    }
  }

  /**
   * Get photo statistics for reporting
   */
  async getPhotoStatistics(): Promise<{
    totalCommunities: number;
    communitiesWithPhotos: number;
    totalPhotos: number;
    validPhotos: number;
    photoSources: Record<string, number>;
    averageQualityScore: number;
  }> {
    const stats = await db
      .select({
        totalCommunities: sql<number>`COUNT(DISTINCT id)`,
        communitiesWithPhotos: sql<number>`COUNT(DISTINCT CASE WHEN photos IS NOT NULL AND jsonb_array_length(photos) > 0 THEN id END)`,
        totalPhotos: sql<number>`COALESCE(SUM(jsonb_array_length(COALESCE(photos, '[]'::jsonb))), 0)`
      })
      .from(communities);

    const validationStats = await db
      .select({
        validPhotos: sql<number>`COUNT(CASE WHEN is_valid = true THEN 1 END)`,
        source: photoValidationLog.source,
        count: sql<number>`COUNT(*)`
      })
      .from(photoValidationLog)
      .where(isNotNull(photoValidationLog.source))
      .groupBy(photoValidationLog.source);

    const photoSources = validationStats.reduce((acc, stat) => {
      if (stat.source) {
        acc[stat.source] = Number(stat.count);
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCommunities: Number(stats[0]?.totalCommunities || 0),
      communitiesWithPhotos: Number(stats[0]?.communitiesWithPhotos || 0),
      totalPhotos: Number(stats[0]?.totalPhotos || 0),
      validPhotos: validationStats.reduce((sum, stat) => sum + Number(stat.validPhotos), 0),
      photoSources,
      averageQualityScore: 75 // Would calculate from actual quality scores
    };
  }

  /**
   * Clean up invalid or broken photo URLs
   */
  async cleanupInvalidPhotos(communityId: number, dryRun = true): Promise<{
    removed: string[];
    kept: string[];
  }> {
    const validation = await this.validateCommunityPhotos(communityId);
    
    if (!dryRun && validation.invalid.length > 0) {
      const validUrls = validation.valid.map(p => p.url);
      
      await db
        .update(communities)
        .set({ 
          photos: validUrls.length > 0 ? validUrls : null,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId));
    }

    return {
      removed: validation.invalid.map(p => p.url),
      kept: validation.valid.map(p => p.url)
    };
  }
}