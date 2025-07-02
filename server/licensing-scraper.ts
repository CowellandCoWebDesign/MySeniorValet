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

  // Main method to scrape all state databases
  async scrapeAllStateLicensing(): Promise<void> {
    console.log('Starting comprehensive state licensing database scraping...');
    
    const allFacilities: LicensingData[] = [];
    
    // Scrape each state database
    try {
      const [caFacilities, txFacilities, flFacilities, nyFacilities, paFacilities] = await Promise.all([
        this.scrapeCalifornaLicensing(),
        this.scrapeTexasLicensing(),
        this.scrapeFloridaLicensing(),
        this.scrapeNewYorkLicensing(),
        this.scrapePennsylvaniaLicensing()
      ]);

      allFacilities.push(...caFacilities, ...txFacilities, ...flFacilities, ...nyFacilities, ...paFacilities);
      
      console.log(`Found ${allFacilities.length} licensed facilities from state databases`);
      
      // Add to database
      let addedCount = 0;
      for (const facility of allFacilities) {
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
              description: `Licensed ${this.getLicenseTypeDescription(facility.licenseType)} facility`,
              careTypes: this.determineCareTypes(facility.licenseType),
              amenities: [],
              priceRange: null,
              imageUrl: null,
              latitude: null,
              longitude: null,
              isVerified: true,
              licenseNumber: facility.licenseNumber,
              licenseStatus: facility.licenseStatus,
              lastInspection: facility.lastInspectionDate || null,
              availabilityStatus: 'Contact',
              lastAvailabilityUpdate: null,
              reviewSources: null,
              transparencyScore: this.calculateLicensingTransparencyScore(facility),
              dataSource: `${facility.state} State Licensing Database`,
              lastDataUpdate: new Date()
            };

            await storage.createCommunity(insertData);
            console.log(`✓ Added licensed facility: ${facility.facilityName} (${facility.state})`);
            addedCount++;
          }
        } catch (error) {
          console.error(`Error adding facility ${facility.facilityName}:`, error);
        }
      }

      console.log(`Successfully added ${addedCount} licensed facilities from state databases`);
      
    } catch (error) {
      console.error('Error in state licensing scraping:', error);
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