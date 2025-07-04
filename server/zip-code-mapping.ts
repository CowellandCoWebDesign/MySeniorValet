/**
 * Comprehensive ZIP Code to County/City Mapping System
 * Provides intelligent geographic search expansion for TrueView
 */

export interface ZipCodeMapping {
  zip: string;
  city: string;
  county: string;
  state: string;
  latitude?: number;
  longitude?: number;
  relatedZips?: string[];
}

// Northern California ZIP code mappings organized by county
export const ZIP_CODE_MAPPINGS: Record<string, ZipCodeMapping> = {
  // Shasta County (Redding Area)
  '96001': { zip: '96001', city: 'Redding', county: 'Shasta County', state: 'CA', relatedZips: ['96002', '96003', '96049'] },
  '96002': { zip: '96002', city: 'Redding', county: 'Shasta County', state: 'CA', relatedZips: ['96001', '96003', '96049'] },
  '96003': { zip: '96003', city: 'Redding', county: 'Shasta County', state: 'CA', relatedZips: ['96001', '96002', '96049'] },
  '96049': { zip: '96049', city: 'Redding', county: 'Shasta County', state: 'CA', relatedZips: ['96001', '96002', '96003'] },
  '96080': { zip: '96080', city: 'Red Bluff', county: 'Tehama County', state: 'CA', relatedZips: ['96001', '96002', '96003'] },

  // Alameda County (Oakland/Fremont Area)
  '94501': { zip: '94501', city: 'Alameda', county: 'Alameda County', state: 'CA', relatedZips: ['94502', '94536', '94538'] },
  '94502': { zip: '94502', city: 'Alameda', county: 'Alameda County', state: 'CA', relatedZips: ['94501', '94536', '94538'] },
  '94536': { zip: '94536', city: 'Fremont', county: 'Alameda County', state: 'CA', relatedZips: ['94537', '94538', '94539'] },
  '94537': { zip: '94537', city: 'Fremont', county: 'Alameda County', state: 'CA', relatedZips: ['94536', '94538', '94539'] },
  '94538': { zip: '94538', city: 'Fremont', county: 'Alameda County', state: 'CA', relatedZips: ['94536', '94537', '94539'] },
  '94539': { zip: '94539', city: 'Fremont', county: 'Alameda County', state: 'CA', relatedZips: ['94536', '94537', '94538'] },
  '94601': { zip: '94601', city: 'Oakland', county: 'Alameda County', state: 'CA', relatedZips: ['94602', '94603', '94605'] },
  '94602': { zip: '94602', city: 'Oakland', county: 'Alameda County', state: 'CA', relatedZips: ['94601', '94603', '94605'] },
  '94603': { zip: '94603', city: 'Oakland', county: 'Alameda County', state: 'CA', relatedZips: ['94601', '94602', '94605'] },
  '94605': { zip: '94605', city: 'Oakland', county: 'Alameda County', state: 'CA', relatedZips: ['94601', '94602', '94603'] },

  // Contra Costa County
  '94507': { zip: '94507', city: 'Alamo', county: 'Contra Costa County', state: 'CA', relatedZips: ['94526', '94549', '94563'] },
  '94526': { zip: '94526', city: 'Danville', county: 'Contra Costa County', state: 'CA', relatedZips: ['94507', '94549', '94563'] },
  '94549': { zip: '94549', city: 'Lafayette', county: 'Contra Costa County', state: 'CA', relatedZips: ['94507', '94526', '94563'] },
  '94563': { zip: '94563', city: 'Orinda', county: 'Contra Costa County', state: 'CA', relatedZips: ['94507', '94526', '94549'] },
  '94801': { zip: '94801', city: 'Richmond', county: 'Contra Costa County', state: 'CA', relatedZips: ['94802', '94803', '94805'] },
  '94802': { zip: '94802', city: 'Richmond', county: 'Contra Costa County', state: 'CA', relatedZips: ['94801', '94803', '94805'] },
  '94803': { zip: '94803', city: 'El Cerrito', county: 'Contra Costa County', state: 'CA', relatedZips: ['94801', '94802', '94805'] },
  '94805': { zip: '94805', city: 'Richmond', county: 'Contra Costa County', state: 'CA', relatedZips: ['94801', '94802', '94803'] },

  // Santa Clara County (San Jose Area)
  '95008': { zip: '95008', city: 'Campbell', county: 'Santa Clara County', state: 'CA', relatedZips: ['95014', '95030', '95051'] },
  '95014': { zip: '95014', city: 'Cupertino', county: 'Santa Clara County', state: 'CA', relatedZips: ['95008', '95030', '95051'] },
  '95030': { zip: '95030', city: 'Los Gatos', county: 'Santa Clara County', state: 'CA', relatedZips: ['95008', '95014', '95051'] },
  '95051': { zip: '95051', city: 'Santa Clara', county: 'Santa Clara County', state: 'CA', relatedZips: ['95008', '95014', '95030'] },
  '95110': { zip: '95110', city: 'San Jose', county: 'Santa Clara County', state: 'CA', relatedZips: ['95111', '95112', '95113', '95124'] },
  '95111': { zip: '95111', city: 'San Jose', county: 'Santa Clara County', state: 'CA', relatedZips: ['95110', '95112', '95113', '95124'] },
  '95112': { zip: '95112', city: 'San Jose', county: 'Santa Clara County', state: 'CA', relatedZips: ['95110', '95111', '95113', '95124'] },
  '95113': { zip: '95113', city: 'San Jose', county: 'Santa Clara County', state: 'CA', relatedZips: ['95110', '95111', '95112', '95124'] },
  '95124': { zip: '95124', city: 'San Jose', county: 'Santa Clara County', state: 'CA', relatedZips: ['95110', '95111', '95112', '95113'] },

  // San Mateo County
  '94002': { zip: '94002', city: 'Belmont', county: 'San Mateo County', state: 'CA', relatedZips: ['94010', '94019', '94025'] },
  '94010': { zip: '94010', city: 'Burlingame', county: 'San Mateo County', state: 'CA', relatedZips: ['94002', '94019', '94025'] },
  '94019': { zip: '94019', city: 'Half Moon Bay', county: 'San Mateo County', state: 'CA', relatedZips: ['94002', '94010', '94025'] },
  '94025': { zip: '94025', city: 'Menlo Park', county: 'San Mateo County', state: 'CA', relatedZips: ['94002', '94010', '94019'] },
  '94301': { zip: '94301', city: 'Palo Alto', county: 'San Mateo County', state: 'CA', relatedZips: ['94302', '94303', '94304'] },
  '94302': { zip: '94302', city: 'Palo Alto', county: 'San Mateo County', state: 'CA', relatedZips: ['94301', '94303', '94304'] },
  '94303': { zip: '94303', city: 'Palo Alto', county: 'San Mateo County', state: 'CA', relatedZips: ['94301', '94302', '94304'] },
  '94304': { zip: '94304', city: 'Palo Alto', county: 'San Mateo County', state: 'CA', relatedZips: ['94301', '94302', '94303'] },

  // Marin County
  '94901': { zip: '94901', city: 'San Rafael', county: 'Marin County', state: 'CA', relatedZips: ['94903', '94904', '94949'] },
  '94903': { zip: '94903', city: 'San Rafael', county: 'Marin County', state: 'CA', relatedZips: ['94901', '94904', '94949'] },
  '94904': { zip: '94904', city: 'Greenbrae', county: 'Marin County', state: 'CA', relatedZips: ['94901', '94903', '94949'] },
  '94949': { zip: '94949', city: 'Novato', county: 'Marin County', state: 'CA', relatedZips: ['94901', '94903', '94904'] },
  '94941': { zip: '94941', city: 'Mill Valley', county: 'Marin County', state: 'CA', relatedZips: ['94945', '94947', '94965'] },
  '94945': { zip: '94945', city: 'Novato', county: 'Marin County', state: 'CA', relatedZips: ['94941', '94947', '94965'] },
  '94947': { zip: '94947', city: 'Novato', county: 'Marin County', state: 'CA', relatedZips: ['94941', '94945', '94965'] },
  '94965': { zip: '94965', city: 'Sausalito', county: 'Marin County', state: 'CA', relatedZips: ['94941', '94945', '94947'] },

  // Sacramento County
  '95608': { zip: '95608', city: 'Carmichael', county: 'Sacramento County', state: 'CA', relatedZips: ['95610', '95621', '95628'] },
  '95610': { zip: '95610', city: 'Citrus Heights', county: 'Sacramento County', state: 'CA', relatedZips: ['95608', '95621', '95628'] },
  '95621': { zip: '95621', city: 'Citrus Heights', county: 'Sacramento County', state: 'CA', relatedZips: ['95608', '95610', '95628'] },
  '95628': { zip: '95628', city: 'Fair Oaks', county: 'Sacramento County', state: 'CA', relatedZips: ['95608', '95610', '95621'] },
  '95814': { zip: '95814', city: 'Sacramento', county: 'Sacramento County', state: 'CA', relatedZips: ['95815', '95816', '95817'] },
  '95815': { zip: '95815', city: 'Sacramento', county: 'Sacramento County', state: 'CA', relatedZips: ['95814', '95816', '95817'] },
  '95816': { zip: '95816', city: 'Sacramento', county: 'Sacramento County', state: 'CA', relatedZips: ['95814', '95815', '95817'] },
  '95817': { zip: '95817', city: 'Sacramento', county: 'Sacramento County', state: 'CA', relatedZips: ['95814', '95815', '95816'] },

  // San Francisco County - All ZIP codes where we have communities
  '94102': { zip: '94102', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94103', '94104', '94105', '94109', '94110', '94112', '94115', '94117', '94118', '94122', '94131', '94132', '94158'] },
  '94103': { zip: '94103', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94104', '94105', '94109', '94110', '94112', '94115', '94117', '94118', '94122', '94131', '94132', '94158'] },
  '94104': { zip: '94104', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94105', '94109', '94110', '94112', '94115', '94117', '94118', '94122', '94131', '94132', '94158'] },
  '94105': { zip: '94105', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94109', '94110', '94112', '94115', '94117', '94118', '94122', '94131', '94132', '94158'] },
  '94109': { zip: '94109', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94110', '94112', '94115', '94117', '94118', '94122', '94131', '94132', '94158'] },
  '94110': { zip: '94110', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94109', '94112', '94115', '94117', '94118', '94122', '94131', '94132', '94158'] },
  '94112': { zip: '94112', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94109', '94110', '94115', '94117', '94118', '94122', '94131', '94132', '94158'] },
  '94114': { zip: '94114', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94109', '94110', '94112', '94115', '94117', '94118', '94122', '94131', '94132', '94158'] },
  '94115': { zip: '94115', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94109', '94110', '94112', '94117', '94118', '94122', '94131', '94132', '94158'] },
  '94117': { zip: '94117', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94109', '94110', '94112', '94115', '94118', '94122', '94131', '94132', '94158'] },
  '94118': { zip: '94118', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94109', '94110', '94112', '94115', '94117', '94122', '94131', '94132', '94158'] },
  '94122': { zip: '94122', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94109', '94110', '94112', '94115', '94117', '94118', '94131', '94132', '94158'] },
  '94131': { zip: '94131', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94109', '94110', '94112', '94115', '94117', '94118', '94122', '94132', '94158'] },
  '94132': { zip: '94132', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94109', '94110', '94112', '94115', '94117', '94118', '94122', '94131', '94158'] },
  '94158': { zip: '94158', city: 'San Francisco', county: 'San Francisco County', state: 'CA', relatedZips: ['94102', '94103', '94104', '94105', '94109', '94110', '94112', '94115', '94117', '94118', '94122', '94131', '94132'] },

  // Solano County
  '94533': { zip: '94533', city: 'Fairfield', county: 'Solano County', state: 'CA', relatedZips: ['94534', '94585', '94591'] },
  '94534': { zip: '94534', city: 'Fairfield', county: 'Solano County', state: 'CA', relatedZips: ['94533', '94585', '94591'] },
  '94585': { zip: '94585', city: 'Suisun City', county: 'Solano County', state: 'CA', relatedZips: ['94533', '94534', '94591'] },
  '94591': { zip: '94591', city: 'Vallejo', county: 'Solano County', state: 'CA', relatedZips: ['94533', '94534', '94585'] },
  '94592': { zip: '94592', city: 'Vallejo', county: 'Solano County', state: 'CA', relatedZips: ['94533', '94534', '94585'] },

  // Yolo County
  '95616': { zip: '95616', city: 'Davis', county: 'Yolo County', state: 'CA', relatedZips: ['95695', '95691', '95605'] },
  '95691': { zip: '95691', city: 'West Sacramento', county: 'Yolo County', state: 'CA', relatedZips: ['95616', '95695', '95605'] },
  '95695': { zip: '95695', city: 'Woodland', county: 'Yolo County', state: 'CA', relatedZips: ['95616', '95691', '95605'] },
  '95605': { zip: '95605', city: 'West Sacramento', county: 'Yolo County', state: 'CA', relatedZips: ['95616', '95695', '95691'] },

  // Butte County
  '95928': { zip: '95928', city: 'Chico', county: 'Butte County', state: 'CA', relatedZips: ['95929', '95973', '95965'] },
  '95929': { zip: '95929', city: 'Chico', county: 'Butte County', state: 'CA', relatedZips: ['95928', '95973', '95965'] },
  '95965': { zip: '95965', city: 'Oroville', county: 'Butte County', state: 'CA', relatedZips: ['95928', '95929', '95973'] },
  '95973': { zip: '95973', city: 'Paradise', county: 'Butte County', state: 'CA', relatedZips: ['95928', '95929', '95965'] },

  // Placer County
  '95603': { zip: '95603', city: 'Auburn', county: 'Placer County', state: 'CA', relatedZips: ['95661', '95662', '95747'] },
  '95661': { zip: '95661', city: 'Roseville', county: 'Placer County', state: 'CA', relatedZips: ['95603', '95662', '95747'] },
  '95662': { zip: '95662', city: 'Orangevale', county: 'Placer County', state: 'CA', relatedZips: ['95603', '95661', '95747'] },
  '95747': { zip: '95747', city: 'Roseville', county: 'Placer County', state: 'CA', relatedZips: ['95603', '95661', '95662'] },

  // Sonoma County
  '95401': { zip: '95401', city: 'Santa Rosa', county: 'Sonoma County', state: 'CA', relatedZips: ['95403', '95404', '95405'] },
  '95403': { zip: '95403', city: 'Santa Rosa', county: 'Sonoma County', state: 'CA', relatedZips: ['95401', '95404', '95405'] },
  '95404': { zip: '95404', city: 'Santa Rosa', county: 'Sonoma County', state: 'CA', relatedZips: ['95401', '95403', '95405'] },
  '95405': { zip: '95405', city: 'Santa Rosa', county: 'Sonoma County', state: 'CA', relatedZips: ['95401', '95403', '95404'] },
  '95448': { zip: '95448', city: 'Middletown', county: 'Sonoma County', state: 'CA', relatedZips: ['95401', '95403', '95404'] },
};

export class ZipCodeService {
  /**
   * Get ZIP code information including related ZIP codes
   */
  getZipInfo(zipCode: string): ZipCodeMapping | null {
    return ZIP_CODE_MAPPINGS[zipCode] || null;
  }

  /**
   * Get all ZIP codes for a given county
   */
  getZipsByCounty(county: string): string[] {
    return Object.values(ZIP_CODE_MAPPINGS)
      .filter(mapping => mapping.county === county)
      .map(mapping => mapping.zip);
  }

  /**
   * Get all ZIP codes for a given city
   */
  getZipsByCity(city: string): string[] {
    return Object.values(ZIP_CODE_MAPPINGS)
      .filter(mapping => mapping.city.toLowerCase() === city.toLowerCase())
      .map(mapping => mapping.zip);
  }

  /**
   * Get related ZIP codes for geographic expansion
   */
  getRelatedZips(zipCode: string): string[] {
    const zipInfo = this.getZipInfo(zipCode);
    if (!zipInfo) return [];

    // Return related ZIPs plus the original ZIP
    return [zipCode, ...(zipInfo.relatedZips || [])];
  }

  /**
   * Get nearest ZIP codes when no exact match is found
   */
  getNearestZips(zipCode: string, maxDistance: number = 50): string[] {
    const zipInfo = this.getZipInfo(zipCode);
    if (!zipInfo) {
      // For unknown ZIP codes, try to find ZIP codes in the same region
      // This is a fallback for ZIP codes not in our mapping
      const prefix = zipCode.substring(0, 3);
      return Object.keys(ZIP_CODE_MAPPINGS)
        .filter(zip => zip.startsWith(prefix))
        .slice(0, 10); // Limit to first 10 matches
    }

    // Return ZIP codes in the same county
    return this.getZipsByCounty(zipInfo.county);
  }

  /**
   * Expand ZIP code search to include geographic variations
   */
  expandZipSearch(zipCode: string): string[] {
    const relatedZips = this.getRelatedZips(zipCode);
    if (relatedZips.length > 1) {
      return relatedZips;
    }

    // If no related ZIPs, try to find nearby ZIPs
    return this.getNearestZips(zipCode);
  }

  /**
   * Get county information for a ZIP code
   */
  getCountyForZip(zipCode: string): string | null {
    const zipInfo = this.getZipInfo(zipCode);
    return zipInfo ? zipInfo.county : null;
  }

  /**
   * Get city information for a ZIP code
   */
  getCityForZip(zipCode: string): string | null {
    const zipInfo = this.getZipInfo(zipCode);
    return zipInfo ? zipInfo.city : null;
  }

  /**
   * Check if two ZIP codes are in the same geographic area
   */
  areZipsRelated(zip1: string, zip2: string): boolean {
    const info1 = this.getZipInfo(zip1);
    const info2 = this.getZipInfo(zip2);
    
    if (!info1 || !info2) return false;
    
    // Same county or same city
    return info1.county === info2.county || info1.city === info2.city;
  }

  /**
   * Get all supported ZIP codes
   */
  getAllSupportedZips(): string[] {
    return Object.keys(ZIP_CODE_MAPPINGS);
  }

  /**
   * Get all supported counties
   */
  getAllSupportedCounties(): string[] {
    const counties = new Set(Object.values(ZIP_CODE_MAPPINGS).map(m => m.county));
    return Array.from(counties);
  }
}

export const zipCodeService = new ZipCodeService();