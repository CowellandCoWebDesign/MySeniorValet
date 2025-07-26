import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPricingDisplay(community: any): string {
  // Check for HUD verified pricing
  if (community.hudPropertyId && community.rentPerMonth) {
    return `$${community.rentPerMonth}/month`;
  }
  
  // Check for price range
  if (community.priceRange) {
    if (typeof community.priceRange === 'object' && community.priceRange.min) {
      const min = community.priceRange.min;
      const max = community.priceRange.max;
      if (min > 0 && max > 0) {
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
      }
    } else if (typeof community.priceRange === 'string' && community.priceRange !== 'Contact for pricing') {
      return community.priceRange;
    }
  }

  // Check for monthly rent range
  if (community.monthlyRentRangeStart && community.monthlyRentRangeEnd) {
    return `$${community.monthlyRentRangeStart} - $${community.monthlyRentRangeEnd}`;
  }

  return "Contact for pricing";
}
