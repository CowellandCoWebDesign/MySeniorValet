import OpenAI from 'openai';

// Initialize xAI Grok client - Grok has NATIVE real-time web search built-in
const grok = process.env.XAI_API_KEY ? new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
}) : null;

export class GrokAIService {
  static async searchAndAnalyze(query: string, context?: string): Promise<any> {
    try {
      console.log('🤖 Grok AI Request:', { query: query.substring(0, 100), hasContext: !!context });
      
      // If Grok is not configured, return error (Golden Data Rule: no fake data)
      if (!grok) {
        console.log('⚠️ Grok API not configured');
        return {
          success: false,
          error: 'Grok API key not configured',
          aiService: 'Grok AI (xAI)'
        };
      }
      
      // Grok has NATIVE real-time web search - now enhanced to extract images
      const systemPrompt = `You are Grok, an advanced AI assistant with NATIVE REAL-TIME access to:
- Live web search and current information from the internet (built into your model)
- Real-time X/Twitter posts and trending topics
- Up-to-date news and events
- Current pricing and availability for senior living communities
- Ability to find and extract image URLs from websites

You have DIRECT ACCESS to search the web in real-time. You don't need external search results.

You must:
1. Use your native web search capabilities to find current information
2. Provide current, accurate data about senior living facilities, pricing, care levels, and services
3. Include specific sources and URLs when referencing information
4. EXTRACT AND LIST IMAGE URLs found on the websites you discover
5. Be direct, factual, and helpful in your responses
6. Mention dates when providing time-sensitive information
7. ALWAYS cite real sources with real URLs that you find through your native web access

RETURN FORMAT:
Structure your response with clear sections:
- CONTENT: Main information about the query
- IMAGES: List of actual image URLs found (if any)
- SOURCES: List of website URLs consulted

CRITICAL: You have built-in web search. Use it to find REAL information and REAL image URLs. DO NOT make up data or URLs.`;

      const userPrompt = `${context ? `Context: ${context}\n\n` : ''}Query: ${query}

Please use your native real-time web search capabilities to find current information about this query. Include real URLs for both sources AND any images you find on those websites.

FORMAT YOUR RESPONSE WITH:
- CONTENT: (your analysis)
- IMAGES: (list actual image URLs you found)
- SOURCES: (list website URLs)`;

      const response = await grok.chat.completions.create({
        model: "grok-2-latest",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      
      console.log('✅ Grok response received:', content.substring(0, 200));
      
      // Extract images from the response
      const images = this.extractImagesFromResponse(content);
      const sources = this.extractSourcesFromResponse(content);
      
      console.log(`🖼️ Grok found ${images.length} images and ${sources.length} sources`);
      
      return {
        success: true,
        content,
        images, // Now includes extracted image URLs
        model: 'grok-2-latest',
        aiService: 'Grok AI (xAI) with Native Web Search',
        features: ['native-real-time-search', 'x-twitter-data', 'built-in-web-access', 'image-extraction'],
        sources,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Grok AI Error:', error.message);
      
      // Return error (Golden Data Rule: no fake data)
      return {
        success: false,
        error: error.message || 'Grok service temporarily unavailable',
        aiService: 'Grok AI (xAI)'
      };
    }
  }

  // Helper method to extract image URLs from Grok's response
  private static extractImagesFromResponse(content: string): { url: string; source: string }[] {
    const images: { url: string; source: string }[] = [];
    
    // Look for IMAGES section
    const imagesMatch = content.match(/IMAGES:([\s\S]*?)(?:SOURCES:|$)/i);
    if (imagesMatch) {
      const imagesSection = imagesMatch[1];
      // Extract URLs that look like images
      const urlPattern = /https?:\/\/[^\s\)\]]+\.(?:jpg|jpeg|png|gif|webp|svg)/gi;
      const foundUrls = imagesSection.match(urlPattern) || [];
      
      foundUrls.forEach(url => {
        images.push({
          url: url.trim(),
          source: 'Grok Web Search',
          isAuthentic: true
        } as any);
      });
    }
    
    // Also check for inline image URLs in the content
    const inlinePattern = /!\[.*?\]\((https?:\/\/[^\)]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = inlinePattern.exec(content)) !== null) {
      if (!images.find(img => img.url === match[1])) {
        images.push({
          url: match[1],
          source: 'Grok Web Search',
          isAuthentic: true
        } as any);
      }
    }
    
    return images;
  }

