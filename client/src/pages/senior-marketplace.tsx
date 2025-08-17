import { useState } from 'react';
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
  ShoppingCart,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VendorMarketplaceTabs } from '@/components/VendorMarketplaceTabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/footer';

import { useSEO } from '@/hooks/useSEO';

export default function SeniorMarketplace() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Set SEO metadata for marketplace page
  useSEO({
    title: 'Senior Vendor Marketplace - Trusted Senior Living Services & Products',
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
              <Link href="/search">
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
                Marketplace
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
                    <Link href="/search" onClick={() => setIsMenuOpen(false)}>
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
                        Vendor Marketplace
                      </Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </header>
      
      {/* Hero Section with Modern Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
              Senior Vendor Marketplace
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

            {/* Partner CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
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

      {/* Footer */}
      <Footer />
    </div>
  );
}