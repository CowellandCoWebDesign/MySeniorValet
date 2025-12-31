import { groqPerplexityWrapper, isGroqAvailable } from './groq-ai-wrapper';
import { communityWebsiteCrawler } from './community-website-crawler';

// Comprehensive list of virtual tour platforms and their patterns
const VIRTUAL_TOUR_PATTERNS = {
  matterport: {
    name: 'Matterport',
    domains: ['matterport.com', 'my.matterport.com'],
    urlPatterns: [
      /matterport\.com\/show\/\?m=[\w-]+/i,
      /my\.matterport\.com\/show\/\?m=[\w-]+/i,
      /matterport\.com\/models\/[\w-]+/i,
      /matterport\.com\/discover\/space\/[\w-]+/i
    ],
    embedPatterns: [
      /iframe.*src=["'].*matterport\.com/i,
      /data-matterport-id=["']([\w-]+)/i,
      /matterport-showcase/i
    ]
  },
  youvisit: {
    name: 'YouVisit',
    domains: ['youvisit.com', 'tours.youvisit.com'],
    urlPatterns: [
      /youvisit\.com\/tour\/[\w-]+/i,
      /tours\.youvisit\.com\/[\w-]+/i,
      /youvisit\.com\/embed\/[\w-]+/i
    ],
    embedPatterns: [
      /iframe.*src=["'].*youvisit\.com/i,
      /data-youvisit-id=["']([\w-]+)/i,
      /youvisit-tour/i
    ]
  },
  kuula: {
    name: 'Kuula',
    domains: ['kuula.co'],
    urlPatterns: [
      /kuula\.co\/share\/[\w-]+/i,
      /kuula\.co\/share\/collection\/[\w-]+/i,
      /kuula\.co\/post\/[\w-]+/i
    ],
    embedPatterns: [
      /iframe.*src=["'].*kuula\.co/i,
      /kuula-embed/i
    ]
  },
  roundme: {
    name: 'Roundme',
    domains: ['roundme.com'],
    urlPatterns: [
      /roundme\.com\/tour\/[\w-]+/i,
      /roundme\.com\/embed\/[\w-]+/i
    ],
    embedPatterns: [
      /iframe.*src=["'].*roundme\.com/i,
      /roundme-embed/i
    ]
  },
  threesixty: {
    name: '360° Tours',
    domains: ['360.io', 'tour360.com', '360tour.com'],
    urlPatterns: [
      /360\.io\/[\w-]+/i,
      /tour360\.com\/[\w-]+/i,
      /360tour\.com\/[\w-]+/i
    ],
    embedPatterns: [
      /iframe.*src=["'].*360/i,
      /data-360-tour/i,
      /360-virtual-tour/i
    ]
  },
  panoskin: {
    name: 'Panoskin',
    domains: ['panoskin.com'],
    urlPatterns: [
      /panoskin\.com\/panos\/[\w-]+/i
    ],
    embedPatterns: [
      /iframe.*src=["'].*panoskin\.com/i,
      /panoskin-tour/i
    ]
  },
  eyespy360: {
    name: 'EyeSpy360',
    domains: ['eyespy360.com'],
    urlPatterns: [
      /eyespy360\.com\/[\w-]+/i,
      /tours\.eyespy360\.com\/[\w-]+/i
    ],
    embedPatterns: [
      /iframe.*src=["'].*eyespy360\.com/i,
      /eyespy360-tour/i
    ]
  },
  cupix: {
    name: 'Cupix',
    domains: ['cupix.com'],
    urlPatterns: [
      /cupix\.com\/tour\/[\w-]+/i,
      /player\.cupix\.com\/p\/[\w-]+/i
    ],
    embedPatterns: [
      /iframe.*src=["'].*cupix\.com/i,
      /cupix-player/i
    ]
  },
  pano2vr: {
    name: 'Pano2VR',
    domains: [],
    urlPatterns: [],
    embedPatterns: [
      /pano2vr_player/i,
      /p2q_embed_object/i,
      /panorama.*\.xml/i
    ]
  },
  generic: {
    name: 'Virtual Tour',
    domains: [],
    urlPatterns: [],
    embedPatterns: [
      /virtual[-_]?tour/i,
      /3d[-_]?tour/i,
      /360[-_]?tour/i,
      /panoram(a|ic)/i,
      /walkthrough/i,
      /interactive[-_]?tour/i
    ]
  }
};

// Keywords to search for virtual tours - expanded with more variations
const VIRTUAL_TOUR_KEYWORDS = [
  'virtual tour',
  '3D tour',
  '3d tour',
  '360 tour',
  '360° tour',
  '360-degree tour',
  '360 degree tour',
  'three sixty tour',
  'matterport',
  'interactive tour',
  'walkthrough',
  'virtual walkthrough',
  'panoramic tour',
  'immersive tour',
  'online tour',
  'digital tour',
  'view online',
  'vr tour',
  'virtual reality tour'
];

export interface VirtualTourResult {
  found: boolean;
  platform?: string;
  tourUrl?: string;
  embedUrl?: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'perplexity' | 'website' | 'website_crawler' | 'cached' | 'error';
  detectionMethod?: string;
  metadata?: {
    foundElements?: string[];
    galleryUrls?: string[];
    videoUrls?: string[];
  };
  lastChecked: Date;
}

export class VirtualTourDetectorService {
  private cache: Map<number, VirtualTourResult> = new Map();
  private cacheTimeout = 3600000; // 1 hour cache

  constructor() {
    console.log(`🆓 VirtualTourDetector using Groq (FREE) - Groq available: ${isGroqAvailable()}`);
  }

  /**
   * Detect virtual tour for a community using multiple methods
   */
  async detectVirtualTour(
    communityId: number,
    communityName: string,
    website?: string,
    forceRefresh = false
  ): Promise<VirtualTourResult> {
    // Check cache first
    if (!forceRefresh && this.cache.has(communityId)) {
      const cached = this.cache.get(communityId)!;
      const age = Date.now() - cached.lastChecked.getTime();
      if (age < this.cacheTimeout) {
        return { ...cached, source: 'cached' };
      }
    }

    try {
      // Method 1: If we have a website, use Playwright to crawl it directly
      if (website && website !== '-' && website !== '') {
        console.log(`🔍 Using Playwright to crawl ${website} for virtual tours...`);
        
        const crawlResult = await communityWebsiteCrawler.crawlForVirtualTour(website, communityName);
        
        if (crawlResult.virtualTourUrl) {
          const platform = this.identifyPlatform(crawlResult.virtualTourUrl);
          const result: VirtualTourResult = {
            found: true,
            platform: platform || 'Unknown',
            tourUrl: crawlResult.virtualTourUrl,
            embedUrl: this.convertToEmbedUrl(crawlResult.virtualTourUrl, platform),
            confidence: crawlResult.confidence,
            source: 'website_crawler',
            detectionMethod: 'playwright_crawl',
            metadata: {
              foundElements: crawlResult.foundElements,
              galleryUrls: crawlResult.galleryUrls,
              videoUrls: crawlResult.videoUrls
            },
            lastChecked: new Date()
          };
          
          this.cache.set(communityId, result);
          console.log(`✅ Playwright found virtual tour: ${crawlResult.virtualTourUrl}`);
          return result;
        }
        
        // If crawler found galleries or videos but no direct tour, include them in metadata
        // but don't mark as found unless we actually found a tour
        if ((crawlResult.galleryUrls && crawlResult.galleryUrls.length > 0) || 
            (crawlResult.videoUrls && crawlResult.videoUrls.length > 0)) {
          const result: VirtualTourResult = {
            found: false, // No actual tour found, just galleries/videos
            confidence: 'low',
            source: 'website_crawler',
            detectionMethod: 'galleries_checked_no_tour',
            metadata: {
              foundElements: crawlResult.foundElements,
              galleryUrls: crawlResult.galleryUrls,
              videoUrls: crawlResult.videoUrls
            },
            lastChecked: new Date()
          };
          
          this.cache.set(communityId, result);
          console.log(`📸 Found galleries/videos but no virtual tour on ${website}`);
          // Continue to check Perplexity as fallback
        }
      }

      // Method 2: Ask Perplexity about virtual tours as fallback or if no website
      const perplexityResult = await this.searchWithPerplexity(communityName);
      
      // Cache and return the result
      this.cache.set(communityId, perplexityResult);
      return perplexityResult;

    } catch (error) {
      console.error(`Error detecting virtual tour for ${communityName}:`, error);
      return {
        found: false,
        confidence: 'low',
        source: 'error',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Search for virtual tours using Groq AI (FREE replacement for Perplexity)
   */
  private async searchWithPerplexity(communityName: string): Promise<VirtualTourResult> {
    try {
      const query = `Does "${communityName}" senior living community have a virtual tour, 360 tour, 360° tour, 3D tour, Matterport tour, interactive tour, or online walkthrough? Look for any buttons or links labeled "360 tour", "virtual tour", "view online", or "take a tour". If yes, what is the direct URL to view it? Check if the tour redirects to Matterport.com or any other virtual tour platform.`;
      
      // Use Groq (FREE) instead of Perplexity (paid)
      const response = await groqPerplexityWrapper.searchCommunityInfo(query);

      if (!response.data) {
        return {
          found: false,
          confidence: 'medium',
          source: 'perplexity',
          lastChecked: new Date()
        };
      }

      // Parse response for tour URLs
      const tourUrl = this.extractTourUrl(response.data);
      
      if (tourUrl) {
        const platform = this.identifyPlatform(tourUrl);
        return {
          found: true,
          platform: platform || 'Unknown',
          tourUrl,
          embedUrl: this.convertToEmbedUrl(tourUrl, platform),
          confidence: 'high',
          source: 'perplexity',
          detectionMethod: 'perplexity_direct',
          lastChecked: new Date()
        };
      }

      // Check if response indicates a tour exists but no URL found
      const hasTourKeywords = VIRTUAL_TOUR_KEYWORDS.some(keyword => 
        response.data.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasTourKeywords && response.data.toLowerCase().includes('yes')) {
        return {
          found: true,
          confidence: 'low',
          source: 'perplexity',
          detectionMethod: 'perplexity_mentioned',
          lastChecked: new Date()
        };
      }

      return {
        found: false,
        confidence: 'medium',
        source: 'perplexity',
        lastChecked: new Date()
      };

    } catch (error) {
      console.error('Perplexity search error:', error);
      return {
        found: false,
        confidence: 'low',
        source: 'perplexity',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Scan a website for virtual tour links and embeds
   */
  private async scanWebsite(websiteUrl: string, communityName: string): Promise<VirtualTourResult> {
    try {
      // Use Groq (FREE) to scan the website
      const query = `Scan the website ${websiteUrl} for any virtual tours, 360 tours, 360° tours, 3D tours, Matterport tours, or interactive tours. Look for buttons or links labeled "360 tour", "virtual tour", "view online", "take a tour" in navigation menus, galleries, amenities pages, hero sections, or footer. Follow any redirect links to find the actual tour URL. Return the direct tour URL if found.`;
      
      const response = await groqPerplexityWrapper.searchCommunityInfo(query);

      if (!response.data) {
        return {
          found: false,
          confidence: 'low',
          source: 'website',
          lastChecked: new Date()
        };
      }

      const tourUrl = this.extractTourUrl(response.data);
      
      if (tourUrl) {
        const platform = this.identifyPlatform(tourUrl);
        return {
          found: true,
          platform: platform || 'Unknown',
          tourUrl,
          embedUrl: this.convertToEmbedUrl(tourUrl, platform),
          confidence: 'high',
          source: 'website',
          detectionMethod: 'website_scan',
          lastChecked: new Date()
        };
      }

      return {
        found: false,
        confidence: 'medium',
        source: 'website',
        lastChecked: new Date()
      };

    } catch (error) {
      console.error('Website scan error:', error);
      return {
        found: false,
        confidence: 'low',
        source: 'website',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Search for tour links using search engines
   */
  private async searchForTourLinks(communityName: string): Promise<VirtualTourResult> {
    try {
      // Search for tour links on known platforms
      const platformSearches = [
        `"${communityName}" site:matterport.com`,
        `"${communityName}" site:youvisit.com`,
        `"${communityName}" site:kuula.co`,
        `"${communityName}" "virtual tour"`,
        `"${communityName}" "3D tour"`,
        `"${communityName}" "360 tour"`
      ];

      for (const searchQuery of platformSearches) {
        // Use Groq (FREE) instead of Perplexity
        const response = await groqPerplexityWrapper.searchCommunityInfo(searchQuery);

        if (response.data) {
          const tourUrl = this.extractTourUrl(response.data);
          
          if (tourUrl) {
            const platform = this.identifyPlatform(tourUrl);
            return {
              found: true,
              platform: platform || 'Unknown',
              tourUrl,
              embedUrl: this.convertToEmbedUrl(tourUrl, platform),
              confidence: 'medium',
              source: 'perplexity',
              detectionMethod: 'search_engine',
              lastChecked: new Date()
            };
          }
        }
      }

      return {
        found: false,
        confidence: 'high',
        source: 'perplexity',
        lastChecked: new Date()
      };

    } catch (error) {
      console.error('Search error:', error);
      return {
        found: false,
        confidence: 'low',
        source: 'perplexity',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Extract tour URL from text
   */
  private extractTourUrl(text: string): string | null {
    // Check if text is provided
    if (!text) {
      return null;
    }
    
    // Look for URLs in the text
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
    const urls = text.match(urlRegex) || [];

    // First pass: look for direct tour platform URLs
    for (const url of urls) {
      // Check if URL matches any known platform
      for (const platform of Object.values(VIRTUAL_TOUR_PATTERNS)) {
        for (const domain of platform.domains) {
          if (url.includes(domain)) {
            return url;
          }
        }
        for (const pattern of platform.urlPatterns) {
          if (pattern.test(url)) {
            return url;
          }
        }
      }
    }

    // Second pass: look for any URL near tour keywords
    // This catches cases where the tour link might not be on a known platform
    const tourKeywordPatterns = [
      /360[\s-]?tour/i,
      /virtual[\s-]?tour/i,
      /3d[\s-]?tour/i,
      /interactive[\s-]?tour/i,
      /view[\s-]?online/i,
      /take[\s-]?a[\s-]?tour/i,
      /video[\s-]?tour/i,
      /online[\s-]?tour/i,
      /gallery/i,
      /photo[\s-]?gallery/i,
      /video[\s-]?gallery/i
    ];
    
    for (const url of urls) {
      // Check if the URL text or surrounding text contains tour keywords
      const urlIndex = text.indexOf(url);
      const contextStart = Math.max(0, urlIndex - 100);
      const contextEnd = Math.min(text.length, urlIndex + url.length + 100);
      const context = text.slice(contextStart, contextEnd).toLowerCase();
      
      if (tourKeywordPatterns.some(pattern => pattern.test(context))) {
        // This URL is likely a tour link based on context
        return url;
      }
    }

    // Third pass: If text mentions a tour exists but we can't find a direct URL,
    // look for the community's main website URL
    const textLower = text.toLowerCase();
    if (textLower.includes('virtual tour') || 
        textLower.includes('360 tour') ||
        textLower.includes('video tour') ||
        textLower.includes('interactive tour') ||
        textLower.includes('online tour')) {
      
      // Return the first website URL we find - the tour is likely on their site
      for (const url of urls) {
        // Skip social media and common non-tour sites
        if (!url.includes('facebook.com') && 
            !url.includes('twitter.com') && 
            !url.includes('instagram.com') &&
            !url.includes('youtube.com') &&
            !url.includes('linkedin.com')) {
          return url;
        }
      }
    }

    return null;
  }

  /**
   * Identify which platform a tour URL belongs to
   */
  private identifyPlatform(url: string): string | null {
    for (const [key, platform] of Object.entries(VIRTUAL_TOUR_PATTERNS)) {
      // Check domains
      for (const domain of platform.domains) {
        if (url.includes(domain)) {
          return platform.name;
        }
      }
      // Check URL patterns
      for (const pattern of platform.urlPatterns) {
        if (pattern.test(url)) {
          return platform.name;
        }
      }
    }
    return null;
  }

  /**
   * Convert a tour URL to an embeddable URL
   */
  private convertToEmbedUrl(url: string, platform: string | null): string {
    if (!platform) return url;

    // Platform-specific embed conversions
    switch (platform) {
      case 'Matterport':
        // Convert showcase URL to embed URL
        if (url.includes('/show/')) {
          return url.replace('/show/', '/embed/') + '&play=1&qs=1';
        }
        return url;
        
      case 'YouVisit':
        // Convert tour URL to embed URL
        if (url.includes('/tour/')) {
          return url.replace('/tour/', '/embed/');
        }
        return url;
        
      case 'Kuula':
        // Kuula URLs are already embeddable
        return url;
        
      default:
        return url;
    }
  }

  /**
   * Clear cache for a specific community
   */
  clearCache(communityId: number): void {
    this.cache.delete(communityId);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const virtualTourDetector = new VirtualTourDetectorService();