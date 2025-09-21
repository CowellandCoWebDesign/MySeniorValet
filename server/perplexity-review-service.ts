import { PerplexityAIService } from './perplexity-ai-service';

export interface ReviewData {
  source: string;
  content: string;
  author?: string;
  rating?: number;
  verified: boolean;
  platform: string;
  isSummary?: boolean;
  url?: string;
  title?: string;
  reviewCount?: number;
}

export class PerplexityReviewService {
  private perplexityService: PerplexityAIService;
  
  constructor() {
    this.perplexityService = new PerplexityAIService();
  }

  isConfigured(): boolean {
    return this.perplexityService.isConfigured();
  }

  async fetchReviewsWithPerspective(
    communityName: string,
    address: string,
    city: string,
    state: string,
    zipCode: string
  ): Promise<{
    reviews: ReviewData[];
    sources: string[];
    perspectiveAnalysis: string;
    comparativeInsights: string;
    summary: string;  // Full raw response from Perplexity
    lastUpdated: Date;
  }> {
    if (!this.isConfigured()) {
      throw new Error('Perplexity service not configured');
    }

    try {
      // Use the exact same search query format as market data
      const searchQuery = `Find ALL reviews and ratings for "${communityName}" senior living community located at ${address}, ${city}, ${state} ${zipCode}. 

Include information from:
- Google Reviews
- Yelp (check for "Holiday ${communityName}" or variations)
- A Place for Mom 
- Caring.com
- SeniorAdvisor.com
- SeniorAdvice.com
- Seniorly.com
- Facebook Reviews

For each platform, provide:
- Total number of reviews (e.g., "67 reviews")
- Overall rating (e.g., "4.5 out of 5 stars")
- Recent review quotes with dates
- Direct URL to the reviews page

Also check nearby cities like Redlands if community is in Riverside, as communities are sometimes listed under adjacent cities.`;

      // Call Perplexity with same settings as market data tab
      const results = await this.perplexityService.searchRealTime(searchQuery, 
        `Searching for reviews of ${communityName} in ${city}, ${state}`
      );
      
      console.log(`📝 Perplexity Response Length: ${results.summary.length} characters`);
      
      // Parse the response to extract reviews
      const parsedData = this.parsePerplexityResponse(results.summary, communityName);
      
      console.log(`🔍 Parsed Data:
        - Reviews: ${parsedData.reviews.length}
        - Sources: ${results.sources.length}
        - Perspective Analysis Length: ${parsedData.perspectiveAnalysis.length}
        - Comparative Insights Length: ${parsedData.comparativeInsights.length}`);
      
      return {
        reviews: parsedData.reviews,
        sources: results.sources,
        perspectiveAnalysis: parsedData.perspectiveAnalysis,
        comparativeInsights: parsedData.comparativeInsights,
        summary: results.summary,  // Full raw response for compatibility
        lastUpdated: new Date()
      };
    } catch (error: any) {
      console.error('❌ Perplexity review search error:', error);
      throw new Error(`Perplexity review search failed: ${error.message}`);
    }
  }

  private parsePerplexityResponse(content: string, communityName?: string): {
    reviews: ReviewData[];
    perspectiveAnalysis: string;
    comparativeInsights: string;
  } {
    const reviews: ReviewData[] = [];
    
    // Extract reviews from different platforms
    const platforms = [
      'A Place for Mom',
      'Caring.com', 
      'Yelp',
      'Google',
      'SeniorAdvisor',
      'SeniorAdvice',
      'Seniorly',
      'Facebook'
    ];
    
    platforms.forEach(platform => {
      // Look for review counts (e.g., "67 reviews", "67 total reviews", "(67 reviews)")
      const countPatterns = [
        new RegExp(`${platform}[^\\n]*?(\\d+)\\s+(?:total\\s+)?reviews?`, 'i'),
        new RegExp(`${platform}[^\\n]*?\\((\\d+)\\s+reviews?\\)`, 'i'),
        new RegExp(`${platform}[^\\n]*?has\\s+(\\d+)\\s+reviews?`, 'i')
      ];
      
      let reviewCount = 0;
      let rating = null;
      
      for (const pattern of countPatterns) {
        const match = content.match(pattern);
        if (match) {
          reviewCount = parseInt(match[1]);
          break;
        }
      }
      
      // Look for ratings (e.g., "4.5/5", "4.5 out of 5", "4.5 stars")
      const ratingPatterns = [
        new RegExp(`${platform}[^\\n]*?(\\d+\\.?\\d*)\\s*(?:out of\\s*)?/?\\s*5`, 'i'),
        new RegExp(`${platform}[^\\n]*?(?:rating|rated)[:\\s]*(\\d+\\.?\\d*)`, 'i'),
        new RegExp(`${platform}[^\\n]*?(\\d+\\.?\\d*)\\s+stars?`, 'i')
      ];
      
      for (const pattern of ratingPatterns) {
        const match = content.match(pattern);
        if (match) {
          rating = parseFloat(match[1]);
          break;
        }
      }
      
      // If we found review count or rating, add a summary entry
      if (reviewCount > 0 || rating !== null) {
        reviews.push({
          source: platform,
          content: `${reviewCount} reviews found`,
          rating: rating,
          totalReviews: reviewCount,
          isSummary: true,
          platform: platform,
          verified: true,
          author: platform
        });
      }
      
      // Look for actual review quotes
      const quoteRegex = new RegExp(`${platform}[\\s\\S]*?"([^"]{30,500})"\\s*-?\\s*([^\\n]+)?`, 'gi');
      const matches = [...content.matchAll(quoteRegex)];
      
      matches.forEach((match, index) => {
        if (index < 3) { // Limit to 3 quotes per platform
          reviews.push({
            source: platform,
            content: match[1],
            author: match[2]?.trim() || 'Anonymous',
            rating: rating,
            verified: true,
            platform: platform,
            isSummary: false,
            title: `${platform} Review`
          });
        }
      });
      
      // Extract URLs
      const urlRegex = new RegExp(`${platform}[^\\n]*?(https?:\\/\\/[^\\s)]+)`, 'gi');
      const urlMatch = content.match(urlRegex);
      if (urlMatch) {
        const url = urlMatch[0].match(/https?:\/\/[^\s)]+/)?.[0];
        if (url && reviews.length > 0) {
          reviews.forEach(review => {
            if (review.platform === platform && !review.url) {
              review.url = url;
            }
          });
        }
      }
    });
    
