import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Home, Heart, Brain, Users, Package, TrendingUp, DollarSign, Info } from "lucide-react";

interface CostBreakdown {
  category: string;
  monthlyMin: number;
  monthlyMax: number;
  description: string;
  icon: React.ElementType;
  color: string;
}

export function MoveInCostCalculator() {
  const [moveInBudget, setMoveInBudget] = useState([5000]);
  const [monthlyBudget, setMonthlyBudget] = useState([4000]);

  const costCategories: CostBreakdown[] = [
    {
      category: "Basic Living Expenses",
      monthlyMin: 2000,
      monthlyMax: 3500,
      description: "Room, board, housekeeping, maintenance",
      icon: Home,
      color: "blue"
    },
    {
      category: "Assisted Living Care",
      monthlyMin: 1500,
      monthlyMax: 3000,
      description: "Medication management, daily living assistance",
      icon: Heart,
      color: "green"
    },
    {
      category: "Memory Care",
      monthlyMin: 2000,
      monthlyMax: 4000,
      description: "Specialized dementia/Alzheimer's care",
      icon: Brain,
      color: "purple"
    },
    {
      category: "Independent Living",
      monthlyMin: 1800,
      monthlyMax: 3200,
      description: "Active senior communities with minimal assistance",
      icon: Users,
      color: "orange"
    },
    {
      category: "Amenities & Programs",
      monthlyMin: 200,
      monthlyMax: 800,
      description: "Activities, dining options, transportation",
      icon: Package,
      color: "pink"
    }
  ];

  const moveInCosts = [
    { name: "Community Fee", amount: "$500-$3,000", description: "One-time admission fee" },
    { name: "Security Deposit", amount: "$1,000-$2,000", description: "Typically one month's rent" },
    { name: "First Month's Rent", amount: "$2,000-$8,000", description: "Paid upfront" },
    { name: "Moving Expenses", amount: "$500-$2,000", description: "Professional movers, packing" },
    { name: "Room Setup", amount: "$500-$1,500", description: "Furniture, decorations, essentials" }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          Move-In Cost Calculator
        </h2>
        <p className="text-sm text-muted-foreground">
          Understand the true costs of senior living
        </p>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">Monthly Costs</TabsTrigger>
          <TabsTrigger value="movein">Move-In Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-3 mt-3">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base">Monthly Budget Calculator</CardTitle>
              <CardDescription className="text-xs">
                Estimate your monthly senior living expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Budget</span>
                  <span className="text-lg font-bold text-purple-600">
                    ${monthlyBudget[0].toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={monthlyBudget}
                  onValueChange={setMonthlyBudget}
                  max={10000}
                  min={1000}
                  step={100}
                  className="mb-3"
                />
              </div>

              <div className="space-y-2">
                {costCategories.map((category, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <category.icon className={`w-4 h-4 text-${category.color}-600`} />
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <Badge variant="outline" className="text-xs h-6">
                        ${category.monthlyMin.toLocaleString()} - ${category.monthlyMax.toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Estimated Total Monthly Cost</span>
                  <span className="text-lg font-bold text-purple-600">
                    $3,500 - $8,500
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on average costs across care levels
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movein" className="space-y-3 mt-3">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base">One-Time Move-In Costs</CardTitle>
              <CardDescription className="text-xs">
                Initial expenses when transitioning to senior living
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Move-In Budget</span>
                  <span className="text-lg font-bold text-green-600">
                    ${moveInBudget[0].toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={moveInBudget}
                  onValueChange={setMoveInBudget}
                  max={15000}
                  min={2000}
                  step={500}
                  className="mb-3"
                />
              </div>

              <div className="space-y-2">
                {moveInCosts.map((cost, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="text-sm font-medium">{cost.name}</p>
                      <p className="text-xs text-muted-foreground">{cost.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs h-6">{cost.amount}</Badge>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total Move-In Costs</span>
                  <span className="text-lg font-bold text-green-600">
                    $5,000 - $16,500
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Varies by community and care level
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cost Saving Tips - Compact */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 py-3 px-4">
          <CardTitle className="flex items-center gap-1 text-base">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Cost Saving Strategies
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 pb-4 px-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <h4 className="font-medium flex items-center gap-1 text-sm mb-1">
                <DollarSign className="w-3 h-3 text-green-600" />
                Financial Assistance
              </h4>
              <ul className="text-xs space-y-0.5 ml-4">
                <li>• Veterans Aid & Attendance</li>
                <li>• Long-term care insurance</li>
                <li>• Medicaid coverage</li>
                <li>• Life insurance conversions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium flex items-center gap-1 text-sm mb-1">
                <Info className="w-3 h-3 text-blue-600" />
                Smart Planning Tips
              </h4>
              <ul className="text-xs space-y-0.5 ml-4">
                <li>• Compare multiple communities</li>
                <li>• Negotiate move-in specials</li>
                <li>• Consider shared rooms</li>
                <li>• Plan moves during promotions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}