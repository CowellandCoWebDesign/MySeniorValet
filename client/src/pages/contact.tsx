import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Globe, Phone, Clock, X } from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { useState } from "react";

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

export default function Contact() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; description: string } | null>(null);

  const brandImages = [
    // Brand Style Images
    { src: LuxuryValet, title: 'Luxury Valet', description: 'Elegant concierge service aesthetic representing premium senior care assistance' },
    { src: TechAI, title: 'Tech AI', description: 'Modern AI-powered care technology - the future of senior living search' },
    { src: Watercolor, title: 'Watercolor Art', description: 'Artistic creative interpretation showcasing the human touch in care' },
    { src: Chrome3D, title: '3D Chrome', description: 'Futuristic cosmic design representing infinite possibilities in senior living' },
    { src: ArtDeco, title: 'Art Deco', description: 'Vintage glamour style honoring the golden age of elegance' },
    { src: Minimalist, title: 'Minimalist', description: 'Clean Scandinavian design emphasizing simplicity and clarity' },
    { src: ZenGarden, title: 'Zen Garden', description: 'Peaceful Japanese aesthetic promoting tranquility in senior care' },
    { src: Corporate, title: 'Corporate', description: 'Professional business branding for Fortune 500-level infrastructure' },
    { src: Nature, title: 'Nature', description: 'Organic environmental theme connecting seniors with natural wellness' },
    { src: Cyberpunk, title: 'Cyberpunk', description: 'Neon futuristic vibe showcasing cutting-edge technology' },
    // Feature & Advertising Images
    { src: TransparentPricing, title: 'Transparent Pricing', description: 'No hidden fees - complete pricing transparency for all communities' },
    { src: FamilyCollab, title: 'Family Collaboration', description: 'Bringing families together in senior care decisions with shared research tools' },
    { src: AISearch, title: 'AI-Powered Search', description: 'Intelligent search across 33,000+ senior communities nationwide' },
    { src: TourMate, title: 'TourMate™ Scheduling', description: 'Book tours instantly with our revolutionary one-click scheduling system' },
    { src: VerifiedData, title: 'Verified Data', description: '99.8% accuracy with our Golden Data Rule - only authentic information' },
    { src: InteractiveMap, title: 'Interactive Map', description: 'Complete coverage across North America with real-time availability' },
    { src: StainedGlass, title: 'Spiritual Care', description: 'Timeless elegance in senior care with dignity and respect' },
    { src: EmergencyContact, title: 'Emergency System', description: 'One-touch emergency contact feature for immediate assistance' },
    { src: ComparisonDash, title: 'Compare Communities', description: 'Side-by-side community comparisons for informed decision-making' },
    { src: CrystalPrism, title: 'Crystal Clear', description: 'Transparency and clarity in everything we do - the MySeniorValet promise' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        title="Contact Us" 
        subtitle="Get in touch with MySeniorValet"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact MySeniorValet</h1>
          <p className="text-xl mb-8">
            We're here to help you find the perfect senior living community for your family
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Details */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium">General Inquiries</div>
                      <a href="mailto:hello@myseniorvalet.com" className="text-blue-600 hover:text-blue-700">
                        hello@myseniorvalet.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium">Business & Billing</div>
                      <a href="mailto:billing@myseniorvalet.com" className="text-blue-600 hover:text-blue-700">
                        billing@myseniorvalet.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <div className="font-medium">Business Address</div>
                      <div className="text-gray-600">Contact for business inquiries</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium">Website</div>
                      <a 
                        href="https://cowellandcowebdesign.github.io" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        cowellandcowebdesign.github.io
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <div className="font-medium">Response Time</div>
                      <div className="text-gray-600">Within 24 hours</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Why I Built This</h3>
                  <p className="text-blue-800 text-sm">
                    MySeniorValet exists to put power back in families' hands. I watched too many loved ones struggle 
                    through the overwhelming process of finding senior care, frustrated by hidden costs, fake reviews, 
                    and incomplete information scattered across dozens of websites. This platform brings everything 
                    together—34,000+ communities, healthcare facilities, senior services, and government resources—all 
                    with transparent pricing and authentic information. We never sell your data. We never charge families. 
                    We never hide communities behind paywalls. Because when families have complete information, they make 
                    confident decisions. That's the transparency revolution we're leading in senior living.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      id="subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="community">Community Information</option>
                      <option value="partnership">Partnership Opportunities</option>
                      <option value="feedback">Feedback & Suggestions</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Brand Gallery Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">MySeniorValet Brand Gallery</h2>
          <p className="text-center text-gray-600 mb-8">Explore 20 unique AI-generated interpretations of our brand and features</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brandImages.map((image, index) => (
              <div 
                key={index}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => setSelectedImage(image)}
              >
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                  <div className="aspect-square relative">
                    <img 
                      src={image.src} 
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-semibold text-lg">{image.title}</p>
                        <p className="text-white/80 text-sm mt-1 line-clamp-2">{image.description}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              These images showcase the creative possibilities of MySeniorValet through AI-generated art.
              <br />
              Click any image to view in full size.
            </p>
          </div>
        </div>
      </section>

      {/* Modal for selected image */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <div className="flex-1 flex items-center justify-center">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
            <div className="text-center text-white mt-6 px-4">
              <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-lg text-gray-200 mb-4">{selectedImage.description}</p>
              <p className="text-sm text-gray-400">MySeniorValet - AI-Generated Brand & Feature Visualization</p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">How do I search for communities?</h3>
                <p className="text-gray-600 text-sm">
                  Use our search page to find communities by location, care type, pricing, and amenities. 
                  All search results include transparent pricing and authentic community information.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Are your prices accurate?</h3>
                <p className="text-gray-600 text-sm">
                  We provide intelligent pricing estimates based on authentic market data, government sources, 
                  and state-specific algorithms. Prices are clearly marked as estimates and should be verified with communities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">How can I share communities with family?</h3>
                <p className="text-gray-600 text-sm">
                  Use our family collaboration features to share community details, add personal notes, 
                  and coordinate with family members. Each community page includes easy sharing options.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Do you cover affordable housing options?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! We include HUD Section 202 and 811 affordable housing, HUD-VASH veterans housing, 
                  and other government-subsidized options for seniors and disabled adults.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}