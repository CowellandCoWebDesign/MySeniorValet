import { useState, useEffect } from "react";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, MapPin, Home, Building2, Users, Phone, Brain, Sparkles, Shield, Globe, ChevronRight, Flag, Languages, Maple } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";
import { CareServiceCard } from "@/components/CareServiceCard";
import { VendorMarketplaceTabs } from "@/components/VendorMarketplaceTabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CanadianStatsCard } from "@/components/canadian-stats-card";
import { BilingualCommunityCard } from "@/components/bilingual-community-card";

export default function CanadaPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch Canadian communities
  const { data: canadianCommunities, isLoading: canadianLoading } = useQuery({
    queryKey: ["/api/communities/canadian/all"],
    retry: false,
  });

  // Fetch Canadian stats
  const { data: canadianStats } = useQuery({
    queryKey: ["/api/communities/canadian/stats"],
    retry: false,
  });

  // Fetch Canadian care services
  const { data: canadianCareServices, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/care-services/canadian"],
    retry: false,
  });

  // Fetch platform stats
  const { data: platformStats } = useQuery({
    queryKey: ["/api/platform/stats"],
    retry: false,
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-red-600/90 dark:bg-red-900/90 backdrop-blur-md border-b border-white/20">
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <div className="flex items-center space-x-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                    <span className="text-red-600 text-lg">🍁</span>
                  </div>
                  <span className="text-lg font-bold text-white">MySeniorValet Canada</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <Link href="/login" className="text-white hover:text-red-200 transition-colors font-medium text-sm">
                Sign In
              </Link>
              <Link href="/signup" className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Canadian Theme */}
      <section className="relative min-h-[60vh] bg-gradient-to-br from-red-100 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Canadian Flag Pattern Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-red-50 dark:from-red-900/20 dark:via-gray-900 dark:to-red-900/10">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-20 text-red-600 text-8xl">🍁</div>
              <div className="absolute top-40 right-40 text-red-600 text-6xl rotate-45">🍁</div>
              <div className="absolute bottom-20 left-1/3 text-red-600 text-7xl -rotate-12">🍁</div>
              <div className="absolute bottom-10 right-20 text-red-600 text-5xl rotate-180">🍁</div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600 text-9xl opacity-5">🍁</div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-gray-900/50"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-6 py-8 pt-20">
          <div className="text-center mb-8 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-red-600 dark:text-red-400 leading-tight mb-4">
              {language === 'fr' ? 'Bienvenue au Canada' : 'Welcome to Canada'}
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 font-medium">
              {language === 'fr' 
                ? 'Découvrez les communautés de retraite canadiennes avec support bilingue'
                : 'Discover Canadian senior living communities with bilingual support'}
            </h2>
          </div>

          {/* Canadian Search Bar */}
          <div className="w-full max-w-3xl mb-8">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!searchQuery) return;
              window.location.href = `/map-search?q=${encodeURIComponent(searchQuery)}&country=canada`;
            }}>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-red-200 dark:border-red-700">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder={language === 'fr' 
                      ? "Rechercher des communautés canadiennes..." 
                      : "Search Canadian communities..."}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="flex-1 px-8 py-5 text-lg md:text-xl border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <div className="flex items-center mr-3">
                    <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0 text-sm md:text-base px-4 py-2 font-semibold">
                      🍁 Canada
                    </Badge>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 m-3 rounded-2xl transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    <Search className="w-7 h-7" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Canadian Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <Flag className="h-5 w-5 text-red-600" />
              <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {canadianStats?.total || 24} Communities
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <Languages className="h-5 w-5 text-blue-600" />
              <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {canadianStats?.bilingual || 10} Bilingual
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <MapPin className="h-5 w-5 text-green-600" />
              <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                13 Provinces & Territories
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Canadian Communities Grid */}
      <section className="px-4 py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {language === 'fr' ? 'Communautés Canadiennes' : 'Canadian Communities'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {language === 'fr' 
                  ? 'Explorez les options de logement pour aînés à travers le Canada'
                  : 'Explore senior living options across Canada'}
              </p>
            </div>
            <Link href="/map-search?country=canada">
              <Button variant="outline" className="hidden sm:flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {language === 'fr' ? 'Voir sur la carte' : 'View on Map'}
              </Button>
            </Link>
          </div>

          {/* Canadian Stats Card */}
          <div className="mb-8">
            <CanadianStatsCard />
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canadianLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              (canadianCommunities as any[])?.map((community) => (
                <BilingualCommunityCard 
                  key={community.id} 
                  community={community}
                  language={language}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Canadian Vendor Marketplace */}
      <section className="px-4 py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {language === 'fr' ? 'Marché Canadien' : 'Canadian Marketplace'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'fr' 
                ? 'Produits et services pour les aînés canadiens'
                : 'Products and services for Canadian seniors'}
            </p>
          </div>

          {/* Canadian-specific vendors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Bell Mobility</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Senior Plans</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Special mobile plans for Canadian seniors with simplified features
                </p>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Shoppers Drug Mart</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Senior Services</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Pharmacy services, health consultations, and senior discounts
                </p>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Canadian Red Cross</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Home Support</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Health equipment loans and home support services
                </p>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Regular Vendor Marketplace */}
          <VendorMarketplaceTabs />
        </div>
      </section>

      {/* Canadian Care Services */}
      <section className="px-4 py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {language === 'fr' ? 'Services de Soins Canadiens' : 'Canadian Care Services'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'fr' 
                ? 'Services de soins à domicile et de soutien disponibles au Canada'
                : 'Home care and support services available in Canada'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              (canadianCareServices as any[])?.slice(0, 6).map((service) => (
                <CareServiceCard key={service.id} service={service} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Canadian Resources */}
      <section className="px-4 py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {language === 'fr' ? 'Ressources Canadiennes' : 'Canadian Resources'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'fr' 
                ? 'Ressources gouvernementales et informations pour les aînés'
                : 'Government resources and information for seniors'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Government of Canada - Seniors
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Official government resources including Old Age Security, Canada Pension Plan, and health benefits
                </p>
                <a 
                  href="https://www.canada.ca/en/services/benefits/publicpensions.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  Visit Canada.ca <ChevronRight className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Provincial Health Services
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Links to provincial health authorities and senior care programs across Canada
                </p>
                <Link href="/resources/provincial-health">
                  <span className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 cursor-pointer">
                    Explore Provincial Resources <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Canadian Association of Retired Persons (CARP)
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Canada's largest advocacy association for older Canadians
                </p>
                <a 
                  href="https://www.carp.ca" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  Visit CARP.ca <ChevronRight className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Service Canada Locations
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Find your nearest Service Canada office for in-person assistance
                </p>
                <a 
                  href="https://www.servicecanada.gc.ca/tbsc-fsco/sc-lst.jsp?lang=eng" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  Find Locations <ChevronRight className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">
            {language === 'fr' 
              ? 'MySeniorValet Canada - Votre guide pour la vie des aînés au Canada'
              : 'MySeniorValet Canada - Your guide to senior living in Canada'}
          </p>
          <Link href="/">
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
              {language === 'fr' ? 'Retour à MySeniorValet' : 'Back to MySeniorValet'}
            </span>
          </Link>
        </div>
      </footer>
    </div>
  );
}