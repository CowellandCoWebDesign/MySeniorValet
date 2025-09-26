// Tab Content Sections for MySeniorValet Home Page
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RedTagDeals } from "@/components/RedTagDeals";
import { MarketIntelligence } from "@/components/MarketIntelligence";
import { CostComparisonWorksheet } from "@/components/CostComparisonWorksheet";
import { AidAndAttendance } from "@/components/AidAndAttendance";
import { Link } from "wouter";
import { 
  TrendingUp, Shield, Globe, CheckCircle, Sparkles, RefreshCw, Eye, ArrowRight,
  Brain, Star, Building, Users, ShoppingBag, Heart, Package, Truck, Calendar,
  MessageSquare, Activity, Stethoscope, DollarSign, FileText, Book, HelpCircle,
  Briefcase, GraduationCap, Phone, Building2, Home, Layers
} from "lucide-react";

import MotelVacancySign from '@assets/generated_images/Motel_vacancy_sign_ae0ac2af.png';
import RetroShoppingSign from '@assets/generated_images/Retro_shopping_center_neon_sign_dbb6f040.png';
import RetroMedicalSign from '@assets/generated_images/Retro_medical_clinic_neon_sign_bdc37a10.png';
import RetroLibrarySign from '@assets/generated_images/Retro_library_resource_center_sign_c0d548ed.png';
import RetroVendorMarketplace from '@assets/generated_images/Retro_vendor_marketplace_sign_b412c8cc.png';
import RetroGuestServices from '@assets/generated_images/Retro_guest_services_sign_b951be1b.png';

export function CommunitiesTabContent({ communityStats }: { communityStats?: any }) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Senior Living Communities Directory
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Discover and compare {communityStats?.communities || '33,000+'} senior living communities worldwide with transparent pricing, 
          verified HUD rates, and real availability. From assisted living to memory care and nursing homes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Community Search Card */}
        <Card className="hover:shadow-xl transition-all">
          <CardHeader>
            <Building className="h-8 w-8 mb-2 text-blue-600" />
            <CardTitle>Find Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Search our comprehensive database of senior living communities by location, care type, or budget.
            </p>
            <Link href="/community-directory">
              <Button className="w-full">Explore Communities</Button>
            </Link>
          </CardContent>
        </Card>

        {/* HUD Properties */}
        <Card className="hover:shadow-xl transition-all">
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-green-600" />
            <CardTitle>HUD-Verified Housing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Access government-subsidized senior housing with income-based pricing and verified availability.
            </p>
            <Link href="/hud-properties">
              <Button className="w-full" variant="outline">View HUD Properties</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Care Types Guide */}
        <Card className="hover:shadow-xl transition-all">
          <CardHeader>
            <Heart className="h-8 w-8 mb-2 text-red-600" />
            <CardTitle>Care Types Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Understand the differences between assisted living, memory care, independent living, and more.
            </p>
            <Link href="/care-types">
              <Button className="w-full" variant="outline">Learn About Care</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Featured Communities Section */}
      <div className="mt-12">
        <RedTagDeals />
      </div>

      {/* Market Intelligence */}
      <div className="mt-12">
        <MarketIntelligence />
      </div>
    </div>
  );
}

