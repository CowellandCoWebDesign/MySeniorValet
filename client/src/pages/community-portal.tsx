import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Shield, 
  Star, 
  Users, 
  Camera, 
  Calendar,
  Edit,
  CheckCircle,
  AlertTriangle,
  Lock,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Upload,
  Eye,
  Settings,
  X,
  FileSignature,
  Home
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function CommunityPortal() {
  const [currentStep, setCurrentStep] = useState('landing');
  const [claimForm, setClaimForm] = useState({
    communityName: '',
    contactName: '',
    title: '',
    email: '',
    phone: '',
    workEmail: '',
    employeeId: '',
    verificationDocs: []
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showPricing, setShowPricing] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Listing',
      price: 'Free',
      priceValue: 0,
      tier: 'Basic',
      color: 'gray',
      description: 'All licensed communities (default listing scraped by MSV)',
      features: [
        'Profile Ownership & Claim',
        'Basic contact information display',
        'Single auto-generated photo',
        'Basic amenity tags',
        'Lowest search visibility',
        'No reporting dashboard'
      ],
      limitations: [
        'No editable contact info',
        'No Google/Yelp reviews integration',
        'Limited photo gallery (1 photo max)',
        'No video uploads',
        'No direct messaging'
      ]
    },
    {
      id: 'verified',
      name: 'Verified Standard',
      price: '$149/month',
      priceValue: 149,
      tier: 'Verified Standard',
      color: 'blue',
      description: 'Budget-conscious operators wanting verified info + basic upgrades',
      features: [
        'All Basic features',
        'Editable contact info & description',
        'Google Reviews integration',
        'Photo gallery (5 photos max)',
        'Standard amenity tags',
        'Blue "Verified" badge',
        'Monthly reporting dashboard',
        'AI-generated lease template',
        'eSignature integration (DocuSign)',
        'Move-in intake form automation',
        'Help documentation'
      ],
      popular: false
    },
    {
      id: 'enhanced',
      name: 'Enhanced Showcase',
      price: '$249/month',
      priceValue: 249,
      tier: 'Enhanced Showcase',
      color: 'purple',
      description: 'Operators focused on lead generation, photo gallery, reviews, and leasing tools',
      features: [
        'All Verified Standard features',
        'Yelp Reviews integration',
        'Photo gallery (20 photos max)',
        'Video upload (1 video)',
        'Virtual tour embed',
        'Full amenity tags',
        'High search appearance',
        'Feature tags in search',
        'AI-driven lead match priority',
        'Direct family messaging (secure)',
        'Rent collection tools (Stripe/ACH)',
        'Deposit & fee tracking',
        'Secure family document uploads',
        'Resident onboarding workflow',
        'Co-signer/family collaboration tools',
        'Lease expiration reminders',
        'Recurring charges management',
        'Internal notes/admin memo tool',
        'Affiliate program eligibility',
        'Assisted onboarding'
      ],
      popular: true
    },
    {
      id: 'platinum',
      name: 'Platinum Spotlight',
      price: '$399/month',
      priceValue: 399,
      tier: 'Platinum Spotlight',
      color: 'gold',
      description: 'Flagship communities needing premium exposure, full automation, and white-glove onboarding',
      features: [
        'All Enhanced Showcase features',
        'Unlimited photo gallery',
        'Video uploads (up to 3 videos)',
        'Custom feature tags',
        'Premium gold border in search',
        'Top search priority (rotating spotlight)',
        'Animation on hover',
        'Branded banner',
        'Featured in "Best of" sections',
        'Full reporting + competitive insights',
        'Concierge placement leads',
        'Custom branded lease packets',
        'Move-out checklist automation',
        'Multi-resident/multi-unit support',
        'Fully managed onboarding',
        'White-glove support',
        'Affiliate program with premium benefits'
      ]
    }
  ];

  // Add-on options for all tiers
  const addOns = [
    {
      id: 'additional-videos',
      name: 'Additional Videos',
      price: '$25/video',
      description: 'Beyond tier maximum video limit',
      available: ['verified', 'enhanced', 'platinum']
    },
    {
      id: 'branded-lease',
      name: 'Branded Lease Packet',
      price: '$99 one-time',
      description: 'Custom branded lease documents',
      available: ['enhanced']
    },
    {
      id: 'concierge-setup',
      name: 'Concierge Lease Setup',
      price: '$299 one-time',
      description: 'White-glove onboarding and lease customization',
      available: ['verified', 'enhanced', 'platinum']
    },
    {
      id: 'zip-lock',
      name: 'Zip Code Lock (Ad Suppression)',
      price: '$100/month',
      description: 'Locks out competitor Spotlight ads in local area',
      available: ['enhanced', 'platinum']
    },
    {
      id: 'waitlist-tool',
      name: 'Automated Waitlist Tool',
      price: '$49/month',
      description: 'Manage overflow leads efficiently',
      available: ['verified', 'enhanced', 'platinum']
    }
  ];

  // Tier benefits summary
  const tierBenefits = {
    basic: {
      visibility: 'Lowest',
      searchTreatment: 'Gray border, minimal data',
      photoLimit: 1,
      videoLimit: 0,
      messaging: false,
      analytics: false,
      tools: ['Basic profile claim']
    },
    verified: {
      visibility: 'Standard',
      searchTreatment: 'Blue "Verified" badge, logo shown',
      photoLimit: 5,
      videoLimit: 0,
      messaging: false,
      analytics: 'Monthly reporting',
      tools: ['Lease templates', 'eSignature', 'Intake forms']
    },
    enhanced: {
      visibility: 'High',
      searchTreatment: 'Feature tag, media-rich card, higher priority',
      photoLimit: 20,
      videoLimit: 1,
      messaging: true,
      analytics: 'Full reporting',
      tools: ['All verified tools', 'Payment processing', 'Family collaboration', 'Lead management']
    },
    platinum: {
      visibility: 'Top Priority',
      searchTreatment: 'Premium gold border, animation, top carousel slot',
      photoLimit: 'Unlimited',
      videoLimit: 3,
      messaging: true,
      analytics: 'Full + competitive insights',
      tools: ['All enhanced tools', 'Custom branding', 'Multi-unit support', 'White-glove service']
    }
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically submit to your backend
    console.log('Claim submitted:', claimForm);
    setCurrentStep('verification');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentStep('dashboard');
  };

  const renderLandingPage = () => (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MySeniorValet Community Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your community visibility, connect with families, and drive move-ins with our comprehensive platform
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg"
            onClick={() => setCurrentStep('search')}
          >
            <Building className="w-5 h-5 mr-2" />
            Claim Your Community
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 py-6 text-lg"
            onClick={() => setShowPricing(true)}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            View Pricing
          </Button>
        </div>
      </div>
      
      {/* Value Proposition */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="text-center p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Increase Visibility</h3>
          <p className="text-gray-600">Stand out among 25,000+ communities with enhanced search placement and premium features</p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Connect with Families</h3>
          <p className="text-gray-600">Direct messaging, tour scheduling, and family collaboration tools to convert leads</p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Streamline Operations</h3>
          <p className="text-gray-600">Automated leasing tools, payment processing, and comprehensive reporting dashboard</p>
        </Card>
      </div>
      
      {/* Success Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-center mb-8">Join Thousands of Successful Communities</h3>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">25,000+</div>
            <div className="text-gray-600">Communities Listed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">85%</div>
            <div className="text-gray-600">Lead Conversion Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">3.5x</div>
            <div className="text-gray-600">More Tour Bookings</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-600">24/7</div>
            <div className="text-gray-600">Family Engagement</div>
          </div>
        </div>
      </div>
      
      {/* Quick Pricing Preview */}
      <div className="text-center space-y-6">
        <h3 className="text-2xl font-bold">Simple, Transparent Pricing</h3>
        <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={plan.id} className={`text-center p-4 ${index === 2 ? 'border-purple-500 shadow-lg' : ''}`}>
              <h4 className="font-semibold text-lg">{plan.name}</h4>
              <div className="text-2xl font-bold text-blue-600 my-2">{plan.price}</div>
              <p className="text-sm text-gray-600">{plan.description}</p>
              {index === 2 && (
                <Badge className="mt-2 bg-purple-500">Most Popular</Badge>
              )}
            </Card>
          ))}
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowPricing(true)}
          className="px-8 py-3"
        >
          See All Features & Pricing
        </Button>
      </div>
    </div>
  );

  const renderSearchStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Find Your Community</h2>
        <p className="text-gray-600">Search for your senior living community to claim and manage your profile</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <Input
          placeholder="Enter community name or address..."
          className="text-lg py-3"
        />
        <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Search Communities
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">Already have an account?</p>
        <Button variant="outline" onClick={handleLogin}>
          Login to Portal
        </Button>
      </div>
    </div>
  );

  const renderClaimStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Claim Your Community</h2>
        <p className="text-gray-600">Verify your employment to gain access to your community profile</p>
      </div>
      
      <form onSubmit={handleClaimSubmit} className="max-w-2xl mx-auto space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Community Name</label>
            <Input
              value={claimForm.communityName}
              onChange={(e) => setClaimForm({...claimForm, communityName: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <Input
              value={claimForm.contactName}
              onChange={(e) => setClaimForm({...claimForm, contactName: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <Input
              value={claimForm.title}
              onChange={(e) => setClaimForm({...claimForm, title: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Work Email</label>
            <Input
              type="email"
              value={claimForm.workEmail}
              onChange={(e) => setClaimForm({...claimForm, workEmail: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Personal Email</label>
            <Input
              type="email"
              value={claimForm.email}
              onChange={(e) => setClaimForm({...claimForm, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <Input
              type="tel"
              value={claimForm.phone}
              onChange={(e) => setClaimForm({...claimForm, phone: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Employee ID (if applicable)</label>
          <Input
            value={claimForm.employeeId}
            onChange={(e) => setClaimForm({...claimForm, employeeId: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Verification Documents</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">Upload employment verification (business card, ID badge, etc.)</p>
            <Button variant="outline" className="mt-2">
              Choose Files
            </Button>
          </div>
        </div>
        
        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Submit Claim Request
        </Button>
      </form>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Claim Submitted Successfully</h2>
        <p className="text-gray-600">We're reviewing your claim and will contact you within 24-48 hours</p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Verification Process</p>
                <p className="text-sm text-gray-600">We'll verify your employment and authority to manage this community</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Approval Notification</p>
                <p className="text-sm text-gray-600">Once approved, you'll receive login credentials and setup instructions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Choose Your Plan</p>
                <p className="text-sm text-gray-600">Select the management plan that best fits your needs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlanSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">MySeniorValet Community Tier System</h2>
        <p className="text-gray-600 mb-2">Transform your community visibility, connect with families, and drive move-ins</p>
        <p className="text-sm text-gray-500 mb-6">Choose the tier that maximizes your community's potential</p>
        
        {/* Annual Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className="text-sm text-gray-600">Monthly</span>
          <button className="relative bg-gray-200 rounded-full p-1 w-12 h-6">
            <div className="bg-white rounded-full w-4 h-4 transition-transform transform translate-x-0"></div>
          </button>
          <span className="text-sm text-gray-600">Annual <span className="text-green-600 font-medium">(Save 15%)</span></span>
        </div>
      </div>
      
      {/* Tier Comparison Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const tierColor = plan.color === 'gray' ? 'border-gray-200' : 
                          plan.color === 'blue' ? 'border-blue-200' : 
                          plan.color === 'purple' ? 'border-purple-200' : 
                          'border-yellow-200';
          
          const tierBg = plan.color === 'gray' ? 'bg-gray-50' : 
                        plan.color === 'blue' ? 'bg-blue-50' : 
                        plan.color === 'purple' ? 'bg-purple-50' : 
                        'bg-yellow-50';
          
          const tierTextColor = plan.color === 'gray' ? 'text-gray-700' : 
                                plan.color === 'blue' ? 'text-blue-700' : 
                                plan.color === 'purple' ? 'text-purple-700' : 
                                'text-yellow-700';
          
          return (
            <Card key={plan.id} className={`relative ${tierColor} ${plan.popular ? 'border-purple-500 shadow-lg scale-105' : ''} transition-all duration-300 hover:shadow-xl`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-3 py-1">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className={`text-center ${tierBg} rounded-t-lg`}>
                <div className="flex items-center justify-center mb-2">
                  <Building className={`w-6 h-6 ${tierTextColor} mr-2`} />
                  <CardTitle className={`text-xl ${tierTextColor}`}>{plan.name}</CardTitle>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{plan.price}</div>
                <p className="text-sm text-gray-600 px-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-3 mb-6">
                  {/* Key highlights */}
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Key Benefits</div>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 8).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.features.length > 8 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{plan.features.length - 8} more features
                    </div>
                  )}
                </div>
                
                <Button 
                  className={`w-full mb-3 ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setCurrentStep('dashboard');
                  }}
                >
                  {plan.priceValue === 0 ? 'Start Free' : `Start ${plan.name}`}
                </Button>
                
                {plan.popular && (
                  <div className="text-xs text-center text-gray-500">
                    ⭐ Most communities choose this tier
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Feature Comparison Table */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-center mb-8">Complete Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-4 text-left font-medium">Feature</th>
                <th className="border p-4 text-center font-medium">Basic</th>
                <th className="border p-4 text-center font-medium">Verified</th>
                <th className="border p-4 text-center font-medium">Enhanced</th>
                <th className="border p-4 text-center font-medium">Platinum</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: 'Profile Ownership & Claim',
                  basic: '✅', verified: '✅', enhanced: '✅', platinum: '✅'
                },
                {
                  feature: 'Editable Contact Info',
                  basic: '❌', verified: '✅', enhanced: '✅', platinum: '✅'
                },
                {
                  feature: 'Google Reviews Integration',
                  basic: '❌', verified: '✅', enhanced: '✅', platinum: '✅'
                },
                {
                  feature: 'Photo Gallery',
                  basic: '1 photo', verified: '5 photos', enhanced: '20 photos', platinum: 'Unlimited'
                },
                {
                  feature: 'Video Uploads',
                  basic: '❌', verified: '❌', enhanced: '1 video', platinum: '3 videos'
                },
                {
                  feature: 'Search Appearance',
                  basic: 'Lowest', verified: 'Standard', enhanced: 'High', platinum: 'Top Priority'
                },
                {
                  feature: 'Direct Family Messaging',
                  basic: '❌', verified: '❌', enhanced: '✅', platinum: '✅'
                },
                {
                  feature: 'Reporting Dashboard',
                  basic: '❌', verified: 'Basic', enhanced: 'Advanced', platinum: 'Full + Insights'
                },
                {
                  feature: 'Leasing Tools',
                  basic: '❌', verified: 'Basic', enhanced: 'Full Suite', platinum: 'Full + Automation'
                },
                {
                  feature: 'Onboarding Support',
                  basic: '❌', verified: 'Help Docs', enhanced: 'Assisted', platinum: 'Fully Managed'
                }
              ].map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-4 font-medium">{row.feature}</td>
                  <td className="border p-4 text-center">{row.basic}</td>
                  <td className="border p-4 text-center">{row.verified}</td>
                  <td className="border p-4 text-center">{row.enhanced}</td>
                  <td className="border p-4 text-center">{row.platinum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add-on Options */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-center mb-8">Add-On Options</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addOns.map((addon) => (
            <Card key={addon.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  {addon.name}
                </CardTitle>
                <div className="text-2xl font-bold text-green-600">{addon.price}</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{addon.description}</p>
                <div className="flex flex-wrap gap-1">
                  {addon.available.map((tier) => (
                    <Badge key={tier} variant="outline" className="text-xs">
                      {tier}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Strategic Goals */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-center mb-8">Strategic Goals by Tier</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { tier: 'Basic', goal: 'Establish searchable presence, low-friction intro to platform' },
            { tier: 'Verified', goal: 'Claim and clean up profile, use essential tools, verify trust' },
            { tier: 'Enhanced', goal: 'Actively drive move-ins, manage leasing documents, boost leads' },
            { tier: 'Platinum', goal: 'Maximize search visibility, unlock full automation + MSV concierge help' }
          ].map((item, index) => (
            <div key={index} className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{item.tier} Tier</h4>
                <p className="text-sm text-gray-600">{item.goal}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Community Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Professional Plan</Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold">2,347</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold">58</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Tours Booked</p>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                <Edit className="w-6 h-6 mb-2" />
                <span>Update Info</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                <Camera className="w-6 h-6 mb-2" />
                <span>Manage Photos</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                <Building className="w-6 h-6 mb-2" />
                <span>Unit Types</span>
              </Button>
              <Button 
                className="h-auto p-4 flex flex-col items-center bg-blue-600 hover:bg-blue-700 text-white"
                disabled
              >
                <FileSignature className="w-6 h-6 mb-2" />
                <span>Leasing</span>
                <Badge className="mt-1 text-xs">Coming Soon</Badge>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                <Calendar className="w-6 h-6 mb-2" />
                <span>Availability</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center"
                onClick={() => window.location.href = '/tenant-portal'}
              >
                <Home className="w-6 h-6 mb-2" />
                <span>Tenant Portal</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm">New inquiry from Sarah Johnson</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div>
                  <p className="text-sm">Photo gallery updated</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <div>
                  <p className="text-sm">Tour scheduled for Friday</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <Building className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MySeniorValet
                </span>
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-medium">Community Portal</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentStep !== 'landing' && (
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentStep('landing')}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Portal Home
                </Button>
              )}
              
              {!showPricing && (
                <Button 
                  variant="ghost" 
                  onClick={() => setShowPricing(true)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pricing
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleLogin}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Shield className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Show Pricing Modal/Overlay */}
        {showPricing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Community Portal Pricing</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowPricing(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                {renderPlanSelection()}
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps - only show for claim process */}
        {currentStep !== 'landing' && !showPricing && (
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className={`flex items-center space-x-2 ${currentStep === 'search' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
                <span>Search</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className={`flex items-center space-x-2 ${currentStep === 'claim' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'claim' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
                <span>Claim</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className={`flex items-center space-x-2 ${currentStep === 'verification' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'verification' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
                <span>Verify</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className={`flex items-center space-x-2 ${currentStep === 'plans' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'plans' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>4</div>
                <span>Plans</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content */}
        {currentStep === 'landing' && renderLandingPage()}
        {currentStep === 'search' && renderSearchStep()}
        {currentStep === 'claim' && renderClaimStep()}
        {currentStep === 'verification' && renderVerificationStep()}
        {currentStep === 'plans' && renderPlanSelection()}
        {currentStep === 'dashboard' && renderDashboard()}

        {/* Support Section */}
        {currentStep === 'landing' && (
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Need Help?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Community Support</h4>
                  <p className="text-sm text-gray-600 mb-2">Get help with claiming or managing your community profile</p>
                  <div className="space-y-1">
                    <p className="text-sm">📧 communities@myseniorvalet.com</p>
                    <p className="text-sm">📞 (555) 123-4567</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Technical Support</h4>
                  <p className="text-sm text-gray-600 mb-2">Having trouble with the portal? We're here to help</p>
                  <Link href="/help">
                    <Button variant="outline" size="sm">
                      Visit Help Center
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}