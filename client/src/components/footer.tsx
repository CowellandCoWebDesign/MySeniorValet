import { Link } from "wouter";
import { Home, Facebook, Twitter, Linkedin, MapPin, Building, Shield, Settings, User, Store } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function Footer() {
  const { data: formattedStats, isLoading } = useQuery({
    queryKey: ["/api/platform/stats/formatted"],
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    staleTime: 15 * 60 * 1000, // Consider data stale after 15 minutes
  });

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Real-time Platform Stats */}
        <div className="mb-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Platform Coverage
            </h3>
            <p className="text-gray-400 text-sm">Real-time statistics across North America</p>
          </div>
          
          {!isLoading && formattedStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Building className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{(formattedStats as any)?.totalCommunities || '34,171'}</div>
                  <div className="text-xs text-gray-400">Communities</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-lg font-bold text-white">{(formattedStats as any)?.coverage || '100% US + Canada'}</div>
                  <div className="text-xs text-gray-400">Geographic Coverage</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-lg font-bold text-white">{(formattedStats as any)?.dataQuality || '99.8% Verified'}</div>
                  <div className="text-xs text-gray-400">Data Quality</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl font-bold text-white">25,782+ Communities</div>
              <div className="text-sm text-gray-400">Complete North America Coverage</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="text-white h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-display font-bold">MySeniorValet</span>
                <p className="text-sm text-blue-400 font-medium">Your Personal Senior Living Concierge</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The trusted platform for authentic senior living community information. Helping families make informed decisions with verified data and transparent pricing.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">For Families</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/map-search" className="hover:text-blue-400 transition-colors font-medium">Search Communities</Link></li>
              <li><Link href="/map-search" className="hover:text-blue-400 transition-colors font-medium">Explore All Communities</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition-colors font-medium">How it Works</Link></li>
              <li><Link href="/care-guide" className="hover:text-blue-400 transition-colors font-medium">Care Type Guide</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">For Communities</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/community-portal" className="hover:text-blue-400 transition-colors font-medium">Claim Your Profile</Link></li>
              <li><Link href="/community-portal" className="hover:text-blue-400 transition-colors font-medium">Community Portal</Link></li>
              <li><Link href="/mission" className="hover:text-blue-400 transition-colors font-medium">Transparency Benefits</Link></li>
              <li><Link href="/ai-support" className="hover:text-blue-400 transition-colors font-medium">Support Center</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">For Vendors</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/vendor-marketplace" className="hover:text-blue-400 transition-colors font-medium">Marketplace</Link></li>
              <li><Link href="/vendor-marketplace-tiers" className="hover:text-blue-400 transition-colors font-medium">Pricing & Tiers</Link></li>
              <li><Link href="/vendor-dashboard" className="hover:text-blue-400 transition-colors font-medium">Vendor Dashboard</Link></li>
              <li><Link href="/vendor-signup" className="hover:text-blue-400 transition-colors font-medium">Become a Vendor</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Legal & Compliance</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/privacy-policy" className="hover:text-blue-400 transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-blue-400 transition-colors font-medium">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-blue-400 transition-colors font-medium">Cookie Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-blue-400 transition-colors font-medium">Disclaimer</Link></li>
              <li><Link href="/accessibility" className="hover:text-blue-400 transition-colors font-medium">Accessibility</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-sm font-medium">
                © 2025 MySeniorValet. All rights reserved.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Data sourced from authentic, verified state licensing agencies and Google Places.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Version 2.1
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <Link href="/veterans" className="text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">Veterans Housing</Link>
              <Link href="/privacy-policy" className="text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">Privacy</Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">Terms</Link>
              <Link href="/cookie-policy" className="text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">Cookies</Link>
              <Link href="/disclaimer" className="text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">Disclaimer</Link>
              <Link href="/accessibility" className="text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">Accessibility</Link>
              
              {/* Dashboard Login Buttons */}
              <div className="flex items-center space-x-4 border-l border-gray-600 pl-6">
                <Link href="/super-admin" className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
                <Link href="/community-portal" className="flex items-center space-x-1 text-green-400 hover:text-green-300 text-sm transition-all font-semibold border border-green-600/50 px-3 py-1 rounded-md hover:bg-green-600/10">
                  <User className="h-4 w-4" />
                  <span>Community Dashboard</span>
                </Link>
                <Link href="/vendor-dashboard" className="flex items-center space-x-1 text-gray-400 hover:text-purple-400 text-sm transition-colors font-medium">
                  <Store className="h-4 w-4" />
                  <span>Vendor</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
