import { Check, Star, Zap, Brain, Building2, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            THE KRAKEN AWAKENS
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            MySeniorValet Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            The $50M AI-Powered Senior Care Intelligence Platform
          </p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
            ✨ Families Are ALWAYS FREE ✨
          </p>
        </div>

        {/* Revenue Target Banner */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm opacity-90">Monthly Target</p>
              <p className="text-3xl font-bold">$210,000</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Annual Base</p>
              <p className="text-3xl font-bold">$2.52M</p>
            </div>
            <div>
              <p className="text-sm opacity-90">With 15% Growth</p>
              <p className="text-3xl font-bold">$5.3M</p>
            </div>
          </div>
        </div>

        {/* Tier Tabs */}
        <Tabs defaultValue="professional" className="mt-12">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="family">
              <Star className="w-4 h-4 mr-2" />
              Family
            </TabsTrigger>
            <TabsTrigger value="professional">
              <Users className="w-4 h-4 mr-2" />
              Professional
            </TabsTrigger>
            <TabsTrigger value="community">
              <Building2 className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger value="enterprise">
              <Zap className="w-4 h-4 mr-2" />
              Enterprise
            </TabsTrigger>
            <TabsTrigger value="api">
              <Brain className="w-4 h-4 mr-2" />
              API
            </TabsTrigger>
          </TabsList>

          {/* Family Tier (Always Free) */}
          <TabsContent value="family">
            <Card className="border-2 border-green-500">
              <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                <CardTitle className="text-3xl">Family Access</CardTitle>
                <CardDescription className="text-xl">
                  <span className="text-green-600 font-bold">ALWAYS FREE</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Full Platform Access</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Unified AI Search (Claude, ChatGPT, Perplexity)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Neural network semantic understanding</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Unlimited searches & saved communities</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Tour scheduling & emergency contacts</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Trilingual support (English, French, Spanish)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Complete Transparency</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Real pricing without paywalls</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>35,000+ communities nationwide</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Photos, reviews, availability</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Comparison tables & messaging</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Map visualization & filters</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600">
                  Start Free Now
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Professional Tiers */}
          <TabsContent value="professional">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Starter */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Starter</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$99</span>/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Professional dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>10 client management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Market analysis & territory reports</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>10 bulk exports/month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Calendar sync</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Growth */}
              <Card className="border-2 border-blue-500 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">MOST POPULAR</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Professional Growth</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$299</span>/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>50 client management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>White label & branded reports</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Predictive analytics & AI modeling</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>View all Matterport 3D tours</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>5 team members</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Scale */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Scale</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$699</span>/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Unlimited clients</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Embed 3D tours in reports</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>10,000 API calls included</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>AI lead scoring & sentiment</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Full CRM integration suite</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Dedicated account manager</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Community Tiers */}
          <TabsContent value="community">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Essential */}
              <Card>
                <CardHeader>
                  <CardTitle>Community Essential</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$99</span>/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Enhanced listing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>10 photo gallery</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Pricing & availability display</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>View analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Standard search ranking</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className="border-2 border-purple-500 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">INCLUDES 3D TOUR</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Community Premium</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$299</span>/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Sparkles className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold">1 Matterport 3D tour included</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Unlimited photos & videos</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Featured search ranking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Tour scheduler & messaging</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>CRM integration (Aline, Yardi)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Advanced analytics & insights</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Enterprise */}
              <Card>
                <CardHeader>
                  <CardTitle>Community Enterprise</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$599</span>/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Sparkles className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold">5 Matterport 3D tours included</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Platinum search ranking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>All 6 RMS integrations</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Revenue optimization AI</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Multi-property management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Dedicated success manager</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enterprise Tiers */}
          <TabsContent value="enterprise">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Healthcare */}
              <Card>
                <CardHeader>
                  <CardTitle>Healthcare System</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$2,499</span>/month
                    <br />
                    <span className="text-sm">+ $5,000 setup</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Hospital data integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>EHR integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Discharge planning AI</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>HIPAA compliant</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>100,000 API calls</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Insurance */}
              <Card>
                <CardHeader>
                  <CardTitle>Insurance Network</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$4,999</span>/month
                    <br />
                    <span className="text-sm">+ $10,000 setup</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Claims integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Risk assessment AI</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Fraud detection</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Actuarial modeling</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>500,000 API calls</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Government */}
              <Card>
                <CardHeader>
                  <CardTitle>Government Agency</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$9,999</span>/month
                    <br />
                    <span className="text-sm">+ $25,000 setup</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>FedRAMP compliant</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>On-premise option</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Custom security</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Legislative reporting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Dedicated infrastructure</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Tiers */}
          <TabsContent value="api">
            <div className="space-y-8">
              {/* Standard API */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Standard API Access</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Developer API</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold">$99</span>/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>10,000 API calls</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>$0.02 per extra call</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Basic endpoints</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Business API</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold">$499</span>/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>100,000 API calls</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>$0.01 per extra call</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Webhooks & bulk export</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Enterprise API</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold">$2,499</span>/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>1,000,000 API calls</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>$0.005 per extra call</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Custom endpoints & SLA</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Neural API (The Kraken) */}
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  <Brain className="inline-block w-8 h-8 mr-2 text-purple-600" />
                  Neural API (The Kraken Brain)
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle>Neural Basic</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold">$999</span>/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Brain className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>1,000 neural calls</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>$0.10 per extra call</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>AI search & insights</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-500 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-500 text-white">FULL AI SUITE</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle>Neural Advanced</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold">$4,999</span>/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Brain className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>10,000 neural calls</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Claude, ChatGPT, Perplexity</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Predictive models</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Custom AI training</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle>Neural Unlimited</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold">$19,999</span>/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Brain className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Unlimited neural calls</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>White-label AI</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Dedicated GPU</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Custom AI models</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Revolution?</h2>
          <p className="text-xl mb-6">Experience the power of The Kraken - the AI brain of senior care</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
              Schedule Demo
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}