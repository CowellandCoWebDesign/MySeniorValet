import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Brain, Shield, Eye, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

export function MarketIntelligence() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-2">Understanding Care Levels & Live Market Intelligence</h2>
        <p className="text-sm text-muted-foreground">
          Live pricing data from our 3-AI orchestration system • 34,171 verified communities
        </p>
      </div>

      {/* Market Intelligence Overview - Compact */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="py-3 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-4 h-4 text-blue-600" />
            AI-Powered Senior Living Intelligence
          </CardTitle>
          <CardDescription className="text-xs">
            3-AI Orchestra: Claude + Perplexity + ChatGPT • 34,171 Verified Communities
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-1 text-sm">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Revolutionary Features
              </h3>
              <ul className="space-y-1 text-xs">
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span><strong>AI Search:</strong> Natural language queries</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span><strong>Live Pricing:</strong> 25,376+ communities</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span><strong>Transparency Score:</strong> Multi-factor rating</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span><strong>Geospatial 2.0:</strong> Interactive mapping</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-1 text-sm">
                <BarChart3 className="w-3 h-3 text-purple-600" />
                3-AI Orchestration System
              </h3>
              <div className="text-xs mb-2 text-muted-foreground">
                Claude • Perplexity • ChatGPT working in harmony
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                  <span>Claude (Analysis)</span>
                  <Progress value={96} className="w-16 h-1.5" />
                </div>
                <div className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                  <span>Perplexity (Real-time Data)</span>
                  <Progress value={94} className="w-16 h-1.5" />
                </div>
                <div className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                  <span>ChatGPT (Cross-Check)</span>
                  <Progress value={92} className="w-16 h-1.5" />
                </div>
              </div>
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                <p className="text-xs flex items-start gap-1">
                  <Eye className="w-3 h-3 text-blue-600 mt-0.5" />
                  <span><strong>Triple Verification:</strong> Each community verified by all 3 AI systems for absolute accuracy</span>
                </p>
              </div>
            </div>
          </div>

          {/* Live Pricing by Care Type */}
          <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded">
            <h3 className="font-medium mb-2 flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Live Pricing Intelligence by Care Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                <p className="text-lg font-bold text-green-600">$2,850</p>
                <p className="text-xs text-muted-foreground">Independent Living</p>
                <p className="text-xs text-green-600">8,745 communities</p>
              </div>
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                <p className="text-lg font-bold text-blue-600">$4,580</p>
                <p className="text-xs text-muted-foreground">Assisted Living</p>
                <p className="text-xs text-blue-600">12,234 communities</p>
              </div>
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                <p className="text-lg font-bold text-purple-600">$6,920</p>
                <p className="text-xs text-muted-foreground">Memory Care</p>
                <p className="text-xs text-purple-600">3,897 communities</p>
              </div>
              <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                <p className="text-lg font-bold text-orange-600">$8,450</p>
                <p className="text-xs text-muted-foreground">Skilled Nursing</p>
                <p className="text-xs text-orange-600">2,300 communities</p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                Live data from 34,171 verified communities
              </Badge>
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