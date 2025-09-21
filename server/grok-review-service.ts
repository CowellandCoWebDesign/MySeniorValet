import OpenAI from 'openai';

export class GrokReviewService {
  private client: OpenAI | null = null;

  constructor() {
    if (process.env.XAI_API_KEY) {
      this.client = new OpenAI({ 
        baseURL: "https://api.x.ai/v1", 
        apiKey: process.env.XAI_API_KEY 
      });
      console.log('✅ Grok Review Service initialized');
    } else {
      console.warn('⚠️ XAI_API_KEY not configured');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async fetchReviewsWithPerspective(
    communityName: string,
    address: string,
    city: string,
    state: string,
    zipCode: string
  ): Promise<{
    summary: string;
    reviews: any[];
    sources: string[];
    perspectiveAnalysis: string;
    comparativeInsights: string;
    lastUpdated: string;
  }> {
    if (!this.client) {
      throw new Error('Grok service not configured');
    }

    try {
      const searchQuery = `Search the internet for ALL reviews and ratings for "${communityName}" senior living, assisted living, or retirement home located at ${address}, ${city}, ${state} ${zipCode}.

**SEARCH STRATEGY:**
1. Search broadly - include variations like "Holiday ${communityName}", "${communityName} Provincial Senior Living", "${communityName} Discovery Senior Living"
2. Check nearby cities - communities near ${city} might be listed under adjacent cities (e.g., Redlands near Riverside)
3. Search ALL review platforms: Google, Yelp, A Place for Mom, Caring.com, SeniorAdvisor, SeniorAdvice.com, FamilyAssets.com, Seniorly.com, SeniorHomes.com, AssistedLivingMagazine.com
4. Look for total review counts even if individual reviews aren't visible
5. Include ANY mentions of ratings or feedback you find

**WHAT TO RETURN:**
For each platform where you find information:
[Platform Name]
- Overall Rating: X.X/5 (Y total reviews)
- Key quotes or feedback if available
- Direct URL to the reviews page

**IMPORTANT:**
- Cast a WIDE net - better to find too much than too little
- Include review COUNTS even if you can't access individual review text
- If a site mentions "${communityName} has 67 reviews" - INCLUDE that information
- Search for variations of the community name and nearby cities`;

      console.log(`🤖 Grok: Analyzing reviews for ${communityName} with comparative perspective...`);
      
      const response = await this.client.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are Grok with Live Search enabled. Your job is to find ALL available reviews and ratings for senior living communities by searching extensively across the internet. Be thorough - search multiple variations of the community name and check all review platforms. Focus on finding review COUNTS, RATINGS, and any available feedback. Always include the total number of reviews when mentioned on any platform."
          },
          {
            role: "user",
            content: searchQuery
          }
        ],
        temperature: 0.2,  // Low temperature for maximum factual accuracy
        max_tokens: 8000,  // Increased to ensure full response
        // Enable Live Search to actually search for real reviews
        search_parameters: {
          mode: "auto",  // Let Grok decide when to search
          return_citations: true,  // Include source citations
          max_search_results: 30,  // Get plenty of results to find reviews
          sources: [
            { type: "web" },
            { type: "news" },
            { type: "x" }  // X/Twitter posts
          ]
        } as any  // TypeScript bypass for search_parameters
      });

      const content = response.choices[0]?.message?.content || '';
      
      console.log(`📝 Grok Response Length: ${content.length} characters`);
      
      // Parse the response to extract structured data
      const extractedData = this.parseGrokResponse(content, communityName);
      
      // Log what we're returning
      console.log(`🔍 Parsed Data:
        - Reviews: ${extractedData.reviews.length}
        - Sources: ${extractedData.sources.length}
        - Perspective Analysis Length: ${extractedData.perspectiveAnalysis.length}
        - Comparative Insights Length: ${extractedData.comparativeInsights.length}`);
      
