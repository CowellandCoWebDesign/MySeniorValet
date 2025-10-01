// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics following Google's manual installation recommendations
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Initialize dataLayer and gtag function immediately (as per Google's recommendations)
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  // Set initial timestamp
  window.gtag('js', new Date());

  // Add Google Analytics script to the head
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  
  // Configure GA after script loads
  script.onload = () => {
    window.gtag('config', measurementId);
    console.log('✅ Google Analytics initialized with manual installation method');
  };
  
  // Insert as first script in head for faster loading
  const firstScript = document.head.querySelector('script');
  if (firstScript) {
    document.head.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track specific user interactions with MySeniorValet features
export const trackCommunityView = (communityId: number | string, communityName: string) => {
  trackEvent('view_community', 'engagement', communityName, Number(communityId));
};

export const trackSearch = (searchQuery: string, resultsCount: number) => {
  trackEvent('search', 'discovery', searchQuery, resultsCount);
};

export const trackTourScheduled = (communityName: string) => {
  trackEvent('schedule_tour', 'conversion', communityName);
};

export const trackContactClick = (type: 'phone' | 'email' | 'website', communityName: string) => {
  trackEvent(`contact_${type}`, 'engagement', communityName);
};

export const trackFilterUsed = (filterType: string, filterValue: string) => {
  trackEvent('use_filter', 'discovery', `${filterType}: ${filterValue}`);
};

export const trackEmergencyButton = () => {
  trackEvent('emergency_contact', 'safety', 'emergency_button_clicked');
};

export const trackAIInteraction = (feature: string) => {
  trackEvent('ai_interaction', 'engagement', feature);
};