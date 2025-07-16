import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Search, 
  User, 
  Map, 
  Heart, 
  MessageSquare, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  LogIn,
  UserPlus,
  Star,
  Phone,
  Mail
} from "lucide-react";
import { Link } from "wouter";

export default function Help() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <UserPlus className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Search Without Signing Up</h4>
            <p className="text-gray-700">You can search our 8,000+ communities without creating an account. Just use the search bar on the homepage.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">2. Create an Account for Full Features</h4>
            <p className="text-gray-700">Sign up to save favorites, track visits, take notes, and share communities with family members.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">3. Use Family Collaboration</h4>
            <p className="text-gray-700">Share community listings with family members via email, text, or direct links for collaborative decision-making.</p>
          </div>
        </div>
      )
    },
    {
      id: 'searching',
      title: 'How to Search Communities',
      icon: <Search className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Search by Location</h4>
            <p className="text-gray-700">Enter a city, state, or ZIP code. Try "San Francisco", "California", or "90210".</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Search by Community Name</h4>
            <p className="text-gray-700">If you know a specific community name, you can search for it directly.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Use the Map View</h4>
            <p className="text-gray-700">Switch to map view to see communities visually and explore nearby options.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Filter Results</h4>
            <p className="text-gray-700">Use care type filters (Independent Living, Assisted Living, Memory Care) to narrow results.</p>
          </div>
        </div>
      )
    },
    {
      id: 'login-help',
      title: 'Login & Account Help',
      icon: <LogIn className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Creating an Account</h4>
            <p className="text-gray-700">Click "Sign Up" in the top right corner. You'll need an email address and password.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Forgot Password?</h4>
            <p className="text-gray-700">Use the "Forgot Password" link on the login page to reset your password via email.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Account Benefits</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• Save favorite communities</li>
              <li>• Track community visits</li>
              <li>• Add personal notes</li>
              <li>• Share with family members</li>
              <li>• Access your dashboard</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Using Your Dashboard',
      icon: <User className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Favorites</h4>
            <p className="text-gray-700">View all communities you've saved by clicking the heart icon. Easily access your shortlist.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Visit Tracker</h4>
            <p className="text-gray-700">Log your community visits, add notes, and track your tour experiences.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Personal Notes</h4>
            <p className="text-gray-700">Add private notes to any community to remember important details.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Family Sharing</h4>
            <p className="text-gray-700">Share communities with family members via email or direct links.</p>
          </div>
        </div>
      )
    },
    {
      id: 'understanding-listings',
      title: 'Understanding Community Listings',
      icon: <Star className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Pricing Information</h4>
            <p className="text-gray-700">We show transparent pricing when available. "Starting at" prices are estimates based on market research.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Review Ratings</h4>
            <p className="text-gray-700">Ratings come from Google and Yelp. Click review links to read actual reviews on those platforms.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Care Types</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• <strong>Independent Living:</strong> For active seniors needing minimal assistance</li>
              <li>• <strong>Assisted Living:</strong> For seniors needing help with daily activities</li>
              <li>• <strong>Memory Care:</strong> Specialized care for dementia/Alzheimer's</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Availability Status</h4>
            <p className="text-gray-700">Green = Available, Yellow = Waitlist, Orange = Call for availability</p>
          </div>
        </div>
      )
    },
    {
      id: 'family-collaboration',
      title: 'Family Collaboration Features',
      icon: <Heart className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">One-Click Sharing</h4>
            <p className="text-gray-700">Share any community listing instantly via email, text, or social media.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Family Collaboration Page</h4>
            <p className="text-gray-700">Access dedicated tools for involving family members in the decision-making process.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Tour Tracker Sharing</h4>
            <p className="text-gray-700">Share your visit experiences and notes with family members after touring communities.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Personal Notes</h4>
            <p className="text-gray-700">Add private notes to communities that only you and your shared family members can see.</p>
          </div>
        </div>
      )
    },
    {
      id: 'affordable-housing',
      title: 'Affordable Housing Options',
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">HUD Section 202 Housing</h4>
            <p className="text-gray-700">Income-based housing for seniors. Rent is limited to 30% of income. Typical waiting lists are 6+ months.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Veterans Housing</h4>
            <p className="text-gray-700">HUD-VASH program combines rental assistance with VA supportive services for eligible veterans.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Application Process</h4>
            <p className="text-gray-700">Apply directly with each property. Must qualify as "very low income" (below 50% of area median income).</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-blue-100">
              Everything you need to know about MySeniorValet
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Quick Start Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <span>Quick Start Guide</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Search</h3>
                <p className="text-sm text-gray-600">Enter a city, state, or ZIP code to find communities</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Save Favorites</h3>
                <p className="text-sm text-gray-600">Click the heart icon to save communities you're interested in</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Share</h3>
                <p className="text-sm text-gray-600">Share communities with family members for collaborative decisions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Topics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Help Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {helpSections.map((section) => (
                <div key={section.id} className="border rounded-lg">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {section.icon}
                      <span className="font-semibold">{section.title}</span>
                    </div>
                    {openSection === section.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {openSection === section.id && (
                    <div className="p-4 border-t bg-gray-50">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you can't find what you're looking for in our help topics, we're here to help!
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Email Support</p>
                  <a href="mailto:info@myseniorvalet.com" className="text-blue-600 hover:text-blue-700">
                    info@myseniorvalet.com
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold">Live Chat</p>
                  <p className="text-gray-600">Available during business hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Platform Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">🔍</Badge>
                  <span>Search 8,000+ communities across 19 states</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">💰</Badge>
                  <span>Transparent pricing - no "call for pricing"</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">🗺️</Badge>
                  <span>Interactive map view</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">❤️</Badge>
                  <span>Save favorites and track visits</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">👥</Badge>
                  <span>Family collaboration tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">📱</Badge>
                  <span>Mobile-friendly design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">🏠</Badge>
                  <span>Affordable housing options</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">🛡️</Badge>
                  <span>No referral fees or commissions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Started */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Ready to start your senior living search?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Search Communities
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}