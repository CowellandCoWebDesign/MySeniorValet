import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, AlertCircle, TrendingUp, Users, Settings, DollarSign, Package, Utensils, Zap, Wrench, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ValidationResult {
  feature: string;
  category: string;
  week: number;
  status: 'pending' | 'checking' | 'success' | 'error' | 'warning';
  message: string;
  dataCount?: number;
  details?: any;
}

interface PhaseProgress {
  week: number;
  name: string;
  features: number;
  completed: number;
  percentage: number;
}

export default function Phase5bValidation() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const communityId = 1; // Test community ID

  // Week 1: Financial Automation endpoints
  const billingEndpoints = [
    { name: 'Invoices', endpoint: '/api/billing/invoices', category: 'Financial Automation', week: 1, icon: DollarSign },
    { name: 'Payments', endpoint: '/api/billing/payments', category: 'Financial Automation', week: 1, icon: DollarSign },
    { name: 'Transactions', endpoint: '/api/billing/transactions', category: 'Financial Automation', week: 1, icon: DollarSign },
    { name: 'Financial Reports', endpoint: '/api/billing/reports/financial', category: 'Financial Automation', week: 1, icon: TrendingUp },
    { name: 'AR Aging', endpoint: '/api/billing/reports/ar-aging', category: 'Financial Automation', week: 1, icon: TrendingUp },
    { name: 'Budgets', endpoint: '/api/billing/budgets', category: 'Financial Automation', week: 1, icon: DollarSign },
  ];

  // Week 2: Resident & Family Experience endpoints
  const residentEndpoints = [
    { name: 'Residents', endpoint: '/api/residents', category: 'Resident Experience', week: 2, icon: Users },
    { name: 'Care Plans', endpoint: '/api/care-plans', category: 'Resident Experience', week: 2, icon: Users },
    { name: 'Family Members', endpoint: '/api/family-members', category: 'Family Experience', week: 2, icon: Users },
    { name: 'Messages', endpoint: '/api/messages', category: 'Communication', week: 2, icon: Users },
    { name: 'Documents', endpoint: '/api/documents', category: 'Documents', week: 2, icon: Users },
    { name: 'Video Calls', endpoint: '/api/video-calls', category: 'Communication', week: 2, icon: Users },
    { name: 'Budget Variance', endpoint: '/api/budgets/variance', category: 'Financial Planning', week: 2, icon: TrendingUp },
  ];

  // Week 3: Operational Excellence endpoints
  const operationsEndpoints = [
    { name: 'Vendors', endpoint: '/api/operations/vendors', category: 'Supply Chain', week: 3, icon: Package },
    { name: 'Purchase Orders', endpoint: '/api/operations/purchase-orders', category: 'Supply Chain', week: 3, icon: Package },
    { name: 'Inventory', endpoint: '/api/operations/inventory', category: 'Supply Chain', week: 3, icon: Package },
    { name: 'Menus', endpoint: '/api/operations/menus', category: 'Food Service', week: 3, icon: Utensils },
    { name: 'Meal Orders', endpoint: '/api/operations/meal-orders', category: 'Food Service', week: 3, icon: Utensils },
    { name: 'Utility Meters', endpoint: '/api/operations/utility-meters', category: 'Energy Management', week: 3, icon: Zap },
    { name: 'Energy Targets', endpoint: '/api/operations/energy-targets', category: 'Energy Management', week: 3, icon: Zap },
    { name: 'Assets', endpoint: '/api/operations/assets', category: 'Maintenance', week: 3, icon: Wrench },
    { name: 'Work Orders', endpoint: '/api/operations/work-orders', category: 'Maintenance', week: 3, icon: Wrench },
    { name: 'Vehicles', endpoint: '/api/operations/vehicles', category: 'Transportation', week: 3, icon: Truck },
    { name: 'Trips', endpoint: '/api/operations/trips', category: 'Transportation', week: 3, icon: Truck },
  ];

  const allEndpoints = [...billingEndpoints, ...residentEndpoints, ...operationsEndpoints];

  const validateEndpoint = async (endpoint: any): Promise<ValidationResult> => {
    const result: ValidationResult = {
      feature: endpoint.name,
      category: endpoint.category,
      week: endpoint.week,
      status: 'checking',
      message: 'Validating...',
    };

    try {
      // Add communityId to endpoints that need it
      const url = endpoint.endpoint.includes('?') 
        ? `${endpoint.endpoint}&communityId=${communityId}`
        : `${endpoint.endpoint}?communityId=${communityId}`;
      
      const response = await apiRequest('GET', url);
      
      // Check if response is valid
      if (response && (Array.isArray(response) || (typeof response === 'object' && response !== null))) {
        const dataCount = Array.isArray(response) ? response.length : 
                         response.data && Array.isArray(response.data) ? response.data.length :
                         response.count || 1;
        
        result.status = dataCount > 0 ? 'success' : 'warning';
        result.message = dataCount > 0 
          ? `✓ Endpoint functional (${dataCount} records)` 
          : '⚠ Endpoint works but no data yet';
        result.dataCount = dataCount;
        result.details = response;
      } else {
        result.status = 'warning';
        result.message = '⚠ Unexpected response format';
      }
    } catch (error: any) {
      result.status = 'error';
      result.message = `✗ ${error.message || 'Failed to connect'}`;
    }

    return result;
  };

  const runValidation = async (weekNumber?: number) => {
    setIsValidating(true);
    setCurrentWeek(weekNumber || null);
    setValidationResults([]);
    
    const endpointsToTest = weekNumber 
      ? allEndpoints.filter(e => e.week === weekNumber)
      : allEndpoints;
    
    const results: ValidationResult[] = [];
    
    for (const endpoint of endpointsToTest) {
      const result = await validateEndpoint(endpoint);
      results.push(result);
      setValidationResults([...results]);
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsValidating(false);
  };

  const getPhaseProgress = (): PhaseProgress[] => {
    const weeks = [
      { week: 1, name: 'Financial Automation', features: billingEndpoints.length },
      { week: 2, name: 'Resident & Family Experience', features: residentEndpoints.length },
      { week: 3, name: 'Operational Excellence', features: operationsEndpoints.length },
    ];

    return weeks.map(week => {
      const weekResults = validationResults.filter(r => r.week === week.week);
      const completed = weekResults.filter(r => r.status === 'success').length;
      return {
        ...week,
        completed,
        percentage: weekResults.length > 0 ? Math.round((completed / week.features) * 100) : 0
      };
    });
  };

  const getOverallStats = () => {
    const total = validationResults.length;
    const successful = validationResults.filter(r => r.status === 'success').length;
    const warnings = validationResults.filter(r => r.status === 'warning').length;
    const errors = validationResults.filter(r => r.status === 'error').length;
    
    return { total, successful, warnings, errors };
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'checking': return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      default: return null;
    }
  };

  const getWeekIcon = (week: number) => {
    switch (week) {
      case 1: return <DollarSign className="w-5 h-5" />;
      case 2: return <Users className="w-5 h-5" />;
      case 3: return <Settings className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Phase 5b: Enhanced Operations Validation
          </h1>
          <p className="text-gray-400">
            Comprehensive validation of all Financial, Resident Experience, and Operational features
          </p>
        </div>

        {/* Control Panel */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Validation Control Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => runValidation()}
                disabled={isValidating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Validate All Features'
                )}
              </Button>
              
              <Button 
                onClick={() => runValidation(1)}
                disabled={isValidating}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Week 1: Financial
              </Button>
              
              <Button 
                onClick={() => runValidation(2)}
                disabled={isValidating}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Users className="mr-2 h-4 w-4" />
                Week 2: Resident/Family
              </Button>
              
              <Button 
                onClick={() => runValidation(3)}
                disabled={isValidating}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Settings className="mr-2 h-4 w-4" />
                Week 3: Operations
              </Button>
            </div>

            {/* Overall Stats */}
            {validationResults.length > 0 && (
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-gray-400 text-sm">Total Tests</div>
                  <div className="text-2xl font-bold text-white">{getOverallStats().total}</div>
                </div>
                <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
                  <div className="text-green-400 text-sm">Successful</div>
                  <div className="text-2xl font-bold text-green-400">{getOverallStats().successful}</div>
                </div>
                <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700">
                  <div className="text-yellow-400 text-sm">Warnings</div>
                  <div className="text-2xl font-bold text-yellow-400">{getOverallStats().warnings}</div>
                </div>
                <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
                  <div className="text-red-400 text-sm">Errors</div>
                  <div className="text-2xl font-bold text-red-400">{getOverallStats().errors}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress by Week */}
        {validationResults.length > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-6">
            {getPhaseProgress().map((phase) => (
              <Card key={phase.week} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getWeekIcon(phase.week)}
                      <CardTitle className="text-white text-lg">Week {phase.week}</CardTitle>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">{phase.percentage}%</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{phase.name}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Features</span>
                      <span className="text-white">{phase.completed}/{phase.features}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${phase.percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Validation Results */}
        {validationResults.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Validation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map(week => {
                  const weekResults = validationResults.filter(r => r.week === week);
                  if (weekResults.length === 0) return null;
                  
                  const weekInfo = week === 1 ? 'Financial Automation' :
                                  week === 2 ? 'Resident & Family Experience' :
                                  'Operational Excellence';
                  
                  return (
                    <div key={week} className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        {getWeekIcon(week)}
                        Week {week}: {weekInfo}
                      </h3>
                      <div className="grid gap-2">
                        {weekResults.map((result, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(result.status)}
                              <div>
                                <span className="text-white font-medium">{result.feature}</span>
                                <span className="text-gray-400 text-sm ml-2">({result.category})</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-400">
                              {result.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Alert */}
        {validationResults.length > 0 && (
          <Alert className="mt-6 bg-blue-900/30 border-blue-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-gray-300">
              <strong>Phase 5b Validation Complete:</strong> {getOverallStats().successful} of {getOverallStats().total} features 
              are fully operational. {getOverallStats().warnings > 0 && `${getOverallStats().warnings} features are ready but need data. `}
              {getOverallStats().errors > 0 && `${getOverallStats().errors} features need attention.`}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}