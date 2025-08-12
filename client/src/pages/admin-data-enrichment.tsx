/**
 * Admin Data Enrichment Control Panel
 * Allows admins to manage live pricing data enrichment
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { 
  Database, 
  RefreshCw, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  MapPin,
  Clock,
  Target,
  Activity,
  Settings,
  Download
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const US_STATES = [
  { code: 'CA', name: 'California' },
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'NY', name: 'New York' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'IL', name: 'Illinois' },
  { code: 'OH', name: 'Ohio' },
  { code: 'GA', name: 'Georgia' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'MI', name: 'Michigan' }
];

export default function AdminDataEnrichmentPage() {
  const { toast } = useToast();
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [batchSize, setBatchSize] = useState(50);
  const [onlyMissingPricing, setOnlyMissingPricing] = useState(true);
  const [specificCommunityIds, setSpecificCommunityIds] = useState('');

  // Fetch enrichment status
  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ['enrichment-status'],
    queryFn: async () => {
      const response = await fetch('/api/admin/enrichment/status', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch status');
      return response.json();
    },
    refetchInterval: status?.isRunning ? 5000 : undefined // Poll every 5 seconds when running
  });

  // Start enrichment mutation
  const startEnrichment = useMutation({
    mutationFn: async (params: { batchSize: number; targetStates: string[]; onlyMissingPricing: boolean }) => {
      const response = await fetch('/api/admin/enrichment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to start enrichment');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Enrichment Started",
        description: `Processing ${data.stats.totalBatches} batches of communities`,
      });
      refetchStatus();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start enrichment process",
        variant: "destructive"
      });
    }
  });

  // Test enrichment on specific communities
  const testEnrichment = useMutation({
    mutationFn: async (communityIds: number[]) => {
      const response = await fetch('/api/admin/enrichment/specific', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ communityIds })
      });
      if (!response.ok) throw new Error('Failed to test enrichment');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test Complete",
        description: `Enriched ${data.results.filter((r: any) => r.success).length} of ${data.results.length} communities`,
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: "Failed to test enrichment",
        variant: "destructive"
      });
    }
  });

  const handleStartEnrichment = () => {
    startEnrichment.mutate({
      batchSize,
      targetStates: selectedStates,
      onlyMissingPricing
    });
  };

  const handleTestEnrichment = () => {
    const ids = specificCommunityIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (ids.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid community IDs separated by commas",
        variant: "destructive"
      });
      return;
    }
    testEnrichment.mutate(ids);
  };

  const toggleState = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const progressPercentage = status?.stats?.totalBatches > 0 
    ? (status.stats.currentBatch / status.stats.totalBatches) * 100 
    : 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          Data Enrichment Service
        </h1>
        <p className="text-gray-600 mt-2">
          Fetch live pricing and availability data from public sources to enrich community information
        </p>
      </div>

      {/* Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Service Status
            </span>
            <Badge variant={status?.isRunning ? "default" : "secondary"}>
              {status?.isRunning ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Running
                </>
              ) : (
                'Idle'
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status?.isRunning && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">
                  Batch {status.stats.currentBatch} of {status.stats.totalBatches}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {status?.stats?.totalProcessed || 0}
              </div>
              <div className="text-sm text-gray-600">Total Processed</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {status?.stats?.successfulEnrichments || 0}
              </div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">
                {status?.stats?.failedEnrichments || 0}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-900">
                {status?.stats?.lastRunTime 
                  ? new Date(status.stats.lastRunTime).toLocaleString()
                  : 'Never'}
              </div>
              <div className="text-sm text-gray-600">Last Run</div>
            </div>
          </div>

          {status?.nextScheduledRun && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Next scheduled run: {new Date(status.nextScheduledRun).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Tabs */}
      <Tabs defaultValue="batch" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batch">Batch Enrichment</TabsTrigger>
          <TabsTrigger value="specific">Specific Communities</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Enrichment</CardTitle>
              <CardDescription>
                Process multiple communities to fetch missing pricing and availability data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* State Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Target States</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {US_STATES.map(state => (
                    <div key={state.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={state.code}
                        checked={selectedStates.includes(state.code)}
                        onCheckedChange={() => toggleState(state.code)}
                      />
                      <Label
                        htmlFor={state.code}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {state.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedStates.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Leave empty to process all states
                  </p>
                )}
              </div>

              {/* Batch Size */}
              <div>
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 50)}
                  min={1}
                  max={500}
                  className="w-32"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Number of communities to process in this batch
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="missing-pricing"
                    checked={onlyMissingPricing}
                    onCheckedChange={(checked) => setOnlyMissingPricing(checked as boolean)}
                  />
                  <Label htmlFor="missing-pricing" className="text-sm font-normal">
                    Only process communities missing pricing data
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleStartEnrichment}
                  disabled={status?.isRunning || startEnrichment.isPending}
                  className="flex items-center gap-2"
                >
                  {status?.isRunning ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Enrichment
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => refetchStatus()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specific">
          <Card>
            <CardHeader>
              <CardTitle>Test Specific Communities</CardTitle>
              <CardDescription>
                Test enrichment on specific community IDs for debugging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="community-ids">Community IDs (comma-separated)</Label>
                <Input
                  id="community-ids"
                  placeholder="e.g., 123, 456, 789"
                  value={specificCommunityIds}
                  onChange={(e) => setSpecificCommunityIds(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <Button
                onClick={handleTestEnrichment}
                disabled={testEnrichment.isPending || !specificCommunityIds.trim()}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Test Enrichment
              </Button>

              {/* Test Results */}
              {testEnrichment.isSuccess && testEnrichment.data && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Test Results:</h4>
                  <div className="space-y-2">
                    {testEnrichment.data.results.map((result: any) => (
                      <div key={result.communityId} className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          Community {result.communityId}: {result.success ? 'Success' : result.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Enrichment Settings</CardTitle>
              <CardDescription>
                Configure how the enrichment service operates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Important Notes</h4>
                      <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                        <li>• Enrichment fetches data from public sources using AI search</li>
                        <li>• Process runs with rate limiting to avoid API throttling</li>
                        <li>• Only communities with missing data are processed</li>
                        <li>• Data is cached for 30 days before re-enrichment</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Data Sources</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Perplexity AI Web Search
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        HUD Database (for HUD properties)
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Public Community Websites
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Data Types Enriched</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        Monthly Rent Ranges
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Availability Status
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Contact Information
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}