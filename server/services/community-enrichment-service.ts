/**
 * Community Enrichment Service — Free Pipeline
 * ============================================
 * Replaces the former Perplexity + Bull/Redis enrichment pipeline with the
 * zero-cost free pipeline (Jina AI Reader + DuckDuckGo + optional Groq).
 *
 * Redis/Bull are no longer used here. Enrichment runs synchronously (via
 * setImmediate to avoid blocking the request) using the free pipeline.
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { enrichCommunityFree } from './free-enrichment-service';

const ENRICHMENT_STALE_DAYS = 7;

interface EnrichmentResult {
  content: string;
  metadata: {
    sources: Array<{ url: string; title: string }>;
    lastUpdated: Date;
    wordCount: number;
    topics: string[];
  };
  seoData: {
    metaDescription: string;
    keywords: string[];
    faqItems?: Array<{ question: string; answer: string }>;
  };
}

export class CommunityEnrichmentService {
  /**
   * Main entry point for getting enriched content for a community.
   * Checks database freshness, kicks off background free-pipeline enrichment
   * when content is stale, and always returns something.
   */
  async getEnrichedContent(communityId: number): Promise<EnrichmentResult | null> {
    try {
      const community = await db
        .select({
          id: communities.id,
          name: communities.name,
          enrichedContent: communities.enrichedContent,
          enrichedAt: communities.enrichedAt,
          city: communities.city,
          state: communities.state,
          description: communities.description,
          careTypes: communities.careTypes,
          website: communities.website,
        })
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community[0]) {
        console.error(`Community ${communityId} not found`);
        return null;
      }

      const communityData = community[0];
      const isStale = this.isContentStale(communityData.enrichedAt as Date | null);

      // Fresh enriched content — return immediately
      if (communityData.enrichedContent && !isStale) {
        console.log(`✅ Fresh enriched content found for community ${communityId}`);
        return this.parseEnrichedContent(communityData.enrichedContent);
      }

      // Stale or missing — kick off free pipeline async (non-blocking)
      console.log(`🔄 Scheduling free-pipeline enrichment for community ${communityId} (stale: ${isStale})`);
      setImmediate(async () => {
        try {
          await this.runFreePipeline(communityId, communityData);
        } catch (err) {
          console.error(`❌ Background enrichment failed for community ${communityId}:`, err);
        }
      });

      // Return existing stale content if available
      if (communityData.enrichedContent) {
        return this.parseEnrichedContent(communityData.enrichedContent);
      }

      // Fallback: synthesise basic content from DB fields
      return this.generateFallbackContent(communityData);
    } catch (error) {
      console.error(`Error getting enriched content for community ${communityId}:`, error);
      return null;
    }
  }

  /**
   * Run the free pipeline for a community and persist the result to the DB.
   */
  private async runFreePipeline(communityId: number, communityData: any): Promise<void> {
    const result = await enrichCommunityFree({
      name: communityData.name || '',
      city: communityData.city || '',
      state: communityData.state || '',
      websiteUrl: communityData.website,
    });

    const about = result.about || communityData.description || '';

    const enrichmentResult: EnrichmentResult = {
      content: about,
      metadata: {
        sources: result.sourceUrl ? [{ url: result.sourceUrl, title: 'Official Website' }] : [],
        lastUpdated: new Date(),
        wordCount: about.split(/\s+/).length,
        topics: result.careTypes || [],
      },
      seoData: {
        metaDescription: `${communityData.name} offers ${(communityData.careTypes || []).join(', ') || 'senior living'} in ${communityData.city}, ${communityData.state}.`.substring(0, 160),
        keywords: [
          communityData.name,
          communityData.city,
          communityData.state,
          'senior living',
          ...(communityData.careTypes || []),
        ].filter(Boolean),
      },
    };

    await db
      .update(communities)
      .set({
        enrichedContent: enrichmentResult as any,
        enrichedAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .where(eq(communities.id, communityId));

    console.log(`💾 Free-pipeline enrichment persisted for community ${communityId} (source: ${result.sourceType})`);
  }

  /**
   * Force a synchronous re-enrichment (used by admin dashboard).
   */
  async forceRefresh(communityId: number): Promise<void> {
    const community = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community[0]) throw new Error(`Community ${communityId} not found`);
    await this.runFreePipeline(communityId, community[0]);
    console.log(`🔄 Force refresh completed for community ${communityId}`);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private isContentStale(enrichedAt: Date | null): boolean {
    if (!enrichedAt) return true;
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - ENRICHMENT_STALE_DAYS);
    return enrichedAt < staleDate;
  }

  private parseEnrichedContent(content: any): EnrichmentResult {
    try {
      if (typeof content === 'string') return JSON.parse(content);
      return content as EnrichmentResult;
    } catch {
      return {
        content: content?.toString() || '',
        metadata: { sources: [], lastUpdated: new Date(), wordCount: 0, topics: [] },
        seoData: { metaDescription: '', keywords: [] },
      };
    }
  }

  private generateFallbackContent(communityData: any): EnrichmentResult {
    const careTypes = Array.isArray(communityData.careTypes)
      ? communityData.careTypes.join(', ')
      : 'senior living';

    const content = `${communityData.name} is a ${careTypes} community located in ${communityData.city}, ${communityData.state}. ${communityData.description || ''}`.trim();

    return {
      content,
      metadata: { sources: [], lastUpdated: new Date(), wordCount: content.split(/\s+/).length, topics: [] },
      seoData: {
        metaDescription: `Learn about ${communityData.name} in ${communityData.city}, ${communityData.state} — ${careTypes} community.`.substring(0, 160),
        keywords: [communityData.name, communityData.city, communityData.state, ...careTypes.split(', ')],
      },
    };
  }
}

export const communityEnrichmentService = new CommunityEnrichmentService();
