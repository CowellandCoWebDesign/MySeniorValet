import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { LocationInfo, LocationSEOService } from '@/services/locationSEO.service';
import { Helmet } from 'react-helmet-async';

interface UseLocationSEOReturn {
  location: LocationInfo | null;
  isLocationPage: boolean;
  locationContent: {
    headline: string;
    subheadline: string;
    highlights: string[];
  } | null;
}

export function useLocationSEO(): UseLocationSEOReturn {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [pathname] = useLocation();
  
  useEffect(() => {
    // Check URL parameters for location
    const searchParams = new URLSearchParams(window.location.search);
    const detectedLocation = LocationSEOService.parseLocationFromUrl(searchParams);
    
    if (detectedLocation) {
      setLocation(detectedLocation);
      
      // Update document title immediately for SEO
      const title = LocationSEOService.generateTitle(detectedLocation);
      document.title = title;
    } else {
      // Check if we're on a location route
      const locationMatch = pathname.match(/^\/location\/([^/]+)/);
      if (locationMatch) {
        const locationSlug = locationMatch[1];
        const foundLocation = LocationSEOService.parseLocationFromUrl(locationSlug);
        if (foundLocation) {
          setLocation(foundLocation);
          const title = LocationSEOService.generateTitle(foundLocation);
          document.title = title;
        }
      }
    }
  }, [pathname]);
  
  const locationContent = location ? LocationSEOService.generateLocationContent(location) : null;
  
  return {
    location,
    isLocationPage: !!location,
    locationContent
  };
}

interface LocationSEOHeadProps {
  location: LocationInfo;
  pageType?: string;
}