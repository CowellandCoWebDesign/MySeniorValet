import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { playwrightPhotoScraper } from './playwright-photo-scraper';

/**
 * Multi-AI Photo Extraction Service
 * Orchestrates Perplexity, GPT-5, and Claude for intelligent photo discovery
 */

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const GPT5_MODEL = "gpt-5";
// The newest Anthropic model is "claude-sonnet-4-20250514", not older 3.x models
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

interface PhotoCandidate {
  url: string;
  source: string;
  confidence: number;
  isAuthentic: boolean;
  reason?: string;
}

interface PhotoExtractionResult {
  authenticPhotos: PhotoCandidate[];
  rejectedPhotos: PhotoCandidate[];
  sources: string[];
  summary: string;
}

export class MultiAIPhotoExtractor {
  /**
   * Step 1: Use Perplexity to find photo sources (already handled by SimplifiedPerplexityService)
   * This returns web content with potential photo URLs
   */
  
  /**
   * Step 2: Use GPT-5 to intelligently extract photo URLs from content
   */
  static async extractPhotosWithGPT5(content: string, communityName: string): Promise<PhotoCandidate[]> {
    try {
      const prompt = `
Analyze this content about "${communityName}" senior living community and extract ONLY authentic facility photos.

IMPORTANT RULES:
1. ONLY extract photos that are clearly of the actual facility (building exteriors, interiors, rooms, amenities)
2. REJECT all stock photos, generic images, logos, maps, icons, or unrelated images
3. Each photo URL must be complete and valid
4. Provide confidence score (0-100) for each photo being authentic

Content to analyze:
${content.substring(0, 8000)}

Return JSON format:
{
  "photos": [
    {
      "url": "full URL",
      "description": "what the photo shows",
      "confidence": 85,
      "source_context": "where it appeared in the content"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: GPT5_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert at identifying authentic facility photos from web content. You have a keen eye for distinguishing real facility photos from stock images."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        // GPT-5 only supports temperature 1.0 (default)
        max_completion_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content || '{"photos":[]}');
      
      return result.photos.map((photo: any) => ({
        url: photo.url,
        source: `GPT-5: ${photo.description}`,
        confidence: photo.confidence / 100,
        isAuthentic: photo.confidence > 70,
        reason: photo.source_context
      }));
    } catch (error) {
      console.error('GPT-5 photo extraction error:', error);
      return [];
    }
  }

  /**
   * Step 3: Use Claude to verify photo authenticity
   */
  static async verifyPhotosWithClaude(photos: PhotoCandidate[]): Promise<PhotoCandidate[]> {
    if (photos.length === 0) return [];
    
    try {
      const photoUrls = photos.map(p => p.url).join('\n');
      
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_completion_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze these photo URLs and determine which are AUTHENTIC facility photos vs stock photos.

Photo URLs to verify:
${photoUrls}

For each URL, determine:
1. Is it likely a stock photo service? (unsplash, pexels, shutterstock, getty, etc)
2. Does the URL pattern suggest it's from an official website?
3. Does it appear to be a real facility photo?

Return a JSON array with format:
[
  {
    "url": "the URL",
    "is_authentic": true/false,
    "confidence": 0.0-1.0,
    "reason": "brief explanation"
  }
]

Be VERY strict - only mark as authentic if you're confident it's a real facility photo.`
        }],
        temperature: 0.2
      });

      // Handle Claude's response properly - content can be text or tool use
      const contentBlock = response.content[0];
      const responseText = contentBlock.type === 'text' ? contentBlock.text : '';
      const claudeAnalysis = JSON.parse(responseText);
      
      // Merge Claude's verification with existing photos
      return photos.map(photo => {
        const claudeResult = claudeAnalysis.find((a: any) => a.url === photo.url);
        if (claudeResult) {
          return {
            ...photo,
            isAuthentic: claudeResult.is_authentic && photo.isAuthentic,
            confidence: (photo.confidence + claudeResult.confidence) / 2,
            reason: `${photo.reason || ''} | Claude: ${claudeResult.reason}`
          };
        }
        return photo;
      });
    } catch (error) {
      console.error('Claude verification error:', error);
      return photos; // Return unverified if Claude fails
    }
  }

  /**
   * Step 4: SUPER-POWERED photo search using Playwright + Three AIs
   */
  static async findAuthenticPhotos(
    communityName: string,
    perplexityContent: string,
    websiteUrl?: string
  ): Promise<PhotoExtractionResult> {
    console.log(`🔥 SUPER-POWERED Multi-AI + Playwright Photo Extraction for ${communityName}`);
    
    let allPhotoCandidates: PhotoCandidate[] = [];
    
    // Step 1: Use Playwright to scrape photos directly from the website
    if (websiteUrl) {
      console.log('🚀 Step 1: Playwright scraping photos from actual website...');
      try {
        const scrapedPhotos = await playwrightPhotoScraper.scrapePhotosFromWebsite(
          websiteUrl,
          communityName
        );
        
        // Convert scraped photos to candidates
        const playwrightCandidates = scrapedPhotos.map(photo => ({
          url: photo.url,
          source: `Playwright: ${photo.context}`,
          confidence: photo.isGallery ? 0.9 : 0.8,
          isAuthentic: true,
          reason: `Scraped from ${photo.isGallery ? 'gallery' : 'website'}`
        }));
        
        allPhotoCandidates.push(...playwrightCandidates);
        console.log(`  🔥 Playwright found ${playwrightCandidates.length} photos directly from website`);
      } catch (error) {
        console.error('Playwright scraping error:', error);
      }
    }
    
    // Step 2: Extract photo URLs using GPT-5 from Perplexity content
    console.log('📸 Step 2: GPT-5 extracting photos from Perplexity content...');
    const gptPhotos = await this.extractPhotosWithGPT5(perplexityContent, communityName);
    allPhotoCandidates.push(...gptPhotos);
    console.log(`  Found ${gptPhotos.length} potential photos from content`);
    
    // Step 3: Search multiple directory sites for more photos
    console.log('🌐 Step 3: GPT-5 searching for photos from 3 directory sources...');
    const directorySites = [
      'assistedliving.com',
      'caring.com', 
      'seniorly.com',
      'aplaceformom.com',
      'senioradvisor.com'
    ];
    
    for (const site of directorySites.slice(0, 3)) { // Search top 3 sites
      console.log(`  📷 Searching ${site} for ${communityName} photos...`);
      const searchPrompt = `Find authentic facility photos for "${communityName}" on ${site}. Look for actual building photos, room photos, amenity photos, dining areas, activity photos. Return all photo URLs found.`;
      
      try {
        const siteResponse = await openai.chat.completions.create({
          model: GPT5_MODEL,
          messages: [
            {
              role: "user",
              content: searchPrompt
            }
          ],
          max_completion_tokens: 4000
        });
        
        const sitePhotos = await this.extractPhotosWithGPT5(
          siteResponse.choices[0].message.content || '',
          communityName
        );
        allPhotoCandidates.push(...sitePhotos);
        console.log(`    Found ${sitePhotos.length} photos from ${site}`);
      } catch (error) {
        console.error(`Photo search error for ${site}:`, error);
      }
    }
    
    // Step 4: If we have a website URL, do a deep search
    if (websiteUrl) {
      console.log(`🌐 Step 4: Deep searching official website ${websiteUrl}`);
      const deepSearchPrompt = `Do a DEEP search for ALL photos on ${websiteUrl} for ${communityName}. Check:
        - Photo galleries
        - Virtual tours
        - Amenities pages
        - About us pages
        - Room/floor plan pages
        - Activities pages
        - Dining pages
        Find at least 20 authentic facility photos if possible.`;
      
      try {
        const websiteResponse = await openai.chat.completions.create({
          model: GPT5_MODEL,
          messages: [
            {
              role: "user",
              content: deepSearchPrompt
            }
          ],
          max_completion_tokens: 4000
        });
        
        const additionalPhotos = await this.extractPhotosWithGPT5(
          websiteResponse.choices[0].message.content || '',
          communityName
        );
        allPhotoCandidates.push(...additionalPhotos);
      } catch (error) {
        console.error('Website deep search error:', error);
      }
    }
    
    // Step 5: Verify all photos with Claude
    console.log('🔍 Step 5: Claude verifying photo authenticity...');
    const verifiedPhotos = await this.verifyPhotosWithClaude(allPhotoCandidates);
    
    // Step 6: Filter and categorize results
    const authenticPhotos = verifiedPhotos.filter(p => 
      p.isAuthentic && 
      p.confidence > 0.6 && // Lower threshold to get more photos
      !this.isStockPhotoUrl(p.url)
    );
    
    const rejectedPhotos = verifiedPhotos.filter(p => 
      !p.isAuthentic || 
      p.confidence <= 0.6 ||
      this.isStockPhotoUrl(p.url)
    );
    
    console.log(`✅ Results: ${authenticPhotos.length} authentic, ${rejectedPhotos.length} rejected`);
    
    return {
      authenticPhotos: authenticPhotos.slice(0, 20), // Increased to 20 photos
      rejectedPhotos,
      sources: [...new Set(verifiedPhotos.map(p => p.source))],
      summary: `🔥 ENHANCED: Found ${authenticPhotos.length} authentic facility photos from 3+ sources using Multi-AI verification`
    };
  }

  /**
   * Check if URL is from a known stock photo service
   */
  private static isStockPhotoUrl(url: string): boolean {
    const stockDomains = [
      'unsplash.com',
      'pexels.com', 
      'pixabay.com',
      'shutterstock.com',
      'gettyimages.com',
      'istockphoto.com'
    ];
    
    const lowerUrl = url.toLowerCase();
    return stockDomains.some(domain => lowerUrl.includes(domain));
  }

  /**
   * Extract photos from image tags in HTML content
   */
  static extractImageUrls(htmlContent: string): string[] {
    const imageUrls: string[] = [];
    
    // Match <img src="..."> tags
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      if (match[1] && !this.isStockPhotoUrl(match[1])) {
        imageUrls.push(match[1]);
      }
    }
    
    // Match URLs ending in image extensions
    const urlRegex = /https?:\/\/[^\s<>"]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s<>"]*)?/gi;
    while ((match = urlRegex.exec(htmlContent)) !== null) {
      if (match[0] && !this.isStockPhotoUrl(match[0])) {
        imageUrls.push(match[0]);
      }
    }
    
    // Remove duplicates and return
    return [...new Set(imageUrls)];
  }
}

export const multiAIPhotoExtractor = new MultiAIPhotoExtractor();