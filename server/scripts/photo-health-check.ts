#!/usr/bin/env tsx

/**
 * Photo Health Check Script
 * 
 * This script performs comprehensive photo validation across the MySeniorValet platform
 * and provides detailed reports on photo quality issues.
 * 
 * Usage:
 * npm run photo-health-check [options]
 * 
 * Options:
 * --cleanup : Automatically remove invalid photos
 * --limit=N : Limit to N communities (default: 100)
 * --priority=high : Only check high-priority communities
 */

import { photoValidationService } from '../services/photo-validation';
import { db } from '../db';
import { communities } from '@shared/schema';
import { isNotNull } from 'drizzle-orm';

interface HealthCheckOptions {
  cleanup?: boolean;
  limit?: number;
  priority?: 'high' | 'medium' | 'low';
  verbose?: boolean;
}

class PhotoHealthChecker {
  private options: HealthCheckOptions;

  constructor(options: HealthCheckOptions = {}) {
    this.options = {
      cleanup: false,
      limit: 100,
      verbose: false,
      ...options
    };
  }

  async run(): Promise<void> {
    console.log('🔍 Starting Photo Health Check...');
    console.log(`Options: ${JSON.stringify(this.options, null, 2)}`);

    try {
      // Get platform statistics
      const platformStats = await photoValidationService.getPlatformPhotoStats();
      console.log('\n📊 Platform Photo Statistics:');
      console.log(`  Total Communities: ${platformStats.totalCommunities.toLocaleString()}`);
      console.log(`  Communities with Photos: ${platformStats.communitiesWithPhotos.toLocaleString()}`);
      console.log(`  Communities without Photos: ${platformStats.communitiesWithoutPhotos.toLocaleString()}`);
      console.log(`  Average Photos per Community: ${platformStats.averagePhotosPerCommunity.toFixed(1)}`);

      // Get communities to check
      const communityLimit = this.options.limit || 100;
      const communitiesToCheck = await this.getCommunitiesToCheck(communityLimit);

      console.log(`\n🎯 Checking ${communitiesToCheck.length} communities...`);

      const reports = await this.validateCommunities(communitiesToCheck);
      await this.generateSummaryReport(reports);

      if (this.options.cleanup) {
        await this.performCleanup(reports);
      }

      console.log('\n✅ Photo Health Check Complete!');

    } catch (error) {
      console.error('❌ Photo Health Check Failed:', error);
      process.exit(1);
    }
  }

  private async getCommunitiesToCheck(limit: number): Promise<Array<{ id: number; name: string; photos: string[] }>> {
    const query = db
      .select({
        id: communities.id,
        name: communities.name,
        photos: communities.photos
      })
      .from(communities)
      .where(isNotNull(communities.photos))
      .limit(limit);

    const results = await query;
    return results.filter(c => (c.photos || []).length > 0);
  }

