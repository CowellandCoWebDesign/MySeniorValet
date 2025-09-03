import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Shield, Pill, DollarSign, FileText, CheckCircle, AlertCircle,
  Clock, Calendar, User, CreditCard, Building, Phone, MapPin,
  TrendingUp, Info, Download, Upload, RefreshCw, Link2
} from 'lucide-react';

interface MedicarePharmacyIntegrationProps {
  communityId: number;
  tierLevel: 'professional' | 'premium' | 'enterprise';
}

interface MedicarePlan {
  id: string;
  name: string;
  type: 'Part A' | 'Part B' | 'Part C' | 'Part D';
  premium: number;
  deductible: number;
  coverage: string[];
  copay: { [key: string]: number };
  status: 'active' | 'pending' | 'expired';
}

interface PharmacyConnection {
  id: string;
  name: string;
  type: 'retail' | 'mail-order' | 'specialty';
  network: 'in-network' | 'out-of-network';
  address: string;
  phone: string;
  hours: string;
  connected: boolean;
  lastSync: Date;
}

interface PrescriptionCost {
  medication: string;
  tier: number;
  retailCost: number;
  mailOrderCost: number;
  coverage: 'covered' | 'partial' | 'not-covered';
  priorAuth: boolean;
  alternatives: string[];
}

