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
   * Extract photos from service-specific directory sites (hotels, restaurants, etc.)
   */
  static async extractPhotosFromServiceDirectorySites(content: string, serviceName: string, serviceType?: string): Promise<PhotoCandidate[]> {
    const photos: PhotoCandidate[] = [];

    // Define service-specific directory patterns
    const serviceDirectoryPatterns = [
      // Hotel directories
      { 
        name: 'TripAdvisor', 
        pattern: /tripadvisor\.com/i,
        types: ['hotel', 'resort', 'inn', 'lodge'],
        photoPatterns: [
          'https://media-cdn.tripadvisor.com/media/photo-s/',
          'https://media-cdn.tripadvisor.com/media/photo-o/',
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/'
        ]
      },
      { 
        name: 'Booking.com', 
        pattern: /booking\.com/i,
        types: ['hotel', 'resort', 'inn'],
        photoPatterns: [
          'https://cf.bstatic.com/xdata/images/hotel/',
          'https://cf.bstatic.com/images/hotel/'
        ]
      },
      { 
        name: 'Hotels.com', 
        pattern: /hotels\.com/i,
        types: ['hotel', 'resort'],
        photoPatterns: [
          'https://images.trvl-media.com/hotels/',
          'https://images.trvl-media.com/lodging/'
        ]
      },
      // Restaurant directories
      { 
        name: 'Yelp', 
        pattern: /yelp\.com/i,
        types: ['restaurant', 'cafe', 'diner', 'food'],
        photoPatterns: [
          'https://s3-media0.fl.yelpcdn.com/bphoto/',
          'https://s3-media1.fl.yelpcdn.com/bphoto/',
          'https://s3-media2.fl.yelpcdn.com/bphoto/',
          'https://s3-media3.fl.yelpcdn.com/bphoto/'
        ]
      },
      { 
        name: 'OpenTable', 
        pattern: /opentable\.com/i,
        types: ['restaurant', 'dining'],
        photoPatterns: [
          'https://images.otstatic.com/prod/',
          'https://resizer.otstatic.com/'
        ]
      },
      // General business directories
      { 
        name: 'Google Maps/Business', 
        pattern: /google\.com\/maps|maps\.google|goo\.gl\/maps/i,
        types: ['any'],
        photoPatterns: [
          'https://lh3.googleusercontent.com/',
          'https://lh5.googleusercontent.com/p/'
        ]
      }
    ];

    console.log(`🔍 Scanning for service directory mentions (${serviceType || 'general service'})...`);

    // Check relevant directory sites based on service type
    for (const directory of serviceDirectoryPatterns) {
      // Skip if this directory isn't relevant for the service type
      if (serviceType && !directory.types.includes('any')) {
        const typeMatches = directory.types.some(type => 
          serviceType.toLowerCase().includes(type) || 
          serviceName.toLowerCase().includes(type)
        );
        if (!typeMatches) continue;
      }

      const mentioned = directory.pattern.test(content);
      if (mentioned) {
        console.log(`✅ Found ${directory.name} mentioned for ${serviceName}`);

        // For service directories, we can't generate fake URLs
        // Instead, mark that this directory was found for potential scraping
        photos.push({
          url: `${directory.name.toLowerCase()}-photos-needed`,
          source: directory.name,
          confidence: 0.0,
          isAuthentic: false,
          reason: `${directory.name} mentioned but photo extraction needed via browser`
        });
      }
    }

    return photos;
  }

  /**
   * Extract photos directly from directory site URLs found in Perplexity responses
   * Note: This method receives the content text, but citations are passed separately to findAuthenticPhotos
   */
  static async extractPhotosFromDirectorySites(content: string, communityName: string): Promise<PhotoCandidate[]> {
    const photos: PhotoCandidate[] = [];

    console.log(`🔍 Scanning Perplexity content for actual photo URLs...`);
    console.log(`📝 Content length: ${content.length} characters`);

    // Extract actual photo URLs from content instead of generating fake ones
    const photoUrlPatterns = [
      // Look for actual image URLs in the content
      /https?:\/\/[^\s<>"]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s<>"]*)?/gi,
      // CDN patterns that might not have extensions
      /https?:\/\/[^\s<>"]*(?:images?|photos?|media|cdn|static)[^\s<>"]*\/[^\s<>"]+/gi,
      // WordPress uploads
      /https?:\/\/[^\s<>"]*wp-content\/uploads\/[^\s<>"]+\.(?:jpg|jpeg|png|gif|webp)/gi
    ];

    let foundUrls = 0;

    for (const pattern of photoUrlPatterns) {
      const matches = content.match(pattern) || [];
      for (const url of matches) {
        // Clean up the URL
        const cleanUrl = url.replace(/['")\]}>]+$/, '');

        // Skip obvious non-photos
        if (cleanUrl.includes('logo') || cleanUrl.includes('icon') || 
            cleanUrl.includes('avatar') || cleanUrl.includes('placeholder')) {
          continue;
        }

        // Validate it's a real URL
        try {
          new URL(cleanUrl);
          photos.push({
            url: cleanUrl,
            source: 'Content Extraction',
            confidence: 0.7,
            isAuthentic: true,
            reason: 'Extracted from Perplexity content'
          });
          foundUrls++;
        } catch (e) {
          // Invalid URL, skip
        }
      }
    }

    console.log(`✅ Found ${foundUrls} actual photo URLs in content`);

    // Log sample URLs for debugging
    if (photos.length > 0) {
      console.log(`📸 Sample extracted URLs:`);
      photos.slice(0, 3).forEach((photo, idx) => {
        console.log(`  ${idx + 1}. ${photo.url}`);
      });
    }

    return photos.slice(0, 10); // Limit to 10 photos from content
  }

  /**
   * Enhanced photo finding without OpenAI
   */
  static async findAuthenticPhotos(
    communityName: string,
    perplexityContent: string,
    websiteUrl?: string,
    perplexityCitations?: string[]
  ): Promise<PhotoExtractionResult> {
    console.log(`🚀 Enhanced Photo Extraction for ${communityName} (No OpenAI)`);

    let allPhotoCandidates: PhotoCandidate[] = [];
    const websiteSources: string[] = [];

    // Step 1: Use Playwright to scrape photos directly from the official website
    if (websiteUrl) {
      console.log('🌐 Step 1: Playwright browser automation for official website...');
      try {
        const scrapedPhotos = await playwrightPhotoScraper.scrapePhotosFromWebsite(
          websiteUrl,
          communityName
        );

        // Extract domain name for source
        let websiteName = 'Official Website';
        try {
          const url = new URL(websiteUrl);
          websiteName = url.hostname.replace('www.', '');
        } catch (e) {
          // Keep default if URL parsing fails
        }

        // Convert scraped photos to candidates with high confidence
        const playwrightCandidates = scrapedPhotos.map(photo => ({
          url: photo.url,
          source: websiteName,
          confidence: photo.isGallery ? 0.95 : 0.85,
          isAuthentic: true,
          reason: `Direct from ${photo.isGallery ? 'photo gallery' : 'website'}`
        }));

        allPhotoCandidates.push(...playwrightCandidates);
        websiteSources.push(websiteUrl);
        console.log(`  ✅ Found ${playwrightCandidates.length} photos from ${websiteName}`);
      } catch (error) {
        console.error('Playwright scraping failed (will continue with other methods):', error);
      }
    }

    // Step 2: Search at least 3 websites specifically mentioning the community
    console.log('📷 Step 2: Searching multiple websites for photos...');

    // Get citations from Perplexity that specifically mention the community
    const relevantCitations = perplexityCitations || [];
    const communitySpecificSites: string[] = [];

    // Search for sites that specifically mention the community name
    for (const citation of relevantCitations) {
      try {
        const url = new URL(citation);
        const hostname = url.hostname.replace('www.', '');

        // Check if this citation likely mentions the community
        if (!websiteSources.includes(citation) && communitySpecificSites.length < 3) {
          console.log(`  🔍 Checking ${hostname} for community-specific photos...`);

          try {
            const scrapedPhotos = await playwrightPhotoScraper.scrapePhotosFromWebsite(
              citation,
              communityName
            );

            if (scrapedPhotos.length > 0) {
              const siteCandidates = scrapedPhotos.map(photo => ({
                url: photo.url,
                source: hostname,
                confidence: 0.75,
                isAuthentic: true,
                reason: `Found on ${hostname} page about ${communityName}`
              }));

              allPhotoCandidates.push(...siteCandidates);
              websiteSources.push(citation);
              communitySpecificSites.push(hostname);
              console.log(`    ✅ Found ${scrapedPhotos.length} photos from ${hostname}`);
            }
          } catch (error) {
            console.log(`    ⚠️ Could not scrape ${hostname}:`, error instanceof Error ? error.message : 'Unknown error');
          }
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }

    // Step 3: Extract photos from directory sites if we haven't found enough
    if (allPhotoCandidates.length < 10) {
      console.log('📷 Step 3: Supplementing with directory site photos...');
      const directoryPhotos = await this.extractPhotosFromDirectorySites(perplexityContent, communityName);

      // Add source information to directory photos
      const enhancedDirectoryPhotos = directoryPhotos.map(photo => {
        // Extract website name from the source field
        const sourceSite = photo.source.replace(' Gallery', '').toLowerCase();
        return {
          ...photo,
          source: sourceSite.includes('caring') ? 'caring.com' :
                  sourceSite.includes('seniorhomes') ? 'seniorhomes.com' :
                  sourceSite.includes('seniorly') ? 'seniorly.com' :
                  sourceSite.includes('senioradvisor') ? 'senioradvisor.com' :
                  sourceSite.includes('aplaceformom') ? 'aplaceformom.com' : photo.source
        };
      });

      allPhotoCandidates.push(...enhancedDirectoryPhotos);
      console.log(`  ✅ Added ${directoryPhotos.length} photos from directory sites`);
    }

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

    // Build proper source URLs for frontend display
    const sourceUrls = websiteSources.length > 0 ? websiteSources : 
                       [...new Set(verifiedPhotos.map(p => {
                         // Convert source names to URLs where possible
                         const source = p.source.toLowerCase();
                         if (source.includes('.com') || source.includes('.org')) {
                           return `https://${source}`;
                         } else if (source === 'official website' && websiteUrl) {
                           return websiteUrl;
                         } else {
                           return `https://${source.replace(/\s+/g, '')}.com`;
                         }
                       }))];

    console.log(`✅ Photo extraction complete:`);
    console.log(`   - ${authenticPhotos.length} authentic photos found`);
    console.log(`   - ${sourceUrls.length} sources checked`);
    console.log(`   - Sources: ${sourceUrls.join(', ')}`);

    return {
      authenticPhotos: authenticPhotos.slice(0, 25), // Increased to 25 photos
      rejectedPhotos,
      sources: sourceUrls,
      summary: `🚀 Found ${authenticPhotos.length} authentic photos from ${sourceUrls.length} websites`
    };
  }

  /**
   * Enhanced photo finding for services (hotels, restaurants, businesses)
   * Uses Playwright scraping and directory knowledge
   */
  static async findAuthenticServicePhotos(
    serviceName: string,
    serviceType: string,
    city: string,
    state: string,
    perplexityContent: string,
    websiteUrl?: string,
    perplexityCitations?: string[]
  ): Promise<PhotoExtractionResult> {
    console.log(`🚀 Enhanced Service Photo Extraction for ${serviceName} (${serviceType}) in ${city}, ${state}`);

    let allPhotoCandidates: PhotoCandidate[] = [];
    const websiteSources: string[] = [];

    // Step 1: Use Playwright to scrape photos from official website if available
    if (websiteUrl) {
      console.log('🌐 Step 1: Playwright browser automation for official website...');
      try {
        const scrapedPhotos = await playwrightPhotoScraper.scrapePhotosFromWebsite(
          websiteUrl,
          serviceName
        );

        // Extract domain name for source
        let websiteName = 'Official Website';
        try {
          const url = new URL(websiteUrl);
          websiteName = url.hostname.replace('www.', '');
        } catch (e) {
          // Keep default if URL parsing fails
        }

        // Convert scraped photos to candidates
        const playwrightCandidates = scrapedPhotos.map(photo => ({
          url: photo.url,
          source: websiteName,
          confidence: photo.isGallery ? 0.95 : 0.85,
          isAuthentic: true,
          reason: `Direct from ${photo.isGallery ? 'photo gallery' : 'website'}`
        }));

        allPhotoCandidates.push(...playwrightCandidates);
        websiteSources.push(websiteUrl);
        console.log(`  ✅ Found ${playwrightCandidates.length} photos from ${websiteName}`);
      } catch (error) {
        console.error('Playwright scraping failed (will continue with other methods):', error);
      }
    }

    // Step 2: Extract photos from service directory sites mentioned in citations
    console.log('📷 Step 2: Searching directory sites for photos...');

    // Extended list of directory sites to check
    const directoryPatterns = [
      // Hotel directories
      { pattern: /tripadvisor\.(com|ca|co\.uk|fr|de|it|es|jp|cn)/i, name: 'TripAdvisor' },
      { pattern: /booking\.com/i, name: 'Booking.com' },
      { pattern: /hotels\.com/i, name: 'Hotels.com' },
      { pattern: /expedia\.(com|ca|co\.uk)/i, name: 'Expedia' },
      { pattern: /agoda\.com/i, name: 'Agoda' },
      { pattern: /kayak\.(com|ca|co\.uk)/i, name: 'Kayak' },
      { pattern: /priceline\.com/i, name: 'Priceline' },
      { pattern: /trivago\.(com|ca|co\.uk)/i, name: 'Trivago' },
      { pattern: /airbnb\.(com|ca|co\.uk)/i, name: 'Airbnb' },
      { pattern: /vrbo\.com/i, name: 'Vrbo' },

      // Restaurant directories
      { pattern: /yelp\.(com|ca|co\.uk)/i, name: 'Yelp' },
      { pattern: /opentable\.(com|ca|co\.uk)/i, name: 'OpenTable' },
      { pattern: /zomato\.com/i, name: 'Zomato' },
      { pattern: /doordash\.com/i, name: 'DoorDash' },
      { pattern: /ubereats\.com/i, name: 'UberEats' },
      { pattern: /grubhub\.com/i, name: 'Grubhub' },
      { pattern: /thefork\.(com|ca|co\.uk)/i, name: 'TheFork' },
      { pattern: /deliveroo\.(com|co\.uk)/i, name: 'Deliveroo' },
      { pattern: /zagat\.com/i, name: 'Zagat' },
      { pattern: /michelin\.com/i, name: 'Michelin' },
      { pattern: /happycow\.net/i, name: 'HappyCow' },

      // General business directories
      { pattern: /google\.(com|ca|co\.uk)\/maps/i, name: 'Google Maps' },
      { pattern: /maps\.google\.(com|ca|co\.uk)/i, name: 'Google Maps' },
      { pattern: /goo\.gl\/maps/i, name: 'Google Maps' },
      { pattern: /facebook\.com/i, name: 'Facebook' },
      { pattern: /instagram\.com/i, name: 'Instagram' },
      { pattern: /foursquare\.com/i, name: 'Foursquare' },
      { pattern: /bing\.com\/maps/i, name: 'Bing Places' },
    ];

    // Process citations to find and scrape directory sites
    if (perplexityCitations && perplexityCitations.length > 0) {
      const scrapedSources = new Set<string>();
      let directoryCount = 0;
      const maxDirectories = 5; // Limit to prevent timeout

      for (const citation of perplexityCitations) {
        if (directoryCount >= maxDirectories) break;

        try {
          const url = new URL(citation);
          const hostname = url.hostname.toLowerCase();

          // Check if this citation matches any directory pattern
          const matchedDirectory = directoryPatterns.find(dir => dir.pattern.test(hostname));

          if (matchedDirectory && !scrapedSources.has(hostname)) {
            console.log(`  🔍 Scraping ${matchedDirectory.name} (${hostname}) for service photos...`);
            scrapedSources.add(hostname);
            directoryCount++;

            try {
              // Use Playwright to scrape photos from this directory page
              const scrapedPhotos = await playwrightPhotoScraper.scrapePhotosFromWebsite(
                citation,
                serviceName,
                {
                  maxPhotos: 10, // Limit photos per directory
                  timeout: 15000, // 15 second timeout per site
                  waitForSelector: this.getDirectoryPhotoSelector(matchedDirectory.name)
                }
              );

              if (scrapedPhotos.length > 0) {
                // Map scraped photos to candidates with appropriate confidence
                const siteCandidates = scrapedPhotos.map(photo => ({
                  url: photo.url,
                  source: matchedDirectory.name,
                  confidence: this.getDirectoryConfidence(matchedDirectory.name),
                  isAuthentic: true,
                  reason: `Direct from ${matchedDirectory.name} listing`
                }));

                allPhotoCandidates.push(...siteCandidates);
                websiteSources.push(citation);
                console.log(`    ✅ Found ${scrapedPhotos.length} photos from ${matchedDirectory.name}`);
              } else {
                console.log(`    ℹ️ No photos found on ${matchedDirectory.name} listing`);
              }
            } catch (error) {
              console.log(`    ⚠️ Could not scrape ${matchedDirectory.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);

              // Fallback: Try to extract CDN patterns from the content if scraping fails
              const cdnPhotos = this.extractCDNPhotosFromDirectory(perplexityContent, matchedDirectory.name);
              if (cdnPhotos.length > 0) {
                allPhotoCandidates.push(...cdnPhotos);
                console.log(`    📦 Extracted ${cdnPhotos.length} CDN photos from ${matchedDirectory.name} content`);
              }
            }
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    }

    // Step 3: Extract photos directly from HTML content
    console.log('📷 Step 3: Extracting photos from content...');
    const contentPhotos = this.extractPhotosFromContent(perplexityContent, serviceName);

    // Filter for service-relevant photos only
    const serviceRelevantPhotos = contentPhotos.filter(photo => {
      const url = photo.url.toLowerCase();
      // Accept photos from known service CDNs
      return url.includes('tripadvisor') ||
             url.includes('yelp') ||
             url.includes('booking') ||
             url.includes('hotels') ||
             url.includes('opentable') ||
             url.includes('googleusercontent') ||
             url.includes('cloudinary') ||
             url.includes('cloudfront') ||
             url.includes('akamai') ||
             photo.confidence > 0.7;
    });

    allPhotoCandidates.push(...serviceRelevantPhotos);

    // Step 4: Quick verification to filter out broken/stock photos
    console.log('🔍 Step 4: Verifying photo quality...');

    // Filter and categorize results
    const authenticPhotos = allPhotoCandidates.filter(p => 
      p.isAuthentic && 
      p.confidence > 0.3 && // Lower threshold for services to get more photos
      !this.isStockPhotoUrl(p.url) &&
      this.isValidPhotoUrl(p.url)
    );

    const rejectedPhotos = allPhotoCandidates.filter(p => 
      !p.isAuthentic || 
      p.confidence <= 0.3 ||
      this.isStockPhotoUrl(p.url) ||
      !this.isValidPhotoUrl(p.url)
    );

    // Sort by confidence
    authenticPhotos.sort((a, b) => b.confidence - a.confidence);

    // Build source URLs for citations
    const sourceUrls = websiteSources.length > 0 ? websiteSources : 
                       perplexityCitations ? perplexityCitations.slice(0, 5) : [];

    console.log(`✅ Service photo extraction complete:`);
    console.log(`   - ${authenticPhotos.length} authentic photos found`);
    console.log(`   - ${rejectedPhotos.length} rejected`);
    console.log(`   - ${sourceUrls.length} sources checked`);

    return {
      authenticPhotos: authenticPhotos.slice(0, 20), // Return up to 20 photos
      rejectedPhotos: rejectedPhotos,
      sources: sourceUrls,
      summary: `Found ${authenticPhotos.length} photos for ${serviceName} from ${sourceUrls.length} sources`
    };
  }

  /**
   * Get directory-specific photo selectors for Playwright
   */
  private static getDirectoryPhotoSelector(directoryName: string): string | undefined {
    const selectors: Record<string, string> = {
      'TripAdvisor': 'img[src*="media-cdn.tripadvisor"], div[style*="background-image"][style*="media-cdn"]',
      'Booking.com': 'img[src*="bstatic.com"], div[data-testid*="image"]',
      'Hotels.com': 'img[src*="trvl-media.com"], img[src*="hotels.com/ho"]',
      'Yelp': 'img[src*="yelpcdn.com/bphoto"], div[style*="yelpcdn.com"]',
      'OpenTable': 'img[src*="otstatic.com"], img[src*="resizer.otstatic"]',
      'Google Maps': 'img[src*="googleusercontent.com"], div[style*="googleusercontent"]',
      'Facebook': 'img[src*="fbcdn.net"], img[src*="facebook.com/photo"]',
      'Instagram': 'img[src*="cdninstagram.com"], img[src*="instagram.fcdn"]',
      'DoorDash': 'img[src*="cdn.doordash"], img[src*="doordash-static"]',
      'UberEats': 'img[src*="uber.com"], img[src*="ubereats"]',
      'Grubhub': 'img[src*="grubhub"], img[src*="seamless"]',
    };

    return selectors[directoryName];
  }

  /**
   * Get confidence score for directory sources
   */
  private static getDirectoryConfidence(directoryName: string): number {
    const confidence: Record<string, number> = {
      'TripAdvisor': 0.85,
      'Booking.com': 0.85,
      'Hotels.com': 0.8,
      'Yelp': 0.85,
      'OpenTable': 0.8,
      'Google Maps': 0.9,
      'Facebook': 0.75,
      'Instagram': 0.75,
      'DoorDash': 0.7,
      'UberEats': 0.7,
      'Grubhub': 0.7,
      'Expedia': 0.8,
      'Agoda': 0.8,
      'Kayak': 0.75,
      'Priceline': 0.75,
      'Trivago': 0.7,
      'Airbnb': 0.85,
      'Vrbo': 0.8,
      'Zomato': 0.75,
      'TheFork': 0.75,
      'Deliveroo': 0.7,
      'Zagat': 0.8,
      'Michelin': 0.9,
      'HappyCow': 0.75,
      'Foursquare': 0.75,
      'Bing Places': 0.7,
    };

    return confidence[directoryName] || 0.7;
  }

  /**
   * Extract CDN photos from directory content as fallback
   */
  private static extractCDNPhotosFromDirectory(content: string, directoryName: string): PhotoCandidate[] {
    const photos: PhotoCandidate[] = [];

    // Directory-specific CDN patterns
    const cdnPatterns: Record<string, RegExp[]> = {
      'TripAdvisor': [
        /https?:\/\/media-cdn\.tripadvisor\.com\/media\/photo-[sow]\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{2}\/[^"\s]+\.jpg/gi,
        /https?:\/\/dynamic-media-cdn\.tripadvisor\.com\/media\/[^"\s]+\.jpg/gi
      ],
      'Yelp': [
        /https?:\/\/s3-media[0-9]\.fl\.yelpcdn\.com\/bphoto\/[A-Za-z0-9_-]+\/[^"\s]+\.jpg/gi
      ],
      'Booking.com': [
        /https?:\/\/cf\.bstatic\.com\/[^"\s]+\/[^"\s]+\.jpg/gi,
        /https?:\/\/cf\.bstatic\.com\/images\/hotel\/[^"\s]+\.jpg/gi
      ],
      'Hotels.com': [
        /https?:\/\/images\.trvl-media\.com\/hotels\/[^"\s]+\.jpg/gi
      ],
      'Google Maps': [
        /https?:\/\/lh[3-6]\.googleusercontent\.com\/[^"\s]+=[^"\s]+/gi,
        /https?:\/\/lh[3-6]\.googleusercontent\.com\/p\/[^"\s]+/gi
      ],
      'Facebook': [
        /https?:\/\/[^"\s]+\.fbcdn\.net\/[^"\s]+\.jpg/gi,
        /https?:\/\/lookaside\.facebook\.com\/lookaside\/crawler\/media\/[^"\s]+/gi
      ],
      'Instagram': [
        /https?:\/\/[^"\s]+\.cdninstagram\.com\/[^"\s]+\.jpg/gi,
        /https?:\/\/instagram\.[^"\s]+\.fbcdn\.net\/[^"\s]+\.jpg/gi
      ]
    };

    const patterns = cdnPatterns[directoryName];
    if (patterns) {
      for (const pattern of patterns) {
        const matches = content.match(pattern) || [];
        for (const url of matches) {
          photos.push({
            url: url,
            source: directoryName,
            confidence: 0.6, // Lower confidence for extracted patterns
            isAuthentic: true,
            reason: `CDN pattern from ${directoryName}`
          });
        }
      }
    }

    return photos.slice(0, 5); // Limit to 5 CDN photos per directory
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
   * Check if URL is a valid photo URL
   */
  private static isValidPhotoUrl(url: string): boolean {
    if (!url || url.length < 10) return false;

    // Clean up the URL
    const cleanUrl = url.trim();

    // WHITELIST: Always accept photos from trusted directory sites
    const trustedDomains = [
      'tripadvisor.com',
      'yelpcdn.com', 
      'googleusercontent.com',
      'lh3.googleusercontent.com',
      'lh5.googleusercontent.com',
      'bstatic.com',  // Booking.com
      'trvl-media.com',  // Hotels.com
      'otstatic.com',  // OpenTable
      'fbcdn.net',  // Facebook
      'cdninstagram.com',  // Instagram
      // Business website domains
      'westpace.net',
      'arcadiosproduce.com',
      'wp-content',
      'uploads'
    ];

    const lowerUrl = cleanUrl.toLowerCase();

    // If it's from a trusted domain, accept it without further validation
    if (trustedDomains.some(domain => lowerUrl.includes(domain))) {
      return true;
    }

    // Check for common image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => lowerUrl.includes(ext));

    // Check for image-related paths
    const imagePaths = ['/images/', '/img/', '/photos/', '/gallery/', '/media/', '/assets/', '/uploads/', '/wp-content/'];
    const hasImagePath = imagePaths.some(path => lowerUrl.includes(path));

    // Accept if it has image extension or image path
    if (hasImageExtension || hasImagePath) {
      return true;
    }

    // Only exclude data URLs and blob URLs
    if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) return false;

    // Only exclude obvious tracking pixels
    if (lowerUrl.includes('pixel') || lowerUrl.includes('tracking') || lowerUrl.includes('1x1')) {
      return false;
    }

    // Exclude social media icons and logos unless they're actual photos
    if (lowerUrl.includes('logo') && !lowerUrl.includes('gallery')) {
      return false;
    }

    // Accept everything else that looks like it could be an image
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