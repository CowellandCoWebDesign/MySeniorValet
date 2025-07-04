/**
 * Comprehensive Care Type Classification System
 * Accurately classifies senior living communities based on facility name, description, and Google Places types
 */

export interface CareTypeAnalysis {
  primaryCareType: string;
  allCareTypes: string[];
  confidence: number;
  reasoning: string;
}

export class CareTypeClassifier {
  
  /**
   * Classify care types based on facility name, Google Places types, and additional context
   */
  classifyCareTypes(name: string, description?: string, googlePlacesTypes?: string[]): CareTypeAnalysis {
    const text = (name + ' ' + (description || '') + ' ' + (googlePlacesTypes?.join(' ') || '')).toLowerCase();
    
    // Senior Mobile Home Parks / RV Parks
    if (this.isMobileHomePark(text)) {
      return {
        primaryCareType: 'Senior Mobile Park',
        allCareTypes: ['Senior Mobile Park'],
        confidence: 0.95,
        reasoning: 'Mobile home park or RV community specifically for seniors'
      };
    }

    // Skilled Nursing / Nursing Homes
    if (this.isSkilledNursing(text)) {
      return {
        primaryCareType: 'Skilled Nursing',
        allCareTypes: ['Skilled Nursing'],
        confidence: 0.95,
        reasoning: 'Provides skilled nursing care and medical services'
      };
    }

    // Memory Care Specific
    if (this.isMemoryCareOnly(text)) {
      return {
        primaryCareType: 'Memory Care',
        allCareTypes: ['Memory Care'],
        confidence: 0.90,
        reasoning: 'Specialized memory care for dementia and Alzheimer\'s'
      };
    }

    // Assisted Living with Memory Care
    if (this.isAssistedWithMemory(text)) {
      return {
        primaryCareType: 'Assisted Living',
        allCareTypes: ['Assisted Living', 'Memory Care'],
        confidence: 0.85,
        reasoning: 'Assisted living facility with specialized memory care wing'
      };
    }

    // Pure Assisted Living
    if (this.isAssistedLiving(text)) {
      return {
        primaryCareType: 'Assisted Living',
        allCareTypes: ['Assisted Living'],
        confidence: 0.80,
        reasoning: 'Provides assistance with daily activities and personal care'
      };
    }

    // Independent Living with Services Available
    if (this.isIndependentWithServices(text)) {
      return {
        primaryCareType: 'Independent Living',
        allCareTypes: ['Independent Living', 'Care Services Available'],
        confidence: 0.75,
        reasoning: 'Independent living with optional care services'
      };
    }

    // Pure Independent Living
    if (this.isIndependentLiving(text)) {
      return {
        primaryCareType: 'Independent Living',
        allCareTypes: ['Independent Living'],
        confidence: 0.75,
        reasoning: 'Independent living for active seniors'
      };
    }

    // 55+ Housing / Senior Apartments
    if (this.is55PlusHousing(text)) {
      return {
        primaryCareType: '55+ Housing',
        allCareTypes: ['55+ Housing'],
        confidence: 0.70,
        reasoning: 'Age-restricted housing for seniors 55 and older'
      };
    }

    // CCRC (Continuing Care Retirement Community)
    if (this.isCCRC(text)) {
      return {
        primaryCareType: 'Continuing Care',
        allCareTypes: ['Independent Living', 'Assisted Living', 'Skilled Nursing'],
        confidence: 0.85,
        reasoning: 'Continuing care retirement community with multiple care levels'
      };
    }

    // Fallback - try to determine most likely type
    return this.getFallbackClassification(text);
  }

  private isMobileHomePark(text: string): boolean {
    const mobileIndicators = [
      'mobile home', 'mobile park', 'rv park', 'rv resort', 'manufactured home',
      'trailer park', 'coach park', 'motorhome', 'mobile village'
    ];
    return mobileIndicators.some(indicator => text.includes(indicator));
  }

  private isSkilledNursing(text: string): boolean {
    const skilledNursingIndicators = [
      'skilled nursing', 'nursing home', 'nursing facility', 'snf',
      'convalescent', 'rehabilitation center', 'rehab center',
      'post-acute care', 'long-term care facility'
    ];
    return skilledNursingIndicators.some(indicator => text.includes(indicator));
  }

