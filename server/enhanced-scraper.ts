import { multiSourceVerifier, type CommunityVerificationData } from './multi-source-verifier';
import { db } from './db';
import { communities, type InsertCommunity } from '@shared/schema';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapingResult {
  communities: CommunityVerificationData[];
  totalFound: number;
  verifiedCount: number;
  duplicatesRemoved: number;
  errors: string[];
}

export class EnhancedCommunityDataScraper {
  private readonly additionalAPISources = {
    // Government data sources
    medicareData: 'https://data.cms.gov/provider-data/dataset/4pq5-n9py', // Nursing Home Compare
    veteransAffairs: 'https://www.va.gov/directory/guide/home.asp',
    
    // Business directory APIs
    yelpAPI: 'https://api.yelp.com/v3/businesses/search',
    googlePlacesAPI: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
    foursquareAPI: 'https://api.foursquare.com/v3/places/search',
    
    // Senior living specific directories
    aplaceformomAPI: 'https://www.aplaceformom.com/api/communities',
    caringAPI: 'https://www.caring.com/api/search',
    seniorAdvisorAPI: 'https://www.senioradvisor.com/api/communities'
  };

  async comprehensiveDataCollection(
    city: string, 
    state: string, 
    options: {
      includeAllCareTypes?: boolean;
      verificationLevel?: 'basic' | 'enhanced' | 'comprehensive';
      maxResults?: number;
    } = {}
  ): Promise<ScrapingResult> {
    const {
      includeAllCareTypes = true,
      verificationLevel = 'enhanced',
      maxResults = 50
    } = options;

    console.log(`Starting comprehensive data collection for ${city}, ${state}`);
    
    const result: ScrapingResult = {
      communities: [],
      totalFound: 0,
      verifiedCount: 0,
      duplicatesRemoved: 0,
      errors: []
    };

    try {
      // 1. Search multiple senior living directories simultaneously
      const directoryResults = await this.searchMultipleDirectories(city, state);
      
      // 2. Cross-reference with licensing databases
      const licensingResults = await this.crossReferenceWithLicensing(directoryResults, state);
      
      // 3. Verify business registrations
      const businessVerifiedResults = await this.verifyBusinessRegistrations(licensingResults);
      
      // 4. Phone and contact verification
      const contactVerifiedResults = await this.verifyContactInformation(businessVerifiedResults);
      
      // 5. Cross-reference with additional APIs (if available)
      const apiEnhancedResults = await this.enhanceWithAdditionalAPIs(contactVerifiedResults, city, state);
      
      // 6. Consolidate and deduplicate
      const consolidatedResults = this.consolidateAndDeduplicate(apiEnhancedResults);
      
      // 7. Filter by verification level
      const filteredResults = this.filterByVerificationLevel(consolidatedResults, verificationLevel);
      
      result.communities = filteredResults.slice(0, maxResults);
      result.totalFound = directoryResults.length;
      result.verifiedCount = filteredResults.filter(c => c.confidence >= 70).length;
      result.duplicatesRemoved = consolidatedResults.length - filteredResults.length;
      
      console.log(`Comprehensive collection complete: ${result.verifiedCount} verified communities found`);
      
      return result;
    } catch (error) {
      result.errors.push(`Comprehensive collection error: ${error.message}`);
      console.error('Comprehensive data collection error:', error);
      return result;
    }
  }

