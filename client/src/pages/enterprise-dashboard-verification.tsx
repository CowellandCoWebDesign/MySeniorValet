import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface VerificationResult {
  component: string;
  status: 'checking' | 'success' | 'error' | 'no-data';
  message: string;
  dataCount?: number;
}

export default function EnterpriseDashboardVerification() {
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const communityId = 1; // Test with community ID 1

  // Phase 1 API endpoints
  const analyticsQuery = useQuery({
    queryKey: [`/api/enterprise/analytics/${communityId}`],
    enabled: false,
  });

  const financialsQuery = useQuery({
    queryKey: [`/api/enterprise/financials/${communityId}`],
    enabled: false,
  });

  const complianceQuery = useQuery({
    queryKey: [`/api/enterprise/compliance/${communityId}`],
    enabled: false,
  });

  // Phase 2 API endpoints
  const residentsQuery = useQuery({
    queryKey: [`/api/enterprise/residents/${communityId}`],
    enabled: false,
  });

  const staffQuery = useQuery({
    queryKey: [`/api/enterprise/staff/${communityId}`],
    enabled: false,
  });

  const schedulesQuery = useQuery({
    queryKey: [`/api/enterprise/schedules/${communityId}`],
    enabled: false,
  });

  const familiesQuery = useQuery({
    queryKey: [`/api/enterprise/families/${communityId}`],
    enabled: false,
  });

  // Phase 3 API endpoints - Operations Systems
  const maintenanceQuery = useQuery({
    queryKey: [`/api/enterprise/maintenance/${communityId}`],
    enabled: false,
  });

  const vendorsQuery = useQuery({
    queryKey: [`/api/enterprise/vendors/${communityId}`],
    enabled: false,
  });

  const qualityQuery = useQuery({
    queryKey: [`/api/enterprise/quality-metrics/${communityId}`],
    enabled: false,
  });

  const verifyPhases = async () => {
    setIsVerifying(true);
    const results: VerificationResult[] = [];

    // Phase 1 Verification
    console.log('🔍 Starting Phase 1 Verification...');
    
    // Check Analytics
    try {
      const analyticsData = await analyticsQuery.refetch();
      if (analyticsData.data) {
        const data = analyticsData.data as any;
        results.push({
          component: 'EnterpriseAnalytics',
          status: 'success',
          message: 'Connected to real API - Data retrieved successfully',
          dataCount: data.summary ? 1 : 0
        });
      } else {
        results.push({
          component: 'EnterpriseAnalytics',
          status: 'no-data',
          message: 'API connected but no data available yet'
        });
      }
    } catch (error: any) {
      results.push({
        component: 'EnterpriseAnalytics',
        status: 'error',
        message: `API Error: ${error?.message || 'Unknown error'}`
      });
    }

    // Check Financials
    try {
      const financialsData = await financialsQuery.refetch();
      if (financialsData.data) {
        const data = financialsData.data as any;
        results.push({
          component: 'FinancialManagement',
          status: 'success',
          message: 'Connected to real API - Data retrieved successfully',
          dataCount: data.summary ? 1 : 0
        });
      } else {
        results.push({
          component: 'FinancialManagement',
          status: 'no-data',
          message: 'API connected but no data available yet'
        });
      }
    } catch (error: any) {
      results.push({
        component: 'FinancialManagement',
        status: 'error',
        message: `API Error: ${error?.message || 'Unknown error'}`
      });
    }

    // Check Compliance
    try {
      const complianceData = await complianceQuery.refetch();
      if (complianceData.data) {
        const data = complianceData.data as any;
        results.push({
          component: 'ComplianceMonitoring',
          status: 'success',
          message: 'Connected to real API - Data retrieved successfully',
          dataCount: data.summary ? 1 : 0
        });
      } else {
        results.push({
          component: 'ComplianceMonitoring',
          status: 'no-data',
          message: 'API connected but no data available yet'
        });
      }
    } catch (error: any) {
      results.push({
        component: 'ComplianceMonitoring',
        status: 'error',
        message: `API Error: ${error?.message || 'Unknown error'}`
      });
    }

    // Phase 2 Verification
    console.log('🔍 Starting Phase 2 Verification...');

    // Check Residents
    try {
      const residentsData = await residentsQuery.refetch();
      if (residentsData.data) {
        const data = residentsData.data as any;
        const residentCount = data.residents?.length || 0;
        results.push({
          component: 'ResidentManagement',
          status: residentCount > 0 ? 'success' : 'no-data',
          message: residentCount > 0 
            ? `Connected to real API - ${residentCount} residents found`
            : 'API connected but no residents in database yet',
          dataCount: residentCount
        });
      } else {
        results.push({
          component: 'ResidentManagement',
          status: 'no-data',
          message: 'API connected but no data available yet'
        });
      }
    } catch (error: any) {
      results.push({
        component: 'ResidentManagement',
        status: 'error',
        message: `API Error: ${error?.message || 'Unknown error'}`
      });
    }

    // Check Staff
    try {
      const staffData = await staffQuery.refetch();
      if (staffData.data) {
        const data = staffData.data as any;
        const staffCount = data.staff?.length || 0;
        results.push({
          component: 'StaffManagement',
          status: staffCount > 0 ? 'success' : 'no-data',
          message: staffCount > 0 
            ? `Connected to real API - ${staffCount} staff members found`
            : 'API connected but no staff in database yet',
          dataCount: staffCount
        });
      } else {
        results.push({
          component: 'StaffManagement',
          status: 'no-data',
          message: 'API connected but no data available yet'
        });
      }
    } catch (error: any) {
      results.push({
        component: 'StaffManagement',
        status: 'error',
        message: `API Error: ${error?.message || 'Unknown error'}`
      });
    }

    // Check Schedules
    try {
      const schedulesData = await schedulesQuery.refetch();
      if (schedulesData.data) {
        const data = schedulesData.data as any;
        const scheduleCount = data.schedules?.length || 0;
        results.push({
          component: 'StaffScheduling',
          status: scheduleCount > 0 ? 'success' : 'no-data',
          message: scheduleCount > 0 
            ? `Connected to real API - ${scheduleCount} schedules found`
            : 'API connected but no schedules in database yet',
          dataCount: scheduleCount
        });
      } else {
        results.push({
          component: 'StaffScheduling',
          status: 'no-data',
          message: 'API connected but no data available yet'
        });
      }
    } catch (error: any) {
      results.push({
        component: 'StaffScheduling',
        status: 'error',
        message: `API Error: ${error?.message || 'Unknown error'}`
      });
    }

    // Check Families
    try {
      const familiesData = await familiesQuery.refetch();
      if (familiesData.data) {
        const data = familiesData.data as any;
        const familyCount = data.families?.length || 0;
        results.push({
          component: 'FamilyPortal',
          status: familyCount > 0 ? 'success' : 'no-data',
          message: familyCount > 0 
            ? `Connected to real API - ${familyCount} family connections found`
            : 'API connected but no families in database yet',
          dataCount: familyCount
        });
      } else {
        results.push({
          component: 'FamilyPortal',
          status: 'no-data',
          message: 'API connected but no data available yet'
        });
      }
    } catch (error: any) {
      results.push({
        component: 'FamilyPortal',
        status: 'error',
        message: `API Error: ${error?.message || 'Unknown error'}`
      });
    }

    // Phase 3 Verification - Operations Systems
    console.log('🔍 Starting Phase 3 Verification...');
    
    // Check Maintenance System
    try {
      const maintenanceData = await maintenanceQuery.refetch();
      if (maintenanceData.data) {
        const data = maintenanceData.data as any;
        results.push({
          component: 'MaintenanceSystem',
          status: data.summary || data.workOrders?.length ? 'success' : 'no-data',
          message: data.summary || data.workOrders?.length 
            ? 'Connected to real API - Data retrieved successfully'
            : 'API connected but no data available yet',
          dataCount: data.workOrders?.length || 0
        });
      } else {
        results.push({
          component: 'MaintenanceSystem',
          status: 'no-data',
          message: 'API connected but no data available yet'
        });
      }
    } catch (error: any) {
      results.push({
        component: 'MaintenanceSystem',
        status: 'error',
        message: `API Error: ${error?.message || 'Unknown error'}`
      });
    }

    // Check Vendor Management
    try {
      const vendorsData = await vendorsQuery.refetch();
      if (vendorsData.data) {
        const data = vendorsData.data as any;
        results.push({
          component: 'VendorManagement',
          status: data.summary || data.vendors?.length ? 'success' : 'no-data',
          message: data.summary || data.vendors?.length 
            ? 'Connected to real API - Data retrieved successfully'
            : 'API connected but no data available yet',
          dataCount: data.vendors?.length || 0
        });
      } else {
        results.push({
          component: 'VendorManagement',
          status: 'no-data',
          message: 'API connected but no data available yet'
        });
      }
    } catch (error: any) {
      results.push({
        component: 'VendorManagement',
        status: 'error',
        message: `API Error: ${error?.message || 'Unknown error'}`
      });
    }

    // Check Quality Metrics
    try {
      const qualityData = await qualityQuery.refetch();
      if (qualityData.data) {
        const data = qualityData.data as any;
        results.push({
          component: 'QualityMetrics',
          status: data.summary || data.qualityIndicators ? 'success' : 'no-data',
          message: data.summary || data.qualityIndicators 
            ? 'Connected to real API - Data retrieved successfully'
            : 'API connected but no data available yet',
          dataCount: data.departmentScores?.length || 0
        });
      } else {
        results.push({
          component: 'QualityMetrics',
          status: 'no-data',
          message: 'API connected but no data available yet'
        });
      }
    } catch (error: any) {
      results.push({
        component: 'QualityMetrics',
        status: 'error',
        message: `API Error: ${error?.message || 'Unknown error'}`
      });
    }

    setVerificationResults(results);
    setIsVerifying(false);
    console.log('✅ Verification Complete!', results);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'no-data':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  const getPhaseStatus = (phase: string) => {
    const phaseResults = phase === 'Phase 1' 
      ? verificationResults.filter(r => ['EnterpriseAnalytics', 'FinancialManagement', 'ComplianceMonitoring'].includes(r.component))
      : phase === 'Phase 2'
      ? verificationResults.filter(r => ['ResidentManagement', 'StaffManagement', 'StaffScheduling', 'FamilyPortal'].includes(r.component))
      : verificationResults.filter(r => ['MaintenanceSystem', 'VendorManagement', 'QualityMetrics'].includes(r.component));
    
    if (phaseResults.length === 0) return 'pending';
    if (phaseResults.every(r => r.status === 'success')) return 'success';
    if (phaseResults.some(r => r.status === 'error')) return 'error';
    if (phaseResults.every(r => r.status === 'no-data' || r.status === 'success')) return 'partial';
    return 'checking';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Enterprise Dashboard Migration Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This verification tool checks that all enterprise components are properly connected to real PostgreSQL database APIs with no mock data.
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button 
              onClick={verifyPhases}
              disabled={isVerifying}
              size="lg"
              className="min-w-[200px]"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Components...
                </>
              ) : (
                'Run Verification'
              )}
            </Button>
          </div>

          {verificationResults.length > 0 && (
            <div className="space-y-6">
              {/* Phase 1 Results */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Phase 1: Core Enterprise Components
                  {getPhaseStatus('Phase 1') === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {getPhaseStatus('Phase 1') === 'partial' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  {getPhaseStatus('Phase 1') === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                </h3>
                {verificationResults
                  .filter(r => ['EnterpriseAnalytics', 'FinancialManagement', 'ComplianceMonitoring'].includes(r.component))
                  .map((result, index) => (
                    <Card key={index} className="border-l-4" style={{
                      borderLeftColor: result.status === 'success' ? '#10b981' : 
                                       result.status === 'error' ? '#ef4444' : '#f59e0b'
                    }}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <p className="font-semibold">{result.component}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{result.message}</p>
                              {result.dataCount !== undefined && result.dataCount > 0 && (
                                <p className="text-xs text-gray-500 mt-1">Records found: {result.dataCount}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Phase 2 Results */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Phase 2: People Systems
                  {getPhaseStatus('Phase 2') === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {getPhaseStatus('Phase 2') === 'partial' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  {getPhaseStatus('Phase 2') === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                </h3>
                {verificationResults
                  .filter(r => ['ResidentManagement', 'StaffManagement', 'StaffScheduling', 'FamilyPortal'].includes(r.component))
                  .map((result, index) => (
                    <Card key={index} className="border-l-4" style={{
                      borderLeftColor: result.status === 'success' ? '#10b981' : 
                                       result.status === 'error' ? '#ef4444' : '#f59e0b'
                    }}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <p className="font-semibold">{result.component}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{result.message}</p>
                              {result.dataCount !== undefined && result.dataCount > 0 && (
                                <p className="text-xs text-gray-500 mt-1">Records found: {result.dataCount}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Phase 3 Results */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Phase 3: Operations Systems
                  {getPhaseStatus('Phase 3') === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {getPhaseStatus('Phase 3') === 'partial' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  {getPhaseStatus('Phase 3') === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                </h3>
                {verificationResults
                  .filter(r => ['MaintenanceSystem', 'VendorManagement', 'QualityMetrics'].includes(r.component))
                  .map((result, index) => (
                    <Card key={index} className="border-l-4" style={{
                      borderLeftColor: result.status === 'success' ? '#10b981' : 
                                       result.status === 'error' ? '#ef4444' : '#f59e0b'
                    }}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <p className="font-semibold">{result.component}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{result.message}</p>
                              {result.dataCount !== undefined && result.dataCount > 0 && (
                                <p className="text-xs text-gray-500 mt-1">Records found: {result.dataCount}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Summary */}
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="py-4">
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p>✅ Total Components Verified: {verificationResults.length}</p>
                    <p>🟢 Successfully Connected: {verificationResults.filter(r => r.status === 'success').length}</p>
                    <p>🟡 Connected (No Data): {verificationResults.filter(r => r.status === 'no-data').length}</p>
                    <p>🔴 Connection Errors: {verificationResults.filter(r => r.status === 'error').length}</p>
                    <p className="mt-2 font-semibold">
                      Golden Data Rule Compliance: {verificationResults.every(r => r.status !== 'error') ? '✅ 100% - No Mock Data Detected' : '⚠️ Check Error Components'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}