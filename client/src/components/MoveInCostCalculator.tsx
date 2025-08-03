import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calculator, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function MoveInCostCalculator() {
  const [seniorLivingCost, setSeniorLivingCost] = useState([4500]);
  const [applicationFee, setApplicationFee] = useState(300);
  const [securityDeposit, setSecurityDeposit] = useState(2250);
  const [firstMonth, setFirstMonth] = useState(4500);
  const [lastMonth, setLastMonth] = useState(4500);
  const [movingServices, setMovingServices] = useState(1200);
  const [homePrep, setHomePrep] = useState(800);
  const [otherCosts, setOtherCosts] = useState(500);

  // Update dependent costs when slider changes AND user inputs change
  useEffect(() => {
    const monthlyCost = seniorLivingCost[0];
    // Only auto-update if user hasn't manually changed these values significantly
    if (Math.abs(firstMonth - monthlyCost) > 200) {
      // User has customized, don't auto-update
    } else {
      setFirstMonth(monthlyCost);
    }
    
    if (Math.abs(lastMonth - monthlyCost) > 200) {
      // User has customized, don't auto-update
    } else {
      setLastMonth(monthlyCost);
    }
    
    if (Math.abs(securityDeposit - (monthlyCost * 0.5)) > 200) {
      // User has customized, don't auto-update
    } else {
      setSecurityDeposit(monthlyCost * 0.5);
    }
  }, [seniorLivingCost]);

  const calculateTotal = () => {
    return applicationFee + securityDeposit + firstMonth + lastMonth + movingServices + homePrep + otherCosts;
  };

  const handleCostChange = (setter: (value: number) => void) => (value: string) => {
    const numValue = parseFloat(value) || 0;
    setter(numValue);
  };

  // Calculate total that updates in real-time as user changes inputs
  const totalCost = calculateTotal();



  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Move-In Cost Calculator</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Plan your transition with accurate move-in cost estimates based on your actual expenses
        </p>
      </div>

      {/* Enhanced Total Summary with Real-time Updates */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Move-In Cost</p>
            <p className="text-4xl font-bold text-purple-700 dark:text-purple-300">
              ${totalCost.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Based on ${seniorLivingCost[0].toLocaleString()}/month • Updates as you edit costs below
            </p>
            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">${(applicationFee + securityDeposit).toLocaleString()}</div>
                <div className="text-xs text-gray-500">Deposits & Fees</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">${(firstMonth + lastMonth).toLocaleString()}</div>
                <div className="text-xs text-gray-500">Rent Payments</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">${(movingServices + homePrep + otherCosts).toLocaleString()}</div>
                <div className="text-xs text-gray-500">Moving & Setup</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Cost Slider - Functional */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Monthly Senior Living Cost</CardTitle>
          <CardDescription className="text-sm">
            Adjust to match your target community's monthly rate - automatically updates dependent costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="px-3">
              <Slider
                value={seniorLivingCost}
                onValueChange={setSeniorLivingCost}
                max={8000}
                min={2000}
                step={100}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>$2,000/mo</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400 text-lg">
                ${seniorLivingCost[0].toLocaleString()}/mo
              </span>
              <span>$8,000/mo</span>
            </div>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              💡 Slider automatically adjusts security deposit and rent amounts below
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Cost Breakdown with Real-time Totals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Move-In Cost Breakdown
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Live Total: ${totalCost.toLocaleString()}
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm">
            Enter your actual costs - total updates automatically as you type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Application Fee */}
            <div className="space-y-2">
              <Label htmlFor="applicationFee" className="text-sm font-medium flex items-center justify-between">
                Application Fee
                <span className="text-xs text-gray-500">${applicationFee.toLocaleString()}</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input
                  id="applicationFee"
                  type="number"
                  value={applicationFee}
                  onChange={(e) => handleCostChange(setApplicationFee)(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="25"
                  placeholder="Typical: $200-$500"
                />
              </div>
            </div>

            {/* Security Deposit */}
            <div className="space-y-2">
              <Label htmlFor="securityDeposit" className="text-sm font-medium flex items-center justify-between">
                Security Deposit
                <span className="text-xs text-gray-500">${securityDeposit.toLocaleString()}</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input
                  id="securityDeposit"
                  type="number"
                  value={securityDeposit}
                  onChange={(e) => handleCostChange(setSecurityDeposit)(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="100"
                  placeholder="Usually 0.5-1x monthly rent"
                />
              </div>
            </div>

            {/* First Month */}
            <div className="space-y-2">
              <Label htmlFor="firstMonth" className="text-sm font-medium flex items-center justify-between">
                First Month's Rent
                <span className="text-xs text-gray-500">${firstMonth.toLocaleString()}</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input
                  id="firstMonth"
                  type="number"
                  value={firstMonth}
                  onChange={(e) => handleCostChange(setFirstMonth)(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="100"
                  placeholder="Match monthly rate"
                />
              </div>
            </div>

            {/* Last Month */}
            <div className="space-y-2">
              <Label htmlFor="lastMonth" className="text-sm font-medium flex items-center justify-between">
                Last Month's Rent
                <span className="text-xs text-gray-500">${lastMonth.toLocaleString()}</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input
                  id="lastMonth"
                  type="number"
                  value={lastMonth}
                  onChange={(e) => handleCostChange(setLastMonth)(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="100"
                  placeholder="If required by community"
                />
              </div>
            </div>

            {/* Moving Services */}
            <div className="space-y-2">
              <Label htmlFor="movingServices" className="text-sm font-medium flex items-center justify-between">
                Moving Services
                <span className="text-xs text-gray-500">${movingServices.toLocaleString()}</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input
                  id="movingServices"
                  type="number"
                  value={movingServices}
                  onChange={(e) => handleCostChange(setMovingServices)(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="50"
                  placeholder="Professional movers"
                />
              </div>
            </div>

            {/* Home Preparation */}
            <div className="space-y-2">
              <Label htmlFor="homePrep" className="text-sm font-medium flex items-center justify-between">
                Home Preparation
                <span className="text-xs text-gray-500">${homePrep.toLocaleString()}</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input
                  id="homePrep"
                  type="number"
                  value={homePrep}
                  onChange={(e) => handleCostChange(setHomePrep)(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="50"
                  placeholder="Cleaning, repairs, staging"
                />
              </div>
            </div>

            {/* Other Costs */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="otherCosts" className="text-sm font-medium flex items-center justify-between">
                Other Costs (Utilities Setup, Pet Deposits, etc.)
                <span className="text-xs text-gray-500">${otherCosts.toLocaleString()}</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input
                  id="otherCosts"
                  type="number"
                  value={otherCosts}
                  onChange={(e) => handleCostChange(setOtherCosts)(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="25"
                  placeholder="Miscellaneous fees"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Cost Breakdown Visual */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Live Cost Summary</CardTitle>
          <CardDescription className="text-sm">Real-time breakdown based on your entered amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Application Fee', amount: applicationFee, color: 'bg-blue-500', percentage: (applicationFee / totalCost * 100).toFixed(1) },
              { label: 'Security Deposit', amount: securityDeposit, color: 'bg-green-500', percentage: (securityDeposit / totalCost * 100).toFixed(1) },
              { label: 'First Month\'s Rent', amount: firstMonth, color: 'bg-purple-500', percentage: (firstMonth / totalCost * 100).toFixed(1) },
              { label: 'Last Month\'s Rent', amount: lastMonth, color: 'bg-indigo-500', percentage: (lastMonth / totalCost * 100).toFixed(1) },
              { label: 'Moving Services', amount: movingServices, color: 'bg-yellow-500', percentage: (movingServices / totalCost * 100).toFixed(1) },
              { label: 'Home Preparation', amount: homePrep, color: 'bg-red-500', percentage: (homePrep / totalCost * 100).toFixed(1) },
              { label: 'Other Costs', amount: otherCosts, color: 'bg-gray-500', percentage: (otherCosts / totalCost * 100).toFixed(1) }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${item.color}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${item.amount.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="border-t pt-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Total Move-In Cost</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  ${totalCost.toLocaleString()}
                </span>
              </div>
              <div className="text-center mt-2 text-xs text-gray-500">
                💡 Total updates automatically as you adjust costs above
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Save Calculation
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Compare Communities
        </Button>
      </div>
    </div>
  );
}