  private async searchMultipleDirectories(city: string, state: string): Promise<CommunityVerificationData[]> {
    const allResults: CommunityVerificationData[] = [];
    
    // Directory search strategies
    const searchStrategies = [
      // Primary senior living searches
      {
        terms: [`senior living ${city} ${state}`, `assisted living ${city} ${state}`, `memory care ${city} ${state}`],
        sites: ['aplaceformom.com', 'caring.com', 'senioradvisor.com', 'seniorliving.org']
      },
      // Independent living searches
      {
        terms: [`independent living ${city} ${state}`, `55+ communities ${city} ${state}`],
        sites: ['apartments.com', 'rent.com', '55places.com']
      },
      // Skilled nursing searches
      {
        terms: [`nursing homes ${city} ${state}`, `skilled nursing ${city} ${state}`],
        sites: ['medicare.gov', 'nursinghomes.com']
      }
    ];

    for (const strategy of searchStrategies) {
      for (const site of strategy.sites) {
        for (const term of strategy.terms) {
          try {
            const searchResults = await this.searchSpecificDirectory(term, site, city, state);
            allResults.push(...searchResults);
            await this.delay(1500); // Rate limiting
          } catch (error) {
            console.log(`Directory search failed for ${site} with term: ${term}`);
          }
        }
      }
    }

    return allResults;
  }

  private async searchSpecificDirectory(
    searchTerm: string, 
    site: string, 
    city: string, 
    state: string
  ): Promise<CommunityVerificationData[]> {
    try {
      // Use DuckDuckGo for site-specific searches
      const query = `"${searchTerm}" site:${site}`;
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000
      });

      if (response.data && response.data.RelatedTopics) {
        return this.extractCommunitiesFromSearchResults(response.data.RelatedTopics, city, state, site);
      }
      
