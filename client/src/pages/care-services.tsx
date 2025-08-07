import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { useLocation } from "wouter";
import { 
  Heart, CheckCircle, Shield, Users, Star, Info, Plus
} from "lucide-react";

const serviceTypeLabels: Record<string, string> = {
  hospital: "Hospital",
  home_health: "Home Health Agency",
  hospice: "Hospice Care",
  physical_therapy: "Physical Therapy",
  occupational_therapy: "Occupational Therapy",
  speech_therapy: "Speech Therapy",
  nursing: "Skilled Nursing",
  medical_equipment: "Medical Equipment/DME",
  pharmacy: "Specialty Pharmacy",
  mental_health: "Mental Health Services",
  dental: "Dental Care",
  vision: "Vision/Eye Care",
  hearing: "Hearing/Audiology",
  podiatry: "Podiatry/Foot Care",
  nutrition: "Nutrition/Dietitian",
  transportation: "Medical Transportation",
  adult_day: "Adult Day Care",
  respite: "Respite Care",
  wound_care: "Wound Care",
  dialysis: "Dialysis Center",
  pain_management: "Pain Management",
  cardiology: "Cardiology",
  neurology: "Neurology",
  oncology: "Oncology/Cancer Care",
  pulmonology: "Pulmonology/Respiratory",
  other: "Healthcare Service",
};

export default function CareServices() {
  const [, setLocation] = useLocation();

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-7xl mt-16">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Badge className="px-4 py-2 text-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 mb-4">
            <Heart className="w-4 h-4 mr-2" />
            Healthcare Provider Network - Join FREE
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Healthcare Provider Portal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
            List your healthcare services and connect with 34,000+ senior living communities
          </p>
          
          {/* Healthcare Ecosystem Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 max-w-6xl mx-auto mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Active Services */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🟢 Service Categories You Can List:
                </p>
                
                {/* Primary Healthcare */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-3 mb-1">Primary Healthcare:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs mb-2">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">🏥 Hospitals (6,000+)</Badge>
                </div>
                
                {/* Home & Personal Care */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 mb-1">Home & Personal Care:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs mb-2">
                  <Badge variant="secondary">🏠 Home Care Services</Badge>
                  <Badge variant="secondary">👥 Personal Care Services</Badge>
                  <Badge variant="secondary">🌟 Adult Day Care</Badge>
                </div>
                
                {/* Medical Services */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 mb-1">Medical Services:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs mb-2">
                  <Badge variant="secondary">🏥 Hospice Care</Badge>
                  <Badge variant="secondary">💊 Pharmacy Services</Badge>
                  <Badge variant="secondary">📱 Telemedicine</Badge>
                  <Badge variant="secondary">🩺 Medical Equipment</Badge>
                </div>
                
                {/* Therapy & Rehabilitation */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 mb-1">Therapy & Rehabilitation:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs mb-2">
                  <Badge variant="secondary">🏃 Physical Therapy</Badge>
                  <Badge variant="secondary">🤲 Occupational Therapy</Badge>
                  <Badge variant="secondary">🗣️ Speech Therapy</Badge>
                  <Badge variant="secondary">🧘 Respiratory Therapy</Badge>
                </div>
                
                {/* Specialized Services */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 mb-1">Specialized Services:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs mb-2">
                  <Badge variant="secondary">🧠 Mental Health</Badge>
                  <Badge variant="secondary">🦷 Dental Care</Badge>
                  <Badge variant="secondary">👁️ Vision Care</Badge>
                  <Badge variant="secondary">👂 Hearing Services</Badge>
                  <Badge variant="secondary">🦶 Podiatry</Badge>
                  <Badge variant="secondary">🩸 Dialysis Centers</Badge>
                  <Badge variant="secondary">💉 Wound Care</Badge>
                  <Badge variant="secondary">⚡ Pain Management</Badge>
                </div>
                
                {/* Support Services */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 mb-1">Support Services:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs">
                  <Badge variant="secondary">🚑 Medical Transport</Badge>
                  <Badge variant="secondary">🍎 Nutrition Services</Badge>
                  <Badge variant="secondary">🏥 Respite Care</Badge>
                  <Badge variant="secondary">👥 Social Services</Badge>
                </div>
              </div>
              
              {/* Coming Soon */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🔜 Launching Soon:
                </p>
                <div className="space-y-2">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="font-medium text-sm">🚑 Urgent Care Centers</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Walk-in clinics for immediate care needs</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="font-medium text-sm">🏥 Insurance Provider Networks</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Direct access to in-network doctor lookup portals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>Join our network to reach thousands of senior communities actively searching for services</span>
          </div>
          
          {/* Call to Action for Providers */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 max-w-3xl mx-auto border border-green-200 dark:border-green-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Are you a Healthcare Provider?
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  List your services for FREE and connect with thousands of communities
                </p>
              </div>
              <Button
                onClick={() => setLocation("/healthcare-provider-signup")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your Free Listing
              </Button>
            </div>
          </div>
        </div>

        {/* Care Service Sign Up Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Join Our Healthcare Provider Network
          </h2>
          
          {/* Why Join Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Users className="w-5 h-5" />
                  Reach More Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Connect with thousands of senior living communities and families actively searching for healthcare services.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Direct access to 34,000+ communities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Immediate visibility to families</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Service area customization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Shield className="w-5 h-5" />
                  100% FREE Listing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  No fees, no hidden costs. List your services completely free and start connecting with communities today.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Zero listing fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>No subscription required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Full feature access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Star className="w-5 h-5" />
                  Premium Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Stand out with professional tools designed to help you grow your healthcare practice.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                    <span>Verified provider badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                    <span>Direct messaging system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                    <span>Performance analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Service Categories */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Available Service Categories</CardTitle>
              <CardDescription>Choose from 30+ healthcare service categories to list your practice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(serviceTypeLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Heart className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* CTA Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Join Our Healthcare Network?</h3>
            <p className="text-lg mb-6 opacity-95">
              Start connecting with senior living communities and families today. It's completely free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation("/healthcare-provider-signup")}
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your Free Listing
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/vendor-marketplace-tiers")}
                className="border-white text-white hover:bg-white/10"
              >
                <Info className="w-5 h-5 mr-2" />
                Learn About Premium Options
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}