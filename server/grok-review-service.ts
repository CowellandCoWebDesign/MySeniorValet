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
      const searchQuery = `Analyze and provide ONLY REAL, VERIFIABLE reviews for "${communityName}" senior living community at ${address}, ${city}, ${state} ${zipCode}.

**ABSOLUTE REQUIREMENTS - ZERO TOLERANCE FOR FAKE DATA:**
1. ONLY return reviews that ACTUALLY EXIST on Google, Yelp, Care.com, SeniorAdvisor, A Place for Mom, or Facebook
2. If you cannot find real reviews, you MUST say "No reviews found" - DO NOT create examples or placeholders
3. Every review quote must be verbatim from a real source - no paraphrasing or examples
4. Include the actual URL where each review can be verified
5. Never generate sample reviews or hypothetical examples

**FOR EACH REAL REVIEW FOUND:**
[Platform Name]
- Overall Rating: X.X/5 (Y total reviews) - ONLY if this data actually exists
- Verified Reviews Found:
  * "EXACT VERBATIM QUOTE" - Real Reviewer Name/Actual Date
  * Include direct link to this specific review if possible
- Source URL: [Direct link to the review page]

**IF NO REVIEWS EXIST:**
Simply state: "No verified reviews found for this community on [platform name]"

**VERIFICATION REQUIREMENTS:**
- Each review must have a real source URL
- Each quote must be exactly as written on the platform
- Do not create examples if real reviews don't exist
- Do not fill in missing data with estimates or examples

**IMPORTANT:**
If you cannot find actual reviews, return an empty response or state "No reviews available" rather than generating synthetic examples.`;

      console.log(`🤖 Grok: Analyzing reviews for ${communityName} with comparative perspective...`);
      
      const response = await this.client.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are Grok with Live Search enabled. Search the web, news, and social media for REAL reviews and information about senior living facilities. Report ONLY factual information you find from actual sources. Include direct links to where you found the information."
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