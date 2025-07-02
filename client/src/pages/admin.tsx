import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, Map, Building2, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LicensingStats {
  total: number;
  licensed: number;
  byState: Record<string, { total: number; licensed: number; }>;
  byLicenseStatus: Record<string, number>;
  byDataSource: Record<string, number>;
  lastUpdated: string;
}

export default function Admin() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<LicensingStats | null>(null);
  const { toast } = useToast();

  const handleScrapeState = async (state: string) => {
    setLoading(prev => ({ ...prev, [state]: true }));
    
    try {
      const response = await fetch(`/api/admin/scrape-licensing/${state}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      toast({
        title: "Scraping Initiated",
        description: data.message || `Started ${state} licensing database scraping`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Scraping Failed",
        description: `Failed to initiate ${state} licensing scrape`,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [state]: false }));
    }
  };

  const handleScrapeAll = async () => {
    setLoading(prev => ({ ...prev, all: true }));
    
    try {
      const response = await fetch('/api/admin/scrape-licensing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      toast({
        title: "Comprehensive Search Initiated",
        description: "Collecting both licensed facilities and unlicensed senior communities...",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Scraping Failed",
        description: "Failed to initiate comprehensive data collection",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  const fetchStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    
    try {
      const response = await fetch('/api/admin/licensing-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast({
        title: "Stats Failed",
        description: "Failed to fetch licensing statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const states = [
    { code: 'CA', name: 'California', source: 'Community Care Licensing' },
    { code: 'TX', name: 'Texas', source: 'Health and Human Services' },
    { code: 'FL', name: 'Florida', source: 'Agency for Health Care Administration' },
    { code: 'NY', name: 'New York', source: 'Department of Health' },
    { code: 'PA', name: 'Pennsylvania', source: 'Department of Human Services' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">State Licensing Database Integration</h1>
          <p className="text-muted-foreground">
            Manage and monitor authentic senior living facility data from state licensing databases
          </p>
        </div>
        <Button
          onClick={fetchStats}
          disabled={loading.stats}
          variant="outline"
        >
          {loading.stats ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
          Refresh Stats
        </Button>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Licensed Facilities</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.licensed}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.licensed / stats.total) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">States Covered</CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.byState).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.byDataSource).length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* State-by-State Scraping */}
      <Card>
        <CardHeader>
          <CardTitle>State Licensing Database Scraping</CardTitle>
          <CardDescription>
            Scrape authentic facility data from official state licensing databases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              onClick={handleScrapeAll}
              disabled={loading.all}
              className="flex-1"
            >
              {loading.all ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Scrape All States
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {states.map((state) => (
              <Card key={state.code} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{state.name}</CardTitle>
                    <Badge variant="outline">{state.code}</Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {state.source}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats && stats.byState[state.code] && (
                    <div className="text-sm text-muted-foreground mb-3">
                      {stats.byState[state.code].licensed} licensed of {stats.byState[state.code].total} total
                    </div>
                  )}
                  <Button
                    onClick={() => handleScrapeState(state.code)}
                    disabled={loading[state.code]}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {loading[state.code] ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Database className="h-4 w-4 mr-2" />
                    )}
                    Scrape {state.code}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* License Status Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>License Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byLicenseStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{status}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <Badge 
                        variant={status === 'Active' || status === 'Licensed' ? 'default' : 'secondary'}
                      >
                        {Math.round((count / stats.total) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byDataSource).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <Badge variant="outline">
                        {Math.round((count / stats.total) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 inline mr-1" />
        Data sourced from official state licensing databases for maximum authenticity and transparency
      </div>
    </div>
  );
}