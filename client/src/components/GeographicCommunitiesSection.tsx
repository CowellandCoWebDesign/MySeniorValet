import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, ArrowRight, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { FeaturedExcellenceCard } from "@/components/FeaturedExcellenceCard";

export function GeographicCommunitiesSection() {
  const [, setLocation] = useLocation();
  const language = 'en';
  
  const hawaiiSliderRef = useRef<HTMLDivElement>(null);
  const texasSliderRef = useRef<HTMLDivElement>(null);
  const newYorkSliderRef = useRef<HTMLDivElement>(null);
  const canadianSliderRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollSlider = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const { data: hawaiiCommunities, isLoading: hawaiiLoading } = useQuery({
    queryKey: ['/api/communities/by-state?state=HI'],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: texasCommunities, isLoading: texasLoading } = useQuery({
    queryKey: ['/api/communities/by-city?city=Fort%20Worth&state=TX'],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: newYorkCommunities, isLoading: newYorkLoading } = useQuery({
    queryKey: ['/api/communities/by-state?state=NY'],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: canadianCommunities, isLoading: canadianLoading } = useQuery({
    queryKey: ['/api/communities/canadian'],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: puertoRicoCommunities, isLoading: puertoRicoLoading } = useQuery({
    queryKey: ['/api/communities/puerto-rico'],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: peruCommunities, isLoading: peruLoading } = useQuery({
    queryKey: ['peruCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-country?country=PE');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: cubaCommunities, isLoading: cubaLoading } = useQuery({
    queryKey: ['cubaCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-country?country=CU');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: costaRicaCommunities, isLoading: costaRicaLoading } = useQuery({
    queryKey: ['costaRicaCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-country?country=CR');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: panamaCommunities, isLoading: panamaLoading } = useQuery({
    queryKey: ['panamaCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-country?country=PA');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  return (
    <div ref={sectionRef} className="space-y-8">
      {/* Hawaii Paradise Communities */}
      <section data-testid="section-hawaii-communities" className="relative px-4 py-12 overflow-hidden rounded-xl">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-teal-800 to-blue-900 dark:from-cyan-950 dark:via-teal-900 dark:to-blue-950"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(34, 211, 238, 0.2) 0%, transparent 40%)`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-3xl md:text-4xl font-bold mb-3">
              <span className="text-4xl">🌺</span>
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Hawaii Paradise Communities
              </span>
            </div>
            <p className="text-lg text-gray-200" data-testid="text-hawaii-count">
              Exceptional senior living in America's tropical paradise across {((hawaiiCommunities as any)?.communities?.length || 0)} communities
            </p>
          </div>

          <div className="mb-8 bg-gradient-to-br from-blue-900/90 to-cyan-900/90 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-cyan-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Hawaii Insider Savings Tips</h3>
            </div>
            
            <ul className="space-y-2 text-gray-200 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🏝️</span>
                <span><strong>Kama'aina Discount:</strong> Ask about local resident discounts (10-15% off)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🏝️</span>
                <span><strong>Off-Peak Move:</strong> June-August moves can save $500-1000/month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🏝️</span>
                <span><strong>Outer Island Advantage:</strong> Big Island/Kauai 20-30% less than Oahu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🏝️</span>
                <span><strong>Ohana Plans:</strong> Multi-family member discounts available</span>
              </li>
            </ul>
            
            <div className="mt-3 p-3 bg-cyan-800/30 rounded-lg border border-cyan-600/30">
              <p className="text-sm text-cyan-200">
                <span className="font-semibold text-cyan-300">Pro Tip:</span> Hawaii communities often have 6-12 month waitlists. 
                Secure your spot with a deposit while negotiating terms.
              </p>
            </div>
          </div>

          <div className="relative">
            <div ref={hawaiiSliderRef} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-cyan-500 dark:scrollbar-thumb-cyan-400" style={{scrollBehavior: 'smooth'}}>
              {(hawaiiLoading || !hawaiiCommunities || !(hawaiiCommunities as any)?.communities?.length) ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-72 h-[420px] bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-xl border border-cyan-500/30 overflow-hidden animate-pulse">
                    <div className="h-40 bg-gradient-to-br from-cyan-800/50 to-blue-800/50"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-cyan-800/50 rounded"></div>
                      <div className="h-4 bg-cyan-800/50 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                ((hawaiiCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`hawaii-${community.id}-${index}`} className="flex-shrink-0" data-testid={`card-hawaii-community-${community.id}`}>
                    <FeaturedExcellenceCard 
                      community={{
                        ...community,
                        badge: "🌴 Aloha Living"
                      }} 
                      index={index} 
                      disableAutoPhotoLoad={true}
                      compact 
                    />
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-6">
              <Link to="/map-search?state=HI" data-testid="link-explore-hawaii">
                <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-4 text-base font-semibold shadow-xl" data-testid="button-explore-hawaii">
                  Explore All Hawaii Communities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fort Worth Texas Excellence */}
      <section data-testid="section-fortworth-communities" className="relative px-4 py-12 overflow-hidden rounded-xl">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-red-800 to-amber-900 dark:from-orange-950 dark:via-red-900 dark:to-amber-950"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(245, 158, 11, 0.2) 0%, transparent 40%)`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-3xl md:text-4xl font-bold mb-3">
              <span className="text-4xl">⭐</span>
              <span className="bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">
                Fort Worth Lone Star Excellence
              </span>
            </div>
            <p className="text-lg text-gray-200" data-testid="text-fortworth-subtitle">
              Texas-sized luxury and authentic southern hospitality
            </p>
          </div>

          <div className="mb-8 bg-gradient-to-br from-red-900/90 to-orange-900/90 backdrop-blur-lg rounded-2xl border border-orange-500/30 p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-orange-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Texas-Sized Savings Tips</h3>
            </div>
            
            <ul className="space-y-2 text-gray-200 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🤠</span>
                <span><strong>Summer Special:</strong> July-August moves save 20-30% (heat advantage)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🤠</span>
                <span><strong>Veteran Benefits:</strong> Fort Worth military discounts 10-15% off</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🤠</span>
                <span><strong>Corporate Partnerships:</strong> Ask about employer/alumni discounts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🤠</span>
                <span><strong>Bundle & Save:</strong> Couples save $800-1200/month sharing units</span>
              </li>
            </ul>
            
            <div className="mt-3 p-3 bg-orange-800/30 rounded-lg border border-orange-600/30">
              <p className="text-sm text-orange-200">
                <span className="font-semibold text-orange-300">Insider Secret:</span> Fort Worth communities compete heavily with Dallas. 
                Mention you're comparing both markets for immediate 5-10% concessions.
              </p>
            </div>
          </div>

          <div className="relative">
            <div ref={texasSliderRef} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-orange-500 dark:scrollbar-thumb-orange-400" style={{scrollBehavior: 'smooth'}}>
              {(texasLoading || !texasCommunities || !(texasCommunities as any)?.communities?.length) ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-72 h-[420px] bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-xl border border-orange-500/30 overflow-hidden animate-pulse">
                    <div className="h-40 bg-gradient-to-br from-orange-800/50 to-red-800/50"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-orange-800/50 rounded"></div>
                      <div className="h-4 bg-orange-800/50 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                ((texasCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`texas-${community.id}-${index}`} className="flex-shrink-0" data-testid={`card-texas-community-${community.id}`}>
                    <FeaturedExcellenceCard 
                      community={{
                        ...community,
                        badge: "🏜️ Texas Pride"
                      }} 
                      index={index} 
                      disableAutoPhotoLoad={true}
                      compact 
                    />
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-6">
              <Link to="/map-search?city=Fort Worth&state=Texas" data-testid="link-explore-fortworth">
                <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-4 text-base font-semibold shadow-xl" data-testid="button-explore-fortworth">
                  Explore All Fort Worth Communities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New York Empire Excellence */}
      <section data-testid="section-newyork-communities" className="relative px-4 py-12 overflow-hidden rounded-xl">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 dark:from-purple-950 dark:via-indigo-900 dark:to-blue-950"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(129, 140, 248, 0.2) 0%, transparent 40%)`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-3xl md:text-4xl font-bold mb-3">
              <span className="text-4xl">🗽</span>
              <span className="bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                New York Empire Excellence
              </span>
            </div>
            <p className="text-lg text-gray-200" data-testid="text-newyork-count">
              World-class senior living in the Empire State across {((newYorkCommunities as any)?.communities?.length || 0)} communities
            </p>
          </div>

          <div className="mb-8 bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-purple-300" />
              </div>
              <h3 className="text-lg font-bold text-white">NYC Strategic Savings Tips</h3>
            </div>
            
            <ul className="space-y-2 text-gray-200 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🗽</span>
                <span><strong>Outer Borough Bargain:</strong> Brooklyn/Queens 25% less than Manhattan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🗽</span>
                <span><strong>Winter Move Special:</strong> January-March saves $1000-2000/month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🗽</span>
                <span><strong>Hudson Valley Alternative:</strong> 1-hour north, 50% savings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🗽</span>
                <span><strong>Rent Control Awareness:</strong> Ask about stabilized units</span>
              </li>
            </ul>
            
            <div className="mt-3 p-3 bg-purple-800/30 rounded-lg border border-purple-600/30">
              <p className="text-sm text-purple-200">
                <span className="font-semibold text-purple-300">NYC Pro Tip:</span> Manhattan communities have 3-24 month waitlists. 
                Consider "bridge communities" in Westchester while waiting.
              </p>
            </div>
          </div>

          <div className="relative">
            <div ref={newYorkSliderRef} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-purple-500 dark:scrollbar-thumb-purple-400" style={{scrollBehavior: 'smooth'}}>
              {(newYorkLoading || !newYorkCommunities || !(newYorkCommunities as any)?.communities?.length) ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-72 h-[420px] bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl border border-purple-500/30 overflow-hidden animate-pulse">
                    <div className="h-40 bg-gradient-to-br from-purple-800/50 to-indigo-800/50"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-purple-800/50 rounded"></div>
                      <div className="h-4 bg-purple-800/50 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                ((newYorkCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`newyork-${community.id}-${index}`} className="flex-shrink-0" data-testid={`card-newyork-community-${community.id}`}>
                    <FeaturedExcellenceCard 
                      community={{
                        ...community,
                        badge: "🏙️ Empire Living"
                      }} 
                      index={index} 
                      disableAutoPhotoLoad={true}
                      compact 
                    />
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-6">
              <Link to="/map-search?state=NY" data-testid="link-explore-newyork">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 text-base font-semibold shadow-xl" data-testid="button-explore-newyork">
                  Explore All New York Communities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Canadian Communities */}
      <section data-testid="section-canadian-communities" className="px-4 py-10 relative rounded-xl dark:bg-gray-800/50">
        <div className="absolute inset-0 z-0 rounded-xl overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-red-100 via-white to-red-50 dark:from-red-900/20 dark:via-gray-900 dark:to-red-900/10">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-20 text-red-600 text-6xl">🍁</div>
              <div className="absolute top-40 right-40 text-red-600 text-5xl rotate-45">🍁</div>
              <div className="absolute bottom-20 left-1/3 text-red-600 text-6xl -rotate-12">🍁</div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-600" />
                {language === 'en' ? 'Featured Canadian Communities' : 'Communautés canadiennes en vedette'}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                  {language === 'en' ? 'Coast to coast coverage' : 'Couverture d\'un océan à l\'autre'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-gray-900 dark:text-gray-100" data-testid="text-canadian-price">$2,500 - $5,500 CAD</div>
              <div className="text-sm text-red-600 dark:text-red-300 font-medium">
                {language === 'en' ? 'Canadian communities' : 'Communautés canadiennes'}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
              onClick={() => scrollSlider(canadianSliderRef, 'left')}
              data-testid="button-scroll-canadian-left"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
              onClick={() => scrollSlider(canadianSliderRef, 'right')}
              data-testid="button-scroll-canadian-right"
            >
              <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </Button>
            
            <div ref={canadianSliderRef} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-red-500 dark:scrollbar-thumb-red-400" style={{scrollBehavior: 'smooth'}}>
              {canadianLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-64 h-[380px] bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                    <div className="h-40 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-gray-700 dark:to-gray-800"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : ((canadianCommunities as any)?.communities || []).length === 0 ? (
                <Link to="/search?location=canada" data-testid="link-canadian-promo">
                  <div className="overflow-hidden flex-shrink-0 w-60 h-[28rem] border-2 border-red-300 dark:border-red-600 hover:shadow-xl transition-all cursor-pointer group bg-white dark:bg-gray-900 rounded-xl">
                    <div className="aspect-[4/3] bg-gradient-to-br from-red-100 to-white dark:from-red-900 dark:to-gray-900 flex items-center justify-center">
                      <div className="text-center p-6">
                        <Flag className="w-14 h-14 text-red-600 dark:text-red-400 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-red-700 dark:text-red-300">24+</h3>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {language === 'en' ? 'Canadian Communities' : 'Communautés'}
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-gray-100">
                        {language === 'en' ? 'Explore Canadian Communities' : 'Explorer les communautés'}
                      </h3>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white group-hover:scale-105 transition-transform" data-testid="button-canadian-promo">
                        {language === 'en' ? 'Explore Canadian Communities' : 'Explorer les communautés'}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ) : (
                ((canadianCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`canadian-${community.id}-${index}`} className="flex-shrink-0" data-testid={`card-canadian-community-${community.id}`}>
                    <FeaturedExcellenceCard community={community} index={index} compact disableAutoPhotoLoad={true} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Puerto Rico Communities */}
      <section data-testid="section-puertorico-communities" className="px-4 py-8 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 rounded-xl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                🏝️ Puerto Rico Communities
              </h2>
              <Link to="/search?location=Puerto Rico" data-testid="link-puertorico-view-all">
                <Button variant="outline" className="flex items-center gap-2 border-cyan-300 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-900/20 text-sm" data-testid="button-puertorico-view-all">
                  View All Puerto Rico
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-cyan-600 text-white px-2 py-1 text-xs">🏖️ Caribbean Paradise</Badge>
              <Badge className="bg-blue-600 text-white px-2 py-1 text-xs">🇺🇸 U.S. Territory</Badge>
              <Badge className="bg-emerald-600 text-white px-2 py-1 text-xs">💰 Tax Advantages</Badge>
            </div>
          </div>
          
          <div className="mb-6 bg-gradient-to-br from-cyan-900/90 to-teal-900/90 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-cyan-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Puerto Rico Insider Savings Tips</h3>
            </div>
            
            <ul className="space-y-2 text-gray-200 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🏝️</span>
                <span><strong>Act 60 Tax Benefits:</strong> Retirees pay 0% federal tax on retirement income</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🏝️</span>
                <span><strong>Medicare Advantage:</strong> Full Medicare coverage unlike other Caribbean islands</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🏝️</span>
                <span><strong>Mountain vs Coast:</strong> Central mountain towns 40% less than San Juan</span>
              </li>
            </ul>
            
            <div className="mt-3 p-3 bg-cyan-800/30 rounded-lg border border-cyan-600/30">
              <p className="text-sm text-cyan-200">
                <span className="font-semibold text-cyan-300">Pro Tip:</span> As a U.S. territory, Puerto Rico offers unique benefits - no passport needed, 
                use of U.S. dollar, and Caribbean living at 50% less than Hawaii.
              </p>
            </div>
          </div>
          
          {puertoRicoLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full"></div>
            </div>
          ) : !(puertoRicoCommunities as any)?.communities?.length ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <Button variant="outline" className="mt-2" onClick={() => setLocation('/map-search?location=Puerto Rico')} data-testid="button-search-puertorico">
                Search All Puerto Rico Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-cyan-500" style={{scrollBehavior: 'smooth'}}>
                {((puertoRicoCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`pr-${community.id}-${index}`} className="flex-shrink-0" data-testid={`card-puertorico-community-${community.id}`}>
                    <FeaturedExcellenceCard community={community} index={index} disableAutoPhotoLoad={true} compact />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Peru Communities */}
      <section data-testid="section-peru-communities" className="px-4 py-8 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/30 dark:via-gray-900 dark:to-red-950/30 rounded-xl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                🇵🇪 Peru Communities
              </h2>
              <Link to="/search?location=Peru" data-testid="link-peru-view-all">
                <Button variant="outline" className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20 text-sm" data-testid="button-peru-view-all">
                  View All Peru
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-red-600 text-white px-2 py-1 text-xs">🏔️ Andean Views</Badge>
              <Badge className="bg-yellow-600 text-white px-2 py-1 text-xs">💰 Low Cost</Badge>
              <Badge className="bg-green-600 text-white px-2 py-1 text-xs">🏥 Quality Healthcare</Badge>
            </div>
          </div>
          
          <div className="mb-6 bg-gradient-to-br from-red-900/90 to-yellow-900/90 backdrop-blur-lg rounded-2xl border border-red-500/30 p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-red-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Peru Expat Insider Savings Tips</h3>
            </div>
            
            <ul className="space-y-2 text-gray-200 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🏔️</span>
                <span><strong>Healthcare Bargain:</strong> Private hospitals 70-80% less than US costs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🏔️</span>
                <span><strong>Lima vs Provinces:</strong> Arequipa and Cusco 40% cheaper than Lima</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🏔️</span>
                <span><strong>Rentista Visa:</strong> Show $1,000/month income for residency benefits</span>
              </li>
            </ul>
          </div>
          
          {peruLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
          ) : !(peruCommunities as any)?.communities?.length ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <Button variant="outline" className="mt-2" onClick={() => setLocation('/map-search?location=Peru')} data-testid="button-search-peru">
                Search All Peru Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-red-500" style={{scrollBehavior: 'smooth'}}>
                {((peruCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`pe-${community.id}-${index}`} className="flex-shrink-0" data-testid={`card-peru-community-${community.id}`}>
                    <FeaturedExcellenceCard community={community} index={index} disableAutoPhotoLoad={true} compact />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cuba Caribbean Heritage */}
      <section data-testid="section-cuba-communities" className="relative px-4 py-12 overflow-hidden rounded-xl">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-red-800 to-amber-900 dark:from-blue-950 dark:via-red-900 dark:to-amber-950"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(245, 158, 11, 0.2) 0%, transparent 40%)`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-3xl md:text-4xl font-bold mb-3">
              <span className="text-4xl">🇨🇺</span>
              <span className="bg-gradient-to-r from-blue-300 to-red-300 bg-clip-text text-transparent">
                Cuba Caribbean Heritage
              </span>
            </div>
            <p className="text-lg text-gray-200" data-testid="text-cuba-subtitle">
              Authentic Caribbean retirement in the Pearl of the Antilles
            </p>
          </div>

          <div className="mb-8 bg-gradient-to-br from-blue-900/90 to-red-900/90 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Cuba Insider Living Tips</h3>
            </div>
            
            <ul className="space-y-2 text-gray-200 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🌴</span>
                <span><strong>Casa Particular:</strong> Private homes 40% less than hotels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🌴</span>
                <span><strong>Havana vs Beach:</strong> Beach towns 30% more affordable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🌴</span>
                <span><strong>Long-term Stays:</strong> 6+ months saves 20-25%</span>
              </li>
            </ul>
            
            <div className="mt-3 p-3 bg-blue-800/30 rounded-lg border border-blue-600/30">
              <p className="text-sm text-blue-200">
                <span className="font-semibold text-blue-300">Caribbean Pro Tip:</span> Cuba offers unique cultural immersion opportunities 
                with Spanish lessons and salsa dancing programs.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-blue-500 dark:scrollbar-thumb-blue-400" style={{scrollBehavior: 'smooth'}}>
              {(cubaLoading || !cubaCommunities || !(cubaCommunities as any)?.communities?.length) ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-72 h-[420px] bg-gradient-to-br from-blue-900/50 to-red-900/50 rounded-xl border border-blue-500/30 overflow-hidden animate-pulse">
                    <div className="h-40 bg-gradient-to-br from-blue-800/50 to-red-800/50"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-blue-800/50 rounded"></div>
                      <div className="h-4 bg-blue-800/50 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                ((cubaCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`cuba-${community.id}-${index}`} className="flex-shrink-0" data-testid={`card-cuba-community-${community.id}`}>
                    <FeaturedExcellenceCard 
                      community={{
                        ...community,
                        badge: "🎭 Heritage Living"
                      }} 
                      index={index} 
                      disableAutoPhotoLoad={true}
                      compact 
                    />
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-6">
              <Link to="/search?location=Cuba" data-testid="link-explore-cuba">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white px-6 py-4 text-base font-semibold shadow-xl" data-testid="button-explore-cuba">
                  Explore All Cuba Communities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Costa Rica Communities */}
      <section data-testid="section-costarica-communities" className="px-4 py-8 bg-gradient-to-br from-green-50 via-blue-50 to-green-50 dark:from-green-950/30 dark:via-blue-950/30 dark:to-green-950/30 rounded-xl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                🇨🇷 Costa Rica Communities
              </h2>
              <Link to="/search?location=Costa Rica" data-testid="link-costarica-view-all">
                <Button variant="outline" className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20 text-sm" data-testid="button-costarica-view-all">
                  View All Costa Rica
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-blue-600 text-white px-2 py-1 text-xs">🏥 CIMA Hospital</Badge>
              <Badge className="bg-green-600 text-white px-2 py-1 text-xs">🌴 Perfect Climate</Badge>
              <Badge className="bg-purple-600 text-white px-2 py-1 text-xs">💰 Pensionado Benefits</Badge>
            </div>
          </div>
          
          <div className="mb-6 bg-gradient-to-br from-green-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl border border-green-500/30 p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-green-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Costa Rica Pensionado Insider Tips</h3>
            </div>
            
            <ul className="space-y-2 text-gray-200 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🦜</span>
                <span><strong>Pensionado Program:</strong> Show $1,000/month pension for discounts on everything</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🦜</span>
                <span><strong>Central Valley Advantage:</strong> Perfect climate, 30% less than coastal areas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">🦜</span>
                <span><strong>CAJA Healthcare:</strong> Join public system for $75-150/month full coverage</span>
              </li>
            </ul>
            
            <div className="mt-3 p-3 bg-green-800/30 rounded-lg border border-green-600/30">
              <p className="text-sm text-green-200">
                <span className="font-semibold text-green-300">Pro Tip:</span> Costa Rica's Pensionado visa offers automatic discounts - 50% off entertainment, 
                25% off airlines, 20% off medical bills.
              </p>
            </div>
          </div>
          
          {costaRicaLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
            </div>
          ) : !(costaRicaCommunities as any)?.communities?.length ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <Button variant="outline" className="mt-2" onClick={() => setLocation('/map-search?location=Costa Rica')} data-testid="button-search-costarica">
                Search All Costa Rica Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-green-500" style={{scrollBehavior: 'smooth'}}>
                {((costaRicaCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`cr-${community.id}-${index}`} className="flex-shrink-0" data-testid={`card-costarica-community-${community.id}`}>
                    <FeaturedExcellenceCard community={community} index={index} disableAutoPhotoLoad={true} compact />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Panama Communities */}
      <section data-testid="section-panama-communities" className="px-4 py-8 bg-gradient-to-br from-blue-50 via-red-50 to-blue-50 dark:from-blue-950/30 dark:via-red-950/30 dark:to-blue-950/30 rounded-xl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                🇵🇦 Panama Communities
              </h2>
              <Link to="/search?location=Panama" data-testid="link-panama-view-all">
                <Button variant="outline" className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20 text-sm" data-testid="button-panama-view-all">
                  View All Panama
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-blue-600 text-white px-2 py-1 text-xs">💵 US Dollar Economy</Badge>
              <Badge className="bg-green-600 text-white px-2 py-1 text-xs">🏥 Johns Hopkins Affiliate</Badge>
              <Badge className="bg-purple-600 text-white px-2 py-1 text-xs">🎫 Pensionado Discounts</Badge>
            </div>
          </div>
          
          <div className="mb-6 bg-gradient-to-br from-blue-900/90 to-red-900/90 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Panama Dollar Economy Savings Tips</h3>
            </div>
            
            <ul className="space-y-2 text-gray-200 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">💵</span>
                <span><strong>US Dollar Advantage:</strong> No currency exchange fees or fluctuation risks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">💵</span>
                <span><strong>Boquete vs City:</strong> Mountain towns 40% cheaper than Panama City</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">💵</span>
                <span><strong>Pensionado Perks:</strong> 50% off hotels, 30% off restaurants, 25% off utilities</span>
              </li>
            </ul>
            
            <div className="mt-3 p-3 bg-blue-800/30 rounded-lg border border-blue-600/30">
              <p className="text-sm text-blue-200">
                <span className="font-semibold text-blue-300">Pro Tip:</span> Panama's territorial tax system means foreign-sourced income is tax-free. 
                Retirees can stretch their dollars 30-50% further than in the US.
              </p>
            </div>
          </div>
          
          {panamaLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : !(panamaCommunities as any)?.communities?.length ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <Button variant="outline" className="mt-2" onClick={() => setLocation('/map-search?location=Panama')} data-testid="button-search-panama">
                Search All Panama Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-blue-500" style={{scrollBehavior: 'smooth'}}>
                {((panamaCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`pa-${community.id}-${index}`} className="flex-shrink-0" data-testid={`card-panama-community-${community.id}`}>
                    <FeaturedExcellenceCard community={community} index={index} disableAutoPhotoLoad={true} compact />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
