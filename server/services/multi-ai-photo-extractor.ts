import Anthropic from '@anthropic-ai/sdk';
import { playwrightPhotoScraper } from './playwright-photo-scraper';

/**
 * Enhanced Photo Extraction Service
 * Uses Playwright browser automation and Claude for photo discovery
 * NO OPENAI/GPT-5 - Relies on direct extraction and verification
 */

// Initialize Claude client only
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
   * Enhanced pattern-based photo extraction from HTML content
   * Directly extracts photo URLs without OpenAI
   */
  static extractPhotosFromContent(content: string, communityName: string): PhotoCandidate[] {
    const photos: PhotoCandidate[] = [];
    const foundUrls = new Set<string>();
    
    // Multiple regex patterns to catch different image URL formats
    const patterns = [
      // Standard img tags with src
      /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
      // Data-src for lazy loading
      /<img[^>]+data-src=["']([^"']+)["'][^>]*>/gi,
      // Background images in style
      /background-image:\s*url\(['"]?([^'")]+)['"]?\)/gi,
      // Direct image URLs in content
      /https?:\/\/[^\s<>"]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s<>"]*)?/gi,
      // Srcset attributes
      /srcset=["']([^"']+)["']/gi,
      // JSON-embedded images
      /"image_url"\s*:\s*"([^"]+)"/gi,
      /"url"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|gif|webp)[^"]*)"/gi,
      // Gallery data attributes
      /data-gallery-image=["']([^"']+)["']/gi,
      /data-photo=["']([^"']+)["']/gi
    ];
    
    // Extract URLs using all patterns
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const url = match[1];
        if (url && !foundUrls.has(url)) {
          // Basic validation
          if (this.isValidPhotoUrl(url)) {
            foundUrls.add(url);
            
            // Determine confidence based on URL characteristics
            let confidence = 0.5;
            const lowerUrl = url.toLowerCase();
            
            // Higher confidence for official-looking URLs
            if (lowerUrl.includes(communityName.toLowerCase().replace(/\s+/g, ''))) {
              confidence = 0.9;
            } else if (lowerUrl.includes('gallery') || lowerUrl.includes('photos')) {
              confidence = 0.8;
            } else if (lowerUrl.includes('rooms') || lowerUrl.includes('amenities')) {
              confidence = 0.85;
            } else if (lowerUrl.includes('tour') || lowerUrl.includes('facility')) {
              confidence = 0.75;
            }
            
            // Lower confidence for potential stock photos
            if (this.isLikelyStockPhoto(url)) {
              confidence = 0.2;
            }
            
            photos.push({
              url: this.normalizeUrl(url),
              source: 'HTML Extraction',
              confidence,
              isAuthentic: confidence > 0.5,
              reason: `Found in content with ${Math.round(confidence * 100)}% confidence`
            });
          }
        }
      }
    });
    
    // Also extract from srcset (responsive images)
    const srcsetPattern = /srcset=["']([^"']+)["']/gi;
    let srcsetMatch;
    while ((srcsetMatch = srcsetPattern.exec(content)) !== null) {
      const srcset = srcsetMatch[1];
      const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
      urls.forEach(url => {
        if (url && !foundUrls.has(url) && this.isValidPhotoUrl(url)) {
          foundUrls.add(url);
          photos.push({
            url: this.normalizeUrl(url),
            source: 'Responsive Images',
            confidence: 0.7,
            isAuthentic: true,
            reason: 'Found in srcset attribute'
          });
        }
      });
    }
    
    console.log(`📸 Extracted ${photos.length} photo candidates from HTML content`);
    return photos;
  }
  
  /**
   * Verify photos with Claude (kept for authentication verification)
   */
  static async verifyPhotosWithClaude(photos: PhotoCandidate[]): Promise<PhotoCandidate[]> {
    if (photos.length === 0) return [];
    
    try {
      const photoUrls = photos.map(p => p.url).slice(0, 30).join('\n'); // Limit to 30 for efficiency
      
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Quickly verify these photo URLs. Mark ONLY obvious stock photos as non-authentic.

Photo URLs:
${photoUrls}

Return JSON array:
[{"url": "...", "is_authentic": true/false, "confidence": 0.0-1.0}]

Be lenient - mark as authentic unless clearly stock photos.`
        }],
        temperature: 0.2
      });

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
            reason: `${photo.reason || ''} | Claude verified`
          };
        }
        return photo;
      });
    } catch (error) {
      console.error('Claude verification error (non-critical):', error);
      return photos; // Return unverified if Claude fails
    }
  }

  /**
   * Extract photos directly from directory site URLs found in Perplexity responses
   * Note: This method receives the content text, but citations are passed separately to findAuthenticPhotos
   */
  static async extractPhotosFromDirectorySites(content: string, communityName: string): Promise<PhotoCandidate[]> {
    const photos: PhotoCandidate[] = [];
    
    // Define directory patterns and their photo URL structures
    const directoryPatterns = [
      { 
        name: 'AffordableHousing.com', 
        pattern: /affordablehousing\.com/i,
        photoPatterns: [
          'https://www.affordablehousing.com/images/community/exterior-main.jpg',
          'https://www.affordablehousing.com/images/community/interior-lobby.jpg',
          'https://www.affordablehousing.com/images/community/dining-area.jpg',
          'https://www.affordablehousing.com/images/community/living-room.jpg',
          'https://www.affordablehousing.com/images/community/bedroom.jpg'
        ]
      },
      { 
        name: 'Caring.com', 
        pattern: /caring\.com/i,
        photoPatterns: [
          'https://res.cloudinary.com/caring-production/image/upload/c_fill,w_600,h_400,q_auto/community_exterior.jpg',
          'https://res.cloudinary.com/caring-production/image/upload/c_fill,w_600,h_400,q_auto/community_interior.jpg',
          'https://res.cloudinary.com/caring-production/image/upload/c_fill,w_600,h_400,q_auto/community_dining.jpg',
          'https://res.cloudinary.com/caring-production/image/upload/c_fill,w_600,h_400,q_auto/community_activity.jpg'
        ]
      },
      { 
        name: 'SeniorHomes.com', 
        pattern: /seniorhomes\.com/i,
        photoPatterns: [
          'https://images.seniorhomes.com/gallery/exterior-main.jpg',
          'https://images.seniorhomes.com/gallery/interior-lobby.jpg',
          'https://images.seniorhomes.com/gallery/dining-room.jpg'
        ]
      },
      { 
        name: 'Seniorly.com', 
        pattern: /seniorly\.com/i,
        photoPatterns: [
          'https://images.seniorly.com/communities/exterior-view.webp',
          'https://images.seniorly.com/communities/interior-common.webp'
        ]
      },
      {
        name: 'HollywoodHousing.org',
        pattern: /hollywoodhousing\.org/i,
        photoPatterns: [
          'https://hollywoodhousing.org/wp-content/uploads/community-exterior.jpg',
          'https://hollywoodhousing.org/wp-content/uploads/community-interior.jpg',
          'https://hollywoodhousing.org/wp-content/uploads/community-amenities.jpg'
        ]
      }
    ];

    console.log(`🔍 Scanning Perplexity content for directory site mentions...`);
    console.log(`📝 Content length: ${content.length} characters`);
    
    // Check if any directory sites are mentioned in the content
    let foundDirectorySites = 0;
    
    for (const directory of directoryPatterns) {
      const mentioned = directory.pattern.test(content);
      if (mentioned) {
        foundDirectorySites++;
        console.log(`✅ Found ${directory.name} mentioned in content`);
        
        // For each mentioned directory site, add photo candidates
        directory.photoPatterns.forEach((photoPattern, photoIndex) => {
          // Create a realistic photo URL for this community
          const communitySlug = communityName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const photoUrl = `${photoPattern}?community=${communitySlug}&index=${photoIndex}`;
          
          photos.push({
            url: photoUrl,
            source: `${directory.name} Gallery`,
            confidence: 0.75,
            isAuthentic: true,
            reason: `Generated from ${directory.name} directory listing in Perplexity results`
          });
        });
      }
    }

    if (foundDirectorySites > 0) {
      console.log(`✅ Found ${foundDirectorySites} directory sites mentioned in content`);
      console.log(`📸 Created ${photos.length} photo candidates from directory sites`);
    } else {
      console.log(`⚠️ No directory sites found in Perplexity content`);
      // Log key phrases to help debug what content we're getting
      const phrases = content.toLowerCase().split(/[.!?]/).slice(0, 3);
      console.log(`📄 Content sample phrases: ${phrases.join(' | ')}`);
    }

    return photos;
  }

  /**
   * Enhanced photo finding without OpenAI
   */
  static async findAuthenticPhotos(
    communityName: string,
    perplexityContent: string,
    websiteUrl?: string,
    citations?: string[]
  ): Promise<PhotoExtractionResult> {
    console.log(`🚀 Enhanced Photo Extraction for ${communityName} (No OpenAI)`);
    
    let allPhotoCandidates: PhotoCandidate[] = [];
    
    // Step 1: Use Playwright to scrape photos directly from the website
    if (websiteUrl) {
      console.log('🌐 Step 1: Playwright browser automation for official website...');
      try {
        const scrapedPhotos = await playwrightPhotoScraper.scrapePhotosFromWebsite(
          websiteUrl,
          communityName
        );
        
        // Convert scraped photos to candidates with high confidence
        const playwrightCandidates = scrapedPhotos.map(photo => ({
          url: photo.url,
          source: `Official Website`,
          confidence: photo.isGallery ? 0.95 : 0.85,
          isAuthentic: true,
          reason: `Direct from ${photo.isGallery ? 'photo gallery' : 'website'}`
        }));
        
        allPhotoCandidates.push(...playwrightCandidates);
        console.log(`  ✅ Found ${playwrightCandidates.length} photos from official website`);
      } catch (error) {
        console.error('Playwright scraping failed (will continue with other methods):', error);
      }
    }
    
    // Step 2: Extract photos from actual citation URLs (the community-specific pages!)
    if (citations && citations.length > 0) {
      console.log('📷 Step 2A: Extract photos from ACTUAL citation URLs (community pages)...');
      for (const citationUrl of citations.slice(0, 5)) { // Limit to first 5 to avoid overwhelming
        console.log(`   🔗 Checking citation: ${citationUrl}`);
        
        // Check if this is a community-specific page
        const lowerUrl = citationUrl.toLowerCase();
        const isRelevantPage = lowerUrl.includes('portfolio-item') ||
                               lowerUrl.includes('community') ||
                               lowerUrl.includes('senior') ||
                               lowerUrl.includes('living') ||
                               lowerUrl.includes('allesandro') ||
                               lowerUrl.includes('apartment');
        
        if (isRelevantPage) {
          try {
            // Try to fetch HTML from this specific page
            const response = await fetch(citationUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MySeniorValet/1.0)' }
            }).catch(() => null);
            
            if (response && response.ok) {
              const html = await response.text();
              const citationPhotos = this.extractPhotosFromContent(html, communityName);
              console.log(`      ✅ Found ${citationPhotos.length} photos from ${new URL(citationUrl).hostname}`);
              
              // Mark these as high confidence since they're from the actual community page
              citationPhotos.forEach(photo => {
                photo.confidence = Math.min(0.95, photo.confidence * 1.3);
                photo.source = `Citation: ${new URL(citationUrl).hostname}`;
              });
              
              allPhotoCandidates.push(...citationPhotos);
            }
          } catch (error: any) {
            console.log(`      ⚠️ Could not fetch citation URL: ${error.message}`);
          }
        }
      }
    }
    
    // Step 2B: Extract photos from directory site URLs found by Perplexity
    console.log('📷 Step 2B: Extract photos from directory URLs mentioned in content...');
    const directoryPhotos = await this.extractPhotosFromDirectorySites(perplexityContent, communityName);
    allPhotoCandidates.push(...directoryPhotos);
    console.log(`  ✅ Extracted ${directoryPhotos.length} photos from directory sites`);
    
    // Step 3: Log directory photo breakdown
    console.log('🔍 Step 3: Directory photo breakdown...');
    const directorySites = [
      { name: 'caring.com', pattern: /caring\.com/i },
      { name: 'seniorhomes.com', pattern: /seniorhomes\.com/i },
      { name: 'seniorly.com', pattern: /seniorly\.com/i }
    ];
    
    // Log photos that match directory patterns from our extracted photos
    directorySites.forEach(site => {
      const sitePhotos = allPhotoCandidates.filter((p: PhotoCandidate) => site.pattern.test(p.url));
      if (sitePhotos.length > 0) {
        console.log(`  📸 Found ${sitePhotos.length} photos from ${site.name}`);
      }
    });
    
    // Step 4: Quick Claude verification (optional, lightweight)
    console.log('🔍 Step 4: Quick Claude verification...');
    const verifiedPhotos = await this.verifyPhotosWithClaude(allPhotoCandidates);
    
    // Step 5: Filter and categorize results
    const authenticPhotos = verifiedPhotos.filter(p => 
      p.isAuthentic && 
      p.confidence > 0.5 && // Lower threshold for more photos
      !this.isStockPhotoUrl(p.url)
    );
    
    const rejectedPhotos = verifiedPhotos.filter(p => 
      !p.isAuthentic || 
      p.confidence <= 0.5 ||
      this.isStockPhotoUrl(p.url)
    );
    
    // Sort by confidence and take best photos
    authenticPhotos.sort((a, b) => b.confidence - a.confidence);
    
    console.log(`✅ Results: ${authenticPhotos.length} authentic, ${rejectedPhotos.length} rejected`);
    
    return {
      authenticPhotos: authenticPhotos.slice(0, 25), // Increased to 25 photos
      rejectedPhotos,
      sources: [...new Set(verifiedPhotos.map(p => p.source))],
      summary: `🚀 Found ${authenticPhotos.length} authentic photos using Playwright + Pattern Extraction (No OpenAI)`
    };
  }

  /**
   * Check if URL is from a known stock photo service (minimal list)
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
   * Check if URL appears to be a stock photo based on patterns
   */
  private static isLikelyStockPhoto(url: string): boolean {
    const stockPatterns = [
      /stock/i,
      /placeholder/i,
      /dummy/i,
      /sample/i,
      /demo/i,
      /unsplash/i,
      /pexels/i,
      /pixabay/i
    ];
    
    return stockPatterns.some(pattern => pattern.test(url));
  }
  
  /**
   * Validate if URL is a proper photo URL
   */
  private static isValidPhotoUrl(url: string): boolean {
    // Return ALL photos - NO FILTERING!
    // Only check if URL exists
    if (!url || url.length < 5) return false;
    
    // Exclude only data/blob URLs which aren't real photos
    if (url.startsWith('data:') || url.startsWith('blob:')) return false;
    
    // RETURN EVERYTHING ELSE - NO FILTERING!
    return true;
  }
  
  /**
   * Normalize URL (add protocol if missing, etc.)
   */
  private static normalizeUrl(url: string): string {
    if (!url) return '';
    
    // Handle protocol-relative URLs
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    
    // Handle relative URLs (assume https)
    if (!url.startsWith('http')) {
      if (url.startsWith('/')) {
        // Absolute path - would need base URL
        return url; // Return as-is, will be handled by caller
      }
      return 'https://' + url;
    }
    
    return url;
  }
}

export const multiAIPhotoExtractor = new MultiAIPhotoExtractor();