import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, DollarSign, CheckCircle, FileText, Users, Heart, Calculator, Info, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export function AidAndAttendance() {
  const eligibilityRequirements = [
    { requirement: "Served at least 90 days of active duty", icon: Shield },
    { requirement: "At least one day during a wartime period", icon: FileText },
    { requirement: "Need help with daily activities", icon: Heart },
    { requirement: "Meet income and asset limits", icon: DollarSign }
  ];

  const benefitAmounts = [
    { recipient: "Single Veteran", monthly: 2230, annual: 26760 },
    { recipient: "Married Veteran", monthly: 2642, annual: 31704 },
    { recipient: "Surviving Spouse", monthly: 1432, annual: 17184 },
    { recipient: "Two Veterans Married", monthly: 3536, annual: 42432 }
  ];

  const coveredServices = [
    "Assisted Living Communities",
    "Memory Care Facilities",
    "In-Home Care Services",
    "Adult Day Healthcare",
    "Nursing Home Care",
    "Medical Equipment & Supplies"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold">VA Aid & Attendance Benefits</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Up to $31,714 annually in tax-free benefits for eligible veterans and surviving spouses
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">$2,642</p>
            <p className="text-sm text-muted-foreground">Monthly for Married Veterans</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">2.3M</p>
            <p className="text-sm text-muted-foreground">Eligible Veterans</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6 text-center">
            <Heart className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">90%</p>
            <p className="text-sm text-muted-foreground">Don't Know They Qualify</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">Tax Free</p>
            <p className="text-sm text-muted-foreground">100% Non-Taxable</p>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Requirements */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle>Eligibility Requirements</CardTitle>
          <CardDescription>
            Basic criteria to qualify for Aid & Attendance benefits
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {eligibilityRequirements.map((req, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <req.icon className="w-5 h-5 text-blue-600 mt-0.5" />
                <span className="text-sm">{req.requirement}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <p className="text-sm">
                <strong>Important:</strong> Honorable discharge required. Income and assets must fall below specific thresholds set by the VA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefit Amounts Table */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-green-600" />
            2025 Benefit Amounts
          </CardTitle>
          <CardDescription>
            Maximum monthly and annual benefit amounts by recipient type
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {benefitAmounts.map((benefit, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-semibold">{benefit.recipient}</p>
                  <p className="text-sm text-muted-foreground">Tax-free monthly payment</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${benefit.monthly.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">${benefit.annual.toLocaleString()}/year</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Covered Services */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardTitle>What Aid & Attendance Covers</CardTitle>
          <CardDescription>
            Use these benefits for various care services
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-3">
            {coveredServices.map((service, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>{service}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                How It Works
              </h4>
              <p className="text-sm">
                Aid & Attendance is a monthly cash benefit paid directly to eligible veterans or surviving spouses. 
                You can use this money for any expense, but it's designed to help cover the cost of long-term care.
              </p>
            </div>
            <Link href="/va-resources">
              <Button className="w-full" size="lg">
                Check Your Eligibility Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Application Process */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <CardTitle>Application Process</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-semibold">Gather Documentation</p>
                <p className="text-sm text-muted-foreground">DD-214, medical records, financial statements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-semibold">Complete VA Form 21-2680</p>
                <p className="text-sm text-muted-foreground">Examination for Housebound Status or Need for Aid & Attendance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-semibold">Submit Application</p>
                <p className="text-sm text-muted-foreground">File with VA and wait 3-6 months for decision</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <p className="font-semibold">Receive Benefits</p>
                <p className="text-sm text-muted-foreground">Retroactive to application date once approved</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}