export function MedicarePharmacyIntegration({ communityId, tierLevel }: MedicarePharmacyIntegrationProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('medicare');
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Fetch Medicare integration status
  const { data: medicareStatus } = useQuery({
    queryKey: [`/api/communities/${communityId}/medicare/status`],
  });

  // Fetch pharmacy connections
  const { data: pharmacyData } = useQuery({
    queryKey: [`/api/communities/${communityId}/pharmacy/connections`],
  });

  // Fetch prescription costs
  const { data: prescriptionCosts } = useQuery({
    queryKey: [`/api/communities/${communityId}/pharmacy/costs`],
  });

  // Sync Medicare data
  const syncMedicareMutation = useMutation({
    mutationFn: async () => {
      setSyncInProgress(true);
      return await apiRequest('POST', `/api/medicare/sync`, {
        communityId
      });
    },
    onSuccess: (data) => {
      setSyncInProgress(false);
      toast({
        title: "Medicare Data Synced",
        description: `Successfully updated ${data.plansUpdated} Medicare plans`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/medicare`] });
    },
    onError: (error: any) => {
      setSyncInProgress(false);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Medicare data",
        variant: "destructive",
      });
    }
  });

  // Connect pharmacy
  const connectPharmacyMutation = useMutation({
    mutationFn: async (pharmacyId: string) => {
      return await apiRequest('POST', `/api/pharmacy/connect`, {
        communityId,
        pharmacyId
      });
    },
    onSuccess: () => {
      toast({
        title: "Pharmacy Connected",
        description: "Successfully connected to pharmacy network",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/pharmacy`] });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to pharmacy",
        variant: "destructive",
      });
    }
  });

  const medicarePlans: MedicarePlan[] = medicareStatus?.plans || [
    {
      id: '1',
      name: 'Medicare Part A - Hospital Insurance',
      type: 'Part A',
      premium: 0,
      deductible: 1632,
      coverage: ['Inpatient hospital care', 'Skilled nursing facility', 'Hospice care', 'Home health care'],
      copay: { 'hospital': 400, 'skilled_nursing': 200 },
      status: 'active'
    },
    {
      id: '2',
      name: 'Medicare Part B - Medical Insurance',
      type: 'Part B',
      premium: 164.90,
      deductible: 226,
      coverage: ['Doctor visits', 'Outpatient care', 'Medical supplies', 'Preventive services'],
      copay: { 'doctor_visit': 20, 'specialist': 40 },
      status: 'active'
    },
    {
      id: '3',
      name: 'Medicare Part D - Prescription Drug Coverage',
      type: 'Part D',
      premium: 32.74,
      deductible: 505,
      coverage: ['Generic drugs', 'Brand-name drugs', 'Specialty medications'],
      copay: { 'generic': 5, 'brand': 40, 'specialty': 100 },
      status: 'active'
    }
  ];

  const pharmacies: PharmacyConnection[] = pharmacyData?.pharmacies || [
    {
      id: '1',
      name: 'CVS Pharmacy',
      type: 'retail',
      network: 'in-network',
      address: '123 Main St, Anytown, USA',
      phone: '(555) 123-4567',
      hours: 'Mon-Fri 9AM-9PM, Sat-Sun 10AM-6PM',
      connected: true,
      lastSync: new Date()
    },
    {
      id: '2',
      name: 'Express Scripts',
      type: 'mail-order',
      network: 'in-network',
      address: 'Mail Order Service',
      phone: '1-800-SCRIPTS',
      hours: '24/7 Mail Order',
      connected: true,
      lastSync: new Date()
    },
    {
      id: '3',
      name: 'Walgreens',
      type: 'retail',
      network: 'in-network',
      address: '456 Oak Ave, Anytown, USA',
      phone: '(555) 987-6543',
      hours: '24 Hours',
      connected: false,
      lastSync: new Date()
    }
  ];

  const costs: PrescriptionCost[] = prescriptionCosts?.costs || [
    {
      medication: 'Metformin 500mg',
      tier: 1,
      retailCost: 4,
      mailOrderCost: 10,
      coverage: 'covered',
      priorAuth: false,
      alternatives: []
    },
    {
      medication: 'Lisinopril 10mg',
      tier: 1,
      retailCost: 4,
      mailOrderCost: 10,
      coverage: 'covered',
      priorAuth: false,
      alternatives: []
    },
    {
      medication: 'Eliquis 5mg',
      tier: 3,
      retailCost: 47,
      mailOrderCost: 141,
      coverage: 'partial',
      priorAuth: true,
      alternatives: ['Warfarin', 'Xarelto']
    }
  ];

  const isMedicareConnected = medicareStatus?.connected || true;
  const totalSavings = medicareStatus?.totalSavings || 12847;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Medicare & Pharmacy Integration
              </CardTitle>
              <CardDescription>
                Manage Medicare plans and pharmacy connections for residents
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isMedicareConnected && (
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                  Medicare Connected
                </Badge>
              )}
              <Badge className="bg-gradient-to-r from-blue-500 to-green-500">
                <DollarSign className="w-3 h-3 mr-1" />
                ${totalSavings.toLocaleString()} Saved YTD
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => syncMedicareMutation.mutate()}
              disabled={syncInProgress}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncInProgress ? 'animate-spin' : ''}`} />
              Sync Medicare Data
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medicare">Medicare Plans</TabsTrigger>
          <TabsTrigger value="pharmacy">Pharmacy Network</TabsTrigger>
          <TabsTrigger value="costs">Drug Costs</TabsTrigger>
        </TabsList>

        {/* Medicare Plans Tab */}
        <TabsContent value="medicare">
          <div className="grid md:grid-cols-2 gap-4">
            {medicarePlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                      {plan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Monthly Premium:</span>
                      <p className="font-semibold text-lg">${plan.premium}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Annual Deductible:</span>
                      <p className="font-semibold text-lg">${plan.deductible}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Coverage Includes:</p>
                    <div className="space-y-1">
                      {plan.coverage.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-2">Typical Copays:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(plan.copay).map(([service, amount]) => (
                        <div key={service} className="flex justify-between">
                          <span className="text-gray-600">{service.replace('_', ' ')}:</span>
                          <span className="font-medium">${amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Medicare Advantage Notice */}
          {tierLevel === 'enterprise' && (
            <Alert className="mt-4">
              <Info className="w-4 h-4" />
              <AlertTitle>Medicare Advantage Available</AlertTitle>
              <AlertDescription>
                Your enterprise tier includes access to Medicare Advantage plan comparisons and enrollment assistance.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Pharmacy Network Tab */}
        <TabsContent value="pharmacy">
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {pharmacies.map((pharmacy) => (
                <Card key={pharmacy.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{pharmacy.name}</CardTitle>
                      <Badge variant={pharmacy.network === 'in-network' ? 'default' : 'secondary'}>
                        {pharmacy.network}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">{pharmacy.type}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3 h-3 text-gray-500 mt-0.5" />
                        <span className="text-gray-600">{pharmacy.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">{pharmacy.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">{pharmacy.hours}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      {pharmacy.connected ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Connected
                          </span>
                          <span className="text-gray-500">
                            Synced {format(pharmacy.lastSync, 'MMM d')}
                          </span>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => connectPharmacyMutation.mutate(pharmacy.id)}
                        >
                          <Link2 className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pharmacy Benefits Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Benefits Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">87%</p>
                    <p className="text-sm text-gray-600">Generic Fill Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">$47</p>
                    <p className="text-sm text-gray-600">Avg. Copay</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">92%</p>
                    <p className="text-sm text-gray-600">In-Network Usage</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">4.2</p>
                    <p className="text-sm text-gray-600">Avg. Medications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Drug Costs Tab */}
        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prescription Drug Costs</CardTitle>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Formulary
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {costs.map((cost, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{cost.medication}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">Tier {cost.tier}</Badge>
                            <Badge variant={cost.coverage === 'covered' ? 'default' : 
                                          cost.coverage === 'partial' ? 'secondary' : 'destructive'}>
                              {cost.coverage}
                            </Badge>
                            {cost.priorAuth && (
                              <Badge variant="outline" className="bg-yellow-50">
                                Prior Auth Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Retail (30-day):</span>
                          <p className="font-semibold text-lg">${cost.retailCost}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Mail Order (90-day):</span>
                          <p className="font-semibold text-lg">${cost.mailOrderCost}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Annual Cost:</span>
                          <p className="font-semibold text-lg">${cost.retailCost * 12}</p>
                        </div>
                      </div>

                      {cost.alternatives.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">Lower-cost alternatives:</p>
                          <div className="flex gap-2 mt-1">
                            {cost.alternatives.map((alt, idx) => (
                              <Badge key={idx} variant="outline" className="bg-green-50">
                                {alt}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Cost Savings Alert */}
          <Alert className="mt-4 border-green-200 bg-green-50">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <AlertTitle className="text-green-900">Potential Savings Identified</AlertTitle>
            <AlertDescription className="text-green-800">
              Switching to generic alternatives and using mail-order pharmacy could save residents an average of $1,247 per year.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}