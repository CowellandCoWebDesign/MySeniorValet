/**
 * EMERGENCY API DISABLE SYSTEM
 * Immediately disables all external API calls until cost issues are resolved
 */

export class EmergencyApiDisable {
  private static disabled = true; // EMERGENCY: All APIs disabled
  private static googleApisHalted = true; // EMERGENCY: Google APIs completely halted
  
  /**
   * Check if APIs are disabled
   */
  static isDisabled(): boolean {
    return this.disabled;
  }
  
  /**
   * Check if Google APIs are specifically halted
   */
  static isGoogleApisHalted(): boolean {
    return this.googleApisHalted;
  }
  
  /**
   * Disable all APIs (emergency mode)
   */
  static disable(): void {
    this.disabled = true;
    console.log('🚨 EMERGENCY: All external APIs have been DISABLED to prevent cost overruns');
  }
  
  /**
   * Re-enable APIs (admin only, after fixing issues)
   */
  static enable(): void {
    this.disabled = false;
    console.log('✅ External APIs have been re-enabled');
  }
  
  /**
   * Throw error if API is disabled
   */
  static checkApiAccess(apiName: string): void {
    if (this.disabled) {
      throw new Error(`🚨 API DISABLED: ${apiName} is currently disabled due to cost protection measures. All external API calls are blocked until cost issues are resolved.`);
    }
  }
  
  /**
   * Throw error if Google APIs are specifically accessed
   */
  static checkGoogleApiAccess(apiName: string): void {
    if (this.googleApisHalted) {
      throw new Error(`🚨 GOOGLE API EMERGENCY HALT: ${apiName} is completely halted. All Google API access blocked after $300 cost incident.`);
    }
  }

  /**
   * Get current emergency status
   */
  static getStatus(): {
    disabled: boolean;
    disabledServices: string[];
    disabledDate: Date | null;
    reason: string;
  } {
    return {
      disabled: this.disabled,
      disabledServices: this.disabled ? [
        'Google Places API',
        'Google Places Reviews',
        'Google Places Photos',
        'Yelp API',
        'All External APIs'
      ] : [],
      disabledDate: this.disabled ? new Date() : null,
      reason: this.disabled ? 
        'Emergency disabled due to $300+ API cost overrun from runaway Google Places discovery endpoint' : 
        'APIs operational'
    };
  }
}

export const emergencyApiDisable = EmergencyApiDisable;