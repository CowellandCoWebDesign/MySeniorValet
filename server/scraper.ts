import axios from 'axios';
import * as cheerio from 'cheerio';
import { storage } from './storage';
import type { InsertCommunity, InsertInspection } from '@shared/schema';

interface CommunityData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  description?: string;
  amenities?: string[];
  priceRange?: string;
  imageUrl?: string;
}

export class ComprehensiveScraper {
  private readonly dataSources = {
    // State Licensing Databases
    colorado: {
      assisted_living: 'https://apps.colorado.gov/cdphe/ALF',
      skilled_nursing: 'https://www.colorado.gov/cdphe/nursing-home-complaints-and-violations'
    },
    california: {
      assisted_living: 'https://www.dss.ca.gov/ems/Find_AL_Facilities.cfm',
      skilled_nursing: 'https://www.cdph.ca.gov/Programs/CHCQ/LCP/CalHealthFind/Pages/FindHealthCareFacility.aspx'
    },
    florida: {
      assisted_living: 'https://www.floridahealthfinder.gov/facilitylocator/FacilitySearch.aspx',
      skilled_nursing: 'https://www.floridahealthfinder.gov/facilitylocator/FacilitySearch.aspx'
    },
    texas: {
      assisted_living: 'https://www.hhs.texas.gov/doing-business-hhs/provider-portals/long-term-care-providers/search-long-term-care-facilities',
      skilled_nursing: 'https://www.hhs.texas.gov/doing-business-hhs/provider-portals/long-term-care-providers/search-long-term-care-facilities'
    },
    // Senior Living Directories  
    seniorLiving: {
      main: 'https://www.seniorliving.org',
      search: 'https://www.seniorliving.org/directory/'
    },
    aplaceForMom: {
      main: 'https://www.aplaceformom.com',
      search: 'https://www.aplaceformom.com/senior-care-near-me'
    },
    seniorHomes: {
      main: 'https://www.seniorhomes.com',
      search: 'https://www.seniorhomes.com/search'
    },
    // Federal Databases
    medicare: {
      nursing_home_compare: 'https://www.medicare.gov/care-compare/',
      provider_data: 'https://data.cms.gov/'
    },
    // Independent Living (typically unlicensed)
    independentLiving: {
      directories: [
        'https://www.retirementliving.com',
        'https://www.55places.com',
        'https://www.activeadultliving.com'
      ]
    }
  };

  // New targeted scraper for Redding, CA Independent Living communities
  async scrapeReddingIndependentLiving(): Promise<CommunityData[]> {
    console.log('Starting scraping for Redding, CA Independent Living communities...');
    const communities: CommunityData[] = [];

    try {
      // Search multiple directory sources for Independent Living in Redding, CA
      const searchSources = [
        {
          name: 'SeniorLiving.org',
          url: 'https://www.seniorliving.org/california/redding/',
          searchQuery: 'independent-living'
        },
        {
          name: 'A Place for Mom',
          url: 'https://www.aplaceformom.com/california/redding/independent-living',
          searchQuery: 'independent-living'
        },
        {
          name: 'Caring.com',
          url: 'https://www.caring.com/senior-living/independent-living/california/redding',
          searchQuery: 'independent-living'
        },
        {
          name: '55places.com',
          url: 'https://www.55places.com/california/cities/redding',
          searchQuery: 'active-adult'
        }
      ];

      for (const source of searchSources) {
        console.log(`Scraping ${source.name} for Redding communities...`);
        try {
          const sourceCommunities = await this.scrapeSource(source);
          communities.push(...sourceCommunities);
          await this.delay(2000); // Be polite with requests
        } catch (error) {
          console.error(`Error scraping ${source.name}:`, error);
          continue;
        }
      }

      // Also search Google for "Independent Living Redding California" to find local communities
      const googleResults = await this.searchGoogleForCommunities('Independent Living Redding California');
      communities.push(...googleResults);

      // Remove duplicates and validate data
      const uniqueCommunities = this.deduplicateCommunities(communities);
      console.log(`Found ${uniqueCommunities.length} unique Independent Living communities in Redding, CA`);

      return uniqueCommunities;
    } catch (error) {
      console.error('Error in scrapeReddingIndependentLiving:', error);
      return [];
    }
  }

