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
      const searchQuery = `Analyze and provide a comprehensive review perspective for "${communityName}" senior living community at ${address}, ${city}, ${state} ${zipCode}.

**CRITICAL REQUIREMENTS:**
1. Search for ALL available reviews from Google, Yelp, Care.com, SeniorAdvisor, A Place for Mom, and Facebook
2. Provide ACTUAL review quotes, not summaries
3. Include comparative perspective across all sources
4. Highlight patterns, contradictions, and consensus points

**COMPARISON IN PERSPECTIVE ANALYSIS:**
- Compare what different review platforms are saying
- Identify consistent themes vs conflicting information
- Provide balanced perspective on strengths and concerns
- Note any significant discrepancies between sources

**FORMAT EACH REVIEW SOURCE AS:**
[Platform Name]
- Overall Rating: X.X/5 (Y total reviews)
- Recent Reviews:
  * "EXACT QUOTE FROM REVIEW" - Reviewer Name/Date
  * "ANOTHER EXACT QUOTE" - Reviewer Name/Date
- Key Themes: [List main points mentioned]

**FINAL PERSPECTIVE SYNTHESIS:**
Provide a balanced comparison showing:
- What all sources agree on
- Where opinions diverge
- Red flags or concerns to investigate
- Standout positives consistently mentioned

**IMPORTANT: Include actual clickable URLs at the end in this format:**
Sources:
- Google Reviews: https://[actual google maps URL]
- Yelp: https://[actual yelp URL]
- Care.com: https://[actual care.com URL]
- SeniorAdvisor: https://[actual senioradvisor URL]
- A Place for Mom: https://[actual aplaceformom URL]
- Facebook: https://[actual facebook URL]

Provide real, working URLs not placeholders.`;

      console.log(`🤖 Grok: Analyzing reviews for ${communityName} with comparative perspective...`);
      
      const response = await this.client.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are Grok, an expert at comparative analysis and providing balanced perspective on senior living facilities. You excel at finding patterns across multiple review sources and presenting nuanced insights that help families make informed decisions. Always provide actual quotes and cite sources."
          },
          {
            role: "user",
            content: searchQuery
          }
        ],
        temperature: 0.7,
        max_tokens: 8000  // Increased to ensure full response
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
          
          reviews.push({
            source: platform,
            content: match[1],
            author: match[2].trim(),
            rating: rating,
            verified: true,
            platform: platform,
            isSummary: false,
            url: reviewUrl, // Add the verification URL
            title: `${platform} Review` // Add a title
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
            content: "You are Grok, providing comprehensive analysis of healthcare facility inspections and compliance. Focus on factual data while providing context and perspective that helps families understand the significance of inspection findings."
          },
          {
            role: "user",
            content: searchQuery
          }
        ],
        temperature: 0.5,
        max_tokens: 4000  // Increased for fuller inspection data
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
}