import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Package, 
  LogIn,
  Shield,
  Star,
  ShieldCheck,
  Menu,
  X,
  Home,
  Search,
  Heart,
  User,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Briefcase,
  AlertCircle,
  Info,
  CheckCircle,
  FileText,
  Users,
  TrendingUp,
  Sparkles,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { VendorMarketplaceTabs } from '@/components/VendorMarketplaceTabs';
import { VendorServiceCard } from '@/components/VendorServiceCard';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/footer';
import { useQuery } from '@tanstack/react-query';

import { useSEO } from '@/hooks/useSEO';

export default function SeniorMarketplace() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch recently discovered services
  const { data: recentServices, isLoading } = useQuery({
    queryKey: ['/api/vendors/recently-discovered'],
    queryFn: async () => {
      const response = await fetch('/api/vendors/recently-discovered?limit=30');
      if (!response.ok) throw new Error('Failed to fetch recent services');
      return response.json();
    }
  });

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [recentServices]);

  // Set SEO metadata for marketplace page
  useSEO({
    title: 'Services Directory - Trusted Senior Living Services & Products',
    description: 'Browse 1,500+ verified vendors offering senior living services: pharmacy, medical supplies, home care, moving services, and more. Trusted partners serving families nationwide.',
    keywords: 'senior services, senior vendors, pharmacy services, medical supplies, home care, senior products, elder care services, senior living marketplace',
    canonicalUrl: 'https://www.myseniorvalet.com/senior-marketplace'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-xl hidden sm:block">MySeniorValet</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/map-search">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
              <Link href="/saved">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300">
                  <Heart className="w-4 h-4 mr-2" />
                  Saved
                </Button>
              </Link>
              <Button variant="default" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Services
              </Button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              
              {/* Mobile Menu Button */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Home className="w-4 h-4 mr-2" />
                        Home
                      </Button>
                    </Link>
                    <Link href="/map-search" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Search className="w-4 h-4 mr-2" />
                        Search Communities
                      </Button>
                    </Link>
                    <Link href="/saved" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Heart className="w-4 h-4 mr-2" />
                        Saved Communities
                      </Button>
                    </Link>
                    <Link href="/senior-marketplace" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="default" className="w-full justify-start bg-gradient-to-r from-purple-600 to-indigo-600">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Services Directory
                      </Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </header>
      
      {/* Hero Section with Recently Discovered Services Carousel */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 mb-8"
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
              Services Directory
            </h1>
            <p className="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto">
              Connect with 1,500+ trusted vendors offering essential services for senior living
            </p>

            {/* Status Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 text-base font-bold flex items-center gap-3 shadow-lg">
                <div className="relative">
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping"></div>
                  <div className="relative w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span>PLATFORM ONLINE</span>
              </Badge>
              
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 text-base font-bold flex items-center gap-2 shadow-lg">
                <ShieldCheck className="w-5 h-5" />
                <span>1,500+ VENDORS</span>
              </Badge>
              
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 text-base font-bold flex items-center gap-2 shadow-lg">
                <Star className="w-5 h-5" />
                <span>TRUSTED PARTNERS</span>
              </Badge>
            </motion.div>
          </motion.div>

          {/* Recently Discovered Services Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
                <h2 className="text-2xl font-bold text-white">Recently Discovered Services</h2>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-sm">
                  🔥 HOT
                </Badge>
              </div>
            </div>

            {/* Carousel Container */}
            <div className="relative group">
              {/* Left Scroll Button */}
              {canScrollLeft && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-700"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              )}

              {/* Services Carousel */}
              <div 
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                onScroll={checkScrollPosition}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-80">
                      <div className="bg-white/10 rounded-lg p-4 animate-pulse">
                        <div className="h-24 bg-white/20 rounded mb-4"></div>
                        <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  recentServices?.map((vendor: any) => (
                    <div key={vendor.id} className="flex-shrink-0 w-80">
                      <VendorServiceCard 
                        vendor={vendor} 
                        variant="grid"
                        onSelect={() => {
                          // Navigate to vendor details or open modal
                          console.log('Selected vendor:', vendor.id);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Right Scroll Button */}
              {canScrollRight && (
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-700"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Partner CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <Link href="/vendor-partner">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
                <Briefcase className="w-5 h-5 mr-2" />
                Become a Vendor Partner
              </Button>
            </Link>
            
            <Link href="/vendor-login">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
                <LogIn className="w-5 h-5 mr-2" />
                Vendor Login Portal
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              Browse Vendors by Category
            </h2>
            <VendorMarketplaceTabs />
          </motion.div>
        </div>
      </section>

      {/* Join Vendor Marketplace Section - Condensed Version */}
      <section className="py-12 px-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Compact Header with Badge */}
            <div className="mb-6">
              <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2 text-sm font-bold mb-3">
                3 TIERS AVAILABLE
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                <Briefcase className="inline w-8 h-8 mr-2 text-purple-600" />
                Services Directory
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Join 1,500+ vendors reaching families nationwide • Nationwide coverage • Analytics & leads
              </p>
            </div>
            
            {/* Compact Promotional Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg px-4 py-3 mb-6 max-w-2xl mx-auto inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">50% OFF First Month • 20% OFF Annual Plans</span>
            </div>
            
            {/* Simplified Tier Cards - Horizontal Layout */}
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
              {/* Basic */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">$99/mo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Basic (1 State)</p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ✓ State coverage<br/>
                  ✓ Lead generation
                </div>
              </div>
              
              {/* Featured */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-500 relative">
                <Badge className="absolute -top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5">POPULAR</Badge>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">$249/mo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Featured (3 States)</p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ✓ Multi-state<br/>
                  ✓ Priority placement<br/>
                  ✓ Analytics
                </div>
              </div>
              
              {/* National */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-300 dark:border-purple-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">$499/mo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">National Partner</p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ✓ Nationwide<br/>
                  ✓ Dedicated page<br/>
                  ✓ AI insights
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/vendor-marketplace-tiers">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold">
                  <Star className="w-4 h-4 mr-2" />
                  View All Tiers
                </Button>
              </Link>
              <Link href="/vendor-signup">
                <Button variant="outline" className="border border-gray-400 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Provider Information & Removal Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-900">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      Service Provider Information
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      MySeniorValet aggregates publicly available information about senior services to help families make informed decisions. 
                      We respect the rights of all service providers and vendors listed on our platform.
                    </p>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Important Notice</h3>
                      </div>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                          <span>All information displayed is sourced from public directories and official websites</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                          <span>Service providers maintain full control over removal requests</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                          <span>We comply with all applicable data protection regulations</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        If you are an authorized representative and wish to remove your service from our directory, 
                        please use the removal request option available below.
                      </p>
                      
                      <Link href="/removal-request">
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                          <FileText className="w-4 h-4 mr-2" />
                          Go to Removal Request Form
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}