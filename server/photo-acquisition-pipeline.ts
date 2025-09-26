import fetch from 'node-fetch';

interface PhotoAsset {
  url: string;
  sourceType: 'google_images' | 'bing_images' | 'website' | 'directory' | 'social_media';
  sourceUrl: string;
  licenseHint?: string;
  retrievedAt: Date;
  confidence: number;
  width?: number;
  height?: number;
}

interface PhotoSource {
  type: string;
  url: string;
  priority: number;
}

export class PhotoAcquisitionPipeline {
  private static readonly GOOGLE_CUSTOM_SEARCH_API_KEY = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  private static readonly GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
  private static readonly BING_SEARCH_API_KEY = process.env.BING_SEARCH_API_KEY;

  /**
   * Main entry point for photo acquisition
   */
  static async acquirePhotos(
    businessName: string,
    location: { city?: string; state?: string; country?: string },
    businessType?: string,
    website?: string,
    perplexityResponse?: string
  ): Promise<PhotoAsset[]> {
    console.log(`🎯 Starting PhotoAcquisitionPipeline for ${businessName}`);
    
    const allPhotos: PhotoAsset[] = [];
    const seenUrls = new Set<string>();

    // Stage 1: Parse Perplexity response for source locations and crawl them
    const sources = this.extractSourcesFromPerplexity(perplexityResponse || '');
    console.log(`📍 Found ${sources.length} potential sources from Perplexity`);
    
    // Crawl high-priority sources from Perplexity (skip blocked sites)
    for (const source of sources.slice(0, 5)) {
      if (source.type === 'website' || 
          (source.type === 'google_maps' && source.url.includes('google.com/maps'))) {
        try {
          console.log(`🕷️ Crawling ${source.type}: ${source.url}`);
          const crawledPhotos = await this.crawlSourceWithFallbacks(source.url, businessName);
          for (const photo of crawledPhotos) {
            if (!seenUrls.has(photo.url)) {
              seenUrls.add(photo.url);
              allPhotos.push(photo);
            }
          }
          if (crawledPhotos.length > 0) {
            console.log(`✅ Found ${crawledPhotos.length} photos from ${source.type}`);
          }
        } catch (error) {
          console.log(`⚠️ Failed to crawl ${source.type}: ${error}`);
        }
      }
    }

    // Stage 2: Google Images Search (if API key available)
    if (this.GOOGLE_CUSTOM_SEARCH_API_KEY && this.GOOGLE_CSE_ID) {
      try {
        const googlePhotos = await this.searchGoogleImages(businessName, location, businessType);
        for (const photo of googlePhotos) {
          if (!seenUrls.has(photo.url)) {
            seenUrls.add(photo.url);
            allPhotos.push(photo);
          }
        }
        console.log(`✅ Google Images: Found ${googlePhotos.length} photos`);
      } catch (error) {
        console.log(`⚠️ Google Images search failed:`, error);
      }
    } else {
      console.log(`⚠️ Google Images API keys not configured`);
    }

    // Stage 3: Bing Images Search (Fallback)
    if (allPhotos.length < 10 && this.BING_SEARCH_API_KEY) {
      try {
        const bingPhotos = await this.searchBingImages(businessName, location, businessType);
        for (const photo of bingPhotos) {
          if (!seenUrls.has(photo.url)) {
            seenUrls.add(photo.url);
            allPhotos.push(photo);
          }
        }
        console.log(`✅ Bing Images: Found ${bingPhotos.length} photos`);
      } catch (error) {
        console.log(`⚠️ Bing Images search failed:`, error);
      }
    }

    // Stage 4: Direct website crawl (if we have a website)
    if (website && !website.includes('instagram') && !website.includes('facebook') && !website.includes('yelp')) {
      try {
        const websitePhotos = await this.crawlWebsiteDirectly(website, businessName);
        for (const photo of websitePhotos) {
          if (!seenUrls.has(photo.url)) {
            seenUrls.add(photo.url);
            allPhotos.push(photo);
          }
        }
        console.log(`✅ Website crawl: Found ${websitePhotos.length} photos`);
      } catch (error) {
        console.log(`⚠️ Website crawl failed:`, error);
      }
    }

    // Stage 5: Score and sort photos by confidence
    const scoredPhotos = this.scoreAndRankPhotos(allPhotos);
    
    // Log results
    if (scoredPhotos.length === 0) {
      console.log(`⚠️ PhotoAcquisitionPipeline: No photos found for ${businessName}`);
      console.log(`   Reasons: Google API ${this.GOOGLE_CUSTOM_SEARCH_API_KEY ? 'configured' : 'not configured'}`);
      console.log(`   Bing API ${this.BING_SEARCH_API_KEY ? 'configured' : 'not configured'}`);
      console.log(`   Sources checked: ${sources.length}`);
    } else {
      console.log(`🎉 PhotoAcquisitionPipeline complete: ${scoredPhotos.length} total photos`);
    }
    
    return scoredPhotos.slice(0, 50); // Return top 50 photos
  }

