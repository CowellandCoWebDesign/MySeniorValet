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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compact Stats Bar */}
        <div className="mb-6 py-3 px-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-400" />
              <span className="font-bold text-white">{(formattedStats as any)?.totalCommunities || '34,171'}</span>
              <span className="text-gray-400">Communities</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-400" />
              <span className="font-bold text-white">{(formattedStats as any)?.coverage || '100% US + Canada'}</span>
              <span className="text-gray-400">Coverage</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <span className="font-bold text-white">{(formattedStats as any)?.dataQuality || '99.8%'}</span>
              <span className="text-gray-400">Verified</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6">
          {/* Logo & Social */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="text-white h-4 w-4" />
              </div>
              <div>
                <span className="text-lg font-bold">MySeniorValet</span>
                <p className="text-xs text-gray-400">Your Personal Senior Living Concierge</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              The trusted platform for authentic senior living community information.
            </p>
            <div className="flex space-x-2">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* For Families & Communities */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">For Families</h3>
            <ul className="space-y-2 text-xs text-gray-300 mb-4">
              <li><Link href="/map-search" className="hover:text-blue-400 transition-colors">Search Communities</Link></li>
              <li><Link href="/map-search" className="hover:text-blue-400 transition-colors">Explore All</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">How it Works</Link></li>
              <li><Link href="/care-guide" className="hover:text-blue-400 transition-colors">Care Guide</Link></li>
            </ul>
            
            <h3 className="text-sm font-semibold mb-3 text-white mt-6">For Communities</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link href="/community-portal" className="hover:text-blue-400 transition-colors">Claim Profile</Link></li>
              <li><Link href="/community-portal" className="hover:text-blue-400 transition-colors">Community Portal</Link></li>
              <li><Link href="/mission" className="hover:text-blue-400 transition-colors">Transparency Benefits</Link></li>
              <li><Link href="/ai-support" className="hover:text-blue-400 transition-colors">Support Center</Link></li>
            </ul>
          </div>
          
          {/* For Vendors */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">For Vendors</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link href="/vendor-marketplace" className="hover:text-blue-400 transition-colors">Marketplace</Link></li>
              <li><Link href="/vendor-marketplace-tiers" className="hover:text-blue-400 transition-colors">Pricing & Tiers</Link></li>
              <li><Link href="/vendor-dashboard" className="hover:text-blue-400 transition-colors">Vendor Dashboard</Link></li>
              <li><Link href="/vendor-signup" className="hover:text-blue-400 transition-colors">Become a Vendor</Link></li>
            </ul>
          </div>
          
          {/* Legal & Compliance */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">Legal & Compliance</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-blue-400 transition-colors">Disclaimer</Link></li>
              <li><Link href="/accessibility" className="hover:text-blue-400 transition-colors">Accessibility</Link></li>
              <li><Link href="/veterans" className="hover:text-blue-400 transition-colors">Veterans Housing</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Compact Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright and info - left side */}
            <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 text-xs">
              <p className="text-gray-300">© 2025 MySeniorValet. All rights reserved.</p>
              <span className="hidden md:inline text-gray-600">•</span>
              <p className="text-gray-500">Data from verified state agencies</p>
              <span className="hidden md:inline text-gray-600">•</span>
              <p className="text-gray-500">v2.1</p>
            </div>
            
            {/* Quick links and dashboard access - right side */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy</Link>
              <span className="text-gray-600">•</span>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-blue-400 transition-colors">Terms</Link>
              <span className="text-gray-600">•</span>
              <Link href="/accessibility" className="text-gray-400 hover:text-blue-400 transition-colors">Accessibility</Link>
              
              {/* Dashboard Access - Compact */}
              <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-600">
                <Link href="/super-admin" className="text-gray-400 hover:text-blue-400 transition-colors" title="Admin Dashboard">
                  <Settings className="h-3.5 w-3.5" />
                </Link>
                <Link href="/community-portal" className="text-green-400 hover:text-green-300 transition-colors" title="Community Dashboard">
                  <User className="h-3.5 w-3.5" />
                </Link>
                <Link href="/vendor-dashboard" className="text-purple-400 hover:text-purple-300 transition-colors" title="Vendor Dashboard">
                  <Store className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
