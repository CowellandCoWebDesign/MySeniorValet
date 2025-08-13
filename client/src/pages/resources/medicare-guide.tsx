import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Link } from "wouter";
import { 
  Phone, Book, Globe, Clock, Star, CheckCircle, 
  Award, Shield, Users, Building, Calendar, HelpCircle,
  ArrowLeft, ExternalLink, Mail, Heart, FileText, DollarSign
} from "lucide-react";

export default function MedicareGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Link href="/senior-resources-center">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources Center
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Medicare Complete Guide</h1>
              <p className="text-xl opacity-90">Everything You Need to Know About Medicare</p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge className="bg-white text-blue-700">2025 Updated</Badge>
                <Badge className="bg-white text-blue-700">CMS Official</Badge>
                <Badge className="bg-white text-blue-700">Free Resource</Badge>
              </div>
            </div>
            <Shield className="h-16 w-16 opacity-50" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Overview */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is Medicare?</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Medicare is the federal health insurance program for people 65 or older, 
                  certain younger people with disabilities, and people with End-Stage Renal 
                  Disease (permanent kidney failure requiring dialysis or a transplant).
                </p>
                <p>
                  The program helps with the cost of health care, but it doesn't cover all 
                  medical expenses or the cost of most long-term care. You have choices for 
                  how you get Medicare coverage.
                </p>
              </CardContent>
            </Card>

            {/* Medicare Parts */}
            <Card>
              <CardHeader>
                <CardTitle>The Four Parts of Medicare</CardTitle>
                <CardDescription>Understanding your coverage options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Badge className="bg-blue-500 text-white">Part A</Badge>
                    Hospital Insurance
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Covers inpatient hospital stays, care in a skilled nursing facility, 
                    hospice care, and some home health care.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">Part B</Badge>
                    Medical Insurance
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Covers certain doctors' services, outpatient care, medical supplies, 
                    and preventive services.
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Badge className="bg-purple-500 text-white">Part C</Badge>
                    Medicare Advantage
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    A type of Medicare health plan offered by private companies that 
                    contract with Medicare. Covers all Part A and Part B services.
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Badge className="bg-orange-500 text-white">Part D</Badge>
                    Prescription Drug Coverage
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Adds prescription drug coverage to Original Medicare, some Medicare 
                    Cost Plans, some Medicare Private-Fee-for-Service Plans, and Medicare 
                    Medical Savings Account Plans.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Periods */}
            <Card>
              <CardHeader>
                <CardTitle>Important Enrollment Periods</CardTitle>
                <CardDescription>Don't miss these critical dates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Initial Enrollment Period</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      7-month period that begins 3 months before turning 65
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Annual Enrollment (Oct 15 - Dec 7)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Make changes to Medicare health or prescription drug coverage
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Medicare Advantage Open Enrollment</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      January 1 - March 31 for certain plan changes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Information */}
            <Card>
              <CardHeader>
                <CardTitle>2025 Medicare Costs</CardTitle>
                <CardDescription>Standard monthly premiums and deductibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm">Part B Premium</h4>
                    <p className="text-2xl font-bold text-blue-600">$174.70</p>
                    <p className="text-xs text-gray-500">Standard monthly premium</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Part B Deductible</h4>
                    <p className="text-2xl font-bold text-green-600">$240</p>
                    <p className="text-xs text-gray-500">Annual deductible</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Part A Premium</h4>
                    <p className="text-2xl font-bold text-purple-600">$0</p>
                    <p className="text-xs text-gray-500">If you paid Medicare taxes</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Part A Deductible</h4>
                    <p className="text-2xl font-bold text-orange-600">$1,632</p>
                    <p className="text-xs text-gray-500">Per benefit period</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Resources & Help */}
          <div className="space-y-6">
            {/* Quick Help Card */}
            <Card>
              <CardHeader>
                <CardTitle>Get Help With Medicare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">Medicare Helpline</p>
                    <a href="tel:1-800-633-4227" className="text-blue-600 hover:underline">
                      1-800-MEDICARE
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">Official Website</p>
                    <a href="https://www.medicare.gov" target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline flex items-center">
                      Medicare.gov
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <HelpCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">SHIP Counseling</p>
                    <p className="text-sm">Free, unbiased help</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools & Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Helpful Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Plan Finder Tool
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Extra Help Application
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Coverage Gap Calculator
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Find Local Help
                </Button>
              </CardContent>
            </Card>

            {/* Important Tips */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle>Important Tips</CardTitle>
                <CardDescription>Key things to remember</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Review your coverage annually</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Keep your Medicare card safe</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Beware of Medicare scams</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Use preventive services</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Apply for Extra Help if eligible</p>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card>
              <CardHeader>
                <CardTitle>Ready to Enroll?</CardTitle>
                <CardDescription>We're here to help</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Call 1-800-MEDICARE
                </Button>
                <Button variant="outline" className="w-full">
                  <Globe className="mr-2 h-4 w-4" />
                  Visit Medicare.gov
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}