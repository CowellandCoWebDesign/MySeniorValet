import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Package, 
  LogIn,
  Shield,
  Star,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VendorMarketplaceTabs } from '@/components/VendorMarketplaceTabs';

export default function SeniorMarketplace() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Header Section with Gradient */}
      <section className="px-4 py-16 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-indigo-800/90"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Senior Vendor Marketplace
            </h1>
            <p className="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto">
              Trusted vendors for senior living services - from pharmacy to home care
            </p>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="relative">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="relative">
                    <div className="absolute inset-0 w-2 sm:w-3 h-2 sm:h-3 bg-white rounded-full animate-ping"></div>
                    <div className="relative w-2 sm:w-3 h-2 sm:h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <span className="tracking-wide">LIVE ONLINE</span>
                </Badge>
              </div>
              
              <div className="relative">
                <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <span className="relative flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>1,500+ VERIFIED VENDORS</span>
                  </span>
                </Badge>
              </div>
              
              <div className="relative">
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <span className="relative flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>FREE TO START</span>
                  </span>
                </Badge>
              </div>
            </div>

            {/* Partner CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vendor-partner">
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <Package className="w-5 h-5 mr-2" />
                  Become a Vendor Partner
                </Button>
              </Link>
              
              <Link href="/vendor-login">
                <Button variant="outline" className="border-2 border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <LogIn className="w-5 h-5 mr-2" />
                  Vendor Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Vendor Marketplace Tabs */}
          <div className="mb-12 mt-12">
            <VendorMarketplaceTabs />
          </div>
        </div>
      </section>
    </div>
  );
}