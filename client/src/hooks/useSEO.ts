import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export function useSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage
}: SEOProps) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = `${title} | MySeniorValet - Senior Living Search`;
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Update keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // Update canonical URL
    if (canonicalUrl) {
      let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.href = canonicalUrl;
    }

    // Update Open Graph image
    if (ogImage) {
      let metaOgImage = document.querySelector('meta[property="og:image"]');
      if (!metaOgImage) {
        metaOgImage = document.createElement('meta');
        metaOgImage.setAttribute('property', 'og:image');
        document.head.appendChild(metaOgImage);
      }
      metaOgImage.setAttribute('content', ogImage);
    }

    // Cleanup function to reset title on unmount
    return () => {
      document.title = 'MySeniorValet - Find Senior Living Communities Near You | 34,494+ Verified Locations';
    };
  }, [title, description, keywords, canonicalUrl, ogImage]);
}

// Common SEO templates for different page types
export const SEOTemplates = {
  mapSearch: {
    title: 'Search Senior Living Map',
    description: 'Interactive map search of 34,494+ senior living communities. Filter by care type, price, location. Find assisted living, memory care, nursing homes near you.',
    keywords: 'senior living map, assisted living near me, memory care facilities map, nursing home search, senior care map'
  },
  communities: {
    title: 'Browse All Senior Living Communities',
    description: 'Browse our complete directory of 34,494 senior living communities across USA & Canada. Compare prices, care types, and availability.',
    keywords: 'senior living directory, all senior communities, browse assisted living, senior care facilities list'
  },
  careSpectrum: {
    title: '10 Levels of Senior Care Explained',
    description: 'Understand all 10 levels of senior care from HUD Housing to Skilled Nursing. Learn costs, services, and how to choose the right care level.',
    keywords: 'levels of senior care, types of senior living, care spectrum, assisted living vs memory care, senior care options'
  },
  healthcare: {
    title: 'Healthcare Directory - Hospitals & Medical Centers',
    description: 'Find hospitals, medical centers, and healthcare facilities near senior living communities. Medicare & Medicaid accepted locations.',
    keywords: 'senior healthcare, hospitals near me, Medicare facilities, medical centers, senior health services'
  },
  marketplace: {
    title: 'Senior Living Marketplace - Products & Services',
    description: 'Essential products and services for senior living. Medical supplies, mobility aids, home modifications, and senior-friendly products.',
    keywords: 'senior products, elderly care supplies, mobility aids, senior living marketplace, medical equipment'
  },
  resources: {
    title: 'Senior Living Resources & Guides',
    description: 'Comprehensive guides for senior living decisions. Medicare, Medicaid, VA benefits, financial planning, and family resources.',
    keywords: 'senior living resources, Medicare guide, Medicaid help, VA benefits, senior care guides'
  },
  about: {
    title: 'About MySeniorValet - Transparency in Senior Living',
    description: 'Learn about our mission to bring transparency to senior living. No hidden fees, no referral markups, just honest information.',
    keywords: 'about MySeniorValet, senior living transparency, our mission, senior care platform'
  }
};