    // Generate perspective analysis
    const perspectiveAnalysis = reviews.length > 0 
      ? `Found ${reviews.filter(r => r.isSummary).length} review sources with a total of ${reviews.filter(r => r.isSummary).reduce((sum, r) => sum + (r.totalReviews || 0), 0)} reviews across multiple platforms.`
      : 'No verified reviews found for this community.';
    
    // Use the full content as comparative insights
    const comparativeInsights = content;
    
    return {
      reviews,
      perspectiveAnalysis,
      comparativeInsights
    };
  }

  async fetchInspectionData(
    communityName: string,
    address: string,
    city: string,
    state: string,
    zipCode: string
  ): Promise<{
    inspectionData: any;
    citations: string[];
    analysis: string;
  }> {
    if (!this.isConfigured()) {
      throw new Error('Perplexity service not configured');
    }

    try {
      const searchQuery = `Find government inspection reports and compliance data for "${communityName}" at ${address}, ${city}, ${state} ${zipCode}.

Include:
- Medicare.gov Nursing Home Compare data and star ratings
- State health department inspection reports and citations
- CMS inspection results and deficiencies
- Recent health violations or compliance issues
- Fire safety and emergency preparedness inspections
- Any regulatory actions, fines, or penalties
- Complaint investigations and resolutions

Provide specific data with dates and source URLs.`;

      const results = await this.perplexityService.searchRealTime(searchQuery,
        `Searching for inspection data for ${communityName}`
      );

      return {
        inspectionData: this.parseInspectionData(results.summary),
        citations: results.sources,
        analysis: results.summary
      };
    } catch (error: any) {
      console.error('❌ Perplexity inspection search error:', error);
      throw new Error(`Perplexity inspection search failed: ${error.message}`);
    }
  }

  private parseInspectionData(content: string): any {
    const data: any = {
      starRating: null,
      violations: [],
      citations: [],
      complaints: [],
      findings: []
    };

    // Extract star rating
    const starMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:out of\s*)?(?:\/?\s*)?5\s*stars?/i);
    if (starMatch) {
      data.starRating = parseFloat(starMatch[1]);
    }

    // Extract violations
    const violationMatch = content.match(/violations?:?\s*([^\n]+)/gi);
    if (violationMatch) {
      data.violations = violationMatch.map(v => v.replace(/violations?:?\s*/i, '').trim());
    }

    // Extract citations
    const citationMatch = content.match(/citations?:?\s*([^\n]+)/gi);
    if (citationMatch) {
      data.citations = citationMatch.map(c => c.replace(/citations?:?\s*/i, '').trim());
    }

    // Extract complaints
    const complaintMatch = content.match(/complaints?:?\s*([^\n]+)/gi);
    if (complaintMatch) {
      data.complaints = complaintMatch.map(c => c.replace(/complaints?:?\s*/i, '').trim());
    }

    // Extract findings
    const findingsMatch = content.match(/findings?:?\s*([^\n]+)/gi);
    if (findingsMatch) {
      data.findings = findingsMatch.map(f => f.replace(/findings?:?\s*/i, '').trim());
    }

    return data;
  }
}