  // Helper method to extract source URLs from Grok's response
  private static extractSourcesFromResponse(content: string): string[] {
    const sources: string[] = [];
    
    // Look for SOURCES section
    const sourcesMatch = content.match(/SOURCES:([\s\S]*?)$/i);
    if (sourcesMatch) {
      const sourcesSection = sourcesMatch[1];
      // Extract URLs
      const urlPattern = /https?:\/\/[^\s\)\]]+/gi;
      const foundUrls = sourcesSection.match(urlPattern) || [];
      foundUrls.forEach(url => {
        const cleanUrl = url.trim().replace(/[,;.]$/, '');
        if (!sources.includes(cleanUrl)) {
          sources.push(cleanUrl);
        }
      });
    }
    
    return sources;
  }

  static async analyzeWithVision(imageBase64: string, prompt: string): Promise<any> {
    try {
      console.log('🖼️ Grok Vision Request for image analysis');
      
      if (!grok) {
        return {
          success: false,
          error: 'Grok Vision requires XAI_API_KEY configuration',
          aiService: 'Grok Vision AI'
        };
      }
      
      const response = await grok.chat.completions.create({
        model: "grok-2-vision-1212",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        content,
        model: 'grok-2-vision-1212',
        aiService: 'Grok Vision AI',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Grok Vision Error:', error.message);
      return {
        success: false,
        error: error.message || 'Grok Vision service temporarily unavailable',
        aiService: 'Grok Vision AI'
      };
    }
  }

  // New method specifically for searching with image extraction
  static async searchWithImages(query: string, communityName?: string): Promise<any> {
    try {
      console.log('🖼️ Grok search with image extraction:', query);
      
      if (!grok) {
        return {
          success: false,
          error: 'Grok API key not configured',
          aiService: 'Grok AI (xAI)'
        };
      }
      
      const systemPrompt = `You are a web search expert with access to real-time internet data. 
Your task is to find SPECIFIC information and ACTUAL PHOTOS about senior living communities.

Return your response as valid JSON with this exact structure:
{
  "summary": "Detailed description with specific facts about the community",
  "website": "Official website URL if found",
  "phone": "Phone number if found",
  "images": [
    {"url": "actual image URL", "description": "what the image shows"}
  ],
  "sources": ["list of website URLs you consulted"]
}

CRITICAL RULES FOR IMAGES:
- ONLY include actual photos of the senior living community (building exteriors, rooms, amenities)
- NEVER include:
  * 404 error page images
  * Generic placeholder images
  * Stock photos from image libraries
  * YouTube thumbnails with "/vi/ID/" in the URL
  * Images with "404", "error", "placeholder" in the filename
  * Images from CDN paths like "/app/themes/" or "/dist/resources/"
- Images must be actual photos of the specific community
- If no real photos are found, return empty images array

SUMMARY REQUIREMENTS:
- Include specific details: number of units, care levels offered, year established
- Mention actual amenities and services
- Include pricing information if available
- Be factual and specific, not generic`;

      const userPrompt = `Search the web for: ${query}
${communityName ? `Community name: ${communityName}` : ''}

IMPORTANT: Find REAL, SPECIFIC information about this exact community.

Find and return:
1. Official website (if exists)
2. Phone number (if available)  
3. ACTUAL PHOTOS of the community building, rooms, or amenities (NOT error pages or placeholders)
4. Detailed factual summary with specific information about THIS community

Be specific and factual. If the community doesn't exist or has no online presence, say so clearly.

Return as JSON.`;

      const response = await grok.chat.completions.create({
        model: "grok-2-latest",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.3 // Lower temperature for more consistent JSON
      });

      const content = response.choices[0]?.message?.content || '{}';
      
      try {
        const jsonData = JSON.parse(content);
        
        // Transform and filter images to expected format
        const images = (jsonData.images || [])
          .filter((img: any) => {
            // Filter out bad images
            const badPatterns = [
              '404',
              'error',
              'placeholder',
              '/vi/ID/',
              'not-found',
              'missing',
              '/app/themes/',
              '/dist/resources/'
            ];
            const url = img.url?.toLowerCase() || '';
            return !badPatterns.some(pattern => url.includes(pattern.toLowerCase()));
          })
          .map((img: any) => ({
            url: img.url,
            source: 'Grok Web Search',
            description: img.description || '',
            isAuthentic: true
          }));
        
        console.log(`✅ Grok structured search found ${images.length} images`);
        
        return {
          success: true,
          content: jsonData.summary || '',
          images,
          website: jsonData.website,
          phone: jsonData.phone,
          sources: jsonData.sources || [],
          model: 'grok-2-latest',
          aiService: 'Grok AI (xAI) with Image Extraction',
          timestamp: new Date().toISOString()
        };
      } catch (parseError) {
        console.error('Failed to parse Grok JSON response:', parseError);
        // Fall back to text extraction
        return this.searchAndAnalyze(query, communityName);
      }
    } catch (error: any) {
      console.error('❌ Grok search with images error:', error.message);
      return {
        success: false,
        error: error.message || 'Grok service temporarily unavailable',
        aiService: 'Grok AI (xAI)'
      };
    }
  }

  static async generateStructuredData(prompt: string): Promise<any> {
    try {
      if (!grok) {
        return {
          success: false,
          error: 'Grok structured data requires XAI_API_KEY configuration',
          aiService: 'Grok AI (xAI)'
        };
      }
      
      const response = await grok.chat.completions.create({
        model: "grok-2-latest",
        messages: [
          {
            role: "system",
            content: "You are a data extraction expert. Extract structured information and return it as valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content || '{}';
      
      try {
        const jsonData = JSON.parse(content);
        return {
          success: true,
          data: jsonData,
          model: 'grok-2-latest',
          aiService: 'Grok AI (xAI)'
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse Grok response as JSON',
          rawContent: content,
          aiService: 'Grok AI (xAI)'
        };
      }
    } catch (error: any) {
      console.error('❌ Grok Structured Data Error:', error.message);
      return {
        success: false,
        error: error.message || 'Grok service temporarily unavailable',
        aiService: 'Grok AI (xAI)'
      };
    }
  }
}