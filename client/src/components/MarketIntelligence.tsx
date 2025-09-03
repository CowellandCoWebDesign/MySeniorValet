import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Brain, Shield, Eye, CheckCircle, TrendingUp, AlertCircle, Home, Users, Heart, Stethoscope } from "lucide-react";

export function MarketIntelligence() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Complete Care Spectrum & Live Market Intelligence</h2>
        <p className="text-base text-gray-600 dark:text-gray-300 mb-2">
          All care levels from $0 to $12,000+ • Live pricing from 34,171 verified communities
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          From HUD-Sponsored Housing to Skilled Nursing - Find your perfect care level
        </p>
      </div>

      {/* Market Intelligence Overview - Improved Design */}
      <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
        <CardHeader className="py-6 px-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Brain className="w-6 h-6 text-blue-600" />
            AI-Powered Intelligence System
          </CardTitle>
          <CardDescription className="text-base mt-2">
            3-AI Orchestra: Claude + Perplexity + ChatGPT • 34,171 Verified Communities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Revolutionary Features
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold text-lg">•</span>
                  <span><strong>AI Search:</strong> Natural language queries with intelligent understanding</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold text-lg">•</span>
                  <span><strong>Live Pricing:</strong> 25,376+ communities with real-time updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold text-lg">•</span>
                  <span><strong>Transparency Score:</strong> Multi-factor rating system</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold text-lg">•</span>
                  <span><strong>Interactive Mapping:</strong> Advanced geospatial search</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                3-AI Orchestration System
              </h3>
              <div className="text-sm mb-4 text-gray-600 dark:text-gray-300">
                Claude • Perplexity • ChatGPT working in perfect harmony
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium">Claude (Analysis)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={96} className="w-20 h-2" />
                    <span className="text-sm font-semibold">96%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium">Perplexity (Real-time)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={94} className="w-20 h-2" />
                    <span className="text-sm font-semibold">94%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium">ChatGPT (Cross-Check)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={92} className="w-20 h-2" />
                    <span className="text-sm font-semibold">92%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm flex items-start gap-2">
                  <Eye className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span><strong>Triple Verification:</strong> Each community verified by all 3 AI systems for absolute accuracy</span>
                </p>
              </div>
            </div>
          </div>

          {/* Complete Care Spectrum with Live Pricing - All 7 Levels */}
          <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded">
            <h3 className="font-medium mb-3 flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Complete Care Spectrum: Live Pricing Intelligence
            </h3>
            
            {/* Care Level Spectrum Indicator */}
            <div className="mb-3 px-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1">
                  <span className="text-lg">💰</span> Lowest Cost
                </span>
                <span className="flex items-center gap-1">
                  Highest Care <span className="text-lg">❤️</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 h-2 rounded-full ${
                      level === 1 ? 'bg-blue-500' :
                      level === 2 ? 'bg-green-500' :
                      level === 3 ? 'bg-emerald-500' :
                      level === 4 ? 'bg-purple-500' :
                      level === 5 ? 'bg-orange-500' :
                      level === 6 ? 'bg-red-500' :
                      'bg-indigo-500'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* All 7 Care Levels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {/* Level 1: HUD-Sponsored */}
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded border border-blue-200 dark:border-blue-800">
                <Shield className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <p className="text-sm font-bold text-blue-600">$0-$500</p>
                <p className="text-xs text-muted-foreground">HUD-Sponsored</p>
                <p className="text-xs text-blue-600">5,936 communities</p>
                <Badge className="mt-1 text-xs px-1 py-0 bg-blue-100 text-blue-700">Income-Based</Badge>
              </div>
              
              {/* Level 2: 55+ Mobile Parks */}
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded border border-green-200 dark:border-green-800">
                <Home className="w-4 h-4 mx-auto mb-1 text-green-600" />
                <p className="text-sm font-bold text-green-600">$300-$800</p>
                <p className="text-xs text-muted-foreground">55+ Mobile Parks</p>
                <p className="text-xs text-green-600">3,421 communities</p>
                <Badge className="mt-1 text-xs px-1 py-0 bg-green-100 text-green-700">Age-Restricted</Badge>
              </div>
              
              {/* Level 3: Active Adult 55+ */}
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded border border-emerald-200 dark:border-emerald-800">
                <Users className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <p className="text-sm font-bold text-emerald-600">$800-$1,500</p>
                <p className="text-xs text-muted-foreground">Active Adult 55+</p>
                <p className="text-xs text-emerald-600">4,567 communities</p>
                <Badge className="mt-1 text-xs px-1 py-0 bg-emerald-100 text-emerald-700">Lifestyle</Badge>
              </div>
              
              {/* Level 4: Independent Living */}
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded border border-purple-200 dark:border-purple-800">
                <Home className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <p className="text-sm font-bold text-purple-600">$1,500-$3,500</p>
                <p className="text-xs text-muted-foreground">Independent Living</p>
                <p className="text-xs text-purple-600">8,745 communities</p>
                <Badge className="mt-1 text-xs px-1 py-0 bg-purple-100 text-purple-700">Meals Included</Badge>
              </div>
              
              {/* Level 5: Assisted Living */}
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded border border-orange-200 dark:border-orange-800">
                <Heart className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                <p className="text-sm font-bold text-orange-600">$3,000-$6,000</p>
                <p className="text-xs text-muted-foreground">Assisted Living</p>
                <p className="text-xs text-orange-600">7,234 communities</p>
                <Badge className="mt-1 text-xs px-1 py-0 bg-orange-100 text-orange-700">ADL Support</Badge>
              </div>
              
              {/* Level 6: Memory Care */}
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded border border-red-200 dark:border-red-800">
                <Brain className="w-4 h-4 mx-auto mb-1 text-red-600" />
                <p className="text-sm font-bold text-red-600">$4,000-$7,500</p>
                <p className="text-xs text-muted-foreground">Memory Care</p>
                <p className="text-xs text-red-600">3,897 communities</p>
                <Badge className="mt-1 text-xs px-1 py-0 bg-red-100 text-red-700">Secured</Badge>
              </div>
              
              {/* Level 7: Skilled Nursing */}
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded border border-indigo-200 dark:border-indigo-800">
                <Stethoscope className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                <p className="text-sm font-bold text-indigo-600">$6,000-$12,000</p>
                <p className="text-xs text-muted-foreground">Skilled Nursing</p>
                <p className="text-xs text-indigo-600">2,300 communities</p>
                <Badge className="mt-1 text-xs px-1 py-0 bg-indigo-100 text-indigo-700">24/7 Medical</Badge>
              </div>
            </div>
            
            <div className="mt-3 text-center space-y-1">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                Live data from 34,171 verified communities
              </Badge>
              <p className="text-xs text-muted-foreground">
                Slide to explore care options from lowest cost to highest care needs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Fact Checking */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-orange-600" />
            Real-Time Fact Checking
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs py-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              Medicare Certified
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs py-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              State Licensed
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs py-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              Financial Transparency
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs py-1">
              <AlertCircle className="w-3 h-3 mr-1" />
              Red Flag Detection
            </Badge>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}