  /**
   * Crawl a source with appropriate fallback methods
   */
  private static async crawlSourceWithFallbacks(
    url: string, 
    businessName: string
  ): Promise<PhotoAsset[]> {
    const photos: PhotoAsset[] = [];
    
    // Skip known problematic sites
    if (url.includes('instagram.com') || 
        url.includes('facebook.com') || 
        url.includes('yelp.com') || 
        url.includes('tripadvisor.com')) {
      console.log(`⏭️ Skipping blocked site: ${url}`);
      return photos;
    }
    
    // For Google Maps, extract place info and use Places API if available
    if (url.includes('google.com/maps')) {
      console.log(`🗺️ Extracting Google Maps place data from: ${url}`);
      // Extract place name for search
      const placeMatch = url.match(/place\/([^/@]+)/);
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        console.log(`📍 Google Maps place: ${placeName}`);
        // Could use Google Places API here if configured
      }
      return photos; // Can't directly scrape Google Maps
    }
    
    // Try simple HTML scrape for regular websites
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        const extractedPhotos = this.extractImagesFromHTML(html, url, businessName);
        
        for (const photoUrl of extractedPhotos) {
          photos.push({
            url: photoUrl,
            sourceType: 'directory',
            sourceUrl: url,
            retrievedAt: new Date(),
            confidence: 0.75
          });
        }
        
