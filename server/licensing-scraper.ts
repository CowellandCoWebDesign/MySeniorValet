import axios from 'axios';
import * as cheerio from 'cheerio';
import { storage } from './storage';
import type { InsertCommunity } from '@shared/schema';

interface LicensingData {
  facilityName: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  phone?: string;
  licenseStatus: string;
  licenseType: string;
  capacity?: number;
  lastInspectionDate?: Date;
  violations?: string[];
}

export class LicensingDatabaseScraper {
  
  // California Department of Social Services - Community Care Licensing
  async scrapeCalifornaLicensing(): Promise<LicensingData[]> {
    const facilities: LicensingData[] = [];
    
    try {
      console.log('Scraping California Community Care Licensing database...');
      
      // California CCLD search URL for assisted living facilities
      const searchUrl = 'https://secure.dss.cahwnet.gov/ccld/securenet/ccld_search/ccld_search.aspx';
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      
      // California specific facility search - focus on Shasta County (Redding area)
      const shastaCountyUrl = 'https://secure.dss.cahwnet.gov/ccld/securenet/ccld_search/ccld_search_results.aspx?county=Shasta&factype=RCFE';
      
      const shastaResponse = await axios.get(shastaCountyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      const $shasta = cheerio.load(shastaResponse.data);
      
      // Parse facility listings from search results
      $shasta('table tr').each((i, row) => {
        if (i === 0) return; // Skip header row
        
        const $row = $shasta(row);
        const cells = $row.find('td');
        
        if (cells.length >= 4) {
          const facilityName = $shasta(cells[0]).text().trim();
          const address = $shasta(cells[1]).text().trim();
          const licenseNumber = $shasta(cells[2]).text().trim();
          const status = $shasta(cells[3]).text().trim();
          
          if (facilityName && this.isSeniorLivingFacility(facilityName)) {
            facilities.push({
              facilityName,
              licenseNumber,
              address,
              city: 'Redding',
              state: 'CA',
              licenseStatus: status,
              licenseType: 'RCFE' // Residential Care Facility for the Elderly
            });
          }
        }
      });
      
    } catch (error) {
      console.error('California licensing scrape failed:', error);
    }
    
    return facilities;
  }

  // Texas Health and Human Services - Assisted Living Facilities
  async scrapeTexasLicensing(): Promise<LicensingData[]> {
    const facilities: LicensingData[] = [];
    
    try {
      console.log('Scraping Texas HHS licensing database...');
      
      const searchUrl = 'https://www.hhs.texas.gov/providers/long-term-care-providers/nursing-facilities-nf/search-nursing-facilities';
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      
      // Parse Texas facility data
      $('.facility-listing').each((i, element) => {
        const $el = $(element);
        const name = $el.find('.facility-name').text().trim();
        const address = $el.find('.facility-address').text().trim();
        const license = $el.find('.license-number').text().trim();
        
        if (name && this.isSeniorLivingFacility(name)) {
          facilities.push({
            facilityName: name,
            licenseNumber: license,
            address,
            city: this.extractCity(address),
            state: 'TX',
            licenseStatus: 'Active',
            licenseType: 'ALF' // Assisted Living Facility
          });
        }
      });
      
    } catch (error) {
      console.error('Texas licensing scrape failed:', error);
    }
    
    return facilities;
  }

  // Florida Agency for Health Care Administration
  async scrapeFloridaLicensing(): Promise<LicensingData[]> {
    const facilities: LicensingData[] = [];
    
    try {
      console.log('Scraping Florida AHCA licensing database...');
      
      const searchUrl = 'https://www.floridahealthfinder.gov/facilitylocator/FacilitySearch.aspx';
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      
      // Parse Florida ALF data
      $('.search-result').each((i, element) => {
        const $el = $(element);
        const name = $el.find('.facility-name').text().trim();
        const address = $el.find('.address').text().trim();
        const license = $el.find('.license').text().trim();
        
        if (name && this.isSeniorLivingFacility(name)) {
          facilities.push({
            facilityName: name,
            licenseNumber: license,
            address,
            city: this.extractCity(address),
            state: 'FL',
            licenseStatus: 'Licensed',
            licenseType: 'ALF'
          });
        }
      });
      
    } catch (error) {
      console.error('Florida licensing scrape failed:', error);
    }
    
    return facilities;
  }

  // New York State Department of Health
  async scrapeNewYorkLicensing(): Promise<LicensingData[]> {
    const facilities: LicensingData[] = [];
    
    try {
      console.log('Scraping New York DOH licensing database...');
      
      const searchUrl = 'https://health.data.ny.gov/resource/7jzm-jti7.json?facility_type=Adult%20Care%20Facility';
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((facility: any) => {
          if (facility.facility_name && this.isSeniorLivingFacility(facility.facility_name)) {
            facilities.push({
              facilityName: facility.facility_name,
              licenseNumber: facility.operating_certificate_number || '',
              address: facility.address || '',
              city: facility.city || '',
              state: 'NY',
              zipCode: facility.zip_code,
              licenseStatus: facility.current_operating_status || 'Unknown',
              licenseType: 'ACF', // Adult Care Facility
              capacity: facility.total_capacity ? parseInt(facility.total_capacity) : undefined
            });
          }
        });
      }
      
    } catch (error) {
      console.error('New York licensing scrape failed:', error);
    }
    
    return facilities;
  }

