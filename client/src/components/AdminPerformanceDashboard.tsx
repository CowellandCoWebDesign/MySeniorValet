import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Activity,
  Database,
  Zap,
  TrendingUp,
  Server,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Gauge
} from "lucide-react";

interface PerformanceMetrics {
  cacheHitRate: number;
  averageQueryTime: number;
  totalApiCalls: number;
  slowQueries: Array<{
    query: string;
    time: number;
    count: number;
  }>;
  systemHealth: {
    cpu: number;
    memory: number;
    uptime: number;
  };
}

interface CacheStats {
  size: number;
  entries: Array<{
    key: string;
    size: number;
    hits: number;
    age: number;
    ttl: number;
    expired: boolean;
  }>;
  totalMemoryMB: string;
  totalHits: number;
  averageHits: string;
}

export default function AdminPerformanceDashboard() {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Fetch performance metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<PerformanceMetrics>({
    queryKey: ["/api/admin/performance/metrics"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch cache statistics
  const { data: cacheStats, isLoading: cacheLoading } = useQuery<CacheStats>({
    queryKey: ["/api/admin/cache/stats"],
    refetchInterval: 60000 // Refresh every minute
  });

  // Create performance indexes mutation
  const createIndexesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/performance/create-indexes", {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to create indexes");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Performance indexes created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create performance indexes",
        variant: "destructive"
      });
    }
  });

  // Warm cache mutation
  const warmCacheMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/performance/warm-cache", {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to warm cache");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cache warmed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cache/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to warm cache",
        variant: "destructive"
      });
    }
  });

  // Analyze database performance
  const analyzeDatabaseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/performance/analyze-db", {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to analyze database");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Database Analysis Complete",
        description: `Found ${data.data?.slowQueries?.length || 0} slow queries`
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze database performance",
        variant: "destructive"
      });
    }
  });

  const runFullOptimization = async () => {
    setIsOptimizing(true);
    try {
      await createIndexesMutation.mutateAsync();
      await warmCacheMutation.mutateAsync();
      await analyzeDatabaseMutation.mutateAsync();
      
      toast({
        title: "Optimization Complete",
        description: "All performance optimizations applied successfully"
      });
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  if (metricsLoading || cacheLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and optimize platform performance in real-time
          </p>
        </div>
        <Button 
          onClick={runFullOptimization}
          disabled={isOptimizing}
          size="lg"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Run Full Optimization
            </>
          )}
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.cacheHitRate ? `${(metrics.cacheHitRate * 100).toFixed(1)}%` : "0%"}
            </div>
            <Progress 
              value={metrics?.cacheHitRate ? metrics.cacheHitRate * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.averageQueryTime ? `${metrics.averageQueryTime.toFixed(0)}ms` : "0ms"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average database query response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalApiCalls?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total API calls today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Memory</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.totalMemoryMB || "0"} MB
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {cacheStats?.size || 0} entries cached
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache Analysis</TabsTrigger>
          <TabsTrigger value="queries">Slow Queries</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Actions</CardTitle>
              <CardDescription>
                Quick actions to improve platform performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Create Database Indexes</p>
                  <p className="text-xs text-muted-foreground">
                    Optimize database queries with strategic indexes
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => createIndexesMutation.mutate()}
                  disabled={createIndexesMutation.isPending}
                >
                  {createIndexesMutation.isPending ? "Creating..." : "Create Indexes"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Warm Cache</p>
                  <p className="text-xs text-muted-foreground">
                    Pre-load frequently accessed data into cache
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => warmCacheMutation.mutate()}
                  disabled={warmCacheMutation.isPending}
                >
                  {warmCacheMutation.isPending ? "Warming..." : "Warm Cache"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Analyze Database</p>
                  <p className="text-xs text-muted-foreground">
                    Identify and optimize slow queries
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => analyzeDatabaseMutation.mutate()}
                  disabled={analyzeDatabaseMutation.isPending}
                >
                  {analyzeDatabaseMutation.isPending ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Analytics</CardTitle>
              <CardDescription>
                Top cached entries by hit rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cacheStats?.entries?.slice(0, 10).map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.expired ? "destructive" : "default"}>
                        {entry.expired ? "Expired" : "Active"}
                      </Badge>
                      <span className="text-sm font-medium truncate max-w-xs">
                        {entry.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{entry.hits} hits</span>
                      <span>{(entry.size / 1024).toFixed(1)} KB</span>
                      <span>{entry.age}s old</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slow Query Analysis</CardTitle>
              <CardDescription>
                Database queries that need optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.slowQueries?.length ? (
                <div className="space-y-3">
                  {metrics.slowQueries.map((query, idx) => (
                    <div key={idx} className="border-b pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {query.time}ms avg
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {query.count} executions
                        </span>
                      </div>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded truncate">
                        {query.query}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No slow queries detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health Monitor</CardTitle>
              <CardDescription>
                Real-time system resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>{metrics?.systemHealth?.cpu || 0}%</span>
                </div>
                <Progress value={metrics?.systemHealth?.cpu || 0} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>{metrics?.systemHealth?.memory || 0}%</span>
                </div>
                <Progress value={metrics?.systemHealth?.memory || 0} />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Uptime</span>
                  <Badge variant="outline">
                    <Gauge className="h-3 w-3 mr-1" />
                    {Math.floor((metrics?.systemHealth?.uptime || 0) / 86400)} days
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}