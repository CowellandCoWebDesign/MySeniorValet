import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  Search,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  MapPin,
  Star,
  Zap,
  Globe,
  Bot,
  Target,
  BarChart
} from 'lucide-react';

export default function AISearchComparison() {
  const [activeComparison, setActiveComparison] = useState<'features' | 'performance' | 'pricing'>('features');

  const searchImplementations = [
    {
      name: "Basic Home Search",
      path: "/",
      description: "Original search bar on home page - database only",
      status: "production",
      features: {
        database: true,
        ai: false,
        realTimePricing: false,
        multiAI: false,
        webIntelligence: false,
        marketAnalysis: true,
        callForPricingSolution: false
      },
      stats: {
        communities: "26,306",
        responseTime: "< 200ms",
        accuracy: "100% (database only)",
        pricingCoverage: "20% (HUD only)"
      }
    },
    {
      name: "AI Search Intelligence",
      path: "/ai-search-intelligence",
      description: "2nd iteration with AI Genius Map - Claude AI enhanced",
      status: "beta",
      features: {
        database: true,
        ai: true,
        realTimePricing: false,
        multiAI: false,
        webIntelligence: false,
        marketAnalysis: true,
        callForPricingSolution: true
      },
      stats: {
        communities: "26,306",
        responseTime: "1-2s",
        accuracy: "Enhanced with AI",
        pricingCoverage: "40% (AI estimates)"
      }
    },
    {
      name: "Multi-AI Intelligence Network",
      path: "/admin/multi-ai-test",
      description: "Advanced 3-AI system with Claude, Gemini, ChatGPT + Perplexity intelligence",
      status: "alpha",
      features: {
        database: true,
        ai: true,
        realTimePricing: true,
        multiAI: true,
        webIntelligence: true,
        marketAnalysis: true,
        callForPricingSolution: true
      },
      stats: {
        communities: "26,306",
        responseTime: "2-4s",
        accuracy: "Cross-verified 4 AIs",
        pricingCoverage: "90%+ (Web + AI)"
      }
    }
  ];

  const pricingSolutions = [
    {
      problem: "Call for Pricing",
      current: "80% of communities show 'Contact for pricing'",
      solution: "Multi-AI can fetch real-time pricing from web sources + AI estimates",
      impact: "Reduce 'call for pricing' to < 10%"
    },
    {
      problem: "Outdated Prices",
      current: "Many prices are months/years old",
      solution: "Perplexity web search gets current market rates",
      impact: "Always show prices within 30 days"
    },
    {
      problem: "No Price Ranges",
      current: "Single price point only",
      solution: "AI analyzes market to provide min/max ranges",
      impact: "Show realistic price ranges for budgeting"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader 
        title="AI Search Comparison" 
        subtitle="Compare all search implementations"
      />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Search System Comparison Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Compare all 3 AI search implementations to find the best features for solving pricing issues
          </p>
        </CardHeader>
      </Card>

      {/* Quick Access Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {searchImplementations.map((impl) => (
          <Card key={impl.path} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{impl.name}</CardTitle>
                <Badge variant={
                  impl.status === 'production' ? 'default' : 
                  impl.status === 'beta' ? 'secondary' : 'outline'
                }>
                  {impl.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{impl.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  {impl.features.multiAI ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span>Multi-AI Verification</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {impl.features.webIntelligence ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span>Real-time Web Data</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {impl.features.callForPricingSolution ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span>Solves "Call for Pricing"</span>
                </div>
              </div>
              <Link href={impl.path}>
                <Button className="w-full" variant={impl.status === 'production' ? 'default' : 'outline'}>
                  <Search className="w-4 h-4 mr-2" />
                  Try This Search
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Comparison */}
      <Tabs value={activeComparison} onValueChange={(v) => setActiveComparison(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">
            <Sparkles className="w-4 h-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing Solutions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Feature</th>
                      <th className="text-center p-2">Basic Search</th>
                      <th className="text-center p-2">AI Intelligence</th>
                      <th className="text-center p-2">Multi-AI Network</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Database Search</td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">AI Enhancement</td>
                      <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Real-time Pricing</td>
                      <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Web Intelligence</td>
                      <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Multi-AI Verification</td>
                      <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Market Analysis</td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance & Coverage Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {searchImplementations.map((impl) => (
                  <div key={impl.name} className="space-y-4">
                    <h3 className="font-semibold text-lg">{impl.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Communities</span>
                        <Badge variant="outline">{impl.stats.communities}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Response Time</span>
                        <Badge variant="outline">{impl.stats.responseTime}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Accuracy</span>
                        <Badge variant="outline">{impl.stats.accuracy}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Pricing Coverage</span>
                        <Badge variant={
                          impl.stats.pricingCoverage.includes('90%') ? 'default' :
                          impl.stats.pricingCoverage.includes('40%') ? 'secondary' : 'outline'
                        }>
                          {impl.stats.pricingCoverage}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                How Multi-AI Solves "Call for Pricing"
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricingSolutions.map((solution, idx) => (
                <Alert key={idx} className="border-green-200 bg-green-50">
                  <AlertDescription>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-semibold text-red-600 mb-1">Problem</div>
                        <div className="text-sm">{solution.problem}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-orange-600 mb-1">Current State</div>
                        <div className="text-sm">{solution.current}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-600 mb-1">AI Solution</div>
                        <div className="text-sm">{solution.solution}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-green-600 mb-1">Impact</div>
                        <div className="text-sm font-medium">{solution.impact}</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}

              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-purple-600" />
                  Recommended Hybrid Approach
                </h4>
                <p className="text-sm mb-3">
                  Combine the best features from all three implementations:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Speed:</strong> Use basic search for instant results (&lt; 200ms)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Intelligence:</strong> Add AI enhancement for natural language understanding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Pricing:</strong> Use Perplexity for real-time pricing to eliminate "call for pricing"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Accuracy:</strong> Deploy multi-AI verification for critical searches</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}