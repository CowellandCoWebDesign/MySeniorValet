import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnterpriseWebSocket } from '@/hooks/useEnterpriseWebSocket';
import { apiRequest } from '@/lib/queryClient';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Activity,
  Shield,
  DollarSign,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface EnterpriseAlert {
  id: number;
  communityId: number | null;
  type: 'system' | 'revenue' | 'occupancy' | 'compliance' | 'performance';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  metadata?: Record<string, any>;
  createdAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: number | null;
  resolvedAt: string | null;
  resolvedBy: number | null;
}

interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  critical: number;
  warning: number;
  info: number;
}

export function EnterpriseAlerts() {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'critical'>('active');
  
  // Connect to WebSocket for real-time alerts
  const { isConnected, lastMessage } = useEnterpriseWebSocket(['alerts']);

  // Fetch alerts
  const { data: alerts = [], isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['/api/enterprise/monitoring/alerts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/enterprise/monitoring/alerts');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch alert statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/enterprise/monitoring/alerts/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/enterprise/monitoring/alerts/stats');
      return response.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Acknowledge alert mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest('POST', `/api/enterprise/monitoring/alerts/${alertId}/acknowledge`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/monitoring/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/monitoring/alerts/stats'] });
    }
  });

  // Resolve alert mutation
  const resolveMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest('POST', `/api/enterprise/monitoring/alerts/${alertId}/resolve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/monitoring/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/monitoring/alerts/stats'] });
    }
  });

  // Handle real-time WebSocket updates
  useEffect(() => {
    if (lastMessage?.channel === 'alerts') {
      if (lastMessage.data.type === 'new_alert') {
        // Refetch alerts when new alert arrives
        refetchAlerts();
      }
    }
  }, [lastMessage, refetchAlerts]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-4 w-4" />;
      case 'occupancy':
        return <Users className="h-4 w-4" />;
      case 'compliance':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Activity className="h-4 w-4" />;
      case 'system':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const filteredAlerts = alerts.filter((alert: EnterpriseAlert) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return alert.status === 'active';
    if (selectedFilter === 'critical') return alert.severity === 'critical';
    return true;
  });

  if (alertsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold">{stats?.active || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-primary opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-red-500">{stats?.critical || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold text-yellow-500">{stats?.warning || 0}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
              <p className="text-2xl font-bold text-green-500">{stats?.resolved || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={selectedFilter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('active')}
        >
          Active Only
        </Button>
        <Button
          variant={selectedFilter === 'critical' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('critical')}
        >
          Critical
        </Button>
        <Button
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('all')}
        >
          All Alerts
        </Button>
      </div>

      {/* Connection Status */}
      {isConnected && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Real-time monitoring active - Alerts will appear instantly
          </AlertDescription>
        </Alert>
      )}

      {/* Alerts List */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">System Alerts</h3>
          <p className="text-sm text-muted-foreground">
            {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts matching your criteria</p>
              </div>
            ) : (
              filteredAlerts.map((alert: EnterpriseAlert) => (
                <Card key={alert.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        {getTypeIcon(alert.type)}
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">{alert.type}</Badge>
                        {alert.status !== 'active' && (
                          <Badge variant="secondary">{alert.status}</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(alert.createdAt), 'MMM d, HH:mm')}
                        </span>
                        {alert.communityId && (
                          <span>Community #{alert.communityId}</span>
                        )}
                      </div>
                      
                      {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          <p className="font-semibold mb-1">Details:</p>
                          {Object.entries(alert.metadata).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-muted-foreground">{key}:</span>
                              <span>{JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {alert.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeMutation.mutate(alert.id)}
                            disabled={acknowledgeMutation.isPending}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => resolveMutation.mutate(alert.id)}
                            disabled={resolveMutation.isPending}
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => resolveMutation.mutate(alert.id)}
                          disabled={resolveMutation.isPending}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}