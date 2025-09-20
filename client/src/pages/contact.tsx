import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Globe, Phone, Clock, X } from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// MySeniorValet Marketing & Promise Images - Third Set
import FamilyCollabCenter from '@assets/generated_images/Family_collaboration_center_2d7b3c57.png';
import NoSpam from '@assets/generated_images/No_spam_promise_a9f5006c.png';
import HealthcareTransparency from '@assets/generated_images/Healthcare_transparency_8c8499e3.png';
import Lighthouse from '@assets/generated_images/Lighthouse_guidance_24a5518c.png';
import AuthenticReviews from '@assets/generated_images/Authentic_reviews_only_5c21a64c.png';
import GovResources from '@assets/generated_images/Government_resources_hub_c796fe4e.png';
import AlwaysAvailable from '@assets/generated_images/24/7_always_available_f9934bb4.png';
import VendorMarket from '@assets/generated_images/Vendor_marketplace_1bcaf6d8.png';
import DataPrivacy from '@assets/generated_images/Data_privacy_fortress_7678436a.png';
import FreeForFamilies from '@assets/generated_images/Free_for_families_223f28a6.png';

// Senior-Targeted Social Media Advertising Images - Fourth Set
import SeniorCoupleFinding from '@assets/generated_images/Senior_couple_finding_home_a8966462.png';
import ActiveLifestyle from '@assets/generated_images/Active_senior_lifestyle_06b713a9.png';
import StayingConnected from '@assets/generated_images/Senior_staying_connected_b57da68f.png';
import VeteransHousing from '@assets/generated_images/Veterans_housing_support_ec161a50.png';
import LuxuryLiving from '@assets/generated_images/Luxury_senior_living_606b10b5.png';
import CommunityConnection from '@assets/generated_images/Community_connection_social_4e398aeb.png';
import SimpleTech from '@assets/generated_images/Simple_technology_use_626d34ff.png';
import AffordableHousing from '@assets/generated_images/Affordable_housing_options_76e5e402.png';
import JoyfulMoments from '@assets/generated_images/Joyful_senior_moments_ffa83232.png';
import EmpoweredResearch from '@assets/generated_images/Empowered_senior_research_82415146.png';

// Societal Problem-Solving Images - Fifth Set (Based on 2025 Research)
import StopHiddenFees from '@assets/generated_images/Stop_hidden_fees_1a69939b.png';
import EndIsolation from '@assets/generated_images/End_senior_isolation_34c204db.png';
import CaregiverRelief from '@assets/generated_images/Caregiver_burden_relief_e57d31cb.png';
import HousingCrisis from '@assets/generated_images/Housing_waitlist_crisis_4ede02f7.png';
import ExposeFakes from '@assets/generated_images/Expose_fake_reviews_489c337c.png';
import SaveHomes from '@assets/generated_images/Save_family_homes_178759a8.png';
import NoHarassment from '@assets/generated_images/No_sales_harassment_9e83d2b5.png';
import NavigateMaze from '@assets/generated_images/Healthcare_maze_navigation_20660f54.png';
import ForgottenMiddle from '@assets/generated_images/Forgotten_middle_solution_4526d569.png';
import IntegrityFirst from '@assets/generated_images/Integrity_over_corruption_360394d9.png';