  // Pennsylvania Department of Human Services
  async scrapePennsylvaniaLicensing(): Promise<LicensingData[]> {
    const facilities: LicensingData[] = [];
    
    try {
      console.log('Scraping Pennsylvania DHS licensing database...');
      
      // PA Personal Care Homes directory
      const searchUrl = 'https://www.dhs.pa.gov/Services/Disabilities-Aging/Documents/PCH%20Directory.pdf';
      
      // Note: This would require PDF parsing for full implementation
      // For now, we'll use a web-accessible version if available
      const webUrl = 'https://www.dhs.pa.gov/providers/providers-by-service/long-term-living/pages/personal-care-homes.aspx';
      
      const response = await axios.get(webUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      
      // Parse PA facility listings
      $('.facility-listing, .provider-listing').each((i, element) => {
        const $el = $(element);
        const name = $el.find('h3, .name').text().trim();
        const address = $el.find('.address').text().trim();
        
        if (name && this.isSeniorLivingFacility(name)) {
          facilities.push({
            facilityName: name,
            licenseNumber: '',
            address,
            city: this.extractCity(address),
            state: 'PA',
            licenseStatus: 'Licensed',
            licenseType: 'PCH' // Personal Care Home
          });
        }
      });
      
    } catch (error) {
      console.error('Pennsylvania licensing scrape failed:', error);
    }
    
    return facilities;
  }

  // Helper methods
  private isSeniorLivingFacility(name: string): boolean {
    const seniorKeywords = [
      'senior', 'assisted living', 'memory care', 'alzheimer',
      'dementia', 'elderly', 'retirement', 'adult care',
      'residential care', 'continuing care', 'nursing',
      'rehabilitation', 'manor', 'estate', 'village',
      'gardens', 'residence', 'community'
    ];
    
    const excludeKeywords = [
      'hospital', 'medical center', 'clinic', 'pharmacy',
      'urgent care', 'emergency', 'surgery', 'dialysis'
    ];
    
    const lowerName = name.toLowerCase();
    
    const hasSeniorKeyword = seniorKeywords.some(keyword => lowerName.includes(keyword));
    const hasExcludeKeyword = excludeKeywords.some(keyword => lowerName.includes(keyword));
    
    return hasSeniorKeyword && !hasExcludeKeyword;
  }

  private extractCity(address: string): string {
    // Simple city extraction - gets text before state abbreviation
    const cityMatch = address.match(/^(.+?),\s*[A-Z]{2}/);
    if (cityMatch) {
      return cityMatch[1].trim();
    }
    
    // Fallback: get last part before comma
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    
    return '';
  }

  private cleanPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  // Helper method to extract phone numbers from text
  private extractPhoneFromText(text: string): string | undefined {
    if (!text) return undefined;
    
    // Look for phone number patterns
    const phoneRegex = /(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
    const match = text.match(phoneRegex);
    
    if (match) {
      return this.cleanPhoneNumber(match[0]);
    }
    
    return undefined;
  }

  // Comprehensive Senior Living Search (includes unlicensed communities)
  async searchGeneralSeniorLiving(city: string, state: string): Promise<LicensingData[]> {
    const facilities: LicensingData[] = [];
    
    try {
      console.log(`Searching for all senior living communities in ${city}, ${state}...`);
      
      // Search terms that capture ALL senior living options, not just licensed
      const searchTerms = [
        `"senior living" "${city}" "${state}"`,
        `"independent living" "${city}" "${state}"`,
        `"55+ community" "${city}" "${state}"`,
        `"retirement community" "${city}" "${state}"`,
        `"senior housing" "${city}" "${state}"`,
        `"active adult community" "${city}" "${state}"`,
        `"senior apartments" "${city}" "${state}"`
      ];

      // Use multiple search engines for comprehensive coverage
      for (const searchTerm of searchTerms) {
        // Search Bing for senior living
        const bingResults = await this.searchBingForSeniorLiving(searchTerm, city, state);
        facilities.push(...bingResults);
        
        // Search DuckDuckGo 
        const duckResults = await this.searchDuckDuckGoForSeniorLiving(searchTerm, city, state);
        facilities.push(...duckResults);
        
        await this.delay(2000); // Be respectful between searches
      }

      // Search business directories specifically for senior living
      const directoryResults = await this.searchBusinessDirectoriesForSeniors(city, state);
      facilities.push(...directoryResults);

      // Remove duplicates
      const uniqueFacilities = this.deduplicateFacilities(facilities);
      console.log(`Found ${uniqueFacilities.length} senior living communities (licensed and unlicensed)`);
      
      return uniqueFacilities;
      
    } catch (error) {
      console.error('Error in general senior living search:', error);
      return [];
    }
  }

  // Search Bing specifically for senior living communities
  private async searchBingForSeniorLiving(searchTerm: string, city: string, state: string): Promise<LicensingData[]> {
    const facilities: LicensingData[] = [];
    
    try {
      const url = `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      $('.b_algo').each((i, element) => {
        if (i >= 15) return false;
        
        const $el = $(element);
        const titleEl = $el.find('h2 a');
        const name = titleEl.text().trim();
        const website = titleEl.attr('href');
        const snippet = $el.find('.b_caption p').text().trim();
        
        if (this.isSeniorLivingCommunity(name, snippet)) {
          const addressMatch = snippet.match(/(\d+[^,]+(?:st|street|ave|avenue|dr|drive|blvd|boulevard|rd|road|ln|lane|way|ct|court)[^,]*),?\s*([^,]+),?\s*(?:CA|California)/i);
          
          facilities.push({
            facilityName: name,
            licenseNumber: '', // These may not be licensed
            address: addressMatch ? addressMatch[0] : `${city}, ${state}`,
            city,
            state,
            licenseStatus: 'Not Required', // Many independent/55+ don't need licenses
            licenseType: this.determineLicenseTypeFromName(name, snippet),
            phone: this.extractPhoneFromText(snippet),
            capacity: this.extractCapacityFromText(snippet)
          });
        }
      });
      
    } catch (error) {
      console.error('Bing senior living search failed:', error);
    }
    
    return facilities;
  }

  // Search DuckDuckGo for senior living
  private async searchDuckDuckGoForSeniorLiving(searchTerm: string, city: string, state: string): Promise<LicensingData[]> {
    const facilities: LicensingData[] = [];
    
    try {
      const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(searchTerm)}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      $('.result').each((i, element) => {
        if (i >= 15) return false;
        
        const $el = $(element);
        const titleEl = $el.find('.result__title a');
        const name = titleEl.text().trim();
        const website = titleEl.attr('href');
        const snippet = $el.find('.result__snippet').text().trim();
        
        if (this.isSeniorLivingCommunity(name, snippet)) {
          facilities.push({
            facilityName: name,
            licenseNumber: '',
            address: this.extractAddressFromText(snippet, city, state),
            city,
            state,
            licenseStatus: 'Not Required',
            licenseType: this.determineLicenseTypeFromName(name, snippet),
            phone: this.extractPhoneFromText(snippet)
          });
        }
      });
      
    } catch (error) {
      console.error('DuckDuckGo senior living search failed:', error);
    }
    
    return facilities;
  }

  // Search business directories for senior living
  private async searchBusinessDirectoriesForSeniors(city: string, state: string): Promise<LicensingData[]> {
    const facilities: LicensingData[] = [];
    
    try {
      // Yellow Pages search for senior living
      const ypUrl = `https://www.yellowpages.com/search?search_terms=senior+living&geo_location_terms=${encodeURIComponent(city + ', ' + state)}`;
      
      const response = await axios.get(ypUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      $('.result').each((i, element) => {
        if (i >= 20) return false;
        
        const $el = $(element);
        const name = $el.find('.business-name span').text().trim();
        const address = $el.find('.street-address').text().trim();
        const phone = $el.find('.phones').text().trim();
        
        if (name && this.isSeniorLivingCommunity(name, address)) {
          facilities.push({
            facilityName: name,
            licenseNumber: '',
            address: address || `${city}, ${state}`,
            city,
            state,
            phone: this.cleanPhoneNumber(phone),
            licenseStatus: 'Not Required',
            licenseType: this.determineLicenseTypeFromName(name, address)
          });
        }
      });
      
    } catch (error) {
      console.error('Business directory search failed:', error);
    }
    
    return facilities;
  }

  // Enhanced community detection for unlicensed senior living
  private isSeniorLivingCommunity(name: string, description: string): boolean {
    const text = (name + ' ' + description).toLowerCase();
    
    const seniorKeywords = [
      'senior living', 'independent living', 'assisted living', 'memory care',
      '55+', '55 plus', 'retirement', 'senior community', 'senior housing',
      'active adult', 'senior apartments', 'senior village', 'senior manor',
      'senior estates', 'senior gardens', 'continuing care', 'life care',
      'senior residence', 'senior center', 'senior home', 'elder care',
      'adult community', 'senior citizens', 'retirement home'
    ];
    
    const excludeKeywords = [
      'hospital', 'medical center', 'clinic', 'pharmacy', 'doctor',
      'urgent care', 'emergency', 'surgery', 'dialysis', 'laboratory',
      'dental', 'vision', 'hearing', 'physical therapy', 'rehabilitation center'
    ];
    
    const hasSeniorKeyword = seniorKeywords.some(keyword => text.includes(keyword));
    const hasExcludeKeyword = excludeKeywords.some(keyword => text.includes(keyword));
    
    return hasSeniorKeyword && !hasExcludeKeyword;
  }

  // Determine license type based on name/description for unlicensed communities
  private determineLicenseTypeFromName(name: string, description: string): string {
    const text = (name + ' ' + description).toLowerCase();
    
    if (text.includes('independent living') || text.includes('55+') || text.includes('active adult')) {
      return 'Independent Living'; // Usually unlicensed
    } else if (text.includes('assisted living')) {
      return 'ALF'; // Usually licensed
    } else if (text.includes('memory care') || text.includes('alzheimer') || text.includes('dementia')) {
      return 'Memory Care'; // Usually licensed
    } else if (text.includes('skilled nursing') || text.includes('nursing home')) {
      return 'SNF'; // Always licensed
    } else {
      return 'Senior Community'; // Generic
    }
  }

  // Helper methods for text extraction
  private extractAddressFromText(text: string, city: string, state: string): string {
    const addressMatch = text.match(/(\d+[^,]+(?:st|street|ave|avenue|dr|drive|blvd|boulevard|rd|road|ln|lane|way|ct|court)[^,]*)/i);
    return addressMatch ? `${addressMatch[1]}, ${city}, ${state}` : `${city}, ${state}`;
  }

  private extractCapacityFromText(text: string): number | undefined {
    const capacityMatch = text.match(/(\d+)\s*(?:units?|beds?|residents?|apartments?)/i);
    return capacityMatch ? parseInt(capacityMatch[1]) : undefined;
  }

  private deduplicateFacilities(facilities: LicensingData[]): LicensingData[] {
    const seen = new Set<string>();
    const unique: LicensingData[] = [];
    
    for (const facility of facilities) {
      const key = `${facility.facilityName.toLowerCase()}-${facility.city.toLowerCase()}-${facility.state.toUpperCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(facility);
      }
    }
    
    return unique;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main method to scrape both licensed AND unlicensed communities
  async scrapeAllStateLicensing(): Promise<void> {
    console.log('Starting comprehensive senior living data collection (licensed + unlicensed)...');
    
    const allFacilities: LicensingData[] = [];
    
    try {
      // Step 1: Get licensed facilities from state databases
      console.log('Phase 1: Collecting licensed facilities from state databases...');
      const [caFacilities, txFacilities, flFacilities, nyFacilities, paFacilities] = await Promise.all([
        this.scrapeCalifornaLicensing(),
        this.scrapeTexasLicensing(),
        this.scrapeFloridaLicensing(),
        this.scrapeNewYorkLicensing(),
        this.scrapePennsylvaniaLicensing()
      ]);

      allFacilities.push(...caFacilities, ...txFacilities, ...flFacilities, ...nyFacilities, ...paFacilities);
      console.log(`Found ${allFacilities.length} licensed facilities from state databases`);

      // Step 2: Get ALL senior living communities (including unlicensed)
      console.log('Phase 2: Collecting all senior living communities (including unlicensed)...');
      const majorCities = [
        { city: 'Los Angeles', state: 'CA' },
        { city: 'San Francisco', state: 'CA' },
        { city: 'San Diego', state: 'CA' },
        { city: 'Redding', state: 'CA' },
        { city: 'Sacramento', state: 'CA' },
        { city: 'Houston', state: 'TX' },
        { city: 'Dallas', state: 'TX' },
        { city: 'Austin', state: 'TX' },
        { city: 'Miami', state: 'FL' },
        { city: 'Tampa', state: 'FL' },
        { city: 'Orlando', state: 'FL' },
        { city: 'New York', state: 'NY' },
        { city: 'Buffalo', state: 'NY' },
        { city: 'Philadelphia', state: 'PA' },
        { city: 'Pittsburgh', state: 'PA' }
      ];

      for (const location of majorCities) {
        try {
          console.log(`Searching all senior living in ${location.city}, ${location.state}...`);
          const generalResults = await this.searchGeneralSeniorLiving(location.city, location.state);
          allFacilities.push(...generalResults);
          await this.delay(3000); // Be respectful between city searches
        } catch (error) {
          console.error(`Error searching ${location.city}:`, error);
        }
      }
      
      // Remove duplicates across all sources
      const uniqueFacilities = this.deduplicateFacilities(allFacilities);
      console.log(`Total unique facilities found: ${uniqueFacilities.length} (licensed + unlicensed)`);
      
      // Add to database
      let addedCount = 0;
      for (const facility of uniqueFacilities) {
        try {
          // Check if facility already exists
          const existing = await storage.searchCommunities({
            location: `${facility.city}, ${facility.state}`,
            name: facility.facilityName
          });

          if (existing.length === 0) {
            const insertData: InsertCommunity = {
              name: facility.facilityName,
              address: facility.address,
              city: facility.city,
              state: facility.state,
              zipCode: facility.zipCode || '',
              phone: facility.phone || null,
              website: null,
              email: null,
              description: facility.licenseNumber ? 
                `Licensed ${this.getLicenseTypeDescription(facility.licenseType)} facility` :
                `Senior living community (${facility.licenseType})`,
              careTypes: this.determineCareTypes(facility.licenseType),
              amenities: [],
              priceRange: null,
              imageUrl: null,
              latitude: null,
              longitude: null,
              isVerified: true,
              licenseNumber: facility.licenseNumber || null,
              licenseStatus: facility.licenseStatus,
              lastInspection: facility.lastInspectionDate || null,
              availabilityStatus: 'Contact',
              lastAvailabilityUpdate: null,
              transparencyScore: this.calculateLicensingTransparencyScore(facility),
              dataSource: facility.licenseNumber ? 
                `${facility.state} State Licensing Database` :
                `General Senior Living Search`,
              lastDataUpdate: new Date()
            };

            await storage.createCommunity(insertData);
            console.log(`✓ Added facility: ${facility.facilityName} (${facility.state}) - ${facility.licenseStatus}`);
            addedCount++;
          }
        } catch (error) {
          console.error(`Error adding facility ${facility.facilityName}:`, error);
        }
      }

      console.log(`Successfully added ${addedCount} total senior living communities (licensed + unlicensed)`);
      
    } catch (error) {
      console.error('Error in comprehensive senior living scraping:', error);
    }
  }

  private getLicenseTypeDescription(licenseType: string): string {
    const descriptions: Record<string, string> = {
      'RCFE': 'Residential Care Facility for the Elderly',
      'ALF': 'Assisted Living Facility',
      'ACF': 'Adult Care Facility',
      'PCH': 'Personal Care Home',
      'CCF': 'Community Care Facility'
    };
    
    return descriptions[licenseType] || 'Senior Care Facility';
  }

  private determineCareTypes(licenseType: string): string[] {
    const careTypeMap: Record<string, string[]> = {
      'RCFE': ['Assisted Living', 'Memory Care'],
      'ALF': ['Assisted Living', 'Independent Living'],
      'ACF': ['Assisted Living', 'Skilled Nursing'],
      'PCH': ['Assisted Living'],
      'CCF': ['Memory Care', 'Assisted Living']
    };
    
    return careTypeMap[licenseType] || ['Assisted Living'];
  }

  private calculateLicensingTransparencyScore(facility: LicensingData): number {
    let score = 60; // Base score for having licensing data
    
    if (facility.licenseNumber) score += 15;
    if (facility.licenseStatus === 'Active' || facility.licenseStatus === 'Licensed') score += 10;
    if (facility.lastInspectionDate) score += 10;
    if (facility.capacity) score += 5;
    
    return Math.min(score, 100);
  }
}

export const licensingScraper = new LicensingDatabaseScraper();