import { db } from "./db";
import { communities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { AnthropicAIService } from "./anthropic-ai-service";
import { perplexityService } from "./perplexity-ai-service";
import { openAIIntegration } from "./openai-integration";

const anthropicService = new AnthropicAIService();

export class AIDataQualityAnalyzer {
  async analyzeDataQuality() {
    console.log("🔍 AI Orchestra analyzing data quality...");
    
    // Get duplicate analysis
    const duplicateAnalysis = await db.execute(sql`
      SELECT 
        name,
        address,
        city,
        state,
        COUNT(*) as duplicate_count,
        STRING_AGG(id::text, ', ') as community_ids
      FROM communities
      WHERE name IS NOT NULL AND address IS NOT NULL
      GROUP BY name, address, city, state
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
      LIMIT 50
    `);

    // Get quality metrics
    const qualityMetrics = await db.execute(sql`
      WITH duplicate_stats AS (
        SELECT 
          COUNT(*) as total_communities,
          COUNT(DISTINCT (name, address, city, state)) as unique_communities,
          COUNT(*) - COUNT(DISTINCT (name, address, city, state)) as duplicate_records
        FROM communities
        WHERE name IS NOT NULL AND address IS NOT NULL
      ),
      quality_metrics AS (
        SELECT 
          COUNT(CASE WHEN phone IS NOT NULL AND LENGTH(phone) >= 10 THEN 1 END) as has_phone,
          COUNT(CASE WHEN website IS NOT NULL THEN 1 END) as has_website,
          COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as has_coordinates,
          COUNT(CASE WHEN care_types IS NOT NULL AND array_length(care_types, 1) > 0 THEN 1 END) as has_care_types,
          COUNT(CASE WHEN amenities IS NOT NULL AND array_length(amenities, 1) > 0 THEN 1 END) as has_amenities,
          COUNT(CASE WHEN photos IS NOT NULL AND array_length(photos, 1) > 0 THEN 1 END) as has_photos
        FROM communities
      )
      SELECT * FROM duplicate_stats, quality_metrics
    `);

    const metrics = qualityMetrics.rows[0];
    const duplicates = duplicateAnalysis.rows;

    // Claude AI Analysis
    let claudeAnalysis = "";
    try {
      const claudeResponse = await anthropicService.analyzeWithClaude(
        `Analyze this senior living data quality report:
        - Total communities: ${metrics.total_communities}
        - Unique communities: ${metrics.unique_communities}
        - Duplicate records: ${metrics.duplicate_records} (${((metrics.duplicate_records / metrics.total_communities) * 100).toFixed(2)}%)
        - Has phone: ${metrics.has_phone} (${((metrics.has_phone / metrics.total_communities) * 100).toFixed(1)}%)
        - Has website: ${metrics.has_website} (${((metrics.has_website / metrics.total_communities) * 100).toFixed(1)}%)
        - Has coordinates: ${metrics.has_coordinates} (${((metrics.has_coordinates / metrics.total_communities) * 100).toFixed(1)}%)
        - Has amenities: ${metrics.has_amenities} (${((metrics.has_amenities / metrics.total_communities) * 100).toFixed(1)}%)
        - Has photos: ${metrics.has_photos} (${((metrics.has_photos / metrics.total_communities) * 100).toFixed(1)}%)
        
        Top duplicates found (all showing 4 copies): ${duplicates.slice(0, 5).map(d => d.name).join(', ')}
        
        Provide: 1) Assessment of data quality 2) Impact on users 3) Recommendations for cleanup`,
        'analysis'
      );
      claudeAnalysis = claudeResponse;
    } catch (error) {
      console.error("Claude analysis error:", error);
      claudeAnalysis = "Claude analysis unavailable";
    }

    // Perplexity AI Real-time Analysis
    let perplexityAnalysis = "";
    try {
      const perplexityResponse = await perplexityAIService.searchWithPerplexity(
        `Current industry standards for senior living directory data quality and duplicate detection best practices 2025`
      );
      perplexityAnalysis = perplexityResponse.content || "Perplexity analysis unavailable";
    } catch (error) {
      console.error("Perplexity analysis error:", error);
      perplexityAnalysis = "Perplexity analysis unavailable";
    }

    // OpenAI Analysis
    let openAIAnalysis = "";
    try {
      const openaiResponse = await openaiIntegration.analyzeDataQuality({
        totalCommunities: metrics.total_communities,
        duplicateRecords: metrics.duplicate_records,
        dataCompleteness: {
          phone: ((metrics.has_phone / metrics.total_communities) * 100).toFixed(1),
          website: ((metrics.has_website / metrics.total_communities) * 100).toFixed(1),
          amenities: ((metrics.has_amenities / metrics.total_communities) * 100).toFixed(1),
          photos: ((metrics.has_photos / metrics.total_communities) * 100).toFixed(1)
        }
      });
      openAIAnalysis = openaiResponse;
    } catch (error) {
      console.error("OpenAI analysis error:", error);
      openAIAnalysis = "OpenAI analysis unavailable";
    }

    return {
      metrics,
      duplicates: duplicates.slice(0, 10),
      aiAnalysis: {
        claude: claudeAnalysis,
        perplexity: perplexityAnalysis,
        openai: openAIAnalysis
      },
      recommendations: [
        "Immediate: Remove 980 duplicate records (3.73% of database)",
        "Critical: Enrich amenities data (only 0.03% have amenities)",
        "High Priority: Add photos (only 0.46% have images)",
        "Medium: Add website data (only 24.8% have websites)",
        "Ongoing: Implement duplicate prevention on data import"
      ]
    };
  }

  async removeDuplicates() {
    console.log("🧹 Removing duplicate communities...");
    
    // Keep only the lowest ID for each duplicate group
    const deletionQuery = await db.execute(sql`
      DELETE FROM communities
      WHERE id IN (
        SELECT id FROM (
          SELECT 
            id,
            ROW_NUMBER() OVER (
              PARTITION BY name, address, city, state 
              ORDER BY id
            ) as rn
          FROM communities
          WHERE name IS NOT NULL AND address IS NOT NULL
        ) t
        WHERE rn > 1
      )
    `);

    return deletionQuery;
  }
}

export const aiDataQualityAnalyzer = new AIDataQualityAnalyzer();