import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Home, 
  Calculator, 
  DollarSign, 
  TrendingUp,
  MapPin,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { Link } from "wouter";
import { PricingIntelligenceSelector } from "@/components/pricing-intelligence-selector";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function Costs() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [careLevel, setCareLevel] = useState<string>("");
  const [affordabilityResult, setAffordabilityResult] = useState<any>(null);
  const [customHomeCosts, setCustomHomeCosts] = useState({
    rent: 2000,
    utilities: 200,
    exteriorMaintenance: 150,
    interiorMaintenance: 200,
    housekeeping: 200,
    linenService: 50,
    transportation: 300,
    groceries: 400,
    homecare: 800,
    activities: 100,
    entertainment: 100,
    enrichedLife: 0,
    emergencyService: 50,
    buildingSecurity: 0,
    healthcare: 300,
    misc: 200
  });
  const [isCustomizing, setIsCustomizing] = useState(false);

  const stateAverages = {
    "California": {
      independentLiving: { min: 2800, max: 5500 },
      assistedLiving: { min: 4200, max: 8500 },
      memorycare: { min: 5500, max: 12000 },
      skilled: { min: 8000, max: 15000 }
    },
    "Texas": {
      independentLiving: { min: 2200, max: 4200 },
      assistedLiving: { min: 3500, max: 6800 },
      memorycare: { min: 4800, max: 9500 },
      skilled: { min: 6500, max: 12000 }
    },
    "Florida": {
      independentLiving: { min: 2400, max: 4800 },
      assistedLiving: { min: 3800, max: 7200 },
      memorycare: { min: 5200, max: 10500 },
      skilled: { min: 7000, max: 13500 }
    },
    "Arizona": {
      independentLiving: { min: 2600, max: 4600 },
      assistedLiving: { min: 3900, max: 6900 },
      memorycare: { min: 5100, max: 9800 },
      skilled: { min: 6800, max: 12800 }
    }
  };

  const careTypeLabels = {
    "independentLiving": "Independent Living",
    "assistedLiving": "Assisted Living",
    "memorycare": "Memory Care",
    "skilled": "Skilled Nursing"
  };

  const calculateAffordability = () => {
    if (!monthlyIncome || !selectedState || !careLevel) return;

    const income = parseFloat(monthlyIncome);
    const stateData = stateAverages[selectedState as keyof typeof stateAverages];
    const careData = stateData[careLevel as keyof typeof stateData];

    const recommendedBudget = income * 0.3; // 30% rule
    const maxBudget = income * 0.4; // 40% maximum

    const affordable = recommendedBudget >= careData.min;
    const stretchAffordable = maxBudget >= careData.min;

    // Calculate at-home costs for comparison
    const atHomeCosts = {
      rent: Math.floor(income * 0.25), // 25% of income for housing
      utilities: 200,
      exteriorMaintenance: 150,
      interiorMaintenance: 200,
      housekeeping: 200,
      linenService: 50,
      transportation: 300,
      groceries: 400,
      homecare: careLevel === 'memorycare' ? 3500 : careLevel === 'assistedLiving' ? 2500 : careLevel === 'skilled' ? 4500 : 1500,
      activities: 100,
      entertainment: 100,
      enrichedLife: 150,
      emergencyService: 100,
      buildingSecurity: 200,
      healthcare: 500,
      misc: 300
    };
    
    const totalAtHomeCosts = Object.values(atHomeCosts).reduce((sum, cost) => sum + cost, 0);
    const seniorLivingAverage = Math.floor((careData.min + careData.max) / 2);
    const monthlySavings = totalAtHomeCosts - seniorLivingAverage;
    const yearlyDifference = monthlySavings * 12;

    setAffordabilityResult({
      income,
      recommendedBudget,
      maxBudget,
      careData,
      affordable,
      stretchAffordable,
      state: selectedState,
      careType: careTypeLabels[careLevel as keyof typeof careTypeLabels],
      atHomeCosts,
      totalAtHomeCosts,
      seniorLivingAverage,
      monthlySavings,
      yearlyDifference
    });
  };

  const moveInCosts = [
    { item: "Community Deposit", range: "$1,000 - $5,000", description: "Refundable security deposit" },
    { item: "First Month's Rent", range: "$2,500 - $8,000", description: "Based on care level and location" },
    { item: "Community Fee", range: "$500 - $2,500", description: "One-time entrance fee" },
    { item: "Care Assessment", range: "$200 - $800", description: "Initial health evaluation" },
    { item: "Moving Services", range: "$800 - $3,500", description: "Professional moving assistance" },
    { item: "Setup & Utilities", range: "$300 - $1,200", description: "Phone, internet, cable setup" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Cost Explorer" 
        subtitle="Move-in Costs & Affordability Calculator"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Featured Cost Comparison Table - Always Visible */}
        <div className="mb-8">
          <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center text-2xl font-bold">
                <MapPin className="w-8 h-8 mr-3" />
                Monthly Living Expenses: Your Home vs Senior Living
              </CardTitle>
              <p className="text-sm opacity-90 mt-2">Compare real costs to see the value of senior living communities</p>
            </CardHeader>
            <CardContent className="p-6">
              {/* Header Row */}
              <div className="grid grid-cols-3 gap-4 mb-4 pb-3 border-b-2 border-gray-300 dark:border-gray-600">
                <div className="font-bold text-gray-800 dark:text-gray-200 text-lg">Monthly Expense Category</div>
                <div className="font-bold text-center text-gray-800 dark:text-gray-200 text-lg">Your Home</div>
                <div className="font-bold text-center text-gray-800 dark:text-gray-200 text-lg">Senior Living Residences</div>
              </div>
              
              {/* Expense List */}
              <div className="space-y-0">
                {/* Monthly Housing Payment */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="text-base text-gray-800 dark:text-gray-200 font-medium">Monthly Mortgage + Property Tax / Rent Payment</div>
                  <div className="text-center text-base font-medium text-red-600 dark:text-red-400">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.rent}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, rent: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                        prefix="$"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.rent)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-blue-600 dark:text-blue-400">$2,500 - $8,000</div>
                </div>
                
                {/* Utilities */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="text-base text-gray-800 dark:text-gray-200 font-medium">Utilities (Electric, Gas, Water, Sewer, A/C)</div>
                  <div className="text-center text-base font-medium text-red-600 dark:text-red-400">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.utilities}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, utilities: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.utilities)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 dark:text-green-400 font-bold">Included</div>
                </div>
                
                {/* Exterior Maintenance */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="text-base text-gray-800 dark:text-gray-200 font-medium">Exterior Maintenance (Lawn, Trash, Plow, Paint)</div>
                  <div className="text-center text-base font-medium text-red-600 dark:text-red-400">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.exteriorMaintenance}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, exteriorMaintenance: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.exteriorMaintenance)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Interior Maintenance */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">Interior Maintenance & Home Repairs</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.interiorMaintenance}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, interiorMaintenance: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.interiorMaintenance)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Housekeeping */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">Weekly Housekeeping</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.housekeeping}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, housekeeping: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.housekeeping)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Linen Service */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">Linen Service (Washer & Dryer Available)</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.linenService}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, linenService: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.linenService)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Transportation */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">Transportation (Gas, Insurance, Repairs)</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.transportation}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, transportation: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.transportation)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Groceries */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">Groceries & Meal Preparation</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.groceries}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, groceries: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.groceries)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Personal Care */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">Caregiving / Personal Care Services*</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.homecare}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, homecare: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.homecare)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Exercise & Wellness */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">Exercise & Wellness Programs</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.activities}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, activities: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.activities)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Entertainment */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">Entertainment, Social & Cultural Programs</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.entertainment}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, entertainment: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.entertainment)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* EnrichedLIFE */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">Full-time EnrichedLIFE Director</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.enrichedLife}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, enrichedLife: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.enrichedLife)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Emergency Service */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">24-Hour Emergency Call Service</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.emergencyService}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, emergencyService: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.emergencyService)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Building Security */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">24-Hour Building Security with Someone Awake</div>
                  <div className="text-center text-base font-medium text-red-600">
                    {isCustomizing ? (
                      <Input
                        type="number"
                        value={customHomeCosts.buildingSecurity}
                        onChange={(e) => setCustomHomeCosts({...customHomeCosts, buildingSecurity: parseInt(e.target.value) || 0})}
                        className="w-20 text-center"
                      />
                    ) : (
                      formatCurrency(customHomeCosts.buildingSecurity)
                    )}
                  </div>
                  <div className="text-center text-base font-medium text-green-600 font-bold">Included</div>
                </div>
                
                {/* Peace of Mind */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">Peace of Mind</div>
                  <div className="text-center text-base font-medium text-gray-500">$0</div>
                  <div className="text-center text-base font-medium text-blue-600 font-bold">Priceless!</div>
                </div>
                
                {/* Community */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="text-base text-gray-800 font-medium">A Caring Community & New Friends</div>
                  <div className="text-center text-base font-medium text-gray-500">$0</div>
                  <div className="text-center text-base font-medium text-blue-600 font-bold">Priceless!</div>
                </div>
              </div>
              
              {/* Total Row */}
              <div className="mt-4 pt-4 border-t-2 border-gray-300">
                <div className="grid grid-cols-3 gap-4 py-4 bg-gray-50 rounded-lg">
                  <div className="text-lg text-gray-900 font-bold">Monthly Total</div>
                  <div className="text-center text-lg font-bold text-red-600">
                    {formatCurrency(Object.values(customHomeCosts).reduce((sum, cost) => sum + cost, 0))}
                  </div>
                  <div className="text-center text-lg font-bold text-blue-600">$2,500 - $8,000</div>
                </div>
                
                {/* Savings Calculation */}
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-800">
                      Potential Monthly Savings: {formatCurrency(Object.values(customHomeCosts).reduce((sum, cost) => sum + cost, 0) - 5250)}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Based on average senior living cost of $5,250/month
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Control Buttons */}
              <div className="mt-6 flex justify-between items-center">
                <Button
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  variant={isCustomizing ? "default" : "outline"}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isCustomizing ? "Save Changes" : "Customize Your Costs"}
                </Button>
                
                {isCustomizing && (
                  <Button
                    onClick={() => setCustomHomeCosts({
                      rent: 2000,
                      utilities: 200,
                      exteriorMaintenance: 150,
                      interiorMaintenance: 200,
                      housekeeping: 200,
                      linenService: 50,
                      transportation: 300,
                      groceries: 400,
                      homecare: 800,
                      activities: 100,
                      entertainment: 100,
                      enrichedLife: 0,
                      emergencyService: 50,
                      buildingSecurity: 0,
                      healthcare: 300,
                      misc: 200
                    })}
                    variant="outline"
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Reset to Defaults
                  </Button>
                )}
              </div>
              
              {/* Summary Note */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-600">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>*Personal Care Services:</strong> Varies by care level - Independent Living ($1,500), Assisted Living ($2,500), Memory Care ($3,500), Skilled Nursing ($4,500)
                </p>
                {isCustomizing && (
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    <strong>Tip:</strong> Click in the "Your Home" column to adjust any cost to match your personal situation.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Move-in Cost Estimate */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-t-2xl p-6">
                <CardTitle className="flex items-center space-x-3">
                  <Calculator className="w-6 h-6" />
                  <span className="text-lg font-bold">Move-in Cost Estimate</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-600">
                    <div className="flex items-center mb-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Typical Move-in Costs</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Most families should budget $5,000 - $15,000 for initial move-in costs, depending on location and care level.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {moveInCosts.map((cost, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{cost.item}</h4>
                          <Badge variant="outline" className="text-xs">{cost.range}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{cost.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-600">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="font-semibold text-green-800 dark:text-green-200">MySeniorValet Advantage</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      No referral fees means transparent pricing. We help you understand all costs upfront.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Price Intelligence */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 text-white rounded-t-2xl p-6">
                <CardTitle className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-lg font-bold">Market Price Intelligence</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-600">
                    <div className="flex items-center mb-3">
                      <MapPin className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="font-semibold text-yellow-800 dark:text-yellow-200">Regional Pricing Overview</span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Pricing varies significantly by state, care level, and local market conditions. Use our data to make informed decisions.
                    </p>
                  </div>

                  <PricingIntelligenceSelector />
                  
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-600">
                    <div className="flex items-center mb-2">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Pricing Transparency Promise</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Featured communities provide live pricing • All estimates based on authentic market data • No hidden fees or surprises
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Affordability Calculator */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-t-2xl p-6">
                  <CardTitle className="flex items-center space-x-3">
                    <DollarSign className="w-6 h-6" />
                    <span className="text-lg font-bold">Affordability Calculator</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="income" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Monthly Income
                        </Label>
                        <Input
                          id="income"
                          type="number"
                          placeholder="Enter monthly income"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(e.target.value)}
                          className="rounded-lg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          State
                        </Label>
                        <Select value={selectedState} onValueChange={setSelectedState}>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(stateAverages).map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="care" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Care Level
                        </Label>
                        <Select value={careLevel} onValueChange={setCareLevel}>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select care level" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(careTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={calculateAffordability}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Calculate Affordability
                      </Button>
                    </div>

                    {affordabilityResult && (
                      <div className="space-y-4">
                        <Separator />
                        
                        <div className={`p-4 rounded-xl border ${
                          affordabilityResult.affordable 
                            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-600' 
                            : affordabilityResult.stretchAffordable 
                            ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-600' 
                            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-600'
                        }`}>
                          <div className="flex items-center mb-3">
                            {affordabilityResult.affordable ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            )}
                            <span className="font-semibold">
                              {affordabilityResult.affordable 
                                ? 'Comfortably Affordable' 
                                : affordabilityResult.stretchAffordable 
                                ? 'Stretch Budget' 
                                : 'Above Budget'
                              }
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Monthly Income:</span>
                              <span className="font-semibold">{formatCurrency(affordabilityResult.income)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Recommended Budget (30%):</span>
                              <span className="font-semibold">{formatCurrency(affordabilityResult.recommendedBudget)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{affordabilityResult.careType} Range:</span>
                              <span className="font-semibold">
                                {formatCurrency(affordabilityResult.careData.min)} - {formatCurrency(affordabilityResult.careData.max)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* At-Home vs Senior Living Comparison */}
                        {affordabilityResult && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white p-4 rounded-t-xl">
                              <div className="flex items-center">
                                <MapPin className="w-5 h-5 mr-2" />
                                <span className="font-semibold">Current Monthly Expenses - Updated</span>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              {/* Header Row */}
                              <div className="grid grid-cols-3 gap-4 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                                <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Category</div>
                                <div className="font-semibold text-center text-gray-700 dark:text-gray-300 text-sm">Your Home</div>
                                <div className="font-semibold text-center text-gray-700 dark:text-gray-300 text-sm">Senior Living Residences</div>
                              </div>
                              
                              {/* Expense List */}
                              <div className="space-y-0">
                                {/* Monthly Mortgage + Property Tax / Rent Payment */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                  <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">Monthly Mortgage + Property Tax / Rent Payment</div>
                                  <div className="text-center text-sm font-medium dark:text-gray-200">{formatCurrency(affordabilityResult.atHomeCosts.rent)}</div>
                                  <div className="text-center text-sm font-medium dark:text-gray-200">{formatCurrency(affordabilityResult.seniorLivingAverage)}</div>
                                </div>
                                
                                {/* Utilities */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                  <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">Utilities (Electric, Gas, Water, Sewer, A/C)</div>
                                  <div className="text-center text-sm font-medium dark:text-gray-200">{formatCurrency(affordabilityResult.atHomeCosts.utilities)}</div>
                                  <div className="text-center text-sm font-medium text-green-600 dark:text-green-400">Included</div>
                                </div>
                                
                                {/* Exterior Maintenance */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">Exterior Maintenance (Lawn, Trash, Plow, Paint)</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(150)}</div>
                                  <div className="text-center text-sm font-medium text-green-600">Included</div>
                                </div>
                                
                                {/* Interior Maintenance */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">Interior Maintenance & Home Repairs</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(200)}</div>
                                  <div className="text-center text-sm font-medium text-green-600">Included</div>
                                </div>
                                
                                {/* Housekeeping */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">Weekly Housekeeping</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(affordabilityResult.atHomeCosts.housekeeping)}</div>
                                  <div className="text-center text-sm font-medium text-green-600">Included</div>
                                </div>
                                
                                {/* Linen Service */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">Linen Service (Washer & Dryer Available)</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(50)}</div>
                                  <div className="text-center text-sm font-medium text-green-600">Included</div>
                                </div>
                                
                                {/* Transportation */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">Transportation (Gas, Insurance, Repairs)</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(affordabilityResult.atHomeCosts.transportation)}</div>
                                  <div className="text-center text-sm font-medium text-green-600">Included</div>
                                </div>
                                
                                {/* Groceries */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">Groceries & Meal Preparation</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(affordabilityResult.atHomeCosts.groceries)}</div>
                                  <div className="text-center text-sm font-medium text-green-600">Included</div>
                                </div>
                                
                                {/* Personal Care */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">Caregiving / Personal Care Services*</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(affordabilityResult.atHomeCosts.homecare)}</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(affordabilityResult.seniorLivingAverage)}</div>
                                </div>
                                
                                {/* Exercise & Wellness */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">Exercise & Wellness Programs</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(affordabilityResult.atHomeCosts.activities)}</div>
                                  <div className="text-center text-sm font-medium text-green-600">Included</div>
                                </div>
                                
                                {/* Entertainment */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                  <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">Entertainment, Social & Cultural Programs</div>
                                  <div className="text-center text-sm font-medium dark:text-gray-200">{formatCurrency(100)}</div>
                                  <div className="text-center text-sm font-medium text-green-600 dark:text-green-400">Included</div>
                                </div>
                                
                                {/* EnrichedLIFE */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">Full-time EnrichedLIFE Director</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(150)}</div>
                                  <div className="text-center text-sm font-medium text-green-600">Included</div>
                                </div>
                                
                                {/* Emergency Service */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">24-Hour Emergency Call Service</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(100)}</div>
                                  <div className="text-center text-sm font-medium text-green-600">Included</div>
                                </div>
                                
                                {/* Building Security */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                  <div className="text-sm text-gray-800 font-medium">24-Hour Building Security with Someone Awake</div>
                                  <div className="text-center text-sm font-medium">{formatCurrency(200)}</div>
                                  <div className="text-center text-sm font-medium text-green-600">Included</div>
                                </div>
                                
                                {/* Peace of Mind */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                  <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">Peace of Mind</div>
                                  <div className="text-center text-sm font-medium dark:text-gray-200">{formatCurrency(0)}</div>
                                  <div className="text-center text-sm font-medium text-blue-600 dark:text-blue-400">Priceless!</div>
                                </div>
                                
                                {/* Community */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                  <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">A Caring Community & New Friends</div>
                                  <div className="text-center text-sm font-medium dark:text-gray-200">{formatCurrency(0)}</div>
                                  <div className="text-center text-sm font-medium text-blue-600 dark:text-blue-400">Priceless!</div>
                                </div>
                              </div>
                              
                              {/* Calculate Total Button */}
                              <div className="mt-4 text-center">
                                <button className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
                                  Calculate Total Monthly Expenses
                                </button>
                              </div>
                              
                              {/* Savings Summary */}
                              <div className="mt-4 text-center">
                                <div className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm ${
                                  affordabilityResult.monthlySavings > 0 
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                }`}>
                                  {affordabilityResult.monthlySavings > 0 ? (
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                  )}
                                  {affordabilityResult.monthlySavings > 0 ? 'Additional Cost: ' : 'Potential Savings: '}
                                  {formatCurrency(Math.abs(affordabilityResult.monthlySavings))} /month
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-600">
                          <div className="flex items-center mb-2">
                            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                            <span className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Financial Planning Tip</span>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Financial experts recommend spending no more than 30% of income on senior living costs. 
                            Consider additional care needs and inflation when budgeting.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}