import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CommunityVerificationData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  careTypes: string[];
  verificationSources: string[];
  confidence: number;
  crossReferencedData: {
    phoneVerified: boolean;
    addressVerified: boolean;
    licenseVerified: boolean;
    businessRegistrationVerified: boolean;
  };
}

export class MultiSourceVerifier {
  private readonly dataSources = {
    // State licensing databases
    licensing: {
      california: 'https://www.cdss.ca.gov/inforesources/community-care-licensing',
      texas: 'https://www.hhs.texas.gov/services/safety/facility-licensing-regulation',
      florida: 'https://www.myflfamilies.com/service-programs/adult-protective-services',
      newyork: 'https://www.health.ny.gov/facilities/adult_care/',
      pennsylvania: 'https://www.dhs.pa.gov/Services/Assistance/Pages/Adult-Protective-Services.aspx'
    },
    
    // Business verification sources
    businessRegistries: {
      secretaryOfState: 'https://businesssearch.sos.ca.gov/Search/Search',
      betterBusinessBureau: 'https://www.bbb.org/search',
      yellowPages: 'https://www.yellowpages.com/search'
    },
    
    // Senior living directories
    directories: {
      aplaceForMom: 'https://www.aplaceformom.com/senior-care',
      caring: 'https://www.caring.com/senior-living',
      seniorLiving: 'https://www.seniorliving.org',
      seniorAdvisor: 'https://www.senioradvisor.com',
      assistedLivingDirectory: 'https://www.assistedlivingdirectory.com'
    },
    
    // Phone verification services
    phoneVerification: {
      truecaller: 'https://www.truecaller.com/search',
      whitepages: 'https://www.whitepages.com/search',
      spokeo: 'https://www.spokeo.com/phone-search'
    }
  };

  async verifyAndEnrichCommunityData(
    communityName: string, 
    city: string, 
    state: string
  ): Promise<CommunityVerificationData[]> {
    const results: CommunityVerificationData[] = [];
    
    try {
      // 1. Search state licensing databases
      const licensingResults = await this.searchStateLicensing(communityName, city, state);
      
      // 2. Cross-reference with business registries
      const businessResults = await this.verifyBusinessRegistration(communityName, city, state);
      
      // 3. Search senior living directories
      const directoryResults = await this.searchSeniorLivingDirectories(communityName, city, state);
      
      // 4. Verify phone numbers across multiple sources
      const phoneVerificationResults = await this.verifyPhoneNumbers(licensingResults);
      
      // 5. Cross-reference and score confidence
      const consolidatedResults = this.consolidateAndScore([
        ...licensingResults,
        ...businessResults,
        ...directoryResults
      ], phoneVerificationResults);
      
      return consolidatedResults;
      
    } catch (error) {
      console.error('Multi-source verification error:', error);
      return [];
    }
  }

  private async searchStateLicensing(
    name: string, 
    city: string, 
    state: string
  ): Promise<CommunityVerificationData[]> {
    const results: CommunityVerificationData[] = [];
    
    try {
      switch (state.toUpperCase()) {
        case 'CA':
          return await this.searchCaliforniaLicensing(name, city);
        case 'TX':
          return await this.searchTexasLicensing(name, city);
        case 'FL':
          return await this.searchFloridaLicensing(name, city);
        case 'NY':
          return await this.searchNewYorkLicensing(name, city);
        case 'PA':
          return await this.searchPennsylvaniaLicensing(name, city);
        default:
          return await this.searchGeneralLicensing(name, city, state);
      }
    } catch (error) {
      console.error(`State licensing search error for ${state}:`, error);
      return [];
    }
  }

