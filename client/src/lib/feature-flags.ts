/**
 * Feature flags — flip PAID_TIERS_DISABLED to false when paid plans are ready.
 */
export const PAID_TIERS_DISABLED = true;

/** Tier IDs that are considered paid (not free). */
export const PAID_TIER_IDS = new Set([
  'starter', 'growth', 'premium', 'enterprise',
  'enhanced-listing', 'premium-plus', 'enterprise-monopoly',
]);

export const CONTACT_SALES_MAILTO =
  'mailto:hello@myseniorvalet.com?subject=Subscription Inquiry';
