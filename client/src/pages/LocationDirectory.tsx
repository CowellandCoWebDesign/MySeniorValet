import { useEffect } from "react";
import { useRoute } from "wouter";
import { useLocation } from "wouter";
import CommunityDirectory from "./community-directory";

// Map of URL slugs to location parameters
const locationMap: Record<string, string> = {
  'oakmont': 'oakmont',
  'puerto-rico': 'puerto-rico',
  'peru': 'peru',
  'hawaii': 'hawaii',
  'fort-worth': 'fort-worth',
  'new-york': 'new-york',
  'cuba': 'cuba',
  'costa-rica': 'costa-rica',
  'panama': 'panama',
  'japan': 'japan',
  'singapore': 'singapore',
  'scotland': 'scotland',
  'canada': 'canada',
  'australia': 'australia'
};

export default function LocationDirectory() {
  const [match, params] = useRoute("/directory/:location");
  const [location, setLocation] = useLocation();
  
  const locationSlug = params?.location;
  
  useEffect(() => {
    if (locationSlug && locationMap[locationSlug]) {
      // Set a query parameter that the CommunityDirectory component will read
      // This allows us to reuse the existing component logic
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('location', locationMap[locationSlug]);
      
      // Update the URL to include the location parameter
      const newPath = `/community-directory?${searchParams.toString()}`;
      if (location !== newPath) {
        setLocation(newPath);
      }
    } else if (locationSlug && !locationMap[locationSlug]) {
      // Invalid location, redirect to main directory
      setLocation('/community-directory');
    }
  }, [locationSlug, location, setLocation]);
  
  // Render the CommunityDirectory component which will handle the location scrolling
  return <CommunityDirectory />;
}