  private isMemoryCareOnly(text: string): boolean {
    const memoryIndicators = [
      'memory care', 'alzheimer', 'dementia care', 'cognitive care',
      'memory support', 'alzheimer\'s care', 'dementia support'
    ];
    const assistedIndicators = ['assisted living', 'assisted care'];
    
    return memoryIndicators.some(indicator => text.includes(indicator)) &&
           !assistedIndicators.some(indicator => text.includes(indicator));
  }

  private isAssistedWithMemory(text: string): boolean {
    const memoryIndicators = [
      'memory care', 'alzheimer', 'dementia care', 'memory support'
    ];
    const assistedIndicators = [
      'assisted living', 'assisted care', 'personal care'
    ];
    
    return memoryIndicators.some(indicator => text.includes(indicator)) &&
           assistedIndicators.some(indicator => text.includes(indicator));
  }

  private isAssistedLiving(text: string): boolean {
    const assistedIndicators = [
      'assisted living', 'assisted care', 'personal care home',
      'residential care', 'board and care', 'care home'
    ];
    return assistedIndicators.some(indicator => text.includes(indicator));
  }

  private isIndependentWithServices(text: string): boolean {
    const independentIndicators = [
      'independent living', 'senior community', 'retirement community'
    ];
    const servicesIndicators = [
      'services available', 'care available', 'optional care',
      'supportive services', 'wellness services'
    ];
    
    return independentIndicators.some(indicator => text.includes(indicator)) &&
           servicesIndicators.some(indicator => text.includes(indicator));
  }

  private isIndependentLiving(text: string): boolean {
    const independentIndicators = [
      'independent living', 'senior apartments', 'retirement community',
      'senior community', 'retirement residence', 'senior residence'
    ];
    return independentIndicators.some(indicator => text.includes(indicator));
  }

  private is55PlusHousing(text: string): boolean {
    const ageRestrictedIndicators = [
      '55+', '55 plus', 'senior housing', 'senior apartments',
      'age restricted', 'active adult', '55 and over'
    ];
    return ageRestrictedIndicators.some(indicator => text.includes(indicator));
  }

  private isCCRC(text: string): boolean {
    const ccrcIndicators = [
      'ccrc', 'continuing care', 'life care', 'retirement campus',
      'multiple levels of care', 'all levels of care'
    ];
    return ccrcIndicators.some(indicator => text.includes(indicator));
  }

  private getFallbackClassification(text: string): CareTypeAnalysis {
    // Look for any senior-related keywords to make best guess
    if (text.includes('senior') || text.includes('retirement') || text.includes('elder')) {
      if (text.includes('apartment') || text.includes('housing')) {
        return {
          primaryCareType: '55+ Housing',
          allCareTypes: ['55+ Housing'],
          confidence: 0.40,
          reasoning: 'Appears to be senior housing based on keywords'
        };
      }
      return {
        primaryCareType: 'Independent Living',
        allCareTypes: ['Independent Living'],
        confidence: 0.30,
        reasoning: 'Generic senior facility, likely independent living'
      };
    }

    // Ultimate fallback
    return {
      primaryCareType: 'Senior Living',
      allCareTypes: ['Senior Living'],
      confidence: 0.20,
      reasoning: 'Unable to determine specific care type from available information'
    };
  }

  /**
   * Get care type description for display purposes
   */
  getCareTypeDescription(careType: string): string {
    const descriptions: Record<string, string> = {
      'Senior Mobile Park': 'Age-restricted mobile home or RV community',
      'Skilled Nursing': 'Medical care and rehabilitation services',
      'Memory Care': 'Specialized care for dementia and Alzheimer\'s',
      'Assisted Living': 'Personal care and daily living assistance',
      'Independent Living': 'Independent living for active seniors',
      'Care Services Available': 'Optional care services as needed',
      '55+ Housing': 'Age-restricted housing for adults 55+',
      'Continuing Care': 'Multiple levels of care on one campus',
      'Senior Living': 'General senior living community'
    };
    
    return descriptions[careType] || 'Senior living community';
  }

  /**
   * Get care type icon for display
   */
  getCareTypeIcon(careType: string): string {
    const icons: Record<string, string> = {
      'Senior Mobile Park': '🏘️',
      'Skilled Nursing': '🏥',
      'Memory Care': '🧠',
      'Assisted Living': '🤝',
      'Independent Living': '🏠',
      'Care Services Available': '🛎️',
      '55+ Housing': '🏢',
      'Continuing Care': '🏛️',
      'Senior Living': '🏡'
    };
    
    return icons[careType] || '🏡';
  }
}

export const careTypeClassifier = new CareTypeClassifier();