  private async searchCaliforniaLicensing(name: string, city: string): Promise<CommunityVerificationData[]> {
    // California Community Care Licensing Division search
    const searchTerms = [
      `"${name}" ${city} assisted living`,
      `"${name}" ${city} skilled nursing`,
      `"${name}" ${city} memory care`,
      `${name} senior living ${city} California`
    ];
    
    const results: CommunityVerificationData[] = [];
    
    for (const searchTerm of searchTerms) {
      try {
        // Use DuckDuckGo as it's more reliable than direct site scraping
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm + ' site:cdss.ca.gov')}&format=json`;
        
        const response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });
        
        // Process licensing results
        if (response.data && response.data.AbstractText) {
          const communityData = this.extractLicensingInfo(response.data.AbstractText, name, city, 'CA');
          if (communityData) {
            results.push(communityData);
          }
        }
        
        await this.delay(2000); // Rate limiting
      } catch (error) {
        console.log(`CA licensing search failed for: ${searchTerm}`);
      }
    }
    
    return results;
  }

  private async searchBusinessRegistration(
    name: string, 
    city: string, 
    state: string
  ): Promise<CommunityVerificationData[]> {
    const results: CommunityVerificationData[] = [];
    
    try {
      // Search Secretary of State business registrations
      const businessSearchTerms = [
        `"${name}" ${city} ${state} business registration`,
        `${name} LLC ${city} ${state}`,
        `${name} corporation ${city} ${state}`
      ];
      
      for (const searchTerm of businessSearchTerms) {
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}&format=json`;
        
        const response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 8000
        });
        
        // Process business registration results
        const businessData = this.extractBusinessInfo(response.data, name, city, state);
        if (businessData) {
          results.push(businessData);
        }
        
        await this.delay(1500);
      }
      
    } catch (error) {
      console.error('Business registration search error:', error);
    }
    
    return results;
  }

  private async searchSeniorLivingDirectories(
    name: string, 
    city: string, 
    state: string
  ): Promise<CommunityVerificationData[]> {
    const results: CommunityVerificationData[] = [];
    
    const directorySearches = [
      // A Place for Mom search
      {
        site: 'aplaceformom.com',
        searchType: 'senior living directory'
      },
      // Caring.com search
      {
        site: 'caring.com',
        searchType: 'senior care directory'
      },
      // SeniorAdvisor search
      {
        site: 'senioradvisor.com',
        searchType: 'senior advisor directory'
      }
    ];
    
    for (const directory of directorySearches) {
      try {
        const searchTerm = `"${name}" ${city} ${state} site:${directory.site}`;
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}&format=json`;
        
        const response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });
        
        const directoryData = await this.extractDirectoryInfo(response.data, name, city, state, directory.site);
        if (directoryData) {
          results.push(directoryData);
        }
        
        await this.delay(2000);
      } catch (error) {
        console.log(`Directory search failed for ${directory.site}`);
      }
    }
    
    return results;
  }

  private async verifyPhoneNumbers(
    communities: CommunityVerificationData[]
  ): Promise<Map<string, boolean>> {
    const phoneVerification = new Map<string, boolean>();
    
    for (const community of communities) {
      if (community.phone) {
        try {
          // Use multiple phone verification sources
          const verificationSources = [
            `https://duckduckgo.com/?q=${encodeURIComponent(community.phone + ' ' + community.name)}&format=json`,
            `https://duckduckgo.com/?q=${encodeURIComponent(community.phone + ' business lookup')}&format=json`
          ];
          
          let verifiedCount = 0;
          for (const source of verificationSources) {
            try {
              const response = await axios.get(source, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 8000
              });
              
              if (response.data && this.phoneMatchesExpectedBusiness(response.data, community.name, community.phone)) {
                verifiedCount++;
              }
              
              await this.delay(1000);
            } catch (error) {
              console.log(`Phone verification failed for ${community.phone}`);
            }
          }
          
          phoneVerification.set(community.phone, verifiedCount > 0);
        } catch (error) {
          phoneVerification.set(community.phone, false);
        }
      }
    }
    
    return phoneVerification;
  }

  private consolidateAndScore(
    communities: CommunityVerificationData[], 
    phoneVerification: Map<string, boolean>
  ): CommunityVerificationData[] {
    const consolidated = new Map<string, CommunityVerificationData>();
    
    // Group by name + city for deduplication
    for (const community of communities) {
      const key = `${community.name.toLowerCase()}_${community.city.toLowerCase()}`;
      
      if (consolidated.has(key)) {
        const existing = consolidated.get(key)!;
        
        // Merge verification sources
        existing.verificationSources = [...new Set([...existing.verificationSources, ...community.verificationSources])];
        
        // Update cross-referenced data
        existing.crossReferencedData.phoneVerified = existing.crossReferencedData.phoneVerified || 
          (community.phone ? phoneVerification.get(community.phone) || false : false);
        existing.crossReferencedData.addressVerified = existing.crossReferencedData.addressVerified || 
          community.crossReferencedData.addressVerified;
        existing.crossReferencedData.licenseVerified = existing.crossReferencedData.licenseVerified || 
          community.crossReferencedData.licenseVerified;
        existing.crossReferencedData.businessRegistrationVerified = existing.crossReferencedData.businessRegistrationVerified || 
          community.crossReferencedData.businessRegistrationVerified;
        
        // Calculate confidence score
        existing.confidence = this.calculateConfidenceScore(existing);
      } else {
        // Set initial cross-reference data
        community.crossReferencedData.phoneVerified = community.phone ? 
          phoneVerification.get(community.phone) || false : false;
        community.confidence = this.calculateConfidenceScore(community);
        
        consolidated.set(key, community);
      }
    }
    
    // Return sorted by confidence score
    return Array.from(consolidated.values()).sort((a, b) => b.confidence - a.confidence);
  }

  private calculateConfidenceScore(community: CommunityVerificationData): number {
    let score = 0;
    
    // Base score for having basic information
    if (community.name) score += 10;
    if (community.address) score += 10;
    if (community.phone) score += 10;
    if (community.website) score += 5;
    
    // Verification source scoring
    score += community.verificationSources.length * 15;
    
    // Cross-reference scoring
    if (community.crossReferencedData.phoneVerified) score += 20;
    if (community.crossReferencedData.addressVerified) score += 15;
    if (community.crossReferencedData.licenseVerified) score += 25;
    if (community.crossReferencedData.businessRegistrationVerified) score += 15;
    
    return Math.min(score, 100); // Cap at 100
  }

  private extractLicensingInfo(text: string, name: string, city: string, state: string): CommunityVerificationData | null {
    if (!text || !text.toLowerCase().includes(name.toLowerCase())) {
      return null;
    }
    
    return {
      name,
      address: this.extractAddress(text) || '',
      city,
      state,
      zipCode: this.extractZipCode(text),
      phone: this.extractPhone(text),
      website: this.extractWebsite(text),
      careTypes: this.extractCareTypes(text),
      verificationSources: ['State Licensing Database'],
      confidence: 0,
      crossReferencedData: {
        phoneVerified: false,
        addressVerified: true,
        licenseVerified: true,
        businessRegistrationVerified: false
      }
    };
  }

  private extractBusinessInfo(data: any, name: string, city: string, state: string): CommunityVerificationData | null {
    // Process business registration data
    if (!data || !data.AbstractText) return null;
    
    return {
      name,
      address: this.extractAddress(data.AbstractText) || '',
      city,
      state,
      zipCode: this.extractZipCode(data.AbstractText),
      phone: this.extractPhone(data.AbstractText),
      website: this.extractWebsite(data.AbstractText),
      careTypes: [],
      verificationSources: ['Business Registration'],
      confidence: 0,
      crossReferencedData: {
        phoneVerified: false,
        addressVerified: false,
        licenseVerified: false,
        businessRegistrationVerified: true
      }
    };
  }

  private async extractDirectoryInfo(
    data: any, 
    name: string, 
    city: string, 
    state: string, 
    source: string
  ): Promise<CommunityVerificationData | null> {
    if (!data) return null;
    
    return {
      name,
      address: '',
      city,
      state,
      careTypes: [],
      verificationSources: [source],
      confidence: 0,
      crossReferencedData: {
        phoneVerified: false,
        addressVerified: false,
        licenseVerified: false,
        businessRegistrationVerified: false
      }
    };
  }

  private phoneMatchesExpectedBusiness(data: any, businessName: string, phone: string): boolean {
    if (!data || !data.AbstractText) return false;
    const text = data.AbstractText.toLowerCase();
    return text.includes(businessName.toLowerCase()) && text.includes(phone);
  }

  private extractAddress(text: string): string | null {
    const addressRegex = /\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Circle|Cir|Court|Ct)/i;
    const match = text.match(addressRegex);
    return match ? match[0].trim() : null;
  }

  private extractZipCode(text: string): string | undefined {
    const zipRegex = /\b\d{5}(?:-\d{4})?\b/;
    const match = text.match(zipRegex);
    return match ? match[0] : undefined;
  }

  private extractPhone(text: string): string | undefined {
    const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : undefined;
  }

  private extractWebsite(text: string): string | undefined {
    const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/;
    const match = text.match(websiteRegex);
    return match ? match[0] : undefined;
  }

  private extractCareTypes(text: string): string[] {
    const careTypes: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('independent living')) careTypes.push('Independent Living');
    if (lowerText.includes('assisted living')) careTypes.push('Assisted Living');
    if (lowerText.includes('memory care') || lowerText.includes('alzheimer')) careTypes.push('Memory Care');
    if (lowerText.includes('skilled nursing')) careTypes.push('Skilled Nursing');
    if (lowerText.includes('rehabilitation')) careTypes.push('Rehabilitation');
    
    return careTypes;
  }

  private async searchTexasLicensing(name: string, city: string): Promise<CommunityVerificationData[]> {
    // Texas HHS licensing search implementation
    return [];
  }

  private async searchFloridaLicensing(name: string, city: string): Promise<CommunityVerificationData[]> {
    // Florida licensing search implementation
    return [];
  }

  private async searchNewYorkLicensing(name: string, city: string): Promise<CommunityVerificationData[]> {
    // New York licensing search implementation
    return [];
  }

  private async searchPennsylvaniaLicensing(name: string, city: string): Promise<CommunityVerificationData[]> {
    // Pennsylvania licensing search implementation  
    return [];
  }

  private async searchGeneralLicensing(name: string, city: string, state: string): Promise<CommunityVerificationData[]> {
    // General state licensing search for other states
    const searchTerm = `"${name}" ${city} ${state} senior living license`;
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}&format=json`;
    
    try {
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      const communityData = this.extractLicensingInfo(response.data?.AbstractText || '', name, city, state);
      return communityData ? [communityData] : [];
    } catch (error) {
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // API integration for enhanced verification
  async integrateWithApartmentsList(searchTerm: string): Promise<CommunityVerificationData[]> {
    // This would integrate with Apartments.com API when available
    // For now, we'll use search-based approach
    try {
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm + ' site:apartments.com senior')}&format=json`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      // Process apartments.com results for senior housing
      return this.processApartmentsResults(response.data);
    } catch (error) {
      console.error('Apartments.com integration error:', error);
      return [];
    }
  }

  private processApartmentsResults(data: any): CommunityVerificationData[] {
    // Process results from apartments.com for senior housing
    return [];
  }
}

export const multiSourceVerifier = new MultiSourceVerifier();