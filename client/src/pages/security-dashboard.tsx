import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, Activity, Lock, Users, Clock, Server, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  threats: {
    sqlInjection: number;
    xss: number;
    ddos: number;
    bruteForce: number;
    suspicious: number;
  };
  topBlockedIPs: Array<{
    ip: string;
    count: number;
    lastBlocked: string;
    reason: string;
  }>;
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  uptime: number;
}

interface MaintenanceModeConfig {
  enabled: boolean;
  message: string;
  expectedDuration?: string;
  allowedIPs: string[];
  allowedEmails: string[];
  startedAt?: string;
  scheduledEnd?: string;
}

interface ThreatAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  ip: string;
  timestamp: string;
  details: any;
  resolved: boolean;
}

export default function SecurityDashboard() {
  const { toast } = useToast();
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [expectedDuration, setExpectedDuration] = useState("");
  const [newAllowedIP, setNewAllowedIP] = useState("");
  const [newAllowedEmail, setNewAllowedEmail] = useState("");

  // Fetch security metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<SecurityMetrics>({
    queryKey: ["/api/admin/security/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch maintenance mode status
  const { data: maintenanceStatus, isLoading: maintenanceLoading } = useQuery<MaintenanceModeConfig>({
    queryKey: ["/api/maintenance/status"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch threat alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery<ThreatAlert[]>({
    queryKey: ["/api/admin/security/alerts"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Toggle maintenance mode
  const toggleMaintenance = useMutation({
    mutationFn: async (enable: boolean) => {
      if (enable) {
        return apiRequest("POST", "/api/maintenance/enable", {
          message: maintenanceMessage || undefined,
          expectedDuration: expectedDuration || undefined,
        });
      } else {
        return apiRequest("POST", "/api/maintenance/disable");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/status"] });
      toast({
        title: maintenanceStatus?.enabled ? "Maintenance Mode Disabled" : "Maintenance Mode Enabled",
        description: maintenanceStatus?.enabled 
          ? "The platform is now accessible to all users" 
          : "Only authorized users can access the platform",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to toggle maintenance mode",
        variant: "destructive",
      });
    },
  });

  // Add allowed IP
  const addAllowedIP = useMutation({
    mutationFn: async (ip: string) => {
      return apiRequest("POST", "/api/maintenance/allowed-ip", { ip, action: "add" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/status"] });
      setNewAllowedIP("");
      toast({
        title: "IP Added",
        description: "The IP address has been added to the allowlist",
      });
    },
  });

  // Remove allowed IP
  const removeAllowedIP = useMutation({
    mutationFn: async (ip: string) => {
      return apiRequest("POST", "/api/maintenance/allowed-ip", { ip, action: "remove" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/status"] });
      toast({
        title: "IP Removed",
        description: "The IP address has been removed from the allowlist",
      });
    },
  });

  // Add allowed email
  const addAllowedEmail = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/maintenance/allowed-email", { email, action: "add" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/status"] });
      setNewAllowedEmail("");
      toast({
        title: "Email Added",
        description: "The email has been added to the allowlist",
      });
    },
  });

  // Remove allowed email
  const removeAllowedEmail = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/maintenance/allowed-email", { email, action: "remove" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/status"] });
      toast({
        title: "Email Removed",
        description: "The email has been removed from the allowlist",
      });
    },
  });

  // Resolve threat alert
  const resolveAlert = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("POST", `/api/admin/security/alerts/${alertId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security/alerts"] });
      toast({
        title: "Alert Resolved",
        description: "The security alert has been marked as resolved",
      });
    },
  });

  const getThreatBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  useEffect(() => {
    if (maintenanceStatus) {
      setMaintenanceMessage(maintenanceStatus.message || "");
      setExpectedDuration(maintenanceStatus.expectedDuration || "");
    }
  }, [maintenanceStatus]);

  if (metricsLoading || maintenanceLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor and manage platform security</p>
        </div>
        <Badge variant={metrics?.uptime === 100 ? "default" : "destructive"}>
          {metrics?.uptime}% Uptime
        </Badge>
      </div>

      {/* Maintenance Mode Alert */}
      {maintenanceStatus?.enabled && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Maintenance Mode Active</AlertTitle>
          <AlertDescription>
            {maintenanceStatus.message}
            {maintenanceStatus.expectedDuration && ` (Expected duration: ${maintenanceStatus.expectedDuration})`}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.blockedRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics && metrics.totalRequests > 0 
                    ? `${((metrics.blockedRequests / metrics.totalRequests) * 100).toFixed(1)}% block rate`
                    : "0% block rate"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.responseTime.average.toFixed(0)}ms</div>
                <p className="text-xs text-muted-foreground">
                  P95: {metrics?.responseTime.p95.toFixed(0)}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alerts?.filter(a => !a.resolved).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Unresolved alerts</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Response time distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average</span>
                  <span className="font-mono">{metrics?.responseTime.average.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">P95</span>
                  <span className="font-mono">{metrics?.responseTime.p95.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">P99</span>
                  <span className="font-mono">{metrics?.responseTime.p99.toFixed(0)}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Detection Summary</CardTitle>
              <CardDescription>Detected threats by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.threats && Object.entries(metrics.threats).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                    <Badge variant={count > 0 ? "destructive" : "secondary"}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Blocked IPs</CardTitle>
              <CardDescription>Most frequently blocked IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics?.topBlockedIPs?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No blocked IPs</p>
                ) : (
                  metrics?.topBlockedIPs?.map((ip) => (
                    <div key={ip.ip} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div>
                        <p className="font-mono text-sm">{ip.ip}</p>
                        <p className="text-xs text-muted-foreground">{ip.reason}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">{ip.count} blocks</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(ip.lastBlocked), 'MMM d, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode Control</CardTitle>
              <CardDescription>
                Enable maintenance mode to restrict access to authorized users only
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {maintenanceStatus?.enabled ? (
                    <WifiOff className="h-5 w-5 text-destructive" />
                  ) : (
                    <Wifi className="h-5 w-5 text-green-500" />
                  )}
                  <Label htmlFor="maintenance-toggle">
                    Maintenance Mode {maintenanceStatus?.enabled ? "Active" : "Inactive"}
                  </Label>
                </div>
                <Switch
                  id="maintenance-toggle"
                  checked={maintenanceStatus?.enabled || false}
                  onCheckedChange={(checked) => toggleMaintenance.mutate(checked)}
                  disabled={toggleMaintenance.isPending}
                />
              </div>

              {maintenanceStatus?.startedAt && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Started at: {format(new Date(maintenanceStatus.startedAt), 'PPpp')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <Textarea
                  id="maintenance-message"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Enter a message to display to users..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected-duration">Expected Duration</Label>
                <Input
                  id="expected-duration"
                  value={expectedDuration}
                  onChange={(e) => setExpectedDuration(e.target.value)}
                  placeholder="e.g., 2 hours, 30 minutes"
                />
              </div>

              {!maintenanceStatus?.enabled && (
                <Button
                  onClick={() => toggleMaintenance.mutate(true)}
                  disabled={toggleMaintenance.isPending}
                  className="w-full"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Enable Maintenance Mode
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Allowed IPs */}
          <Card>
            <CardHeader>
              <CardTitle>Allowed IP Addresses</CardTitle>
              <CardDescription>IPs that can access the platform during maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAllowedIP}
                  onChange={(e) => setNewAllowedIP(e.target.value)}
                  placeholder="Enter IP address..."
                />
                <Button
                  onClick={() => newAllowedIP && addAllowedIP.mutate(newAllowedIP)}
                  disabled={!newAllowedIP || addAllowedIP.isPending}
                >
                  Add IP
                </Button>
              </div>
              <div className="space-y-2">
                {maintenanceStatus?.allowedIPs?.map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="font-mono text-sm">{ip}</span>
                    {!['127.0.0.1', '::1'].includes(ip) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAllowedIP.mutate(ip)}
                        disabled={removeAllowedIP.isPending}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allowed Emails */}
          <Card>
            <CardHeader>
              <CardTitle>Allowed Email Addresses</CardTitle>
              <CardDescription>Users who can access the platform during maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newAllowedEmail}
                  onChange={(e) => setNewAllowedEmail(e.target.value)}
                  placeholder="Enter email address..."
                />
                <Button
                  onClick={() => newAllowedEmail && addAllowedEmail.mutate(newAllowedEmail)}
                  disabled={!newAllowedEmail || addAllowedEmail.isPending}
                >
                  Add Email
                </Button>
              </div>
              <div className="space-y-2">
                {maintenanceStatus?.allowedEmails?.map((email) => (
                  <div key={email} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">{email}</span>
                    {!['william.cowell01@gmail.com', 'admin@myseniorvalet.com'].includes(email.toLowerCase()) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAllowedEmail.mutate(email)}
                        disabled={removeAllowedEmail.isPending}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Recent security events requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {!alerts || alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No security alerts</p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.resolved ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getThreatBadgeVariant(alert.type)}>
                              {alert.type.toUpperCase()}
                            </Badge>
                            {alert.resolved && (
                              <Badge variant="outline">Resolved</Badge>
                            )}
                          </div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground">
                            IP: {alert.ip} • {format(new Date(alert.timestamp), 'PPpp')}
                          </p>
                          {alert.details && (
                            <pre className="text-xs bg-muted p-2 rounded mt-2">
                              {JSON.stringify(alert.details, null, 2)}
                            </pre>
                          )}
                        </div>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert.mutate(alert.id)}
                            disabled={resolveAlert.isPending}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}