        console.log(`📸 Extracted ${photos.length} photos from ${new URL(url).hostname}`);
      }
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);
    }
    
    return photos;
  }
  
  /**
   * Extract image URLs from HTML content
   */
  private static extractImagesFromHTML(html: string, baseUrl: string, businessName: string): string[] {
    const images: string[] = [];
    const baseUrlObj = new URL(baseUrl);
    
    // Multiple regex patterns for different image formats
    const patterns = [
      /<img[^>]+src=["']([^"']+)["']/gi,
      /<img[^>]+data-src=["']([^"']+)["']/gi,
      /<img[^>]+data-lazy-src=["']([^"']+)["']/gi,
      /background-image:\s*url\(["']?([^"')]+)["']?\)/gi,
      /data-bg=["']([^"']+)["']/gi
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let imgUrl = match[1];
        
        // Make URL absolute
        if (imgUrl.startsWith('//')) {
          imgUrl = 'https:' + imgUrl;
        } else if (imgUrl.startsWith('/')) {
          imgUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${imgUrl}`;
        } else if (!imgUrl.startsWith('http')) {
          imgUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}/${imgUrl}`;
        }
        
        // Filter images - keep only likely business photos
        const isLikelyBusinessPhoto = 
          !imgUrl.includes('logo') &&
          !imgUrl.includes('icon') &&
          !imgUrl.includes('button') &&
          !imgUrl.includes('arrow') &&
          !imgUrl.includes('banner') &&
          !imgUrl.endsWith('.svg') &&
          !imgUrl.includes('placeholder') &&
          !imgUrl.includes('spinner') &&
          !imgUrl.includes('loading') &&
          (imgUrl.includes('.jpg') || 
           imgUrl.includes('.jpeg') || 
           imgUrl.includes('.png') || 
           imgUrl.includes('.webp'));
        
        if (isLikelyBusinessPhoto && !images.includes(imgUrl)) {
          images.push(imgUrl);
        }
      }
    }
    
    return images;
  }

  /**
   * Extract source locations from Perplexity response
   */
  private static extractSourcesFromPerplexity(response: string): PhotoSource[] {
    const sources: PhotoSource[] = [];
    
    // Look for URLs in the response
    const urlRegex = /https?:\/\/[^\s]+/gi;
    const urls = response.match(urlRegex) || [];
    
    for (const url of urls) {
      let type = 'unknown';
      let priority = 5;
      
      if (url.includes('google.com/maps')) {
        type = 'google_maps';
        priority = 1;
      } else if (url.includes('yelp.com')) {
        type = 'yelp';
        priority = 2;
      } else if (url.includes('tripadvisor')) {
        type = 'tripadvisor';
        priority = 2;
      } else if (url.includes('facebook.com')) {
        type = 'facebook';
        priority = 3;
      } else if (url.includes('instagram.com')) {
        type = 'instagram';
        priority = 3;
      } else if (!url.includes('wikipedia') && !url.includes('linkedin')) {
        type = 'website';
        priority = 4;
      }
      
      if (type !== 'unknown') {
        sources.push({ type, url: url.replace(/[,\s\)]+$/, ''), priority });
      }
    }
    
    return sources.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Search Google Images using Custom Search API
   */
  private static async searchGoogleImages(
    businessName: string,
    location: { city?: string; state?: string; country?: string },
    businessType?: string
  ): Promise<PhotoAsset[]> {
    const photos: PhotoAsset[] = [];
    
    // Build search query
    const locationStr = [location.city, location.state, location.country].filter(Boolean).join(' ');
    const searchQuery = `"${businessName}" ${locationStr} ${businessType || ''}`.trim();
    
    console.log(`🔍 Google Images search: ${searchQuery}`);
    
    // Use Google Custom Search API
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', this.GOOGLE_CUSTOM_SEARCH_API_KEY);
    searchUrl.searchParams.append('cx', this.GOOGLE_CSE_ID);
    searchUrl.searchParams.append('q', searchQuery);
    searchUrl.searchParams.append('searchType', 'image');
    searchUrl.searchParams.append('num', '10'); // Get 10 results
    searchUrl.searchParams.append('safe', 'active');
    
    try {
      const response = await fetch(searchUrl.toString());
      if (response.ok) {
        const data = await response.json() as any;
        
        if (data.items && Array.isArray(data.items)) {
          for (const item of data.items) {
            if (item.link) {
              photos.push({
                url: item.link,
                sourceType: 'google_images',
                sourceUrl: item.image?.contextLink || '',
                licenseHint: item.image?.rights || undefined,
                retrievedAt: new Date(),
                confidence: 0.8,
                width: item.image?.width,
                height: item.image?.height
              });
            }
          }
        }
      } else {
        console.log(`Google Custom Search API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Google Images search error:', error);
    }
    
    return photos;
  }

  /**
   * Search Bing Images as fallback
   */
  private static async searchBingImages(
    businessName: string,
    location: { city?: string; state?: string; country?: string },
    businessType?: string
  ): Promise<PhotoAsset[]> {
    const photos: PhotoAsset[] = [];
    
    if (!this.BING_SEARCH_API_KEY) {
      return photos;
    }
    
    const locationStr = [location.city, location.state, location.country].filter(Boolean).join(' ');
    const searchQuery = `"${businessName}" ${locationStr} ${businessType || ''}`.trim();
    
    console.log(`🔍 Bing Images search: ${searchQuery}`);
    
    const searchUrl = new URL('https://api.bing.microsoft.com/v7.0/images/search');
    searchUrl.searchParams.append('q', searchQuery);
    searchUrl.searchParams.append('count', '10');
    searchUrl.searchParams.append('safeSearch', 'Moderate');
    
    try {
      const response = await fetch(searchUrl.toString(), {
        headers: {
          'Ocp-Apim-Subscription-Key': this.BING_SEARCH_API_KEY
        }
      });
      
      if (response.ok) {
        const data = await response.json() as any;
        
        if (data.value && Array.isArray(data.value)) {
          for (const item of data.value) {
            if (item.contentUrl) {
              photos.push({
                url: item.contentUrl,
                sourceType: 'bing_images',
                sourceUrl: item.hostPageUrl || '',
                retrievedAt: new Date(),
                confidence: 0.7,
                width: item.width,
                height: item.height
              });
            }
          }
        }
      } else {
        console.log(`Bing Search API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Bing Images search error:', error);
    }
    
    return photos;
  }

  /**
   * Crawl website directly for images (simple approach)
   */
  private static async crawlWebsiteDirectly(
    website: string,
    businessName: string
  ): Promise<PhotoAsset[]> {
    const photos: PhotoAsset[] = [];
    
    try {
      // Simple HTML fetch and parse
      const response = await fetch(website, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // Extract image URLs from HTML
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;
        
        while ((match = imgRegex.exec(html)) !== null) {
          let imgUrl = match[1];
          
          // Make URL absolute
          if (imgUrl.startsWith('//')) {
            imgUrl = 'https:' + imgUrl;
          } else if (imgUrl.startsWith('/')) {
            const url = new URL(website);
            imgUrl = `${url.protocol}//${url.host}${imgUrl}`;
          } else if (!imgUrl.startsWith('http')) {
            const url = new URL(website);
            imgUrl = `${url.protocol}//${url.host}/${imgUrl}`;
          }
          
          // Filter out logos, icons, etc.
          if (!imgUrl.includes('logo') && 
              !imgUrl.includes('icon') && 
              !imgUrl.endsWith('.svg') &&
              (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || 
               imgUrl.includes('.png') || imgUrl.includes('.webp'))) {
            photos.push({
              url: imgUrl,
              sourceType: 'website',
              sourceUrl: website,
              retrievedAt: new Date(),
              confidence: 0.9
            });
          }
        }
      }
    } catch (error) {
      console.error('Website crawl error:', error);
    }
    
    return photos;
  }

  /**
   * Score and rank photos by relevance and quality
   */
  private static scoreAndRankPhotos(photos: PhotoAsset[]): PhotoAsset[] {
    return photos.sort((a, b) => {
      // Prefer higher confidence
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      
      // Prefer direct website sources
      if (a.sourceType === 'website' && b.sourceType !== 'website') return -1;
      if (b.sourceType === 'website' && a.sourceType !== 'website') return 1;
      
      // Prefer Google Images over Bing
      if (a.sourceType === 'google_images' && b.sourceType === 'bing_images') return -1;
      if (b.sourceType === 'google_images' && a.sourceType === 'bing_images') return 1;
      
      // Prefer larger images
      const aSize = (a.width || 0) * (a.height || 0);
      const bSize = (b.width || 0) * (b.height || 0);
      return bSize - aSize;
    });
  }
}