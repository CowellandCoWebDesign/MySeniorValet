import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";

// Location landing page for SEO - redirects to AI Search Intelligence
export default function LocationLanding() {
  const [, params] = useRoute("/senior-living/:state/:city?");
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!params?.state) return;
    
    const state = params.state.replace(/-/g, " ").toUpperCase();
    const city = params.city?.replace(/-/g, " ");
    
    // Detect country based on state/province code
    const canadianProvinces = ['ON', 'QC', 'BC', 'AB', 'NS', 'SK', 'NB', 'MB', 'NL', 'PE', 'NT', 'NU', 'YT'];
    const australianStates = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];
    const mexicanStates = ['CDMX', 'JAL', 'NL', 'BC', 'CHIH', 'QRO', 'YUC'];
    
    let country = 'US'; // Default to US
    if (canadianProvinces.includes(state)) {
      country = 'CA';
    } else if (australianStates.includes(state)) {
      country = 'AU';
    } else if (mexicanStates.includes(state)) {
      country = 'Mexico';
    }
    
    // Capitalize city name properly
    const cityName = city?.split(" ").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");
    
    // Build location query
    const locationQuery = cityName ? `${cityName}, ${state}` : state;
    
    // Redirect to AI Search Intelligence with location parameters
    const searchParams = new URLSearchParams();
    searchParams.set('mode', 'simplified');
    searchParams.set('location', locationQuery);
    searchParams.set('country', country);
    if (cityName) {
      searchParams.set('city', cityName);
    }
    searchParams.set('state', state);
    
    // Perform the redirect
    setLocation(`/ai-search-intelligence?${searchParams.toString()}`);
  }, [params, setLocation]);
  
  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-indigo-900">
      <div className="text-center text-white">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl">Redirecting to search...</p>
      </div>
    </div>
  );
}