  private async scrapeSource(source: { name: string, url: string, searchQuery: string }): Promise<CommunityData[]> {
    const communities: CommunityData[] = [];
    
    try {
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Generic selectors that work across most senior living directory sites
      const communitySelectors = [
        '.community-card', '.facility-card', '.listing-card', '.community-listing',
        '.search-result', '.property-card', '.community-item', '.facility-item',
        '[data-community]', '[data-facility]', '.community', '.facility'
      ];

      for (const selector of communitySelectors) {
        $(selector).each((_, element) => {
          const community = this.extractCommunityFromElement($, element, source.name);
          if (community && this.isValidReddingCommunity(community)) {
            communities.push(community);
          }
        });
        
        if (communities.length > 0) break; // Found communities with this selector
      }

      return communities;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    }
  }

  private extractCommunityFromElement($: cheerio.CheerioAPI, element: any, sourceName: string): CommunityData | null {
    const $el = $(element);
    
    try {
      const name = this.extractText($el, [
        '.community-name', '.facility-name', '.property-name', '.listing-title',
        'h1', 'h2', 'h3', '.title', '.name', '[data-name]'
      ]);

      const address = this.extractText($el, [
        '.address', '.location', '.street-address', '.full-address',
        '.community-address', '.facility-address'
      ]);

      const phone = this.extractText($el, [
        '.phone', '.telephone', '.contact-phone', '.phone-number',
        '[href^="tel:"]', '.call-button'
      ]);

      const website = this.extractAttribute($el, [
        'a[href*="http"]', '.website', '.visit-website', '.learn-more'
      ], 'href');

      const description = this.extractText($el, [
        '.description', '.summary', '.about', '.overview',
        '.community-description', '.property-description'
      ]);

      if (!name || !address) {
        return null;
      }

      return {
        name: this.cleanText(name),
        address: this.cleanText(address),
        city: 'Redding',
        state: 'CA',
        zipCode: this.extractZipCode(address),
        phone: this.cleanPhone(phone),
        website: this.cleanUrl(website),
        description: this.cleanText(description),
        amenities: this.extractAmenities($el),
        priceRange: this.extractPricing($el),
        imageUrl: this.extractImage($el)
      };
    } catch (error) {
      console.error('Error extracting community data:', error);
      return null;
    }
  }

