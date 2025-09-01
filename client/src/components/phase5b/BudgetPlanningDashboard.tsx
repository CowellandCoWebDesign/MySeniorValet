import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  FileText,
  Download,
  Upload,
  Calculator,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BudgetPlanningDashboardProps {
  communityId: number;
}

export function BudgetPlanningDashboard({ communityId }: BudgetPlanningDashboardProps) {
  const [createBudgetOpen, setCreateBudgetOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [budgetForm, setBudgetForm] = useState({
    budgetName: '',
    fiscalYear: new Date().getFullYear(),
    quarter: null as number | null,
    month: null as number | null,
    totalBudgetedRevenue: 0,
    totalBudgetedExpenses: 0,
    notes: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch budget plans
  const { data: budgetPlans = [], isLoading } = useQuery({
    queryKey: [`/api/resident-family/communities/${communityId}/budgets`],
    enabled: !!communityId
  });

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      const response = await apiRequest('POST', '/api/resident-family/budgets', {
        ...budgetData,
        communityId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Budget Created",
        description: "Budget plan has been created successfully",
      });
      setCreateBudgetOpen(false);
      setBudgetForm({
        budgetName: '',
        fiscalYear: new Date().getFullYear(),
        quarter: null,
        month: null,
        totalBudgetedRevenue: 0,
        totalBudgetedExpenses: 0,
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: [`/api/resident-family/communities/${communityId}/budgets`] });
    }
  });

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: async ({ budgetId, updates }: any) => {
      const response = await apiRequest('PUT', `/api/resident-family/budgets/${budgetId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Budget Updated",
        description: "Budget plan has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/resident-family/communities/${communityId}/budgets`] });
    }
  });

  // Approve budget mutation
  const approveBudgetMutation = useMutation({
    mutationFn: async (budgetId: number) => {
      const response = await apiRequest('PUT', `/api/resident-family/budgets/${budgetId}/approve`, {
        approvedBy: 'current-user' // Would come from auth context
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Budget Approved",
        description: "Budget plan has been approved and activated",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/resident-family/communities/${communityId}/budgets`] });
    }
  });

  const activeBudget = budgetPlans.find((b: any) => b.status === 'active' || b.status === 'approved');
  const draftBudgets = budgetPlans.filter((b: any) => b.status === 'draft');
  const pendingBudgets = budgetPlans.filter((b: any) => b.status === 'pending_approval');

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (variance < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const calculateVariancePercentage = (budgeted: number, actual: number) => {
    if (budgeted === 0) return 0;
    return ((actual - budgeted) / budgeted * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Budget Planning & Variance Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Create and monitor budgets with real-time variance analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={createBudgetOpen} onOpenChange={setCreateBudgetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Create Budget Plan</DialogTitle>
                <DialogDescription>
                  Set up a new budget plan for revenue and expense tracking
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-name">Budget Name</Label>
                  <Input
                    id="budget-name"
                    placeholder="Q1 2025 Operating Budget"
                    value={budgetForm.budgetName}
                    onChange={(e) => setBudgetForm({ ...budgetForm, budgetName: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fiscal Year</Label>
                    <Input
                      type="number"
                      value={budgetForm.fiscalYear}
                      onChange={(e) => setBudgetForm({ ...budgetForm, fiscalYear: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quarter (Optional)</Label>
                    <Select
                      value={budgetForm.quarter?.toString()}
                      onValueChange={(value) => setBudgetForm({ ...budgetForm, quarter: value ? parseInt(value) : null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Q1</SelectItem>
                        <SelectItem value="2">Q2</SelectItem>
                        <SelectItem value="3">Q3</SelectItem>
                        <SelectItem value="4">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Month (Optional)</Label>
                    <Select
                      value={budgetForm.month?.toString()}
                      onValueChange={(value) => setBudgetForm({ ...budgetForm, month: value ? parseInt(value) : null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {format(new Date(2024, i), 'MMMM')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Budgeted Revenue</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={budgetForm.totalBudgetedRevenue}
                      onChange={(e) => setBudgetForm({ ...budgetForm, totalBudgetedRevenue: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Budgeted Expenses</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={budgetForm.totalBudgetedExpenses}
                      onChange={(e) => setBudgetForm({ ...budgetForm, totalBudgetedExpenses: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Budget assumptions, special considerations..."
                    value={budgetForm.notes}
                    onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateBudgetOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => createBudgetMutation.mutate(budgetForm)}>
                  Create Budget
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Budget Overview */}
      {activeBudget && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{activeBudget.budgetName}</CardTitle>
                <CardDescription>
                  FY {activeBudget.fiscalYear} 
                  {activeBudget.quarter && ` • Q${activeBudget.quarter}`}
                  {activeBudget.month && ` • ${format(new Date(2024, activeBudget.month - 1), 'MMMM')}`}
                </CardDescription>
              </div>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Revenue */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Revenue</span>
                  <span className={`text-sm flex items-center gap-1 ${getVarianceColor(parseFloat(activeBudget.revenueVariance))}`}>
                    {getVarianceIcon(parseFloat(activeBudget.revenueVariance))}
                    {calculateVariancePercentage(
                      parseFloat(activeBudget.totalBudgetedRevenue),
                      parseFloat(activeBudget.totalActualRevenue)
                    )}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budgeted</span>
                    <span>{formatCurrency(activeBudget.totalBudgetedRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual</span>
                    <span className="font-medium">{formatCurrency(activeBudget.totalActualRevenue)}</span>
                  </div>
                  <Progress 
                    value={(parseFloat(activeBudget.totalActualRevenue) / parseFloat(activeBudget.totalBudgetedRevenue)) * 100}
                    className="h-2"
                  />
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Expenses</span>
                  <span className={`text-sm flex items-center gap-1 ${getVarianceColor(-parseFloat(activeBudget.expenseVariance))}`}>
                    {getVarianceIcon(-parseFloat(activeBudget.expenseVariance))}
                    {calculateVariancePercentage(
                      parseFloat(activeBudget.totalBudgetedExpenses),
                      parseFloat(activeBudget.totalActualExpenses)
                    )}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budgeted</span>
                    <span>{formatCurrency(activeBudget.totalBudgetedExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual</span>
                    <span className="font-medium">{formatCurrency(activeBudget.totalActualExpenses)}</span>
                  </div>
                  <Progress 
                    value={(parseFloat(activeBudget.totalActualExpenses) / parseFloat(activeBudget.totalBudgetedExpenses)) * 100}
                    className="h-2"
                  />
                </div>
              </div>

              {/* Net Income */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Net Income</span>
                  <span className={`text-sm flex items-center gap-1 ${getVarianceColor(parseFloat(activeBudget.netIncomeVariance))}`}>
                    {getVarianceIcon(parseFloat(activeBudget.netIncomeVariance))}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budgeted</span>
                    <span>
                      {formatCurrency(
                        parseFloat(activeBudget.totalBudgetedRevenue) - parseFloat(activeBudget.totalBudgetedExpenses)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual</span>
                    <span className="font-medium">
                      {formatCurrency(
                        parseFloat(activeBudget.totalActualRevenue) - parseFloat(activeBudget.totalActualExpenses)
                      )}
                    </span>
                  </div>
                  <Progress 
                    value={50} // Placeholder
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <FileText className="mr-2 h-3 w-3" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="mr-2 h-3 w-3" />
                  Variance Report
                </Button>
              </div>
              <Button size="sm" variant="outline">
                <Edit3 className="mr-2 h-3 w-3" />
                Update Actuals
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Lists */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">
            All Budgets ({budgetPlans.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft ({draftBudgets.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingBudgets.length})
          </TabsTrigger>
          <TabsTrigger value="analysis">
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Plans</CardTitle>
              <CardDescription>All budget plans for this community</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Budget Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Net Income</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetPlans.map((budget: any) => (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">{budget.budgetName}</TableCell>
                      <TableCell>
                        FY {budget.fiscalYear}
                        {budget.quarter && ` Q${budget.quarter}`}
                      </TableCell>
                      <TableCell>{formatCurrency(budget.totalBudgetedRevenue)}</TableCell>
                      <TableCell>{formatCurrency(budget.totalBudgetedExpenses)}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          parseFloat(budget.totalBudgetedRevenue) - parseFloat(budget.totalBudgetedExpenses)
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          budget.status === 'active' || budget.status === 'approved' ? 'default' :
                          budget.status === 'pending_approval' ? 'secondary' :
                          budget.status === 'draft' ? 'outline' : 'destructive'
                        }>
                          {budget.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <FileText className="h-3 w-3" />
                          </Button>
                          {budget.status === 'draft' && (
                            <Button size="sm" variant="ghost">
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          )}
                          {budget.status === 'pending_approval' && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => approveBudgetMutation.mutate(budget.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variance Analysis</CardTitle>
              <CardDescription>Detailed budget variance tracking and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Advanced Analytics Coming Soon</p>
                <p className="text-sm">View detailed variance analysis, trends, and forecasts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}