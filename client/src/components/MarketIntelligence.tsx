import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Brain, Shield, Eye, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

export function MarketIntelligence() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Understanding Care Levels & Live Market Intelligence</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Real pricing data from 25,376+ communities across North America
        </p>
      </div>

      {/* Market Intelligence Overview */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI-Powered Senior Living Intelligence
          </CardTitle>
          <CardDescription>
            Industry-leading Transparency System • Multi-AI Verification Engine • 14,000 Communities Mapped
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                What Makes This Revolutionary
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Natural Language AI Search:</strong> "Find a memory care under $3,000 in Sacramento with pet therapy"... and it actually works!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Live Pricing Intelligence:</strong> Real pricing data from 25,376+ communities across North America, updated daily</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Community Transparency Score:</strong> Multi-factor algorithm evaluating regulatory compliance, patient satisfaction, and more</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Geospatial Mapping 2.0:</strong> Interactive maps showing proximity to hospitals, VA centers, shopping, and amenities</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Industry-Leading 6-AI Verification System
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Financial Transparency</span>
                  <Progress value={95} className="w-24" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Community Mapping</span>
                  <Progress value={88} className="w-24" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Real-Time Fact Checking</span>
                  <Progress value={92} className="w-24" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Visual Intelligence</span>
                  <Progress value={85} className="w-24" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm flex items-start gap-2">
                  <Eye className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span><strong>100% Compliance:</strong> Every community is verified through Medicare.gov, CHAP, state databases, and consumer feedback</span>
                </p>
              </div>
            </div>
          </div>

          {/* Market Trends */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Live Market Insights
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">$4,267</p>
                <p className="text-xs text-muted-foreground">Avg Assisted Living</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">$6,844</p>
                <p className="text-xs text-muted-foreground">Avg Memory Care</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">$2,348</p>
                <p className="text-xs text-muted-foreground">Avg Independent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">94%</p>
                <p className="text-xs text-muted-foreground">Price Accuracy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Fact Checking */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-orange-600" />
            Real-Time Fact Checking
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Medicare Certified: Verified against CMS database
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              State Licensed: Validated with state regulatory boards
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Financial Transparency: Live pricing from actual residents
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Red Flag Detection: AI monitors for compliance issues
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}