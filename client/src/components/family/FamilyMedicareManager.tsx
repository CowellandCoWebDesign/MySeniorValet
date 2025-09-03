import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Shield, Pill, DollarSign, FileText, CheckCircle, AlertCircle,
  Clock, Calendar, User, CreditCard, Building, Phone, MapPin,
  TrendingUp, Info, Search, Calculator, Heart, Star, HelpCircle
} from 'lucide-react';

interface FamilyMedicareManagerProps {
  userId?: string;
  residentName?: string;
}

interface MedicationSearch {
  name: string;
  genericName: string;
  tier: number;
  monthlyRetailCost: number;
  monthly90DayCost: number;
  coverage: 'covered' | 'partial' | 'not-covered';
  priorAuth: boolean;
  alternatives: string[];
}

export function FamilyMedicareManager({ userId, residentName }: FamilyMedicareManagerProps) {
  const [medicationSearch, setMedicationSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Fetch user's Medicare information
  const { data: medicareInfo } = useQuery({
    queryKey: [`/api/users/${userId}/medicare`],
    enabled: !!userId,
  });

  // Fetch nearby pharmacies
  const { data: nearbyPharmacies } = useQuery({
    queryKey: [`/api/pharmacies/nearby`, zipCode],
    enabled: !!zipCode && zipCode.length === 5,
  });

  // Search medication costs
  const { data: medicationResults } = useQuery({
    queryKey: [`/api/medications/search`, medicationSearch],
    enabled: medicationSearch.length > 2,
  });

  const currentPlans = medicareInfo?.plans || [
    { type: 'Part A', status: 'Active', premium: 0 },
    { type: 'Part B', status: 'Active', premium: 164.90 },
    { type: 'Part D', status: 'Active', premium: 32.74, planName: 'SilverScript Choice' }
  ];

  const monthlyMedications = [
    { name: 'Metformin 500mg', quantity: 60, cost: 4, savings: 36 },
    { name: 'Lisinopril 10mg', quantity: 30, cost: 4, savings: 21 },
    { name: 'Atorvastatin 20mg', quantity: 30, cost: 10, savings: 180 }
  ];

  const totalMonthlyCost = monthlyMedications.reduce((sum, med) => sum + med.cost, 0);
  const totalAnnualSavings = monthlyMedications.reduce((sum, med) => sum + (med.savings * 12), 0);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Medicare & Prescription Manager
              </CardTitle>
              <CardDescription>
                {residentName ? `Managing benefits for ${residentName}` : 'Manage your Medicare benefits and track medication costs'}
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-green-500">
              <DollarSign className="w-3 h-3 mr-1" />
              ${totalAnnualSavings.toLocaleString()} Annual Savings
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medications">My Medications</TabsTrigger>
          <TabsTrigger value="pharmacies">Find Pharmacies</TabsTrigger>
          <TabsTrigger value="calculator">Cost Calculator</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Current Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Medicare Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentPlans.map((plan, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${plan.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <p className="font-medium">Medicare {plan.type}</p>
                        {plan.planName && (
                          <p className="text-sm text-gray-600">{plan.planName}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${plan.premium}/mo</p>
                      <Badge variant="outline" className="text-xs">
                        {plan.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Monthly Premium:</span>
                    <span className="font-bold text-lg">
                      ${currentPlans.reduce((sum, plan) => sum + plan.premium, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Medicare Card
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calculator className="w-4 h-4 mr-2" />
                  Estimate Community Costs
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Find Coverage Gaps
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Medicare Help Line
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Medication Costs */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Monthly Medication Summary</CardTitle>
                  <Badge variant="outline">
                    ${totalMonthlyCost}/month
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyMedications.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Pill className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-gray-600">Qty: {med.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${med.cost}</p>
                        <p className="text-xs text-green-600">Save ${med.savings}/mo</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Medications Tab */}
        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <CardTitle>Medication List & Cost Tracker</CardTitle>
              <CardDescription>
                Track your prescriptions and compare costs across pharmacies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Medication Search */}
              <div className="mb-6">
                <Label htmlFor="med-search">Search for a medication</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="med-search"
                    placeholder="Enter medication name..."
                    value={medicationSearch}
                    onChange={(e) => setMedicationSearch(e.target.value)}
                  />
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {medicationResults && (
                <Alert className="mb-4">
                  <Info className="w-4 h-4" />
                  <AlertTitle>Cost Comparison</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span>Your pharmacy (CVS):</span>
                        <span className="font-bold">$47/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mail order (90-day):</span>
                        <span className="font-bold text-green-600">$120 (Save $21)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Generic alternative:</span>
                        <span className="font-bold text-green-600">$10/month</span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Current Medications */}
              <div className="space-y-3">
                <h3 className="font-semibold mb-3">Your Current Medications</h3>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {monthlyMedications.map((med, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{med.name}</h4>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p>Prescriber: Dr. Smith</p>
                              <p>Last filled: {format(new Date(), 'MMM d, yyyy')}</p>
                              <p>Next refill: {format(new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), 'MMM d')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-2">Tier 1</Badge>
                            <p className="font-bold text-lg">${med.cost}</p>
                            <p className="text-sm text-gray-600">with Part D</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Refill</Button>
                            <Button size="sm" variant="outline">Find Cheaper</Button>
                            <Button size="sm" variant="outline">Set Reminder</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Find Pharmacies Tab */}
        <TabsContent value="pharmacies">
          <Card>
            <CardHeader>
              <CardTitle>Find In-Network Pharmacies</CardTitle>
              <CardDescription>
                Locate pharmacies that accept your Medicare Part D plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="zipcode">Enter ZIP Code</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="zipcode"
                    placeholder="12345"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    maxLength={5}
                  />
                  <Button>
                    <MapPin className="w-4 h-4 mr-2" />
                    Search Nearby
                  </Button>
                </div>
              </div>

              {/* Pharmacy Results */}
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        CVS Pharmacy
                        <Badge className="bg-green-100 text-green-800">In-Network</Badge>
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">123 Main St, Anytown, USA</p>
                      <p className="text-sm text-gray-600">0.5 miles away</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          (555) 123-4567
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Open until 9 PM
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">4.5</span>
                      </div>
                      <p className="text-xs text-gray-600">247 reviews</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Preferred pharmacy - Extra savings on Tier 1 & 2 drugs
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        Walgreens
                        <Badge className="bg-green-100 text-green-800">In-Network</Badge>
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">456 Oak Ave, Anytown, USA</p>
                      <p className="text-sm text-gray-600">0.8 miles away</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          (555) 987-6543
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          24 Hours
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">4.3</span>
                      </div>
                      <p className="text-xs text-gray-600">189 reviews</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Express Scripts Mail Order
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Save up to 30% on 90-day supplies of maintenance medications
                  </p>
                  <Button size="sm" className="mt-3">
                    Set Up Mail Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Calculator Tab */}
        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>Medicare Cost Calculator</CardTitle>
              <CardDescription>
                Estimate your out-of-pocket costs at different communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Community Comparison */}
                <div>
                  <h3 className="font-semibold mb-3">Compare Community Costs</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold">Sunrise Senior Living</h4>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly base cost:</span>
                          <span className="font-medium">$4,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medicare coverage:</span>
                          <span className="font-medium text-green-600">-$850</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medication management:</span>
                          <span className="font-medium">$200</span>
                        </div>
                        <div className="pt-2 border-t flex justify-between">
                          <span className="font-semibold">Your cost:</span>
                          <span className="font-bold text-lg">$3,850/mo</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold">Brookdale Place</h4>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly base cost:</span>
                          <span className="font-medium">$3,800</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medicare coverage:</span>
                          <span className="font-medium text-green-600">-$750</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medication management:</span>
                          <span className="font-medium">$150</span>
                        </div>
                        <div className="pt-2 border-t flex justify-between">
                          <span className="font-semibold">Your cost:</span>
                          <span className="font-bold text-lg">$3,200/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Annual Projection */}
                <Alert>
                  <TrendingUp className="w-4 h-4" />
                  <AlertTitle>Annual Cost Projection</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Medicare Premiums:</p>
                        <p className="font-bold">$2,374/year</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Prescription Costs:</p>
                        <p className="font-bold">$216/year</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Healthcare:</p>
                        <p className="font-bold text-lg">$2,590/year</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Help Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4" />
                    Need Help Understanding Your Benefits?
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Our Medicare advisors can help you maximize your coverage and minimize costs.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Phone className="w-3 h-3 mr-1" />
                      Call 1-800-MEDICARE
                    </Button>
                    <Button size="sm" variant="outline">
                      Schedule Consultation
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}