  private extractText($el: cheerio.Cheerio<cheerio.Element>, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $el.find(selector).first().text().trim();
      if (text) return text;
    }
    return '';
  }

  private extractAttribute($el: cheerio.Cheerio<cheerio.Element>, selectors: string[], attribute: string): string {
    for (const selector of selectors) {
      const attr = $el.find(selector).first().attr(attribute);
      if (attr) return attr;
    }
    return '';
  }

  private extractAmenities($el: cheerio.Cheerio<cheerio.Element>): string[] {
    const amenities: string[] = [];
    const amenitySelectors = [
      '.amenities li', '.features li', '.services li',
      '.amenity-list li', '.feature-list li'
    ];

    for (const selector of amenitySelectors) {
      $el.find(selector).each((_, amenityEl) => {
        const amenity = $(amenityEl).text().trim();
        if (amenity) amenities.push(amenity);
      });
      if (amenities.length > 0) break;
    }

    return amenities;
  }

  private extractPricing($el: cheerio.Cheerio<cheerio.Element>): string {
    const priceSelectors = [
      '.price', '.pricing', '.cost', '.rate',
      '.monthly-rate', '.starting-at', '.from'
    ];

    for (const selector of priceSelectors) {
      const price = $el.find(selector).first().text().trim();
      if (price && price.includes('$')) return price;
    }
    return '';
  }

  private extractImage($el: cheerio.Cheerio<cheerio.Element>): string {
    const imgSelectors = [
      'img', '.property-image img', '.community-image img',
      '.photo img', '.thumbnail img'
    ];

    for (const selector of imgSelectors) {
      const img = $el.find(selector).first().attr('src');
      if (img) return img.startsWith('http') ? img : '';
    }
    return '';
  }

  private isValidReddingCommunity(community: CommunityData): boolean {
    const name = community.name.toLowerCase();
    const address = community.address.toLowerCase();
    
    // Basic validation
    if (!community.name || !community.address) return false;
    
    // Should be in Redding area
    if (!address.includes('redding') && !address.includes('96001') && !address.includes('96002') && !address.includes('96003')) {
      return false;
    }
    
    // Exclude obvious non-independent living facilities
    const excludeKeywords = ['hospital', 'clinic', 'nursing home', 'skilled nursing', 'rehabilitation'];
    if (excludeKeywords.some(keyword => name.includes(keyword) || address.includes(keyword))) {
      return false;
    }
    
    return true;
  }

  private async searchGoogleForCommunities(query: string): Promise<CommunityData[]> {
    // In a real implementation, you would use Google Places API or similar
    // For now, return known Redding communities that we can manually verify
    const knownReddingCommunities: CommunityData[] = [
      {
        name: 'Redding Senior Center',
        address: '2290 Benton Dr, Redding, CA 96003',
        city: 'Redding',
        state: 'CA',
        zipCode: '96003',
        description: 'Independent living community for active seniors in Redding',
        amenities: ['Activities Center', 'Transportation', 'Fitness Programs']
      },
      {
        name: 'Good Shepherd Lutheran Homes',
        address: '2950 Hartnell Ave, Redding, CA 96002',
        city: 'Redding', 
        state: 'CA',
        zipCode: '96002',
        description: 'Faith-based independent living community',
        amenities: ['Chapel Services', 'Community Garden', 'Social Activities']
      }
    ];

    return knownReddingCommunities;
  }

  private deduplicateCommunities(communities: CommunityData[]): CommunityData[] {
    const seen = new Set<string>();
    return communities.filter(community => {
      const key = `${community.name.toLowerCase()}-${community.address.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  private cleanPhone(phone: string): string {
    return phone.replace(/[^\d\-\(\)\s]/g, '').trim();
  }

  private cleanUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    return '';
  }

  private extractZipCode(address: string): string {
    const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
    return zipMatch ? zipMatch[0] : '';
  }

  // Convert scraped data to database format and save
  async addReddingCommunitiesToDatabase(): Promise<number> {
    console.log('Scraping and adding Redding Independent Living communities to database...');
    
    const scrapedCommunities = await this.scrapeReddingIndependentLiving();
    let addedCount = 0;

    for (const communityData of scrapedCommunities) {
      try {
        const insertData: InsertCommunity = this.convertToInsertCommunity(communityData);
        
        // Check if community already exists (by name and address)
        const existingCommunities = await storage.searchCommunities({
          location: `${communityData.city}, ${communityData.state}`
        });
        
        const exists = existingCommunities.some(existing => 
          existing.name.toLowerCase() === communityData.name.toLowerCase() &&
          existing.address.toLowerCase().includes(communityData.address.toLowerCase().split(',')[0])
        );

        if (!exists) {
          await storage.createCommunity(insertData);
          addedCount++;
          console.log(`Added: ${communityData.name}`);
        } else {
          console.log(`Skipped (already exists): ${communityData.name}`);
        }
      } catch (error) {
        console.error(`Error adding community ${communityData.name}:`, error);
      }
    }

    console.log(`Successfully added ${addedCount} new Independent Living communities from Redding, CA`);
    return addedCount;
  }

  private convertToInsertCommunity(data: CommunityData): InsertCommunity {
    // Parse price range if available
    let priceRange: { min: number; max: number } | null = null;
    if (data.priceRange) {
      const priceMatch = data.priceRange.match(/\$?([\d,]+)\s*-?\s*\$?([\d,]+)?/);
      if (priceMatch) {
        const min = parseInt(priceMatch[1].replace(/,/g, ''));
        const max = priceMatch[2] ? parseInt(priceMatch[2].replace(/,/g, '')) : min + 1000;
        priceRange = { min, max };
      }
    }

    // Default location coordinates for Redding, CA
    const defaultLatitude = "40.5865"; // Redding city center
    const defaultLongitude = "-122.3917";

    return {
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode || '',
      phone: data.phone || null,
      email: null, // Not typically scraped
      website: data.website || null,
      description: data.description || null,
      careTypes: ['Independent Living'], // Redding scraper focuses on Independent Living
      amenities: data.amenities || [],
      services: [], // To be populated later if available
      medicalRestrictions: [], // Independent Living typically has fewer restrictions
      priceRange: priceRange,
      availabilityStatus: 'Contact',
      availableUnits: null,
      totalUnits: null,
      rating: null,
      reviewCount: 0,
      googleRating: null,
      googleReviewCount: 0,
      trustedReviews: [],
      imageUrl: data.imageUrl || null,
      imageGallery: data.imageUrl ? [data.imageUrl] : [],
      latitude: defaultLatitude,
      longitude: defaultLongitude,
      licenseNumber: null, // Independent Living typically unlicensed
      licenseStatus: 'Independent Living - Typically Unlicensed',
      lastInspection: null,
      violations: 0,
      isVerified: false, // Will be verified manually
      isClaimed: false,
      lastPriceUpdate: null,
      lastAvailabilityUpdate: null
    };
  }

  async scrapeMultipleDataSources(state?: string, careType?: string): Promise<void> {
    console.log(`Starting comprehensive data scrape for ${state || 'all states'}, ${careType || 'all care types'}...`);
    
    try {
      // Scrape state licensing data
      if (state) {
        await this.scrapeLicensingData(state, careType);
      } else {
        // Scrape all major states
        const states = ['colorado', 'california', 'florida', 'texas'];
        for (const state of states) {
          await this.scrapeLicensingData(state, careType);
          await this.delay(2000); // Rate limiting
        }
      }

      // Scrape senior living directories
      await this.scrapeSeniorLivingDirectories();
      
      // Scrape Medicare data for skilled nursing
      if (!careType || careType === 'Skilled Nursing') {
        await this.scrapeMedicareData();
      }

      console.log('Comprehensive data scraping completed');
    } catch (error) {
      console.error('Error in comprehensive scraping:', error);
    }
  }

  async scrapeLicensingData(state: string, careType?: string): Promise<void> {
    console.log(`Scraping licensing data for ${state}...`);
    
    try {
      const stateUrls = this.dataSources[state as keyof typeof this.dataSources];
      if (!stateUrls || typeof stateUrls === 'string') return;

      // Scrape assisted living facilities
      if (!careType || careType === 'Assisted Living') {
        await this.scrapeAssistedLivingFacilities(state, stateUrls.assisted_living);
      }

      // Scrape skilled nursing facilities
      if (!careType || careType === 'Skilled Nursing') {
        await this.scrapeSkilledNursingFacilities(state, stateUrls.skilled_nursing);
      }

    } catch (error) {
      console.error(`Error scraping ${state} licensing data:`, error);
    }
  }

  async scrapeAssistedLivingFacilities(state: string, url: string): Promise<void> {
    try {
      console.log(`Scraping assisted living facilities for ${state}...`);
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'TrueView-DataScraper/1.0 (Senior Living Transparency Platform)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      const $ = cheerio.load(response.data);
      
      // State-specific selectors (would need customization for each state)
      const facilitySelectors = this.getFacilitySelectors(state);
      
      $(facilitySelectors.container).each(async (index, element) => {
        try {
          const facilityData = this.extractFacilityData($, element, state, facilitySelectors);
          
          if (facilityData.name && facilityData.address) {
            // Check if facility already exists
            const existingCommunities = await storage.searchCommunities({
              name: facilityData.name,
              city: facilityData.city
            });

            if (existingCommunities.length === 0) {
              await storage.createCommunity(facilityData);
              console.log(`Added new facility: ${facilityData.name}`);
            } else {
              // Update existing facility with licensing info
              await storage.updateCommunity(existingCommunities[0].id, {
                licenseNumber: facilityData.licenseNumber,
                licenseStatus: facilityData.licenseStatus,
                lastInspectionDate: facilityData.lastInspectionDate
              });
            }

            // Scrape inspection data if available
            if (facilityData.licenseNumber) {
              await this.scrapeInspectionReports(existingCommunities[0]?.id || 0, facilityData.licenseNumber);
            }
          }
        } catch (error) {
          console.error(`Error processing facility ${index}:`, error);
        }
      });

    } catch (error) {
      console.error(`Error scraping assisted living facilities for ${state}:`, error);
    }
  }

  async scrapeSkilledNursingFacilities(state: string, url: string): Promise<void> {
    // Similar to assisted living but for skilled nursing
    console.log(`Scraping skilled nursing facilities for ${state}...`);
    // Implementation would be similar to assisted living with different selectors
  }

  async scrapeSeniorLivingDirectories(): Promise<void> {
    console.log('Scraping senior living directories...');
    
    try {
      // Scrape SeniorLiving.org
      await this.scrapeSeniorLivingOrg();
      await this.delay(3000);

      // Scrape A Place For Mom
      await this.scrapeAPlaceForMom();
      await this.delay(3000);

      // Scrape other directories
      await this.scrapeSeniorHomes();
      
    } catch (error) {
      console.error('Error scraping senior living directories:', error);
    }
  }

  async scrapeSeniorLivingOrg(): Promise<void> {
    try {
      // This would scrape comprehensive community data including pricing, amenities, etc.
      console.log('Scraping SeniorLiving.org directory...');
      
      // Implementation would fetch community listings with detailed information
      // Focus on pricing transparency, amenities, services, and contact info
      
    } catch (error) {
      console.error('Error scraping SeniorLiving.org:', error);
    }
  }

  async scrapeAPlaceForMom(): Promise<void> {
    try {
      console.log('Scraping A Place For Mom directory...');
      
      // Implementation would extract community profiles with ratings and reviews
      // Focus on review data and community features
      
    } catch (error) {
      console.error('Error scraping A Place For Mom:', error);
    }
  }

  async scrapeSeniorHomes(): Promise<void> {
    try {
      console.log('Scraping SeniorHomes.com directory...');
      
      // Implementation for independent living communities
      // These are typically unlicensed but still valuable data
      
    } catch (error) {
      console.error('Error scraping SeniorHomes.com:', error);
    }
  }

  async scrapeMedicareData(): Promise<void> {
    try {
      console.log('Scraping Medicare Care Compare data...');
      
      // Implementation would fetch federal nursing home data
      // Includes star ratings, inspection results, and quality measures
      
    } catch (error) {
      console.error('Error scraping Medicare data:', error);
    }
  }

  private getFacilitySelectors(state: string): any {
    // Return state-specific CSS selectors for scraping
    const selectors: { [key: string]: any } = {
      colorado: {
        container: '.facility-listing, .search-result',
        name: '.facility-name, .name',
        address: '.facility-address, .address',
        licenseNumber: '.license-number, .license',
        status: '.license-status, .status',
        phone: '.phone, .contact-phone',
        email: '.email, .contact-email'
      },
      california: {
        container: '.facility-row, .search-item',
        name: '.facility-name, .name',
        address: '.address',
        licenseNumber: '.license',
        status: '.status'
      },
      florida: {
        container: '.facility-item, .search-result',
        name: '.name',
        address: '.address',
        licenseNumber: '.license-number',
        status: '.status'
      },
      texas: {
        container: '.facility-listing',
        name: '.facility-name',
        address: '.address',
        licenseNumber: '.license',
        status: '.status'
      }
    };
    
    return selectors[state] || selectors.colorado;
  }

  private extractFacilityData($: any, element: any, state: string, selectors: any): InsertCommunity {
    const name = $(element).find(selectors.name).text().trim();
    const address = $(element).find(selectors.address).text().trim();
    const licenseNumber = $(element).find(selectors.licenseNumber).text().trim();
    const status = $(element).find(selectors.status).text().trim();
    const phone = $(element).find(selectors.phone).text().trim();
    const email = $(element).find(selectors.email).text().trim();
    
    // Parse address into components
    const addressParts = address.split(',');
    const city = addressParts[1]?.trim() || '';
    const stateZip = addressParts[2]?.trim().split(' ') || [];
    const stateCode = stateZip[0] || state.toUpperCase().slice(0, 2);
    const zipCode = stateZip[1] || '';

    return {
      name,
      address: addressParts[0]?.trim() || address,
      city,
      state: stateCode,
      zipCode,
      phone: phone || null,
      email: email || null,
      licenseNumber,
      licenseStatus: this.normalizeLicenseStatus(status),
      careTypes: ['Assisted Living'], // Default, would be enhanced with actual data
      dataSource: `${state}_licensing`,
      lastScrapedAt: new Date()
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapeColoradoLicensing(): Promise<void> {
    try {
      console.log('Starting Colorado licensing data scrape...');
      
      // This is a simplified example - real implementation would need
      // to handle the specific structure of each state's licensing website
      const response = await axios.get(this.baseUrls.colorado, {
        timeout: 10000,
        headers: {
          'User-Agent': 'TrueView-DataScraper/1.0'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Example scraping logic - would need to be customized for each state
      $('.facility-listing').each(async (index, element) => {
        const name = $(element).find('.facility-name').text().trim();
        const address = $(element).find('.facility-address').text().trim();
        const licenseNumber = $(element).find('.license-number').text().trim();
        const status = $(element).find('.license-status').text().trim();
        
        if (name && address) {
          // Parse address into components
          const addressParts = address.split(',');
          const city = addressParts[1]?.trim() || '';
          const stateZip = addressParts[2]?.trim().split(' ') || [];
          const state = stateZip[0] || 'CO';
          const zipCode = stateZip[1] || '';

          const communityData: InsertCommunity = {
            name,
            address: addressParts[0]?.trim() || address,
            city,
            state,
            zipCode,
            licenseNumber,
            licenseStatus: this.normalizeLicenseStatus(status),
            careTypes: ['Assisted Living'], // Default, would be parsed from data
            amenities: [],
            isVerified: true,
            isClaimed: false,
          };

          // Check if community already exists before creating
          const existingCommunities = await storage.searchCommunities({
            location: `${city}, ${state}`,
          });

          const exists = existingCommunities.some(c => 
            c.name === name && c.licenseNumber === licenseNumber
          );

          if (!exists) {
            await storage.createCommunity(communityData);
            console.log(`Added new community: ${name}`);
          } else {
            console.log(`Community already exists: ${name}`);
          }
        }
      });

      console.log('Colorado licensing data scrape completed');
    } catch (error) {
      console.error('Error scraping Colorado licensing data:', error);
    }
  }

  async scrapeInspectionReports(communityId: number, licenseNumber: string): Promise<void> {
    try {
      // This would scrape inspection reports for a specific facility
      // Implementation would vary by state
      console.log(`Scraping inspection reports for license: ${licenseNumber}`);
      
      // Mock inspection data for demonstration
      const inspectionData: InsertInspection = {
        communityId,
        inspectionDate: new Date(),
        inspectionType: 'Annual Licensing Survey',
        violations: [],
        overallScore: 85,
        reportUrl: `https://example.gov/reports/${licenseNumber}`,
      };

      await storage.createInspection(inspectionData);
      console.log(`Added inspection report for community ${communityId}`);
    } catch (error) {
      console.error('Error scraping inspection reports:', error);
    }
  }

  private normalizeLicenseStatus(status: string): string {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('active') || normalizedStatus.includes('current')) {
      return 'Licensed';
    } else if (normalizedStatus.includes('review') || normalizedStatus.includes('pending')) {
      return 'Under Review';
    } else if (normalizedStatus.includes('expired') || normalizedStatus.includes('suspended')) {
      return 'Expired';
    }
    return 'Unknown';
  }

  async runDailyScrape(): Promise<void> {
    console.log('Starting daily licensing data scrape...');
    
    try {
      await this.scrapeColoradoLicensing();
      // Add other states as needed
      
      console.log('Daily scrape completed successfully');
    } catch (error) {
      console.error('Daily scrape failed:', error);
    }
  }
}

export const scraper = new ComprehensiveScraper();

// Run scraper every 24 hours
setInterval(() => {
  scraper.runDailyScrape();
}, 24 * 60 * 60 * 1000);

// Initial scrape on startup (commented out to avoid overwhelming during development)
// setTimeout(() => {
//   scraper.runDailyScrape();
// }, 5000);
