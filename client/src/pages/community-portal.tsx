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
  Settings
} from "lucide-react";
import { Link } from "wouter";

export default function CommunityPortal() {
  const [currentStep, setCurrentStep] = useState('search');
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

  const plans = [
    {
      id: 'basic',
      name: 'Basic Profile',
      price: 'Free',
      features: [
        'Update basic community information',
        'Upload up to 10 photos',
        'Respond to reviews',
        'Update contact information',
        'Basic analytics'
      ],
      limitations: [
        'No pricing updates',
        'Limited photo uploads',
        'No priority support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional Profile',
      price: '$49/month',
      features: [
        'All Basic features',
        'Update pricing and availability',
        'Upload unlimited photos',
        'Unit type management',
        'Advanced analytics',
        'Priority support',
        'Custom amenities list'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Profile',
      price: '$99/month',
      features: [
        'All Professional features',
        'Featured community placement',
        'Advanced SEO optimization',
        'Custom virtual tours',
        'Lead management tools',
        'API access',
        'Dedicated account manager'
      ]
    }
  ];

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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Choose Your Management Plan</h2>
        <p className="text-gray-600">Select the plan that best fits your community's needs</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-2 border-blue-500' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-blue-600">{plan.price}</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => {
                  setSelectedPlan(plan.id);
                  setCurrentStep('dashboard');
                }}
              >
                Select {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
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
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                <Calendar className="w-6 h-6 mb-2" />
                <span>Availability</span>
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <Building className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Portal</h1>
            <p className="text-xl text-blue-100">
              Claim and manage your senior living community profile
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Progress Steps */}
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

        {/* Dynamic Content */}
        {currentStep === 'search' && renderSearchStep()}
        {currentStep === 'claim' && renderClaimStep()}
        {currentStep === 'verification' && renderVerificationStep()}
        {currentStep === 'plans' && renderPlanSelection()}
        {currentStep === 'dashboard' && renderDashboard()}

        {/* Support Section */}
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
      </div>
    </div>
  );
}