export default function Contact() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; description: string } | null>(null);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  // Contact form mutation
  const contactMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest('/api/contact', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "We'll respond within 24 hours.",
      });
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "All fields are required",
        description: "Please fill in all fields before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // Submit form
    contactMutation.mutate(formData);
  };

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
    { src: CrystalPrism, title: 'Crystal Clear', description: 'Transparency and clarity in everything we do - the MySeniorValet promise' },
    // Marketing & Promise Images - NEW SET
    { src: FamilyCollabCenter, title: 'Family Collaboration Center', description: 'Unite families in care decisions with shared research tools and real-time updates' },
    { src: NoSpam, title: 'No Spam Promise', description: 'Your peace protected - we never sell your data or allow endless sales calls' },
    { src: HealthcareTransparency, title: 'Healthcare Transparency', description: 'Finally, clear pricing and honest information in healthcare - no more hidden costs' },
    { src: Lighthouse, title: 'Guiding Light', description: 'Your beacon through the fog of senior care decisions - we light the way forward' },
    { src: AuthenticReviews, title: 'Real Reviews Only', description: 'Authentic testimonials from real families - no fake reviews or paid endorsements' },
    { src: GovResources, title: 'Government Resources Hub', description: 'HUD, Medicare, Medicaid, Veterans benefits - all government programs in one place' },
    { src: AlwaysAvailable, title: '24/7 Platform Access', description: 'Always there when you need us - research communities anytime, day or night' },
    { src: VendorMarket, title: 'Senior Vendor Marketplace', description: 'Researched and discovered senior services and products - from medical equipment to home care' },
    { src: DataPrivacy, title: 'Data Privacy Fortress', description: 'Your data is never sold - HIPAA compliant protection with military-grade security' },
    { src: FreeForFamilies, title: 'Free Forever Promise', description: 'Always free for families - communities pay, families never do' },
    // Senior-Targeted Social Media Advertising
    { src: SeniorCoupleFinding, title: 'Find Your Perfect Home', description: 'Happy seniors discovering their ideal community together - perfect for Instagram/Facebook ads' },
    { src: ActiveLifestyle, title: 'Live Your Best Life', description: 'Stay active and engaged in vibrant senior communities - Facebook advertising ready' },
    { src: StayingConnected, title: 'Stay Connected with Family', description: 'Video calling made easy - Instagram Stories format (9:16 vertical)' },
    { src: VeteransHousing, title: 'Veterans Housing Support', description: 'Serving those who served us - LinkedIn professional advertising format' },
    { src: LuxuryLiving, title: 'Discover Luxury Living', description: 'Elegant senior living at its finest - Instagram square post ready' },
    { src: CommunityConnection, title: 'Your Community Awaits', description: 'Diverse, welcoming communities - Twitter/X header format for social media' },
    { src: SimpleTech, title: 'Technology Made Simple', description: 'Easy as 1-2-3 for seniors - minimalist Instagram ad design' },
    { src: AffordableHousing, title: 'Affordable Housing Solutions', description: 'HUD and subsidized housing options - Facebook carousel ad format' },
    { src: JoyfulMoments, title: 'Find Your Joy', description: 'Celebrate life in senior communities - Pinterest pin format (3:4 vertical)' },
    { src: EmpoweredResearch, title: 'Knowledge is Power', description: 'Empowering seniors with information - YouTube thumbnail format ready' },
    // Societal Problem-Solving Images (Based on 2025 Crisis Research)
    { src: StopHiddenFees, title: 'Stop The $131,583 Hidden Fees', description: 'Nursing homes average $131K/year with hidden fees - MySeniorValet shows everything upfront' },
    { src: EndIsolation, title: 'End The Isolation Epidemic', description: '33% of seniors are lonely with 50% higher dementia risk - we connect families instantly' },
    { src: CaregiverRelief, title: '53 Million Caregivers Need Relief', description: 'Only 23% of caregivers have good mental health - we simplify the overwhelming system' },
    { src: HousingCrisis, title: '520,000 Seniors on Waitlists', description: 'Years-long HUD housing waitlists - MySeniorValet shows all available affordable housing now' },
    { src: ExposeFakes, title: 'Expose The Fake Review Scandal', description: 'Senate investigating referral services for fake reviews - we use only verified authentic data' },
    { src: SaveHomes, title: 'Save Your Family Home', description: 'Families forced to sell homes for care costs - find affordable options before its too late' },
    { src: NoHarassment, title: 'No Sales Harassment Ever', description: 'No commissions, no bias, no endless sales calls - your peace and privacy protected' },
    { src: NavigateMaze, title: 'Navigate The Healthcare Maze', description: '53% of families cant navigate the system - MySeniorValet illuminates the clear path' },
    { src: ForgottenMiddle, title: 'Help for the Forgotten Middle', description: 'Too rich for Medicaid, too poor for private pay - we show ALL available options' },
    { src: IntegrityFirst, title: 'Integrity Over Corruption', description: 'While competitors take commissions from facilities, we stand for truth and transparency' }
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
                
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={contactMutation.isPending}
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={contactMutation.isPending}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      disabled={contactMutation.isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="community">Community Information</SelectItem>
                        <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                        <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                      </SelectContent>
                    </Select>
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
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      disabled={contactMutation.isPending}
                    ></textarea>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? 'Sending...' : 'Send Message'}
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
          <p className="text-center text-gray-600 mb-2">Explore 50 powerful images addressing real societal problems, brand identity, and marketing campaigns</p>
          
          {/* AI Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
            <p className="text-sm text-yellow-800 text-center">
              <strong>Disclaimer:</strong> All images in this gallery are AI-generated artistic interpretations created for illustrative purposes. 
              They do not necessarily represent the views, opinions, or official positions of MySeniorValet. 
              These images are intended to showcase creative possibilities and marketing concepts only.
            </p>
          </div>
          
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
              <strong>Note:</strong> All gallery images are AI-generated and do not represent actual people, places, or events.
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