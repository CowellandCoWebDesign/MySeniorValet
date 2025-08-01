import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [activeComparison, setActiveComparison] = useState<'features' | 'performance' | 'pricing' | 'reviews' | 'mapviews'>('features');

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
      description: "Advanced 3-AI system with Claude, OpenAI (ChatGPT), and Perplexity working together",
      status: "production",
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
        accuracy: "Cross-verified by 3 AIs",
        pricingCoverage: "85%+ (Perplexity web search + AI estimates)"
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
        <TabsList className="grid w-full grid-cols-5">
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
            Pricing
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="w-4 h-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="mapviews">
            <MapPin className="w-4 h-4 mr-2" />
            Map Views
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

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Free Review Data Sources Beyond Google & Yelp
              </CardTitle>
              <CardDescription>
                Comprehensive list of free and accessible review data sources for senior living communities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Government & Official Sources */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Government & Official Sources
                </h3>
                <div className="grid gap-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Medicare.gov - Nursing Home Compare</h4>
                        <p className="text-sm">Official CMS data with quality ratings, health inspections, and staffing information</p>
                        <Badge variant="outline">Free API Available</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription>
                      <div className="space-y-2">
                        <h4 className="font-semibold">State Health Department Databases</h4>
                        <p className="text-sm">Each state maintains inspection reports and violation records for licensed facilities</p>
                        <Badge variant="outline">Varies by State</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Industry-Specific Platforms */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Industry-Specific Review Platforms
                </h3>
                <div className="grid gap-4">
                  <Alert className="border-purple-200 bg-purple-50">
                    <AlertDescription>
                      <div className="space-y-2">
                        <h4 className="font-semibold">U.S. News Best Senior Living</h4>
                        <p className="text-sm">450,000+ resident and family survey responses from 3,800+ communities</p>
                        <Badge>Free Public Ratings</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-purple-200 bg-purple-50">
                    <AlertDescription>
                      <div className="space-y-2">
                        <h4 className="font-semibold">A Place for Mom</h4>
                        <p className="text-sm">Consumer reviews and facility information with cost data</p>
                        <Badge>Free Consumer Access</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-purple-200 bg-purple-50">
                    <AlertDescription>
                      <div className="space-y-2">
                        <h4 className="font-semibold">AssistedLiving.org</h4>
                        <p className="text-sm">Data-driven research with facility reviews and industry statistics</p>
                        <Badge>Free Resources</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Additional Sources */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-green-600" />
                  Additional Free Sources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Better Business Bureau (BBB)</h4>
                    <p className="text-sm text-gray-600">Business ratings and complaint history</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">State Ombudsman Reports</h4>
                    <p className="text-sm text-gray-600">Complaint investigations and resolutions</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Facebook Community Pages</h4>
                    <p className="text-sm text-gray-600">Local community feedback (with API limitations)</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">SeniorAdvisor.com</h4>
                    <p className="text-sm text-gray-600">Family and resident reviews</p>
                  </div>
                </div>
              </div>

              {/* Implementation Strategy */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Recommended Implementation Strategy
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">1.</span>
                    <span>Start with U.S. News ratings for resident satisfaction data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">2.</span>
                    <span>Integrate Medicare.gov API for health inspection scores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">3.</span>
                    <span>Add state health department data for compliance records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">4.</span>
                    <span>Use AI to aggregate and cross-verify multiple sources</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Map View Comparison
              </CardTitle>
              <CardDescription>
                Compare different map visualization approaches for senior living search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Map Implementation */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Current MySeniorValet Map Features</h3>
                <div className="grid gap-4">
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertDescription>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Interactive Leaflet Map</h4>
                        <ul className="text-sm space-y-1 ml-4">
                          <li>• Real-time clustering with Supercluster</li>
                          <li>• Dynamic zoom levels (cluster → individual markers)</li>
                          <li>• Bottom panel with community list</li>
                          <li>• AI insights panel for communities in view</li>
                          <li>• Dark/light mode toggle</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Comparison with Competitors */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Industry Map Implementations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Feature</th>
                        <th className="text-center p-2">MySeniorValet</th>
                        <th className="text-center p-2">A Place for Mom</th>
                        <th className="text-center p-2">Caring.com</th>
                        <th className="text-center p-2">SeniorLiving.com</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">Clustering</td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">AI Insights</td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                        <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                        <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">Real-time Pricing</td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">List/Map Toggle</td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">Performance (25k+ markers)</td>
                        <td className="text-center p-2"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                        <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                        <td className="text-center p-2"><XCircle className="w-5 h-5 text-gray-400 mx-auto" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Map View Types */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Available Map Views</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-600">Standard Map View</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Street map with landmarks</li>
                      <li>• Community markers with pricing</li>
                      <li>• Cluster numbers</li>
                      <li>• Best for: General browsing</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-600">Satellite View</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Aerial imagery</li>
                      <li>• Building layouts visible</li>
                      <li>• Surrounding area context</li>
                      <li>• Best for: Evaluating location</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 text-purple-600">Heat Map View</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Density visualization</li>
                      <li>• Price range indicators</li>
                      <li>• Quality score overlay</li>
                      <li>• Best for: Market analysis</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 text-orange-600">3D Building View</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 3D building models</li>
                      <li>• Street-level perspective</li>
                      <li>• Virtual tours integration</li>
                      <li>• Best for: Visual exploration</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Unique MySeniorValet Features */}
              <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  MySeniorValet Map Advantages
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>AI-Powered Insights:</strong> Only platform with multi-AI analysis of communities in view</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Intelligent Pricing:</strong> Real-time market estimates eliminate "Contact for pricing"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Performance:</strong> Handles 25,000+ communities smoothly with Supercluster</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Transparency:</strong> Shows HUD verified pricing and market intelligence</span>
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