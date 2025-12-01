import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
  Mail,
  Edit,
  Check,
  X
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
  const printRef = useRef<HTMLDivElement>(null);
  
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

  // Editable pricing state - allows families to customize amounts
  const [roomPrices, setRoomPrices] = useState<Record<string, number>>({
    shared: 2625,
    private: 3500,
    suite: 4375,
    premium: 5250
  });

  const [carePrices, setCarePrices] = useState<Record<string, number>>({
    independent: 0,
    assisted: 800,
    memory: 1500,
    skilled: 2000
  });

  const [servicePrices, setServicePrices] = useState<Record<string, number>>({
    medication: 150,
    physicalTherapy: 300,
    specialDiet: 200,
    laundry: 100,
    transportation: 150,
    beautySalon: 75
  });

  const [aidAmounts, setAidAmounts] = useState<Record<string, number>>({
    veteransBenefits: 1800,
    longTermCareInsurance: 2000,
    medicaid: 3000,
    privateInsurance: 1000
  });

  // Editing state for inline editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');

  // Helper functions for editing
  const startEditing = (field: string, currentValue: number) => {
    setEditingField(field);
    setEditValue(currentValue.toString());
  };

  const saveEdit = (category: 'room' | 'care' | 'service' | 'aid', key: string) => {
    const trimmedValue = editValue.trim();
    
    // Validate - reject empty or invalid values
    if (trimmedValue === '' || isNaN(parseFloat(trimmedValue))) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid number",
        variant: "destructive"
      });
      return;
    }
    
    const numValue = Math.max(0, parseFloat(trimmedValue));
    
    if (category === 'room') {
      setRoomPrices(prev => ({ ...prev, [key]: numValue }));
    } else if (category === 'care') {
      setCarePrices(prev => ({ ...prev, [key]: numValue }));
    } else if (category === 'service') {
      setServicePrices(prev => ({ ...prev, [key]: numValue }));
    } else if (category === 'aid') {
      setAidAmounts(prev => ({ ...prev, [key]: numValue }));
    }
    setEditingField(null);
    setEditValue('');
    toast({
      title: "Price Updated",
      description: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} updated to $${numValue.toLocaleString()}`,
    });
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
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
  const handleShareCalculation = async () => {
    const shareText = `
Senior Living Cost Estimate
===========================
Room Type: ${roomType.charAt(0).toUpperCase() + roomType.slice(1)} - $${roomPrices[roomType].toLocaleString()}/mo
Care Level: ${careLevel.charAt(0).toUpperCase() + careLevel.slice(1)} - $${carePrices[careLevel].toLocaleString()}/mo
${Object.entries(additionalServices).filter(([_, selected]) => selected).map(([service, _]) => 
  `${service.replace(/([A-Z])/g, ' $1').trim()}: $${servicePrices[service]}/mo`
).join('\n')}
---
Monthly Cost: $${netMonthly.toLocaleString()}
Annual Cost: $${annualCost.toLocaleString()}
Move-in Fees: $${totalMoveIn.toLocaleString()}
First Month Total: $${firstMonthTotal.toLocaleString()}
---
Generated by MySeniorValet.com
    `.trim();

    const shareData = {
      title: 'Senior Living Cost Estimate - MySeniorValet',
      text: shareText,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared Successfully",
          description: "Cost estimate has been shared",
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(shareText);
        }
      }
    } else {
      await copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Cost estimate has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Print calculation
  const handlePrintCalculation = () => {
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Senior Living Cost Estimate - MySeniorValet</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px; 
      max-width: 800px; 
      margin: 0 auto;
      color: #333;
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid #2563eb; 
      padding-bottom: 20px; 
      margin-bottom: 30px;
    }
    .header h1 { color: #2563eb; margin: 0; }
    .header p { color: #666; margin-top: 5px; }
    .section { 
      margin-bottom: 25px; 
      padding: 15px; 
      background: #f8fafc; 
      border-radius: 8px;
    }
    .section-title { 
      font-weight: bold; 
      color: #1e40af; 
      margin-bottom: 15px;
      font-size: 16px;
    }
    .row { 
      display: flex; 
      justify-content: space-between; 
      padding: 8px 0; 
      border-bottom: 1px solid #e2e8f0;
    }
    .row:last-child { border-bottom: none; }
    .total-section { 
      background: #2563eb; 
      color: white; 
      padding: 20px; 
      border-radius: 8px; 
      text-align: center;
      margin: 20px 0;
    }
    .total-section .amount { 
      font-size: 36px; 
      font-weight: bold; 
    }
    .summary-box { 
      background: #f1f5f9; 
      padding: 15px; 
      border-radius: 8px; 
    }
    .footer { 
      margin-top: 40px; 
      text-align: center; 
      color: #666; 
      font-size: 12px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .disclaimer { 
      font-style: italic; 
      color: #888; 
      font-size: 11px;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Senior Living Cost Estimate</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <div class="section-title">Room & Care Selection</div>
    <div class="row">
      <span>Room Type: ${roomType.charAt(0).toUpperCase() + roomType.slice(1)}</span>
      <span>$${roomPrices[roomType].toLocaleString()}/month</span>
    </div>
    <div class="row">
      <span>Care Level: ${careLevel.charAt(0).toUpperCase() + careLevel.slice(1)}</span>
      <span>$${carePrices[careLevel].toLocaleString()}/month</span>
    </div>
  </div>

  ${Object.entries(additionalServices).filter(([_, selected]) => selected).length > 0 ? `
  <div class="section">
    <div class="section-title">Additional Services</div>
    ${Object.entries(additionalServices).filter(([_, selected]) => selected).map(([service, _]) => `
      <div class="row">
        <span>${service.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span>$${servicePrices[service].toLocaleString()}/month</span>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${totalAid > 0 ? `
  <div class="section" style="background: #dcfce7;">
    <div class="section-title" style="color: #166534;">Financial Assistance</div>
    ${Object.entries(financialAid).filter(([_, selected]) => selected).map(([aid, _]) => `
      <div class="row">
        <span>${aid.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span style="color: #166534;">-$${aidAmounts[aid].toLocaleString()}/month</span>
      </div>
    `).join('')}
    <div class="row" style="font-weight: bold; color: #166534;">
      <span>Total Assistance</span>
      <span>-$${totalAid.toLocaleString()}/month</span>
    </div>
  </div>
  ` : ''}

  <div class="total-section">
    <div>Net Monthly Cost</div>
    <div class="amount">$${netMonthly.toLocaleString()}</div>
  </div>

  <div class="summary-box">
    <div class="row">
      <span>Annual Cost</span>
      <span style="font-weight: bold;">$${annualCost.toLocaleString()}</span>
    </div>
    <div class="row">
      <span>Move-in Fees</span>
      <span style="font-weight: bold;">$${totalMoveIn.toLocaleString()}</span>
    </div>
    <div class="row" style="font-weight: bold; font-size: 18px;">
      <span>First Month Total</span>
      <span>$${firstMonthTotal.toLocaleString()}</span>
    </div>
  </div>

  <div class="footer">
    <p>Powered by <strong>MySeniorValet.com</strong></p>
    <p class="disclaimer">This is an estimate. Final costs may vary based on specific care needs and assessment. Contact the community directly for exact pricing.</p>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for the document to fully load before printing
      printWindow.onload = () => {
        printWindow.print();
      };
      
      // Fallback timeout in case onload doesn't fire
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.print();
        }
      }, 500);
      
      toast({
        title: "Print Preview",
        description: "Print dialog should open shortly",
      });
    } else {
      toast({
        title: "Print Failed",
        description: "Please allow pop-ups to print the estimate",
        variant: "destructive"
      });
    }
  };

  // Email to family
  const handleEmailToFamily = () => {
    const subject = encodeURIComponent('Senior Living Cost Estimate - MySeniorValet');
    
    // Build email body as individual lines - each will be encoded separately
    const selectedServices = Object.entries(additionalServices)
      .filter(([_, selected]) => selected)
      .map(([service, _]) => `  ${service.replace(/([A-Z])/g, ' $1').trim()}: $${servicePrices[service]}/mo`);
    
    const bodyLines: string[] = [
      'Hi,',
      '',
      'I wanted to share this senior living cost estimate with you:',
      '',
      `Room Type: ${roomType.charAt(0).toUpperCase() + roomType.slice(1)} - $${roomPrices[roomType].toLocaleString()}/mo`,
      `Care Level: ${careLevel.charAt(0).toUpperCase() + careLevel.slice(1)} - $${carePrices[careLevel].toLocaleString()}/mo`,
    ];
    
    // Add each service as a separate line (not pre-joined)
    if (selectedServices.length > 0) {
      bodyLines.push('', 'Additional Services:');
      bodyLines.push(...selectedServices);
    }
    
    bodyLines.push(
      '',
      '---',
      `Monthly Cost: $${netMonthly.toLocaleString()}`,
      `Annual Cost: $${annualCost.toLocaleString()}`,
      `Move-in Fees: $${totalMoveIn.toLocaleString()}`,
      `First Month Total: $${firstMonthTotal.toLocaleString()}`,
      '',
      `View the full calculator at: ${window.location.href}`,
      '',
      'This estimate was generated using MySeniorValet.com - The trusted platform for authentic senior living community information.',
      '',
      'Note: This is an estimate. Final costs may vary based on specific care needs and assessment.'
    );
    
    // Encode each line individually, then join with CRLF line breaks
    const body = bodyLines.map(line => encodeURIComponent(line)).join('%0D%0A');

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    toast({
      title: "Email Client Opened",
      description: "Your email client should open with the cost estimate",
    });
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
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Home className="mr-2 h-5 w-5" />
                  Room Type
                </span>
                <span className="text-xs text-gray-500 font-normal flex items-center">
                  <Edit className="w-3 h-3 mr-1" />
                  Tap price to edit
                </span>
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
                    data-testid={`room-type-${type}`}
                  >
                    <p className="font-semibold capitalize">{type}</p>
                    {editingField === `room-${type}` ? (
                      <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">$</span>
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 w-24 text-lg font-bold"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit('room', type);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          data-testid={`room-price-input-${type}`}
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6" 
                          onClick={() => saveEdit('room', type)}
                          data-testid={`room-price-save-${type}`}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6" 
                          onClick={cancelEdit}
                          data-testid={`room-price-cancel-${type}`}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <p 
                        className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-text"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(`room-${type}`, price);
                        }}
                        data-testid={`room-price-display-${type}`}
                      >
                        ${price.toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Care Level Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Heart className="mr-2 h-5 w-5" />
                  Care Level
                </span>
                <span className="text-xs text-gray-500 font-normal flex items-center">
                  <Edit className="w-3 h-3 mr-1" />
                  Tap price to edit
                </span>
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
                    data-testid={`care-level-${level}`}
                  >
                    <p className="font-semibold capitalize">{level} Living</p>
                    {editingField === `care-${level}` ? (
                      <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">+$</span>
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 w-24 text-lg font-bold"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit('care', level);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          data-testid={`care-price-input-${level}`}
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6" 
                          onClick={() => saveEdit('care', level)}
                          data-testid={`care-price-save-${level}`}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6" 
                          onClick={cancelEdit}
                          data-testid={`care-price-cancel-${level}`}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <p 
                        className="text-xl font-bold text-green-600 dark:text-green-400 hover:underline cursor-text"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(`care-${level}`, price);
                        }}
                        data-testid={`care-price-display-${level}`}
                      >
                        {price > 0 ? `+$${price.toLocaleString()}` : 'Included'}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">care services</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Additional Services
                </span>
                <span className="text-xs text-gray-500 font-normal flex items-center">
                  <Edit className="w-3 h-3 mr-1" />
                  Tap price to edit
                </span>
              </CardTitle>
              <CardDescription>Select any additional services needed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(servicePrices).map(([service, price]) => (
                  <div key={service} className="flex items-center space-x-2" data-testid={`service-${service}`}>
                    <Checkbox
                      id={service}
                      checked={additionalServices[service as keyof typeof additionalServices]}
                      onCheckedChange={(checked) => 
                        setAdditionalServices(prev => ({ ...prev, [service]: checked }))
                      }
                      data-testid={`service-checkbox-${service}`}
                    />
                    <Label 
                      htmlFor={service} 
                      className="flex-1 cursor-pointer flex justify-between items-center"
                    >
                      <span className="capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {editingField === `service-${service}` ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-sm font-semibold">+$</span>
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-6 w-16 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit('service', service);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            data-testid={`service-price-input-${service}`}
                          />
                          <span className="text-sm">/mo</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-5 w-5" 
                            onClick={() => saveEdit('service', service)}
                            data-testid={`service-price-save-${service}`}
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-5 w-5" 
                            onClick={cancelEdit}
                            data-testid={`service-price-cancel-${service}`}
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <span 
                          className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:underline cursor-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            startEditing(`service-${service}`, price);
                          }}
                          data-testid={`service-price-display-${service}`}
                        >
                          +${price}/mo
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Aid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Financial Assistance
                </span>
                <span className="text-xs text-gray-500 font-normal flex items-center">
                  <Edit className="w-3 h-3 mr-1" />
                  Tap amount to edit
                </span>
              </CardTitle>
              <CardDescription>Select applicable financial aid programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(aidAmounts).map(([aid, amount]) => (
                  <div key={aid} className="flex items-center space-x-2" data-testid={`aid-${aid}`}>
                    <Checkbox
                      id={aid}
                      checked={financialAid[aid as keyof typeof financialAid]}
                      onCheckedChange={(checked) => 
                        setFinancialAid(prev => ({ ...prev, [aid]: checked }))
                      }
                      data-testid={`aid-checkbox-${aid}`}
                    />
                    <Label 
                      htmlFor={aid} 
                      className="flex-1 cursor-pointer flex justify-between items-center"
                    >
                      <span className="capitalize">
                        {aid.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {editingField === `aid-${aid}` ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">-$</span>
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-6 w-16 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit('aid', aid);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            data-testid={`aid-price-input-${aid}`}
                          />
                          <span className="text-sm">/mo</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-5 w-5" 
                            onClick={() => saveEdit('aid', aid)}
                            data-testid={`aid-price-save-${aid}`}
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-5 w-5" 
                            onClick={cancelEdit}
                            data-testid={`aid-price-cancel-${aid}`}
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <span 
                          className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline cursor-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            startEditing(`aid-${aid}`, amount);
                          }}
                          data-testid={`aid-price-display-${aid}`}
                        >
                          -${amount}/mo
                        </span>
                      )}
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
                    <Button className="w-full" onClick={handleSaveCalculation} data-testid="button-save-estimate">
                      <Save className="mr-2 h-4 w-4" />
                      Save Estimate
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleShareCalculation} data-testid="button-share">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleEmailToFamily} data-testid="button-email-family">
                      <Mail className="mr-2 h-4 w-4" />
                      Email to Family
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handlePrintCalculation} data-testid="button-print">
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full" onClick={handleSaveCalculation} data-testid="button-update-pricing">
                      <Save className="mr-2 h-4 w-4" />
                      Update Pricing
                    </Button>
                    <Button variant="outline" className="w-full" data-testid="button-preview-public">
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