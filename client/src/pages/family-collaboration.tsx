import React, { useState } from 'react';
import { Users, Share2, Mail, MessageSquare, Heart, Star, Calendar, Clock, CheckCircle, ArrowRight, Smartphone, Copy, Link, Send, LogIn, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FamilyShareButton } from '@/components/family-share-button';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { useAuth } from '@/hooks/useAuth';
import { Link as RouterLink, useLocation } from 'wouter';

// GOLDEN DATA RULE - Use real community data from database when available
// This is a demo community structure - phone number removed per golden data rule
const sampleCommunity = {
  id: 1,
  name: "Sunset Gardens Senior Living",
  address: "123 Peaceful Lane",
  city: "Sacramento",
  state: "CA",
  priceRange: { min: 3500, max: 7200 },
  careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
  rating: "4.7",
  photos: [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
  ],
  phone: "", // Contact for pricing - no fake phone numbers allowed
  website: "https://sunsetgardens.com"
};

export default function FamilyCollaborationPage() {
  const [activeDemo, setActiveDemo] = useState<'quick' | 'email' | 'link' | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  const features = [
    {
      icon: <Smartphone className="h-8 w-8 text-blue-600" />,
      title: "One-Click Mobile Sharing",
      description: "Native mobile sharing integrates with all your family's favorite apps - WhatsApp, Messages, Email, and more.",
      highlight: "Perfect for busy families on the go"
    },
    {
      icon: <Mail className="h-8 w-8 text-green-600" />,
      title: "Smart Email Sharing",
      description: "Send detailed community information with photos, pricing, and your personal notes to multiple family members at once.",
      highlight: "Professional email formatting included"
    },
    {
      icon: <Copy className="h-8 w-8 text-purple-600" />,
      title: "Copy & Paste Anywhere",
      description: "Get perfectly formatted text with all community details that you can paste into any messaging app or document.",
      highlight: "Works with any platform"
    },
    {
      icon: <Link className="h-8 w-8 text-orange-600" />,
      title: "Direct Share Links",
      description: "Generate special family links that include all the important details and bring relatives directly to the community page.",
      highlight: "No account required for family"
    }
  ];

  const benefits = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Keep Everyone Informed",
      description: "Share discoveries instantly with siblings, children, and other family members involved in the decision."
    },
    {
      icon: <Clock className="h-6 w-6 text-green-600" />,
      title: "Save Time",
      description: "No more explaining details over the phone or forwarding multiple screenshots."
    },
    {
      icon: <Heart className="h-6 w-6 text-red-600" />,
      title: "Better Decisions",
      description: "Get input from the whole family before scheduling tours or making important decisions."
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-purple-600" />,
      title: "Stay Organized",
      description: "Everyone has the same information, reducing confusion and miscommunication."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-3">
          <Button 
            variant="ghost" 
            onClick={() => {
              // Try to go back in history, fallback to search page
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setLocation('/search');
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="flex items-center space-x-2"
          >
            <div className="w-6 h-6 gradient-primary rounded-sm flex items-center justify-center">
              <Home className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-gradient">MySeniorValet</span>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 rounded-full p-4">
                <Users className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Family Collaboration Made Easy
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Finding the right senior living community is a family decision. 
              Our one-click sharing makes it easy to keep everyone informed and involved.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg"
                onClick={() => setActiveDemo('quick')}
              >
                Try It Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Try our family sharing features with this sample community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Sample Community Card */}
          <div className="space-y-4">
            <EnhancedCommunityCard
              community={sampleCommunity as any}
              variant="featured"
              index={0}
            />
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">Try Family Sharing:</h4>
                <FamilyShareButton 
                  community={sampleCommunity}
                  className="w-full"
                  size="lg"
                />
              </CardContent>
            </Card>
          </div>

          {/* Features Overview */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Multiple Ways to Share
            </h3>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{feature.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Families Love Our Sharing Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Senior living decisions affect the whole family. Make sure everyone's on the same page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center shadow-sm border-0 bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-white rounded-full p-3 shadow-sm">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl max-w-2xl mx-auto opacity-90">
              Three simple steps to keep your family informed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Community</h3>
              <p className="opacity-90">Search and discover communities that match your needs</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Click Share</h3>
              <p className="opacity-90">One click opens all your sharing options</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Family Informed</h3>
              <p className="opacity-90">Everyone gets the same detailed information instantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Your Family Involved?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {isAuthenticated 
              ? `Welcome back${user && (user as any).firstName ? `, ${(user as any).firstName}` : ''}! Use your dashboard to start sharing communities with your family.`
              : "Start your senior living search today and use our family sharing features to keep everyone informed and engaged in the decision-making process."
            }
          </p>
          <div className="flex justify-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading...</span>
              </div>
            ) : isAuthenticated ? (
              <>
                <RouterLink href="/dashboard">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 font-semibold px-8 py-4 text-lg">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </RouterLink>
                <RouterLink href="/search">
                  <Button size="lg" variant="outline" className="font-semibold px-8 py-4 text-lg">
                    Start Searching
                  </Button>
                </RouterLink>
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 font-semibold px-8 py-4 text-lg"
                  onClick={() => window.location.href = '/login'}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Try It Now
                </Button>
                <RouterLink href="/search">
                  <Button size="lg" variant="outline" className="font-semibold px-8 py-4 text-lg">
                    Start Searching
                  </Button>
                </RouterLink>
              </>
            )}
          </div>
          
          {isLoading && (
            <div className="mt-4">
              <p className="text-gray-500">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}