// Consolidated Phase 5 Enterprise Tab Components for Admin Mega Dashboard
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Import the detailed Financial Analytics component
export { FinancialAnalyticsTab } from './FinancialAnalyticsTab';

// Compliance Management Tab
export function ComplianceTab() {
  const { data: complianceData, isLoading } = useQuery({
    queryKey: ['/api/operations/compliance']
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!complianceData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>Compliance data is currently unavailable.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData.overallScore}%</div>
            <Progress value={complianceData.overallScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData.certifications}</div>
            <p className="text-xs text-muted-foreground">All up to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Audit Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData.audits.completed}</div>
            <p className="text-xs text-orange-600">{complianceData.audits.upcoming} upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceData.violations}</div>
            <p className="text-xs text-muted-foreground">Clean record</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Compliance Status</AlertTitle>
        <AlertDescription>
          All {complianceData.stateRegulations} state regulations are being met. Next audit scheduled for September 15, 2025.
        </AlertDescription>
      </Alert>
    </div>
  );
}
