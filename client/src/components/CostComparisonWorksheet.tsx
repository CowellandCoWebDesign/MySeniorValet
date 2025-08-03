import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Home, DollarSign, TrendingUp, CheckCircle, AlertCircle, Info, Download, Printer, ChevronDown, ChevronUp } from "lucide-react";
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

  const [isExpanded, setIsExpanded] = useState(false);

  const calculateTotal = () => {
    return Object.values(expenses).reduce((sum, value) => sum + value, 0);
  };

  const handleExpenseChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setExpenses(prev => ({ ...prev, [category]: numValue }));
  };

  const expenseCategories = [
    { id: 'mortgage', label: 'Mortgage/Rent', icon: Home, includesInSeniorLiving: true, priority: 'high' },
    { id: 'utilities', label: 'Utilities (Electric, Gas, Water)', icon: DollarSign, includesInSeniorLiving: true, priority: 'high' },
    { id: 'groceries', label: 'Groceries & Food', icon: DollarSign, includesInSeniorLiving: true, priority: 'high' },
    { id: 'healthcare', label: 'Healthcare & Medications', icon: DollarSign, includesInSeniorLiving: false, priority: 'high' },
    { id: 'insurance', label: 'Home/Renters Insurance', icon: DollarSign, includesInSeniorLiving: true, priority: 'medium' },
    { id: 'propertyTax', label: 'Property Tax', icon: DollarSign, includesInSeniorLiving: true, priority: 'medium' },
    { id: 'maintenance', label: 'Home Maintenance & Repairs', icon: DollarSign, includesInSeniorLiving: true, priority: 'medium' },
    { id: 'dining', label: 'Dining Out', icon: DollarSign, includesInSeniorLiving: true, priority: 'medium' },
    { id: 'transportation', label: 'Car Payment, Gas, Insurance', icon: DollarSign, includesInSeniorLiving: true, priority: 'medium' },
    { id: 'housekeeping', label: 'Housekeeping Services', icon: DollarSign, includesInSeniorLiving: true, priority: 'medium' },
    { id: 'lawnCare', label: 'Lawn Care & Snow Removal', icon: DollarSign, includesInSeniorLiving: true, priority: 'medium' },
    { id: 'personalCare', label: 'Personal Care Services', icon: DollarSign, includesInSeniorLiving: true, priority: 'medium' },
    { id: 'entertainment', label: 'Entertainment & Activities', icon: DollarSign, includesInSeniorLiving: true, priority: 'medium' },
    { id: 'cable', label: 'Cable/Internet/Phone', icon: DollarSign, includesInSeniorLiving: true, priority: 'medium' },
    { id: 'other', label: 'Other Monthly Expenses', icon: DollarSign, includesInSeniorLiving: false, priority: 'medium' }
  ];

  // Show only high priority items initially, rest when expanded
  const priorityCategories = expenseCategories.filter(cat => cat.priority === 'high');
  const remainingCategories = expenseCategories.filter(cat => cat.priority === 'medium');
  const displayCategories = isExpanded ? expenseCategories : priorityCategories;

  const totalHomeExpenses = calculateTotal();
  const averageSeniorLivingCost = 4500; // Average cost
  const potentialSavings = totalHomeExpenses - averageSeniorLivingCost;

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold">Cost Comparison Worksheet</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Compare your current home expenses to the all-inclusive value of senior living
        </p>
      </div>

      {/* Quick Summary Card - Compact */}
      <Card className={cn(
        "border",
        potentialSavings > 0 ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-blue-500 bg-blue-50 dark:bg-blue-950"
      )}>
        <CardContent className="py-3">
          <div className="grid md:grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Current Home Expenses</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ${totalHomeExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-2xl">→</div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Senior Living</p>
              <p className="text-xl font-bold text-purple-600">
                ${averageSeniorLivingCost.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">all-inclusive</p>
            </div>
          </div>
          {potentialSavings > 0 && (
            <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 rounded text-center">
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                Save ${potentialSavings.toLocaleString()}/mo (${(potentialSavings * 12).toLocaleString()}/yr)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Input Grid - Compact */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-base">Enter Your Current Monthly Expenses</CardTitle>
          <CardDescription className="text-xs">
            Adjust the amounts to match your actual expenses. Items marked with ✓ are typically included in senior living.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayCategories.map((category) => (
              <div key={category.id} className="space-y-1">
                <Label htmlFor={category.id} className="flex items-center justify-between">
                  <span className="text-xs">{category.label}</span>
                  {category.includesInSeniorLiving && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <Input
                    id={category.id}
                    type="number"
                    value={expenses[category.id as keyof typeof expenses]}
                    onChange={(e) => handleExpenseChange(category.id, e.target.value)}
                    className="pl-6 h-8 text-sm"
                    min="0"
                    step="10"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Expand/Collapse Button */}
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show fewer expenses ({remainingCategories.length} hidden)
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show all expenses ({remainingCategories.length} more)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* What's Included in Senior Living - Compact */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="w-4 h-4 text-purple-600" />
            What's Included in Senior Living
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 pb-4 px-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1 text-sm">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Housing & Utilities
              </h4>
              <ul className="space-y-1 text-xs">
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span>Private apartment or suite</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span>All utilities (electric, water, gas, trash)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span>Property maintenance & repairs</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span>24/7 emergency maintenance</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1 text-sm">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Services & Amenities
              </h4>
              <ul className="space-y-1 text-xs">
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span>Three meals daily plus snacks</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span>Weekly housekeeping & laundry</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span>Transportation to appointments</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <span>Activities & entertainment programs</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded">
            <h4 className="font-medium mb-1 flex items-center gap-1 text-sm">
              <Info className="w-3 h-3 text-blue-600" />
              Additional Benefits
            </h4>
            <ul className="grid md:grid-cols-2 gap-1 text-xs">
              <li className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-600" />
                <span>No property taxes or HOA fees</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-600" />
                <span>No yard work or snow removal</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-600" />
                <span>On-site wellness programs</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-600" />
                <span>Social activities & companionship</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-600" />
                <span>Cable, internet & phone included</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-600" />
                <span>Safety & security features</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Compact */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button size="sm" variant="outline" className="flex items-center gap-1">
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button size="sm" variant="outline" className="flex items-center gap-1">
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          Find Communities
        </Button>
      </div>
    </div>
  );
}