
import { ObjectStorage } from '@replit/object-storage';

interface CommunityPhoto {
  id: string;
  communityId: string;
  url: string;
  source: 'enrichment' | 'upload' | 'api';
  metadata: {
    width: number;
    height: number;
    fileSize: number;
    uploadedAt: Date;
  };
}

interface CommunityBackup {
  timestamp: Date;
  totalCommunities: number;
  data: any[];
  version: string;
}

export class MySeniorValetStorage {
  private storage: ObjectStorage;

  constructor() {
    this.storage = new ObjectStorage();
  }

  // Photo Management
  async storeEnrichedPhoto(communityId: string, photoData: Buffer, metadata: any): Promise<string> {
    const key = `community-photos/${communityId}/${Date.now()}.jpg`;
    
    await this.storage.uploadFromBuffer(key, photoData, {
      metadata: {
        communityId,
        source: 'enrichment',
        ...metadata
      }
    });

    return key;
  }

  async getCommunityPhotos(communityId: string): Promise<string[]> {
    const prefix = `community-photos/${communityId}/`;
    const objects = await this.storage.list({ prefix });
    return objects.map(obj => obj.key);
  }

  // Data Backup & Recovery
  async backupCommunityData(communities: any[]): Promise<string> {
    const backup: CommunityBackup = {
      timestamp: new Date(),
      totalCommunities: communities.length,
      data: communities,
      version: '2.0'
    };

    const key = `backups/communities-${Date.now()}.json`;
    await this.storage.uploadFromBuffer(
      key, 
      Buffer.from(JSON.stringify(backup, null, 2)),
      {
        metadata: {
          type: 'community-backup',
          count: communities.length.toString()
        }
      }
    );

    console.log(`✅ Backed up ${communities.length} communities to ${key}`);
    return key;
  }

  // API Response Caching
  async cacheApiResponse(endpoint: string, params: string, response: any, ttl: number = 86400): Promise<void> {
    const key = `api-cache/${endpoint}/${Buffer.from(params).toString('base64')}.json`;
    
    const cacheData = {
      response,
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + ttl * 1000),
      endpoint,
      params
    };

    await this.storage.uploadFromBuffer(
      key,
      Buffer.from(JSON.stringify(cacheData)),
      {
        metadata: {
          type: 'api-cache',
          endpoint,
          ttl: ttl.toString()
        }
      }
    );
  }

  async getCachedApiResponse(endpoint: string, params: string): Promise<any | null> {
    try {
      const key = `api-cache/${endpoint}/${Buffer.from(params).toString('base64')}.json`;
      const data = await this.storage.downloadAsBuffer(key);
      const cacheData = JSON.parse(data.toString());
      
      // Check expiration
      if (new Date() > new Date(cacheData.expiresAt)) {
        await this.storage.delete(key);
        return null;
      }
      
      return cacheData.response;
    } catch (error) {
      return null;
    }
  }

  // Financial Reports Storage
  async storeFinancialReport(reportType: string, data: any): Promise<string> {
    const key = `reports/${reportType}-${Date.now()}.json`;
    
    await this.storage.uploadFromBuffer(
      key,
      Buffer.from(JSON.stringify(data, null, 2)),
      {
        metadata: {
          type: 'financial-report',
          reportType,
          generatedAt: new Date().toISOString()
        }
      }
    );

    return key;
  }

  // Search Cache for Performance
  async cacheSearchResults(query: string, results: any[]): Promise<void> {
    const key = `search-cache/${Buffer.from(query.toLowerCase()).toString('base64')}.json`;
    
    const searchCache = {
      query,
      results,
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      count: results.length
    };

    await this.storage.uploadFromBuffer(
      key,
      Buffer.from(JSON.stringify(searchCache)),
      {
        metadata: {
          type: 'search-cache',
          query,
          resultCount: results.length.toString()
        }
      }
    );
  }

  // Utility Methods
  async getStorageStats(): Promise<any> {
    const objects = await this.storage.list();
    
    const stats = {
      totalObjects: objects.length,
      categories: {} as Record<string, number>,
      totalSize: 0
    };

    for (const obj of objects) {
      const category = obj.key.split('/')[0];
      stats.categories[category] = (stats.categories[category] || 0) + 1;
      stats.totalSize += obj.size || 0;
    }

    return stats;
  }

  async cleanup(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const objects = await this.storage.list();
    let deletedCount = 0;

    for (const obj of objects) {
      if (new Date(obj.lastModified) < cutoffDate) {
        await this.storage.delete(obj.key);
        deletedCount++;
      }
    }

    console.log(`🧹 Cleaned up ${deletedCount} old objects`);
    return deletedCount;
  }
}

export const mySeniorValetStorage = new MySeniorValetStorage();