      return {
        summary: content,
        reviews: extractedData.reviews,
        sources: extractedData.sources,
        perspectiveAnalysis: extractedData.perspectiveAnalysis || content, // Fallback to full content
        comparativeInsights: extractedData.comparativeInsights || content, // Fallback to full content
        lastUpdated: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Grok review search error:', error);
      throw new Error(`Grok review search failed: ${error.message}`);
    }
  }

  private parseGrokResponse(content: string, communityName?: string): {
    reviews: any[];
    sources: string[];
    perspectiveAnalysis: string;
    comparativeInsights: string;
  } {
    // First check if response indicates no reviews found
    if (this.containsNoReviewsIndicator(content)) {
      console.log('🚫 Grok indicates no reviews found for this community');
      return {
        reviews: [],
        sources: [],
        perspectiveAnalysis: 'No verified reviews found for this community.',
        comparativeInsights: content
      };
    }

    // Check for synthetic data patterns and reject if found
    if (this.detectSyntheticData(content)) {
      console.warn('⚠️ Synthetic data patterns detected - rejecting response');
      return {
        reviews: [],
        sources: [],
        perspectiveAnalysis: 'Unable to find verified reviews.',
        comparativeInsights: 'No authentic review data available.'
      };
    }

    const reviews: any[] = [];
    const sources: string[] = [];
    
    // Extract reviews from different platforms
    const platforms = ['Google', 'Yelp', 'Care.com', 'SeniorAdvisor', 'A Place for Mom', 'Facebook'];
    
    platforms.forEach(platform => {
      const platformRegex = new RegExp(`${platform}[\\s\\S]*?(?=\\n(?:${platforms.join('|')})|FINAL PERSPECTIVE|$)`, 'i');
      const platformMatch = content.match(platformRegex);
      
      if (platformMatch) {
        const platformContent = platformMatch[0];
        
        // Extract rating
        const ratingMatch = platformContent.match(/(\d+(?:\.\d+)?)\s*(?:\/5|stars?)/i);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
        
        // Extract review count
        const countMatch = platformContent.match(/(\d+)\s*(?:total\s*)?reviews?/i);
        const reviewCount = countMatch ? parseInt(countMatch[1]) : 0;
        
        // Extract individual review quotes
        const quoteRegex = /"([^"]+)"\s*-\s*([^-\n]+)/g;
        let match;
        while ((match = quoteRegex.exec(platformContent)) !== null) {
          // Generate a search URL for the review based on the platform
          let reviewUrl = '';
          const businessName = communityName || 'Senior Living';
          
          switch(platform) {
            case 'Google':
              reviewUrl = `https://www.google.com/maps/search/${encodeURIComponent(businessName)}+reviews`;
              break;
            case 'Yelp':
              reviewUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(businessName)}`;
              break;
            case 'Care.com':
              reviewUrl = `https://www.care.com/senior-care`;
              break;
            case 'SeniorAdvisor':
              reviewUrl = `https://www.senioradvisor.com`;
              break;
            case 'A Place for Mom':
              reviewUrl = `https://www.aplaceformom.com`;
              break;
            case 'Facebook':
              reviewUrl = `https://www.facebook.com/search/top?q=${encodeURIComponent(businessName)}`;
              break;
          }
          
          // Only add review if it contains a real URL (not a generic search URL)
          const isRealReview = reviewUrl && !reviewUrl.includes('/search?');
          
          reviews.push({
            source: platform,
            content: match[1],
            author: match[2].trim(),
            rating: rating,
            verified: false,  // NEVER automatically mark as verified - requires manual verification
            platform: platform,
            isSummary: false,
            url: reviewUrl,
            title: `${platform} Review`,
            needsVerification: true,  // Flag for manual verification
            isRealReview: isRealReview
          });
        }
        
        // Add platform summary if we found data
        if (rating || reviewCount > 0) {
          reviews.push({
            source: platform,
            content: `${platform} Overview: ${rating ? rating + '/5' : 'N/A'} from ${reviewCount} reviews`,
            rating: rating,
            totalReviews: reviewCount,
            isSummary: true,
            platform: platform
          });
        }
      }
    });
    
    // Extract URLs as sources
    const urlRegex = /https?:\/\/[^\s)]+/g;
    const urls = content.match(urlRegex);
    if (urls) {
      sources.push(...urls);
    }
    
    // FULL UNCENSORED RESPONSE - Return the entire Grok content without any parsing or filtering
    // This ensures we show everything Grok provides without truncation
    let perspectiveAnalysis = '';
    let comparativeInsights = content; // Use the FULL content as-is, uncensored and unfiltered
    
    return {
      reviews,
      sources: [...new Set(sources)], // Remove duplicates
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
    if (!this.client) {
      throw new Error('Grok service not configured');
    }

    try {
      const searchQuery = `Search for and analyze government inspection reports and compliance data for "${communityName}" at ${address}, ${city}, ${state} ${zipCode}.

**INCLUDE:**
1. Medicare.gov Nursing Home Compare data and star ratings
2. State health department inspection reports and citations
3. CMS inspection results and deficiencies
4. Recent health violations or compliance issues
5. Fire safety and emergency preparedness inspections
6. Any regulatory actions, fines, or penalties
7. Complaint investigations and resolutions

**PROVIDE PERSPECTIVE:**
- How do these inspection results compare to state/national averages?
- Are there patterns or recurring issues?
- What improvements have been made over time?
- Overall compliance standing relative to peers

Format with clear sections and include source URLs.`;

      const response = await this.client.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are Grok with Live Search enabled. Search government sites, Medicare.gov, state health departments, and news sources for REAL inspection data and compliance information about healthcare facilities. Report ONLY factual findings from actual sources."
          },
          {
            role: "user",
            content: searchQuery
          }
        ],
        temperature: 0.2,  // Low temperature for factual accuracy
        max_tokens: 4000,  // Increased for fuller inspection data
        // Enable Live Search to find real inspection data
        search_parameters: {
          mode: "auto",
          return_citations: true,
          max_search_results: 20,
          sources: [
            { type: "web" },
            { type: "news" }
          ]
        } as any
      });

      const content = response.choices[0]?.message?.content || '';
      
      // Extract URLs as citations
      const urlRegex = /https?:\/\/[^\s)]+/g;
      const citations = content.match(urlRegex) || [];
      
      return {
        inspectionData: this.parseInspectionData(content),
        citations: [...new Set(citations)],
        analysis: content
      };
    } catch (error: any) {
      console.error('❌ Grok inspection search error:', error);
      throw new Error(`Grok inspection search failed: ${error.message}`);
    }
  }

  private parseInspectionData(content: string): any {
    const data: any = {
      starRating: null,
      recentViolations: [],
      complianceScore: null,
      lastInspectionDate: null,
      findings: []
    };

    // Extract star rating
    const starMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:star|★)/i);
    if (starMatch) {
      data.starRating = parseFloat(starMatch[1]);
    }

    // Extract violations
    const violationRegex = /(?:violation|citation|deficiency)[:\s]*([^\n]+)/gi;
    let match;
    while ((match = violationRegex.exec(content)) !== null) {
      data.recentViolations.push(match[1].trim());
    }

    // Extract inspection date
    const dateMatch = content.match(/(?:last |recent )?inspect(?:ed|ion)[:\s]*([A-Za-z]+ \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    if (dateMatch) {
      data.lastInspectionDate = dateMatch[1];
    }

    // Extract key findings
    const findingsMatch = content.match(/(?:findings?|results?)[:\s]*([\s\S]{50,300})/i);
    if (findingsMatch) {
      data.findings.push(findingsMatch[1].trim());
    }

    return data;
  }

  private containsNoReviewsIndicator(content: string): boolean {
    // Only flag as "no reviews" if ALL platforms have no reviews
    // Don't reject if just some platforms have no reviews
    const hasAnyReviews = [
      /Overall Rating: \d+\.?\d*/i,
      /\d+ total reviews/i,
      /\d+ reviews?\)/i,
      /"[^"]{20,}"/,  // Has actual review quotes
      /Verified Reviews Found:/i
    ].some(pattern => pattern.test(content));
    
    // If we found evidence of reviews, don't flag as "no reviews"
    if (hasAnyReviews) {
      return false;
    }
    
    // Only flag as no reviews if explicitly stated and no reviews found
    const noReviewPatterns = [
      /no verified reviews found.*on.*all platforms/i,
      /unable to find any reviews/i,
      /no reviews available from any source/i
    ];
    
    return noReviewPatterns.some(pattern => pattern.test(content));
  }

  private detectSyntheticData(content: string): boolean {
    // Only flag obvious synthetic/example data
    const syntheticPatterns = [
      // Clear indicators of fake data
      /example review/i,
      /sample review/i,
      /placeholder/i,
      /hypothetical/i,
      /illustrative/i,
      /demonstration/i,
      /\[INSERT.*?\]/i,  // Template placeholders
      /\{PLACEHOLDER\}/i,
      /lorem ipsum/i,
      /test data/i,
      
      // Template-like structures with obvious placeholders
      /\[Your Name\]/i,
      /\[Date\]/i,
      /\[Rating\]/i,
      /XX\/XX\/XXXX/,  // Template dates
      
      // AI disclaimers
      /as an AI/i,
      /I cannot provide real reviews/i,
      /these are examples/i,
      /for illustration purposes/i
    ];
    
    // Check for synthetic patterns
    for (const pattern of syntheticPatterns) {
      if (pattern.test(content)) {
        console.log(`🚫 Detected synthetic pattern: ${pattern}`);
        return true;
      }
    }
    
    // Check for duplicate content (same review text appearing multiple times)
    const reviewQuotes = content.match(/"([^"]{50,})"/g) || [];
    const uniqueQuotes = new Set(reviewQuotes);
    if (reviewQuotes.length > 0 && uniqueQuotes.size < reviewQuotes.length / 2) {
      console.log('🚫 Detected duplicate review content');
      return true;
    }
    
    // Check if all reviews have suspiciously similar structure
    const reviewBlocks = content.split(/(?:Google|Yelp|Care\.com|SeniorAdvisor|Facebook)/i);
    if (reviewBlocks.length > 3) {
      const blockLengths = reviewBlocks.map(block => block.length);
      const avgLength = blockLengths.reduce((a, b) => a + b, 0) / blockLengths.length;
      const variance = blockLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / blockLengths.length;
      
      // If variance is very low, blocks are suspiciously uniform (likely generated)
      if (variance < 100) {
        console.log('🚫 Detected suspiciously uniform review structure');
        return true;
      }
    }
    
    return false;
  }
}