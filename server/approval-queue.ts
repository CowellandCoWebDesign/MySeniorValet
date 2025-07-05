/**
 * Approval Queue System
 * Handles communities that can't be automatically added to the main database
 */

import { db } from './db';
import { pendingCommunities } from '../shared/schema';
import type { InsertPendingCommunity } from '../shared/schema';

export interface CommunityForApproval {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  googlePlacesId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  careTypes?: string[];
  latitude?: number;
  longitude?: number;
  reviewReason: string;
  reviewNotes?: string;
  discoverySource: string;
  discoveryQuery?: string;
  discoveryLocation?: string;
}

export class ApprovalQueue {
  /**
   * Add a community to the approval queue for manual review
   */
  async addToQueue(communityData: CommunityForApproval): Promise<{ success: boolean; pendingId?: number; error?: string }> {
    try {
      const pendingData: InsertPendingCommunity = {
        name: communityData.name,
        address: communityData.address,
        city: communityData.city,
        state: communityData.state,
        zipCode: communityData.zipCode || null,
        phone: communityData.phone || null,
        website: communityData.website || null,
        googlePlacesId: communityData.googlePlacesId || null,
        googleRating: communityData.googleRating ? communityData.googleRating.toString() : null,
        googleReviewCount: communityData.googleReviewCount || null,
        careTypes: communityData.careTypes || [],
        latitude: communityData.latitude ? communityData.latitude.toString() : null,
        longitude: communityData.longitude ? communityData.longitude.toString() : null,
        reviewReason: communityData.reviewReason,
        reviewNotes: communityData.reviewNotes || null,
        discoverySource: communityData.discoverySource,
        discoveryQuery: communityData.discoveryQuery || null,
        discoveryLocation: communityData.discoveryLocation || null,
        status: 'Pending',
      };

      const [pending] = await db
        .insert(pendingCommunities)
        .values(pendingData)
        .returning();

      console.log(`✅ Added to approval queue: ${communityData.name} (ID: ${pending.id})`);
      
      return { 
        success: true, 
        pendingId: pending.id 
      };
    } catch (error) {
      console.error('❌ Failed to add to approval queue:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Helper function to handle failed community additions
   */
  async handleFailedAddition(
    communityData: any, 
    reason: string, 
    source: string = 'Regional Expansion',
    notes?: string
  ): Promise<void> {
    const queueData: CommunityForApproval = {
      name: communityData.name || 'Unknown Name',
      address: communityData.address || 'Unknown Address',
      city: communityData.city || 'Unknown City',
      state: communityData.state || 'CA',
      zipCode: communityData.zipCode,
      phone: communityData.phone,
      website: communityData.website,
      googlePlacesId: communityData.googlePlacesId,
      googleRating: communityData.googleRating,
      googleReviewCount: communityData.googleReviewCount,
      careTypes: communityData.careTypes,
      latitude: communityData.latitude,
      longitude: communityData.longitude,
      reviewReason: reason,
      reviewNotes: notes,
      discoverySource: source,
      discoveryQuery: communityData.discoveryQuery,
      discoveryLocation: communityData.discoveryLocation,
    };

    await this.addToQueue(queueData);
  }

  /**
   * Get approval queue statistics
   */
  async getQueueStats(): Promise<{ total: number; pending: number; underReview: number }> {
    try {
      const result = await db
        .select({
          status: pendingCommunities.status,
          count: db.sql<number>`count(*)::int`,
        })
        .from(pendingCommunities)
        .groupBy(pendingCommunities.status);

      const stats = { total: 0, pending: 0, underReview: 0 };
      
      result.forEach(row => {
        stats.total += row.count;
        if (row.status === 'Pending') stats.pending += row.count;
        if (row.status === 'Under Review') stats.underReview += row.count;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return { total: 0, pending: 0, underReview: 0 };
    }
  }
}

export const approvalQueue = new ApprovalQueue();