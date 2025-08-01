import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'hero.title': 'Find Your Perfect Senior Living Community',
    'hero.subtitle': 'From live pricing and unit availability to move coordination, furniture setup, and prescription delivery, MySeniorValet is your white-glove partner.',
    'hero.description': 'Discover verified senior living communities with transparent pricing and authentic reviews across North America',
    'hero.communities': 'Communities',
    'hero.search': 'Search Communities',
    'hero.searchPlaceholder': 'Search by city, state, or community name...',
    'nav.home': 'Home',
    'nav.communities': 'Communities',
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.language': 'Language',
    'communities.title': 'Featured Communities',
    'communities.viewAll': 'View All Communities',
    'communities.hud': 'HUD Housing',
    'communities.hudSubtitle': 'Government-subsidized senior housing',
    'communities.coastal': 'Coastal Communities',
    'communities.coastalSubtitle': 'Beautiful oceanside retirement',
    'communities.trending': 'Trending This Week',
    'communities.trendingSubtitle': 'Most viewed communities',
    'services.title': 'Senior Care Services',
    'services.subtitle': 'Professional care providers near you',
    'services.viewAll': 'View All Services',
    'marketplace.title': 'Senior Products Marketplace',
    'marketplace.subtitle': 'Essential products for senior living',
    'marketplace.viewAll': 'View Marketplace',
    'stats.totalCommunities': 'Total Communities',
    'stats.canadianCommunities': 'Canadian Communities',
    'stats.bilingualCommunities': 'Bilingual Communities',
    'stats.provinces': 'Provinces & Territories',
    'community.contactForPricing': 'Contact for pricing',
    'community.monthlyRent': '/month',
    'community.viewDetails': 'View Details',
    'community.callNow': 'Call Now',
    'community.website': 'Visit Website',
    'community.bilingual': 'Bilingual Services',
    'filters.allTypes': 'All Types',
    'filters.hudSenior': 'HUD Senior Housing',
    'filters.assistedLiving': 'Assisted Living',
    'filters.memorycare': 'Memory Care',
    'filters.independentLiving': 'Independent Living',
    'filters.activeAdult': '55+ Active Adult',
    'filters.mobileHome': 'Mobile Home Parks',
    'filters.manufactureredHome': 'Manufactured Homes',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.disclaimer': 'Disclaimer',
    'footer.allRightsReserved': 'All rights reserved',
  },
  fr: {
    'hero.title': 'Trouvez votre communauté de vie pour aînés idéale',
    'hero.subtitle': 'Des prix en temps réel et la disponibilité des unités à la coordination du déménagement, l\'installation du mobilier et la livraison de médicaments, MySeniorValet est votre partenaire de service haut de gamme.',
    'hero.description': 'Découvrez des communautés vérifiées avec des prix transparents et des avis authentiques à travers l\'Amérique du Nord',
    'hero.communities': 'Communautés',
    'hero.search': 'Rechercher des communautés',
    'hero.searchPlaceholder': 'Rechercher par ville, province ou nom de communauté...',
    'nav.home': 'Accueil',
    'nav.communities': 'Communautés',
    'nav.services': 'Services',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.language': 'Langue',
    'communities.title': 'Communautés en vedette',
    'communities.viewAll': 'Voir toutes les communautés',
    'communities.hud': 'Logement HUD',
    'communities.hudSubtitle': 'Logements pour aînés subventionnés par le gouvernement',
    'communities.coastal': 'Communautés côtières',
    'communities.coastalSubtitle': 'Belles retraites en bord de mer',
    'communities.trending': 'Tendances cette semaine',
    'communities.trendingSubtitle': 'Communautés les plus consultées',
    'services.title': 'Services de soins aux aînés',
    'services.subtitle': 'Fournisseurs de soins professionnels près de chez vous',
    'services.viewAll': 'Voir tous les services',
    'marketplace.title': 'Marché de produits pour aînés',
    'marketplace.subtitle': 'Produits essentiels pour la vie des aînés',
    'marketplace.viewAll': 'Voir le marché',
    'stats.totalCommunities': 'Communautés totales',
    'stats.canadianCommunities': 'Communautés canadiennes',
    'stats.bilingualCommunities': 'Communautés bilingues',
    'stats.provinces': 'Provinces et territoires',
    'community.contactForPricing': 'Contactez pour les prix',
    'community.monthlyRent': '/mois',
    'community.viewDetails': 'Voir les détails',
    'community.callNow': 'Appelez maintenant',
    'community.website': 'Visiter le site web',
    'community.bilingual': 'Services bilingues',
    'filters.allTypes': 'Tous les types',
    'filters.hudSenior': 'Logement HUD pour aînés',
    'filters.assistedLiving': 'Résidence assistée',
    'filters.memorycare': 'Soins de la mémoire',
    'filters.independentLiving': 'Vie autonome',
    'filters.activeAdult': '55+ Adulte actif',
    'filters.mobileHome': 'Parcs de maisons mobiles',
    'filters.manufactureredHome': 'Maisons préfabriquées',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': 'Conditions d\'utilisation',
    'footer.disclaimer': 'Avis de non-responsabilité',
    'footer.allRightsReserved': 'Tous droits réservés',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}