  private async validateCommunities(communitiesToCheck: Array<{ id: number; name: string; photos: string[] }>) {
    const reports = [];
    const batchSize = 10;

    for (let i = 0; i < communitiesToCheck.length; i += batchSize) {
      const batch = communitiesToCheck.slice(i, i + batchSize);
      console.log(`\n📸 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(communitiesToCheck.length / batchSize)}...`);

      const batchReports = await Promise.allSettled(
        batch.map(async (community) => {
          if (this.options.verbose) {
            console.log(`  Validating: ${community.name} (${community.photos.length} photos)`);
          }
          return await photoValidationService.validateCommunityPhotos(community.id);
        })
      );

      for (const result of batchReports) {
        if (result.status === 'fulfilled') {
          reports.push(result.value);
        } else {
          console.warn(`  ⚠️ Validation failed: ${result.reason}`);
        }
      }

      // Brief pause between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return reports;
  }

  private async generateSummaryReport(reports: any[]) {
    console.log('\n📋 SUMMARY REPORT');
    console.log('================');

    const summary = {
      totalCommunities: reports.length,
      totalPhotos: reports.reduce((sum, r) => sum + r.totalPhotos, 0),
      totalValidPhotos: reports.reduce((sum, r) => sum + r.validPhotos, 0),
      totalInvalidPhotos: reports.reduce((sum, r) => sum + r.invalidPhotos, 0),
      communitiesWithIssues: reports.filter(r => r.invalidPhotos > 0).length,
      criticalCommunities: reports.filter(r => (r.invalidPhotos / r.totalPhotos) > 0.5).length
    };

    console.log(`Communities Checked: ${summary.totalCommunities}`);
    console.log(`Total Photos: ${summary.totalPhotos.toLocaleString()}`);
    console.log(`Valid Photos: ${summary.totalValidPhotos.toLocaleString()} (${Math.round((summary.totalValidPhotos / summary.totalPhotos) * 100)}%)`);
    console.log(`Invalid Photos: ${summary.totalInvalidPhotos.toLocaleString()} (${Math.round((summary.totalInvalidPhotos / summary.totalPhotos) * 100)}%)`);
    console.log(`Communities with Issues: ${summary.communitiesWithIssues} (${Math.round((summary.communitiesWithIssues / summary.totalCommunities) * 100)}%)`);
    console.log(`Critical Communities (>50% invalid): ${summary.criticalCommunities}`);

    // Top issues
    console.log('\n🔍 TOP ISSUES FOUND:');
    const allIssues = reports.flatMap(r => r.issues);
    const issueGroups = this.groupIssues(allIssues);
    
    Object.entries(issueGroups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([issue, count]) => {
        console.log(`  ${count}x ${issue}`);
      });

    // Communities needing immediate attention
    const criticalCommunities = reports
      .filter(r => (r.invalidPhotos / r.totalPhotos) > 0.5)
      .sort((a, b) => (b.invalidPhotos / b.totalPhotos) - (a.invalidPhotos / a.totalPhotos))
      .slice(0, 10);

    if (criticalCommunities.length > 0) {
      console.log('\n🚨 CRITICAL COMMUNITIES (requiring immediate attention):');
      criticalCommunities.forEach(community => {
        const invalidPercentage = Math.round((community.invalidPhotos / community.totalPhotos) * 100);
        console.log(`  ${community.communityName} (ID: ${community.communityId}): ${invalidPercentage}% invalid (${community.invalidPhotos}/${community.totalPhotos})`);
      });
    }
  }

  private groupIssues(issues: string[]): Record<string, number> {
    const groups: Record<string, number> = {};
    
    issues.forEach(issue => {
      // Normalize common error types
      let normalizedIssue = issue;
      
      if (issue.includes('HTTP 404') || issue.includes('Not Found')) {
        normalizedIssue = 'HTTP 404: Not Found';
      } else if (issue.includes('HTTP 403') || issue.includes('Forbidden')) {
        normalizedIssue = 'HTTP 403: Forbidden';
      } else if (issue.includes('HTTP 500')) {
        normalizedIssue = 'HTTP 500: Server Error';
      } else if (issue.includes('timeout') || issue.includes('Request timeout')) {
        normalizedIssue = 'Request Timeout';
      } else if (issue.includes('Invalid URL format')) {
        normalizedIssue = 'Invalid URL Format';
      } else if (issue.includes('Invalid file extension')) {
        normalizedIssue = 'Invalid File Extension';
      } else if (issue.includes('Invalid content type')) {
        normalizedIssue = 'Invalid Content Type';
      } else if (issue.includes('File too small')) {
        normalizedIssue = 'File Too Small';
      } else if (issue.includes('File too large')) {
        normalizedIssue = 'File Too Large';
      } else if (issue.includes('Network error')) {
        normalizedIssue = 'Network Error';
      }

      groups[normalizedIssue] = (groups[normalizedIssue] || 0) + 1;
    });

    return groups;
  }

  private async performCleanup(reports: any[]) {
    console.log('\n🧹 PERFORMING CLEANUP...');
    
    const communitiesNeedingCleanup = reports.filter(r => r.invalidPhotos > 0);
    console.log(`Communities to clean: ${communitiesNeedingCleanup.length}`);

    let totalCleaned = 0;
    let totalRemaining = 0;

    for (const report of communitiesNeedingCleanup) {
      try {
        console.log(`Cleaning: ${report.communityName}...`);
        const result = await photoValidationService.cleanupInvalidPhotos(report.communityId);
        totalCleaned += result.removed;
        totalRemaining += result.remaining;
        
        if (result.removed > 0) {
          console.log(`  ✅ Removed ${result.removed} invalid photos, ${result.remaining} remaining`);
        }
      } catch (error) {
        console.error(`  ❌ Cleanup failed for ${report.communityName}:`, error);
      }
    }

    console.log(`\nCleanup Complete:`);
    console.log(`  Total photos removed: ${totalCleaned}`);
    console.log(`  Total photos remaining: ${totalRemaining}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options: HealthCheckOptions = {};

  args.forEach(arg => {
    if (arg === '--cleanup') {
      options.cleanup = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--priority=')) {
      options.priority = arg.split('=')[1] as 'high' | 'medium' | 'low';
    }
  });

  const checker = new PhotoHealthChecker(options);
  await checker.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { PhotoHealthChecker };