export function ServicesTabContent() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Business & Services Research Platform
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Research any business or service worldwide - from restaurants and hotels to lawyers and pharmacies. 
          All information is transparently cited from public sources with AI-powered enrichment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Home Care Services */}
        <Card className="hover:shadow-xl transition-all border-amber-200">
          <CardHeader>
            <Home className="h-8 w-8 mb-2 text-amber-600" />
            <CardTitle>Home Care Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Find home health agencies, companion care, and personal care assistants in your area.
            </p>
            <Button className="w-full" variant="outline">Search Services</Button>
          </CardContent>
        </Card>

        {/* Professional Services */}
        <Card className="hover:shadow-xl transition-all border-amber-200">
          <CardHeader>
            <Briefcase className="h-8 w-8 mb-2 text-amber-600" />
            <CardTitle>Professional Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect with elder law attorneys, financial planners, and care managers.
            </p>
            <Button className="w-full" variant="outline">Find Professionals</Button>
          </CardContent>
        </Card>

        {/* Daily Living Services */}
        <Card className="hover:shadow-xl transition-all border-amber-200">
          <CardHeader>
            <Truck className="h-8 w-8 mb-2 text-amber-600" />
            <CardTitle>Daily Living Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Transportation, meal delivery, housekeeping, and other essential services.
            </p>
            <Button className="w-full" variant="outline">Browse Services</Button>
          </CardContent>
        </Card>
      </div>

      {/* Service Categories Grid */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Restaurants', 'Hotels', 'Pharmacies', 'Banks', 'Stores', 'Lawyers', 'Salons', 'Transportation'].map((category) => (
          <div key={category} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer transition-all">
            <p className="font-semibold text-amber-800 dark:text-amber-200">{category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HealthcareTabContent() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Global Healthcare Discovery Platform
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Find hospitals, clinics, specialists, and healthcare facilities worldwide. 
          Access emergency care information, medical centers, and healthcare options globally.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hospitals & ERs */}
        <Card className="hover:shadow-xl transition-all border-teal-200">
          <CardHeader>
            <Building2 className="h-8 w-8 mb-2 text-teal-600" />
            <CardTitle>Hospitals & Emergency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Locate hospitals, emergency rooms, and urgent care centers near you or globally.
            </p>
            <Button className="w-full bg-teal-600 hover:bg-teal-700">Find Hospitals</Button>
          </CardContent>
        </Card>

        {/* Specialists */}
        <Card className="hover:shadow-xl transition-all border-teal-200">
          <CardHeader>
            <Stethoscope className="h-8 w-8 mb-2 text-teal-600" />
            <CardTitle>Medical Specialists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Find geriatric specialists, neurologists, cardiologists, and other medical experts.
            </p>
            <Button className="w-full" variant="outline">Search Specialists</Button>
          </CardContent>
        </Card>

        {/* Rehabilitation */}
        <Card className="hover:shadow-xl transition-all border-teal-200">
          <CardHeader>
            <Activity className="h-8 w-8 mb-2 text-teal-600" />
            <CardTitle>Rehabilitation Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Physical therapy, occupational therapy, and rehabilitation facilities.
            </p>
            <Button className="w-full" variant="outline">Find Rehab Centers</Button>
          </CardContent>
        </Card>
      </div>

      {/* Healthcare Categories */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Healthcare Specialties</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Primary Care', 'Memory Care', 'Cancer Centers', 'Heart Health', 'Dialysis', 'Mental Health', 'Pain Management', 'Vision & Hearing'].map((specialty) => (
            <div key={specialty} className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-center hover:bg-teal-100 dark:hover:bg-teal-900/30 cursor-pointer transition-all">
              <p className="font-semibold text-teal-800 dark:text-teal-200">{specialty}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResourcesTabContent() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Senior Resources & Support Center
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Access educational resources, government programs, financial assistance, and support services. 
          Everything you need to navigate senior care with confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Medicare/Medicaid Guide */}
        <Card className="hover:shadow-xl transition-all border-purple-200">
          <CardHeader>
            <FileText className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>Medicare & Medicaid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Understand benefits, enrollment, coverage options, and how to maximize your healthcare benefits.
            </p>
            <Button className="w-full" variant="outline">Learn More</Button>
          </CardContent>
        </Card>

        {/* Financial Planning */}
        <Card className="hover:shadow-xl transition-all border-purple-200">
          <CardHeader>
            <DollarSign className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>Financial Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              VA benefits, long-term care insurance, estate planning, and financial assistance programs.
            </p>
            <Link href="/aid-and-attendance">
              <Button className="w-full" variant="outline">Explore Resources</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Caregiver Support */}
        <Card className="hover:shadow-xl transition-all border-purple-200">
          <CardHeader>
            <Heart className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>Caregiver Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Resources, support groups, respite care options, and tools for family caregivers.
            </p>
            <Button className="w-full" variant="outline">Get Support</Button>
          </CardContent>
        </Card>
      </div>

      {/* Educational Resources */}
      <div className="mt-12">
        <CostComparisonWorksheet />
      </div>

      {/* Aid & Attendance Benefits */}
      <div className="mt-12">
        <AidAndAttendance />
      </div>
    </div>
  );
}

export function VendorsTabContent() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Senior Products Marketplace
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Shop for medical supplies, mobility aids, safety equipment, and daily living products from trusted vendors. 
          Find everything from walkers and wheelchairs to bathroom safety and comfort items.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mobility Aids */}
        <Card className="hover:shadow-xl transition-all border-indigo-200">
          <CardHeader>
            <Package className="h-8 w-8 mb-2 text-indigo-600" />
            <CardTitle>Mobility Aids</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Walkers, wheelchairs, scooters, canes, and other mobility equipment.
            </p>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Shop Mobility</Button>
          </CardContent>
        </Card>

        {/* Medical Supplies */}
        <Card className="hover:shadow-xl transition-all border-indigo-200">
          <CardHeader>
            <ShoppingBag className="h-8 w-8 mb-2 text-indigo-600" />
            <CardTitle>Medical Supplies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Hospital beds, oxygen equipment, monitoring devices, and medical consumables.
            </p>
            <Button className="w-full" variant="outline">Browse Supplies</Button>
          </CardContent>
        </Card>

        {/* Safety Equipment */}
        <Card className="hover:shadow-xl transition-all border-indigo-200">
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-indigo-600" />
            <CardTitle>Safety Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Grab bars, shower chairs, alert systems, and fall prevention products.
            </p>
            <Button className="w-full" variant="outline">Shop Safety</Button>
          </CardContent>
        </Card>
      </div>

      {/* Product Categories */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Popular Product Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Bath Safety', 'Lift Chairs', 'Compression Wear', 'Daily Living Aids', 'Incontinence', 'Pain Relief', 'Vision/Hearing', 'Supplements'].map((category) => (
            <div key={category} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center hover:bg-indigo-100 dark:hover:bg-indigo-900/30 cursor-pointer transition-all">
              <p className="font-semibold text-indigo-800 dark:text-indigo-200">{category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Vendors */}
      <div className="mt-12 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Trusted Affiliate Partners</h3>
        <div className="flex flex-wrap gap-4">
          <Badge className="px-4 py-2 text-sm">Amazon Health</Badge>
          <Badge className="px-4 py-2 text-sm">Walmart Medical</Badge>
          <Badge className="px-4 py-2 text-sm">CVS Health</Badge>
          <Badge className="px-4 py-2 text-sm">Walgreens</Badge>
        </div>
      </div>
    </div>
  );
}