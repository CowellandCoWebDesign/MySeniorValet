import { Link } from "wouter";
import { Home, Facebook, Twitter, Linkedin, MapPin, Building, Shield, Settings, User, Store, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import VaporwaveLogo from '@assets/generated_images/Vaporwave_synthwave_style_b2ebe5ea.png';

// MySeniorValet Brand Gallery Images - First Set
import LuxuryValet from '@assets/generated_images/Luxury_valet_silhouette_b48f3fbd.png';
import TechAI from '@assets/generated_images/Tech_AI_logo_121fb756.png';
import Watercolor from '@assets/generated_images/Watercolor_art_style_c8d65f22.png';
import Chrome3D from '@assets/generated_images/3D_chrome_space_c4ebf60f.png';
import ArtDeco from '@assets/generated_images/Art_deco_vintage_a3fbda53.png';
import Minimalist from '@assets/generated_images/Minimalist_Scandinavian_ff548e0c.png';
import ZenGarden from '@assets/generated_images/Zen_garden_style_f7dcf60c.png';
import Corporate from '@assets/generated_images/Corporate_professional_d257ef18.png';
import Nature from '@assets/generated_images/Nature_organic_24298b0b.png';
import Cyberpunk from '@assets/generated_images/Cyberpunk_neon_f9432e52.png';

// MySeniorValet Feature & Advertising Images - Second Set
import TransparentPricing from '@assets/generated_images/Transparent_pricing_feature_36337349.png';
import FamilyCollab from '@assets/generated_images/Family_collaboration_tool_8925b86e.png';
import AISearch from '@assets/generated_images/AI_search_engine_6c0b9a2f.png';
import TourMate from '@assets/generated_images/TourMate_scheduling_dd8d9491.png';
import VerifiedData from '@assets/generated_images/Verified_data_trust_888d702e.png';
import InteractiveMap from '@assets/generated_images/Interactive_map_coverage_c4598da0.png';
import StainedGlass from '@assets/generated_images/Stained_glass_spiritual_f5cf7954.png';
import EmergencyContact from '@assets/generated_images/Emergency_contact_system_db900e8c.png';
import ComparisonDash from '@assets/generated_images/Comparison_dashboard_2d6c7912.png';
import CrystalPrism from '@assets/generated_images/Crystal_prism_clarity_43494b4e.png';

export function Footer() {
  const { data: formattedStats, isLoading } = useQuery({
    queryKey: ["/api/platform/stats/formatted"],
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    staleTime: 15 * 60 * 1000, // Consider data stale after 15 minutes
  });

  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; description: string } | null>(null);

  const brandImages = [
    // Brand Style Images
    { src: LuxuryValet, title: 'Luxury Valet', description: 'Elegant concierge service aesthetic' },
    { src: TechAI, title: 'Tech AI', description: 'Modern AI-powered care technology' },
    { src: Watercolor, title: 'Watercolor Art', description: 'Artistic creative interpretation' },
    { src: Chrome3D, title: '3D Chrome', description: 'Futuristic cosmic design' },
    { src: ArtDeco, title: 'Art Deco', description: 'Vintage glamour style' },
    { src: Minimalist, title: 'Minimalist', description: 'Clean Scandinavian design' },
    { src: ZenGarden, title: 'Zen Garden', description: 'Peaceful Japanese aesthetic' },
    { src: Corporate, title: 'Corporate', description: 'Professional business branding' },
    { src: Nature, title: 'Nature', description: 'Organic environmental theme' },
    { src: Cyberpunk, title: 'Cyberpunk', description: 'Neon futuristic vibe' },
    // Feature & Advertising Images
    { src: TransparentPricing, title: 'Transparent Pricing', description: 'No hidden fees - clear pricing for all' },
    { src: FamilyCollab, title: 'Family Collaboration', description: 'Bringing families together in care decisions' },
    { src: AISearch, title: 'AI-Powered Search', description: 'Intelligent search across 33,000+ communities' },
    { src: TourMate, title: 'TourMate™ Scheduling', description: 'Book tours instantly with one click' },
    { src: VerifiedData, title: 'Verified Data', description: '99.8% accuracy with Golden Data Rule' },
    { src: InteractiveMap, title: 'Interactive Map', description: 'Complete coverage across North America' },
    { src: StainedGlass, title: 'Spiritual Care', description: 'Timeless elegance in senior care' },
    { src: EmergencyContact, title: 'Emergency System', description: 'One-touch emergency contact feature' },
    { src: ComparisonDash, title: 'Compare Communities', description: 'Side-by-side community comparisons' },
    { src: CrystalPrism, title: 'Crystal Clear', description: 'Transparency and clarity in all we do' }
  ];

  return (
    <footer className="relative text-white border-t-2 border-purple-600 overflow-hidden min-h-[600px]" 
      style={{
        background: `linear-gradient(to bottom, rgba(15, 15, 30, 0.85), rgba(30, 10, 40, 0.95)), url(${VaporwaveLogo}) center/contain no-repeat`,
        backgroundColor: '#1a0a2e'
      }}>
      {/* Enhanced vaporwave overlay for better text contrast */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-purple-900/30 to-gray-950/80 dark:from-black/10 dark:via-purple-900/20 dark:to-gray-950/70"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compact Stats Bar with better contrast */}
        <div className="mb-6 py-3 px-4 bg-gray-900/80 dark:bg-gray-900/70 backdrop-blur-sm rounded-lg border border-purple-500/30">
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

        {/* Top Row: Logo/Social + Communities + Families */}
        <div className="flex flex-col md:flex-row justify-between mb-6">
          {/* Logo & Social - Left side */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="text-white h-4 w-4" />
              </div>
              <div>
                <span className="text-lg font-bold">MySeniorValet</span>
                <p className="text-xs text-gray-400">Your Personal Senior Living Concierge</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3 max-w-sm">
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
          
          {/* For Communities + For Families - Right side */}
          <div className="flex gap-8">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">For Communities</h3>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><Link href="/claim-community" className="hover:text-blue-400 transition-colors">Claim Profile</Link></li>
                <li><Link href="/community-portal" className="hover:text-blue-400 transition-colors">Portal</Link></li>
                <li><Link href="/community-benefits" className="hover:text-blue-400 transition-colors">Benefits</Link></li>
                <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">For Families</h3>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><Link href="/map-search" className="hover:text-blue-400 transition-colors">Search Communities</Link></li>
                <li><Link href="/family-collaboration-center" className="hover:text-blue-400 transition-colors">Family Collaboration Center</Link></li>
                <li><Link href="/resident-portal" className="hover:text-blue-400 transition-colors">Resident Portal</Link></li>
                <li><Link href="/tour-tracker" className="hover:text-blue-400 transition-colors">Tour Tracker</Link></li>
                <li><Link href="/tourmate" className="hover:text-blue-400 transition-colors">TourMate</Link></li>
                <li><Link href="/competitive-analysis" className="hover:text-blue-400 transition-colors">Market Analysis</Link></li>
                <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/about" className="hover:text-blue-400 transition-colors">How it Works</Link></li>
                <li><Link href="/care-guide" className="hover:text-blue-400 transition-colors">Care Guide</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Row: Other sections */}
        <div className="flex gap-8 mb-6">
          
          {/* For Vendors */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">For Vendors</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link href="/vendor-marketplace" className="hover:text-blue-400 transition-colors">Marketplace</Link></li>
              <li><Link href="/vendor-marketplace-tiers" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link href="/vendor-dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/vendor-signup" className="hover:text-blue-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">Legal</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-blue-400 transition-colors">Cookies</Link></li>
              <li><Link href="/disclaimer" className="hover:text-blue-400 transition-colors">Disclaimer</Link></li>
              <li><Link href="/accessibility" className="hover:text-blue-400 transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Us & Brand Gallery Section */}
        <div className="mb-6 p-4 bg-gray-900/60 backdrop-blur-sm rounded-lg border border-purple-500/20">
          <h3 className="text-sm font-semibold mb-3 text-white">Contact Us & Brand Gallery - 20 Unique Designs</h3>
          <p className="text-xs text-gray-400 mb-4">
            Explore 20 creative interpretations of MySeniorValet, including brand styles and feature highlights for advertising. 
            Click any image to view details. Contact us at <a href="mailto:hello@myseniorvalet.com" className="text-blue-400 hover:text-blue-300">hello@myseniorvalet.com</a>
          </p>
          
          {/* Image Gallery Grid - Now with 20 images */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-4">
            {brandImages.map((image, index) => (
              <div 
                key={index}
                className="relative group cursor-pointer transform transition-all duration-300 hover:scale-110 hover:z-10"
                onClick={() => setSelectedImage(image)}
              >
                <img 
                  src={image.src} 
                  alt={image.title}
                  className="w-full h-16 object-cover rounded-md border border-purple-500/30 hover:border-purple-400"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                  <div className="absolute bottom-0 left-0 right-0 p-1">
                    <p className="text-[8px] text-white font-semibold truncate">{image.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-3 text-xs">
            <Link href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">Full Contact Form</Link>
            <span className="text-gray-600">•</span>
            <a href="mailto:admin@myseniorvalet.com" className="text-gray-400 hover:text-blue-400 transition-colors">Admin: admin@myseniorvalet.com</a>
            <span className="text-gray-600">•</span>
            <a href="mailto:billing@myseniorvalet.com" className="text-gray-400 hover:text-blue-400 transition-colors">Billing: billing@myseniorvalet.com</a>
          </div>
        </div>

        {/* Modal for selected image */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 z-10 p-2 bg-gray-900/80 rounded-full hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <img 
                src={selectedImage.src} 
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="text-center text-white mt-4">
                <h3 className="text-lg font-bold mb-1">{selectedImage.title}</h3>
                <p className="text-sm text-gray-300">{selectedImage.description}</p>
                <p className="text-xs text-gray-400 mt-2">MySeniorValet - AI-Generated Brand & Feature Visualization</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Compact Bottom Bar */}
        <div className="border-t border-purple-500/30 mt-6 pt-4 bg-gray-950/50 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright and info - left side */}
            <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 text-xs">
              <p className="text-gray-300">© 2025 MySeniorValet. All rights reserved.</p>
              <span className="hidden md:inline text-gray-600">•</span>
              <p className="text-gray-500">Data from AI-assisted web search across all online sources</p>
              <span className="hidden md:inline text-gray-600">•</span>
              <p className="text-gray-500">v3.4</p>
            </div>
            
            {/* Quick links and dashboard access - right side */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs">
              <Link href="/veterans" className="text-gray-400 hover:text-blue-400 transition-colors">Veterans</Link>
              <span className="text-gray-600">•</span>
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
