import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Home, DollarSign, TrendingUp, CheckCircle, AlertCircle, Info, Download, Print } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseCategory {
  category: string;
  description: string;
  monthlyAmount: number;
  includesInSeniorLiving: boolean;
  icon: React.ElementType;
  color: string;
}

export function CostComparisonWorksheet() {
  const [expenses, setExpenses] = useState({
    mortgage: 1800,
    utilities: 250,
    insurance: 200,
    propertyTax: 400,
    maintenance: 300,
    groceries: 600,
    dining: 200,
    transportation: 350,
    housekeeping: 200,
    lawnCare: 150,
    personalCare: 100,
    healthcare: 500,
    entertainment: 150,
    cable: 120,
    other: 200
  });

  const calculateTotal = () => {
    return Object.values(expenses).reduce((sum, value) => sum + value, 0);
  };

  const handleExpenseChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setExpenses(prev => ({ ...prev, [category]: numValue }));
  };

  const expenseCategories = [
    { id: 'mortgage', label: 'Mortgage/Rent', icon: Home, includesInSeniorLiving: true },
    { id: 'utilities', label: 'Utilities (Electric, Gas, Water)', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'insurance', label: 'Home/Renters Insurance', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'propertyTax', label: 'Property Tax', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'maintenance', label: 'Home Maintenance & Repairs', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'groceries', label: 'Groceries & Food', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'dining', label: 'Dining Out', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'transportation', label: 'Car Payment, Gas, Insurance', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'housekeeping', label: 'Housekeeping Services', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'lawnCare', label: 'Lawn Care & Snow Removal', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'personalCare', label: 'Personal Care Services', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'healthcare', label: 'Healthcare & Medications', icon: DollarSign, includesInSeniorLiving: false },
    { id: 'entertainment', label: 'Entertainment & Activities', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'cable', label: 'Cable/Internet/Phone', icon: DollarSign, includesInSeniorLiving: true },
    { id: 'other', label: 'Other Monthly Expenses', icon: DollarSign, includesInSeniorLiving: false }
  ];

  const totalHomeExpenses = calculateTotal();
  const averageSeniorLivingCost = 4500; // Average cost
  const potentialSavings = totalHomeExpenses - averageSeniorLivingCost;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="w-8 h-8 text-purple-600" />
          <h2 className="text-3xl font-bold">Cost Comparison Worksheet</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Compare your current home expenses to the all-inclusive value of senior living
        </p>
      </div>

      {/* Quick Summary Card */}
      <Card className={cn(
        "border-2",
        potentialSavings > 0 ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-blue-500 bg-blue-50 dark:bg-blue-950"
      )}>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Current Home Expenses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                ${totalHomeExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-4xl">→</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Senior Living Cost</p>
              <p className="text-3xl font-bold text-purple-600">
                ${averageSeniorLivingCost.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">all-inclusive per month</p>
            </div>
          </div>
          {potentialSavings > 0 && (
            <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
              <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                Potential Monthly Savings: ${potentialSavings.toLocaleString()}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                That's ${(potentialSavings * 12).toLocaleString()} per year!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Input Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Current Monthly Expenses</CardTitle>
          <CardDescription>
            Adjust the amounts to match your actual expenses. Items marked with ✓ are typically included in senior living.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                <Label htmlFor={category.id} className="flex items-center justify-between">
                  <span className="text-sm">{category.label}</span>
                  {category.includesInSeniorLiving && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id={category.id}
                    type="number"
                    value={expenses[category.id as keyof typeof expenses]}
                    onChange={(e) => handleExpenseChange(category.id, e.target.value)}
                    className="pl-7"
                    min="0"
                    step="10"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What's Included in Senior Living */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
          <CardTitle className="flex items-center gap-2">
            <Home className="w-6 h-6 text-purple-600" />
            What's Included in Senior Living
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Housing & Utilities
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Private apartment or suite</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>All utilities (electric, water, gas, trash)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Property maintenance & repairs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>24/7 emergency maintenance</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Services & Amenities
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Three meals daily plus snacks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Weekly housekeeping & laundry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Transportation to appointments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Activities & entertainment programs</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Additional Benefits
            </h4>
            <ul className="grid md:grid-cols-2 gap-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>No property taxes or HOA fees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>No yard work or snow removal</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>On-site wellness programs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Social activities & companionship</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Cable, internet & phone included</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Safety & security features</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" variant="outline" className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Download Worksheet
        </Button>
        <Button size="lg" variant="outline" className="flex items-center gap-2">
          <Print className="w-5 h-5" />
          Print Comparison
        </Button>
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Find Communities in Your Budget
        </Button>
      </div>
    </div>
  );
}