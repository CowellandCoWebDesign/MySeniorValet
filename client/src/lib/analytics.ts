// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
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