import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calculator,
  DollarSign,
  Home,
  Heart,
  Utensils,
  Activity,
  Shield,
  HelpCircle,
  TrendingUp,
  Info,
  Download,
  Share2,
  Save,
  Printer,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DualSidedCostCalculatorProps {
  viewMode: 'community' | 'family';
  communityId?: number;
  prefilledData?: {
    baseRent?: number;
    careLevel?: string;
    roomType?: string;
  };
}

export default function DualSidedCostCalculator({ 
  viewMode, 
  communityId,
  prefilledData 
}: DualSidedCostCalculatorProps) {
  const { toast } = useToast();
  
  // Calculator state
  const [roomType, setRoomType] = useState(prefilledData?.roomType || 'private');
  const [careLevel, setCareLevel] = useState(prefilledData?.careLevel || 'assisted');
  const [baseRent, setBaseRent] = useState(prefilledData?.baseRent || 3500);
  const [additionalServices, setAdditionalServices] = useState({
    medication: false,
    physicalTherapy: false,
    specialDiet: false,
    laundry: false,
    transportation: false,
    beautySalon: false
  });
  const [financialAid, setFinancialAid] = useState({
    veteransBenefits: false,
    longTermCareInsurance: false,
    medicaid: false,
    privateInsurance: false
  });
  const [moveInFees, setMoveInFees] = useState({
    communityFee: 2500,
    deposit: 0,
    petDeposit: 0
  });

  // Pricing calculations
  const roomPrices = {
    shared: baseRent * 0.75,
    private: baseRent,
    suite: baseRent * 1.25,
    premium: baseRent * 1.5
  };

  const carePrices = {
    independent: 0,
    assisted: 800,
    memory: 1500,
    skilled: 2000
  };

  const servicePrices = {
    medication: 150,
    physicalTherapy: 300,
    specialDiet: 200,
    laundry: 100,
    transportation: 150,
    beautySalon: 75
  };

  const aidAmounts = {
    veteransBenefits: 1800,
    longTermCareInsurance: 2000,
    medicaid: 3000,
    privateInsurance: 1000
  };

  // Calculate totals
  const calculateMonthlyTotal = () => {
    let total = roomPrices[roomType] + carePrices[careLevel];
    
    Object.entries(additionalServices).forEach(([service, selected]) => {
      if (selected) {
        total += servicePrices[service];
      }
    });

    return total;
  };

  const calculateFinancialAid = () => {
    let total = 0;
    Object.entries(financialAid).forEach(([aid, selected]) => {
      if (selected) {
        total += aidAmounts[aid];
      }
    });
    return total;
  };

  const monthlyTotal = calculateMonthlyTotal();
  const totalAid = calculateFinancialAid();
  const netMonthly = Math.max(0, monthlyTotal - totalAid);
  const annualCost = netMonthly * 12;
  const totalMoveIn = moveInFees.communityFee + moveInFees.deposit + moveInFees.petDeposit;
  const firstMonthTotal = netMonthly + totalMoveIn;

  // Save calculation
  const handleSaveCalculation = () => {
    const calculation = {
      roomType,
      careLevel,
      monthlyTotal,
      totalAid,
      netMonthly,
      annualCost,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage or API
    localStorage.setItem('savedCalculation', JSON.stringify(calculation));
    
    toast({
      title: "Calculation Saved",
      description: "Your cost estimate has been saved for future reference",
    });
  };

  // Share calculation
  const handleShareCalculation = () => {
    const shareData = {
      title: 'Senior Living Cost Estimate',
      text: `Monthly cost: $${netMonthly.toLocaleString()}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`Senior Living Cost Estimate\nMonthly: $${netMonthly.toLocaleString()}\nAnnual: $${annualCost.toLocaleString()}`);
      toast({
        title: "Copied to Clipboard",
        description: "Cost estimate has been copied to your clipboard",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header based on view mode */}
      {viewMode === 'community' ? (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">Community View:</span> Configure pricing and view how families will calculate their costs. Changes here update the public calculator.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <Heart className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">Family View:</span> Calculate estimated costs with full transparency. All pricing is provided directly by the community.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Room Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(roomPrices).map(([type, price]) => (
                  <div
                    key={type}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      roomType === type 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setRoomType(type)}
                  >
                    <p className="font-semibold capitalize">{type}</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Care Level Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                Care Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(carePrices).map(([level, price]) => (
                  <div
                    key={level}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      careLevel === level 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setCareLevel(level)}
                  >
                    <p className="font-semibold capitalize">{level} Living</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {price > 0 ? `+$${price.toLocaleString()}` : 'Included'}
                    </p>
                    <p className="text-xs text-gray-500">care services</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Additional Services
              </CardTitle>
              <CardDescription>Select any additional services needed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(servicePrices).map(([service, price]) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={additionalServices[service]}
                      onCheckedChange={(checked) => 
                        setAdditionalServices(prev => ({ ...prev, [service]: checked }))
                      }
                    />
                    <Label 
                      htmlFor={service} 
                      className="flex-1 cursor-pointer flex justify-between items-center"
                    >
                      <span className="capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        +${price}/mo
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Aid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Financial Assistance
              </CardTitle>
              <CardDescription>Select applicable financial aid programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(aidAmounts).map(([aid, amount]) => (
                  <div key={aid} className="flex items-center space-x-2">
                    <Checkbox
                      id={aid}
                      checked={financialAid[aid]}
                      onCheckedChange={(checked) => 
                        setFinancialAid(prev => ({ ...prev, [aid]: checked }))
                      }
                    />
                    <Label 
                      htmlFor={aid} 
                      className="flex-1 cursor-pointer flex justify-between items-center"
                    >
                      <span className="capitalize">
                        {aid.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        -${amount}/mo
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Move-in Fees */}
          <Card>
            <CardHeader>
              <CardTitle>One-Time Move-In Fees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Community Fee</Label>
                <Input 
                  type="number" 
                  value={moveInFees.communityFee}
                  onChange={(e) => setMoveInFees(prev => ({ 
                    ...prev, 
                    communityFee: parseFloat(e.target.value) || 0 
                  }))}
                  disabled={viewMode === 'family'}
                />
              </div>
              <div>
                <Label>Security Deposit</Label>
                <Input 
                  type="number" 
                  value={moveInFees.deposit}
                  onChange={(e) => setMoveInFees(prev => ({ 
                    ...prev, 
                    deposit: parseFloat(e.target.value) || 0 
                  }))}
                  disabled={viewMode === 'family'}
                />
              </div>
              <div>
                <Label>Pet Deposit (if applicable)</Label>
                <Input 
                  type="number" 
                  value={moveInFees.petDeposit}
                  onChange={(e) => setMoveInFees(prev => ({ 
                    ...prev, 
                    petDeposit: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Summary */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Monthly Breakdown */}
              <div className="space-y-2 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span>Room ({roomType})</span>
                  <span>${roomPrices[roomType].toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Care Level ({careLevel})</span>
                  <span>${carePrices[careLevel].toLocaleString()}</span>
                </div>
                {Object.entries(additionalServices).map(([service, selected]) => 
                  selected && (
                    <div key={service} className="flex justify-between text-sm">
                      <span className="capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>${servicePrices[service].toLocaleString()}</span>
                    </div>
                  )
                )}
                <div className="flex justify-between font-semibold pt-2">
                  <span>Monthly Subtotal</span>
                  <span>${monthlyTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Financial Aid */}
              {totalAid > 0 && (
                <div className="space-y-2 pb-4 border-b">
                  {Object.entries(financialAid).map(([aid, selected]) => 
                    selected && (
                      <div key={aid} className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span className="capitalize">{aid.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span>-${aidAmounts[aid].toLocaleString()}</span>
                      </div>
                    )
                  )}
                  <div className="flex justify-between font-semibold text-green-600 dark:text-green-400 pt-2">
                    <span>Total Assistance</span>
                    <span>-${totalAid.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Net Monthly */}
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Net Monthly Cost</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${netMonthly.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Annual Cost</span>
                    <span className="font-semibold">${annualCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Move-in Fees</span>
                    <span className="font-semibold">${totalMoveIn.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span>First Month Total</span>
                    <span className="font-bold text-lg">${firstMonthTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {viewMode === 'family' ? (
                  <>
                    <Button className="w-full" onClick={handleSaveCalculation}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Estimate
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleShareCalculation}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Email to Family
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Update Pricing
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="mr-2 h-4 w-4" />
                      Preview Public View
                    </Button>
                  </>
                )}
              </div>

              {/* Help Section */}
              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertDescription>
                  {viewMode === 'family' 
                    ? "This is an estimate. Final costs may vary based on specific care needs and assessment."
                    : "Families see this calculator on your public profile. Keep pricing updated for transparency."
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}