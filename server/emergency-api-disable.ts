/**
 * EMERGENCY API DISABLE SYSTEM
 * Immediately disables all external API calls until cost issues are resolved
 */

export class EmergencyApiDisable {
  private static disabled = true; // EMERGENCY: All APIs disabled
  
  /**
   * Check if APIs are disabled
   */
  static isDisabled(): boolean {
    return this.disabled;
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
}

export const emergencyApiDisable = EmergencyApiDisable;