      return [];
    } catch (error) {
      console.error(`Directory search error for ${site}:`, error.message);
      return [];
    }
  }

  private extractCommunitiesFromSearchResults(
    results: any[], 
    city: string, 
    state: string, 
    source: string
  ): CommunityVerificationData[] {
    const communities: CommunityVerificationData[] = [];
    
    for (const result of results) {
      if (result.Text && result.FirstURL) {
        const communityName = this.extractCommunityName(result.Text);
        if (communityName && this.isValidSeniorLivingCommunity(communityName, result.Text)) {
          communities.push({
            name: communityName,
            address: this.extractAddress(result.Text) || '',
            city,
            state,
            zipCode: this.extractZipCode(result.Text),
            phone: this.extractPhone(result.Text),
            website: this.extractWebsite(result.FirstURL),
            careTypes: this.extractCareTypes(result.Text),
            verificationSources: [source],
            confidence: 0,
            crossReferencedData: {
              phoneVerified: false,
              addressVerified: false,
              licenseVerified: false,
              businessRegistrationVerified: false
            }
          });
        }
      }
    }
    
    return communities;
  }

  private async crossReferenceWithLicensing(
    communities: CommunityVerificationData[], 
    state: string
  ): Promise<CommunityVerificationData[]> {
    const enhancedCommunities: CommunityVerificationData[] = [];
    
    for (const community of communities) {
      try {
        // Use the multi-source verifier for licensing verification
        const verificationResults = await multiSourceVerifier.verifyAndEnrichCommunityData(
          community.name, 
          community.city, 
          state
        );
        
        if (verificationResults.length > 0) {
          // Merge with existing data
          const enhanced = this.mergeCommunityData(community, verificationResults[0]);
          enhancedCommunities.push(enhanced);
        } else {
          enhancedCommunities.push(community);
        }
        
        await this.delay(1000);
      } catch (error) {
        console.log(`Licensing verification failed for ${community.name}`);
        enhancedCommunities.push(community);
      }
    }
    
    return enhancedCommunities;
  }

  private async verifyBusinessRegistrations(
    communities: CommunityVerificationData[]
  ): Promise<CommunityVerificationData[]> {
    const verifiedCommunities: CommunityVerificationData[] = [];
    
    for (const community of communities) {
      try {
        // Search for business registration information
        const businessSearchTerms = [
          `"${community.name}" business registration ${community.state}`,
          `"${community.name}" LLC ${community.city} ${community.state}`,
          `"${community.name}" corporation ${community.state}`
        ];
        
        let businessVerified = false;
        for (const searchTerm of businessSearchTerms) {
          try {
            const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}&format=json`;
            const response = await axios.get(searchUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              timeout: 10000
            });
            
            if (response.data && this.containsBusinessRegistrationInfo(response.data, community.name)) {
              businessVerified = true;
              break;
            }
            
            await this.delay(1000);
          } catch (error) {
            console.log(`Business verification search failed for: ${searchTerm}`);
          }
        }
        
        community.crossReferencedData.businessRegistrationVerified = businessVerified;
        if (businessVerified) {
          community.verificationSources.push('Business Registration');
        }
        
        verifiedCommunities.push(community);
      } catch (error) {
        console.log(`Business verification failed for ${community.name}`);
        verifiedCommunities.push(community);
      }
    }
    
    return verifiedCommunities;
  }

  private async verifyContactInformation(
    communities: CommunityVerificationData[]
  ): Promise<CommunityVerificationData[]> {
    const contactVerifiedCommunities: CommunityVerificationData[] = [];
    
    for (const community of communities) {
      if (community.phone) {
        try {
          // Verify phone number against multiple sources
          const phoneVerificationSearches = [
            `"${community.phone}" "${community.name}"`,
            `"${community.phone}" senior living ${community.city}`,
            `${community.phone} business lookup`
          ];
          
          let phoneVerified = false;
          for (const search of phoneVerificationSearches) {
            try {
              const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(search)}&format=json`;
              const response = await axios.get(searchUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 8000
              });
              
              if (response.data && this.phoneMatchesBusiness(response.data, community.name, community.phone)) {
                phoneVerified = true;
                break;
              }
              
              await this.delay(1000);
            } catch (error) {
              console.log(`Phone verification search failed for: ${search}`);
            }
          }
          
          community.crossReferencedData.phoneVerified = phoneVerified;
          if (phoneVerified) {
            community.verificationSources.push('Phone Verification');
          }
        } catch (error) {
          console.log(`Contact verification failed for ${community.name}`);
        }
      }
      
      contactVerifiedCommunities.push(community);
    }
    
    return contactVerifiedCommunities;
  }

  private async enhanceWithAdditionalAPIs(
    communities: CommunityVerificationData[], 
    city: string, 
    state: string
  ): Promise<CommunityVerificationData[]> {
    const enhancedCommunities: CommunityVerificationData[] = [];
    
    for (const community of communities) {
      try {
        // Check if we can enhance with additional data sources
        
        // 1. Try to get Medicare/CMS data for nursing homes
        if (community.careTypes.includes('Skilled Nursing')) {
          const medicareData = await this.searchMedicareData(community.name, city, state);
          if (medicareData) {
            community.verificationSources.push('Medicare.gov');
            // Merge any additional data from Medicare
          }
        }
        
        // 2. Search business directories
        const businessDirectoryData = await this.searchBusinessDirectories(community.name, city, state);
        if (businessDirectoryData) {
          community.verificationSources.push('Business Directory');
        }
        
        // 3. Cross-reference with real estate sites for address verification
        if (community.address) {
          const addressVerified = await this.verifyAddress(community.address, city, state);
          community.crossReferencedData.addressVerified = addressVerified;
          if (addressVerified) {
            community.verificationSources.push('Address Verification');
          }
        }
        
        enhancedCommunities.push(community);
      } catch (error) {
        console.log(`API enhancement failed for ${community.name}`);
        enhancedCommunities.push(community);
      }
    }
    
    return enhancedCommunities;
  }

  private async searchMedicareData(name: string, city: string, state: string): Promise<boolean> {
    try {
      // Search Medicare.gov for nursing home data
      const searchTerm = `"${name}" ${city} ${state} site:medicare.gov`;
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}&format=json`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      return response.data && response.data.AbstractText && 
             response.data.AbstractText.toLowerCase().includes(name.toLowerCase());
    } catch (error) {
      return false;
    }
  }

  private async searchBusinessDirectories(name: string, city: string, state: string): Promise<boolean> {
    try {
      // Search business directories like Yellow Pages, Yelp, etc.
      const searchTerm = `"${name}" ${city} ${state} (site:yellowpages.com OR site:yelp.com OR site:bbb.org)`;
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}&format=json`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      return response.data && response.data.AbstractText && 
             response.data.AbstractText.toLowerCase().includes(name.toLowerCase());
    } catch (error) {
      return false;
    }
  }

  private async verifyAddress(address: string, city: string, state: string): Promise<boolean> {
    try {
      // Verify address exists through real estate sites
      const searchTerm = `"${address}" ${city} ${state}`;
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}&format=json`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 8000
      });
      
      return response.data && response.data.AbstractText && 
             (response.data.AbstractText.includes(address) || 
              response.data.AbstractText.includes(city));
    } catch (error) {
      return false;
    }
  }

  private consolidateAndDeduplicate(communities: CommunityVerificationData[]): CommunityVerificationData[] {
    const consolidated = new Map<string, CommunityVerificationData>();
    
    for (const community of communities) {
      const key = this.generateCommunityKey(community);
      
      if (consolidated.has(key)) {
        const existing = consolidated.get(key)!;
        // Merge verification sources and data
        existing.verificationSources = [...new Set([...existing.verificationSources, ...community.verificationSources])];
        
        // Update cross-reference data (take the most verified)
        existing.crossReferencedData.phoneVerified = existing.crossReferencedData.phoneVerified || community.crossReferencedData.phoneVerified;
        existing.crossReferencedData.addressVerified = existing.crossReferencedData.addressVerified || community.crossReferencedData.addressVerified;
        existing.crossReferencedData.licenseVerified = existing.crossReferencedData.licenseVerified || community.crossReferencedData.licenseVerified;
        existing.crossReferencedData.businessRegistrationVerified = existing.crossReferencedData.businessRegistrationVerified || community.crossReferencedData.businessRegistrationVerified;
        
        // Update confidence score
        existing.confidence = this.calculateConfidenceScore(existing);
      } else {
        community.confidence = this.calculateConfidenceScore(community);
        consolidated.set(key, community);
      }
    }
    
    return Array.from(consolidated.values());
  }

  private filterByVerificationLevel(
    communities: CommunityVerificationData[], 
    level: 'basic' | 'enhanced' | 'comprehensive'
  ): CommunityVerificationData[] {
    const thresholds = {
      basic: 30,
      enhanced: 50,
      comprehensive: 70
    };
    
    return communities.filter(community => community.confidence >= thresholds[level])
                     .sort((a, b) => b.confidence - a.confidence);
  }

  // Helper methods
  private extractCommunityName(text: string): string | null {
    // Extract community name from search result text
    const lines = text.split('\n')[0] || text.split('.')[0];
    return lines.trim() || null;
  }

  private isValidSeniorLivingCommunity(name: string, description: string): boolean {
    const seniorKeywords = [
      'senior', 'assisted living', 'memory care', 'nursing home', 
      'independent living', 'retirement', 'elder care', '55+', 
      'alzheimer', 'dementia', 'skilled nursing'
    ];
    
    const text = (name + ' ' + description).toLowerCase();
    return seniorKeywords.some(keyword => text.includes(keyword));
  }

  private mergeCommunityData(
    original: CommunityVerificationData, 
    verification: CommunityVerificationData
  ): CommunityVerificationData {
    return {
      ...original,
      address: verification.address || original.address,
      zipCode: verification.zipCode || original.zipCode,
      phone: verification.phone || original.phone,
      website: verification.website || original.website,
      careTypes: [...new Set([...original.careTypes, ...verification.careTypes])],
      verificationSources: [...new Set([...original.verificationSources, ...verification.verificationSources])],
      crossReferencedData: {
        phoneVerified: original.crossReferencedData.phoneVerified || verification.crossReferencedData.phoneVerified,
        addressVerified: original.crossReferencedData.addressVerified || verification.crossReferencedData.addressVerified,
        licenseVerified: original.crossReferencedData.licenseVerified || verification.crossReferencedData.licenseVerified,
        businessRegistrationVerified: original.crossReferencedData.businessRegistrationVerified || verification.crossReferencedData.businessRegistrationVerified
      },
      confidence: 0 // Will be recalculated
    };
  }

  private containsBusinessRegistrationInfo(data: any, businessName: string): boolean {
    if (!data || !data.AbstractText) return false;
    const text = data.AbstractText.toLowerCase();
    return text.includes(businessName.toLowerCase()) && 
           (text.includes('registration') || text.includes('license') || text.includes('corporation') || text.includes('llc'));
  }

  private phoneMatchesBusiness(data: any, businessName: string, phone: string): boolean {
    if (!data || !data.AbstractText) return false;
    const text = data.AbstractText.toLowerCase();
    return text.includes(businessName.toLowerCase()) && text.includes(phone);
  }

  private generateCommunityKey(community: CommunityVerificationData): string {
    return `${community.name.toLowerCase().replace(/[^\w\s]/g, '')}_${community.city.toLowerCase()}_${community.state.toLowerCase()}`;
  }

  private calculateConfidenceScore(community: CommunityVerificationData): number {
    let score = 0;
    
    // Base information scoring
    if (community.name) score += 10;
    if (community.address) score += 10;
    if (community.phone) score += 10;
    if (community.website) score += 5;
    if (community.careTypes.length > 0) score += 5;
    
    // Verification source scoring
    score += community.verificationSources.length * 12;
    
    // Cross-reference scoring (higher weights)
    if (community.crossReferencedData.phoneVerified) score += 20;
    if (community.crossReferencedData.addressVerified) score += 15;
    if (community.crossReferencedData.licenseVerified) score += 25;
    if (community.crossReferencedData.businessRegistrationVerified) score += 15;
    
    return Math.min(score, 100);
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

  private extractWebsite(url: string): string | undefined {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch {
      return undefined;
    }
  }

  private extractCareTypes(text: string): string[] {
    const careTypes: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('independent living')) careTypes.push('Independent Living');
    if (lowerText.includes('assisted living')) careTypes.push('Assisted Living');
    if (lowerText.includes('memory care') || lowerText.includes('alzheimer')) careTypes.push('Memory Care');
    if (lowerText.includes('skilled nursing') || lowerText.includes('nursing home')) careTypes.push('Skilled Nursing');
    if (lowerText.includes('rehabilitation')) careTypes.push('Rehabilitation');
    if (lowerText.includes('55+') || lowerText.includes('senior housing')) careTypes.push('55+ Housing');
    
    return careTypes;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Save verified communities to database
  async saveVerifiedCommunities(
    verifiedCommunities: CommunityVerificationData[], 
    city: string, 
    state: string
  ): Promise<number> {
    let savedCount = 0;
    
    for (const community of verifiedCommunities) {
      try {
        // Convert to database format
        const insertData: InsertCommunity = {
          name: community.name,
          address: community.address,
          city: community.city,
          state: community.state,
          zipCode: community.zipCode || null,
          phone: community.phone || null,
          website: community.website || null,
          description: `Verified ${community.careTypes.join(', ')} community with ${community.confidence}% confidence score.`,
          careTypes: community.careTypes,
          amenities: [],
          services: [],
          isVerified: community.confidence >= 70,
          licenseNumber: null,
          licenseStatus: community.crossReferencedData.licenseVerified ? 'Licensed' : 'Unknown',
          verificationSources: community.verificationSources,
          confidenceScore: community.confidence,
          crossReferencedData: community.crossReferencedData
        };
        
        await db.insert(communities).values(insertData);
        savedCount++;
      } catch (error) {
        console.error(`Failed to save community ${community.name}:`, error);
      }
    }
    
    return savedCount;
  }
}

export const enhancedScraper = new EnhancedCommunityDataScraper();