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
    <div className="space-y-4">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-bold">VA Aid & Attendance Benefits</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Up to $31,714 annually in tax-free benefits for eligible veterans and surviving spouses
        </p>
      </div>

      {/* Quick Stats - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">$2,642</p>
            <p className="text-xs text-muted-foreground">Monthly (Married)</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-600">2.3M</p>
            <p className="text-xs text-muted-foreground">Eligible</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-3 text-center">
            <Heart className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">90%</p>
            <p className="text-xs text-muted-foreground">Unaware</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">Tax Free</p>
            <p className="text-xs text-muted-foreground">100%</p>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Requirements - Compact */}
      <Card>
        <CardHeader className="py-3 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle className="text-base">Eligibility Requirements</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid md:grid-cols-2 gap-2">
            {eligibilityRequirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                <req.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{req.requirement}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-xs">
            <div className="flex items-start gap-1">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p><strong>Note:</strong> Honorable discharge & income limits apply</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefit Amounts Table - Compact */}
      <Card>
        <CardHeader className="py-3 px-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="w-4 h-4 text-green-600" />
            2025 Benefit Amounts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-2">
            {benefitAmounts.map((benefit, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-sm font-medium">{benefit.recipient}</p>
                <div className="text-right">
                  <p className="text-base font-bold text-green-600">${benefit.monthly.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">${benefit.annual.toLocaleString()}/yr</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Covered Services - Compact */}
      <Card>
        <CardHeader className="py-3 px-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardTitle className="text-base">What Aid & Attendance Covers</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid md:grid-cols-2 gap-1 text-sm">
            {coveredServices.map((service, index) => (
              <div key={index} className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                <span>{service}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded">
            <p className="text-xs">
              <strong>Note:</strong> Monthly cash benefit for any expense, designed for long-term care costs.
            </p>
          </div>
          <Link href="/va-resources">
            <Button className="w-full mt-3" size="sm">
              Check Eligibility
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Application Process - Compact */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="py-3 px-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <CardTitle className="text-base">Application Steps</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div className="text-sm">
                <p className="font-medium">Gather Documentation</p>
                <p className="text-xs text-muted-foreground">DD-214, medical records, financials</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div className="text-sm">
                <p className="font-medium">Complete Form 21-2680</p>
                <p className="text-xs text-muted-foreground">Housebound/Aid & Attendance exam</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div className="text-sm">
                <p className="font-medium">Submit to VA</p>
                <p className="text-xs text-muted-foreground">Wait 3-6 months for decision</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div className="text-sm">
                <p className="font-medium">Receive Benefits</p>
                <p className="text-xs text-muted-foreground">Retroactive to application date</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}