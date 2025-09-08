/**
 * DEPRECATED - This file is maintained for backward compatibility only
 * Please use @shared/tiers instead for all tier information
 */

import { COMMUNITY_TIERS, VENDOR_TIERS } from '@shared/tiers';

// Legacy format for backward compatibility - Maps new tier system to old format
export const COMMUNITY_TIER_INFO = Object.entries(COMMUNITY_TIERS).reduce((acc, [key, tier]) => {
  acc[key] = {
    name: tier.displayName,
    features: tier.highlights,
    nextSteps: [
      'Complete your profile setup',
      'Upload photos and content',
      'Enable all available features',
      'Monitor your analytics dashboard',
      tier.price === 0 ? 'Consider upgrading for more features' : 'Maximize your plan benefits'
    ]
  };
  return acc;
}, {} as Record<string, { name: string; features: string[]; nextSteps: string[] }>);

export const VENDOR_TIER_INFO = Object.entries(VENDOR_TIERS).reduce((acc, [key, tier]) => {
  acc[key] = {
    name: tier.displayName,
    features: tier.highlights,
    nextSteps: [
      'Complete your vendor profile',
      'Add service descriptions',
      'Configure your service areas',
      'Start collecting reviews',
      'Monitor your analytics dashboard'
    ]
  };
  return acc;
}, {} as Record<string, { name: string; features: string[]; nextSteps: string[] }>);