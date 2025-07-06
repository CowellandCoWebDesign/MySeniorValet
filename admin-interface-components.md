# Admin Interface Components for Manual Controls

## 1. ENRICHMENT CONTROL COMPONENTS

### Individual Community Enrichment
```jsx
// Add to your existing admin dashboard
const EnrichmentControls = ({ communityId, communityName }) => {
  const [enriching, setEnriching] = useState(null);
  const { toast } = useToast();

  const enrichCommunity = async (type) => {
    setEnriching(type);
    try {
      const response = await fetch(`/api/admin/enrichment/add-${type}/${communityId}`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `${result.message}. Cost: $${result.cost.toFixed(2)}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error adding ${type}`,
        variant: "destructive"
      });
    } finally {
      setEnriching(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        onClick={() => enrichCommunity('photos')}
        disabled={enriching === 'photos'}
      >
        {enriching === 'photos' ? 'Adding Photos...' : 'Add Photos'}
      </Button>
      <Button 
        size="sm" 
        onClick={() => enrichCommunity('reviews')}
        disabled={enriching === 'reviews'}
      >
        {enriching === 'reviews' ? 'Adding Reviews...' : 'Add Reviews'}
      </Button>
    </div>
  );
};
```

### Bulk Enrichment with Selection
```jsx
const BulkEnrichmentControls = () => {
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [enriching, setEnriching] = useState(null);
  const [stats, setStats] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
    loadCommunities();
  }, []);

  const loadStats = async () => {
    const response = await fetch('/api/admin/enrichment/stats');
    const data = await response.json();
    setStats(data);
  };

  const loadCommunities = async () => {
    const [photosRes, reviewsRes] = await Promise.all([
      fetch('/api/admin/enrichment/communities-needing-photos'),
      fetch('/api/admin/enrichment/communities-needing-reviews')
    ]);
    const photos = await photosRes.json();
    const reviews = await reviewsRes.json();
    setCommunities({ needingPhotos: photos, needingReviews: reviews });
  };

  const bulkEnrich = async (type) => {
    if (selectedCommunities.length === 0) {
      toast({
        title: "Error",
        description: "Please select communities first",
        variant: "destructive"
      });
      return;
    }

    setEnriching(type);
    try {
      const response = await fetch(`/api/admin/enrichment/bulk-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityIds: selectedCommunities })
      });
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `${result.message}. Total cost: $${result.totalCost.toFixed(2)}`,
        });
        loadStats();
        loadCommunities();
        setSelectedCommunities([]);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error in bulk ${type} enrichment`,
        variant: "destructive"
      });
    } finally {
      setEnriching(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Enrichment Controls</CardTitle>
        <CardDescription>
          Select communities and enrich them with photos or reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats Display */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.withPhotos}</div>
              <div className="text-sm text-muted-foreground">With Photos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.withReviews}</div>
              <div className="text-sm text-muted-foreground">With Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.needingPhotos}</div>
              <div className="text-sm text-muted-foreground">Need Photos</div>
            </div>
          </div>
        )}

        {/* Community Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold">Communities Needing Photos</h3>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {communities.needingPhotos?.map(community => (
              <div key={community.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`photo-${community.id}`}
                  checked={selectedCommunities.includes(community.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCommunities([...selectedCommunities, community.id]);
                    } else {
                      setSelectedCommunities(selectedCommunities.filter(id => id !== community.id));
                    }
                  }}
                />
                <Label htmlFor={`photo-${community.id}`} className="text-sm">
                  {community.name} - {community.city}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button 
            onClick={() => bulkEnrich('photos')}
            disabled={enriching === 'photos'}
            variant="outline"
          >
            {enriching === 'photos' ? 'Adding Photos...' : `Add Photos (${selectedCommunities.length})`}
          </Button>
          <Button 
            onClick={() => bulkEnrich('reviews')}
            disabled={enriching === 'reviews'}
            variant="outline"
          >
            {enriching === 'reviews' ? 'Adding Reviews...' : `Add Reviews (${selectedCommunities.length})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

## 2. EXPANSION CONTROL COMPONENTS

### County Expansion Interface
```jsx
const CountyExpansionControls = () => {
  const [availableCounties, setAvailableCounties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [expanding, setExpanding] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableCounties();
  }, []);

  const loadAvailableCounties = async () => {
    const response = await fetch('/api/admin/expansion/available-counties');
    const data = await response.json();
    setAvailableCounties(data.available);
  };

  const expandCounty = async () => {
    if (!selectedCounty) {
      toast({
        title: "Error",
        description: "Please select a county",
        variant: "destructive"
      });
      return;
    }

    setExpanding(true);
    try {
      const response = await fetch('/api/admin/expansion/research-county', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ county: selectedCounty })
      });
      const result = await response.json();
      
      if (response.ok) {
        setLastResult(result.result);
        toast({
          title: "Success",
          description: `${result.message}: Found ${result.result.added} new communities`,
        });
        // Refresh available counties
        loadAvailableCounties();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error researching county",
        variant: "destructive"
      });
    } finally {
      setExpanding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>County Expansion</CardTitle>
        <CardDescription>
          Research and add communities from new counties
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Select County to Research</Label>
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a county..." />
              </SelectTrigger>
              <SelectContent>
                {availableCounties.map(county => (
                  <SelectItem key={county} value={county}>
                    {county} County
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={expandCounty}
            disabled={expanding || !selectedCounty}
            className="w-full"
          >
            {expanding ? 'Researching County...' : 'Research County'}
          </Button>

          {/* Last Result Display */}
          {lastResult && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">
                {lastResult.county} County Results:
              </h4>
              <ul className="text-sm text-green-700 mt-2">
                <li>• Discovered: {lastResult.discovered.length} communities</li>
                <li>• Added: {lastResult.added} new communities</li>
                <li>• Duplicates filtered: {lastResult.duplicates}</li>
                {lastResult.errors.length > 0 && (
                  <li>• Errors: {lastResult.errors.length}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

## 3. COST MONITORING COMPONENT

### Real-time Cost Monitor
```jsx
const CostMonitor = () => {
  const [costStatus, setCostStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadCostStatus = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/admin/api-costs');
      const data = await response.json();
      setCostStatus(data);
    } catch (error) {
      console.error('Error loading cost status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCostStatus();
    const interval = setInterval(loadCostStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const emergencyStop = async () => {
    try {
      const response = await fetch('/api/admin/api-costs/emergency-stop', {
        method: 'POST'
      });
      if (response.ok) {
        loadCostStatus();
      }
    } catch (error) {
      console.error('Error triggering emergency stop:', error);
    }
  };

  if (!costStatus) return <div>Loading cost status...</div>;

  const { usage, limits } = costStatus;
  const costPercentage = (usage.dailyCost / limits.maxDailyCost) * 100;
  const callsPercentage = (usage.dailyCalls / limits.maxDailyCalls) * 100;

  return (
    <Card className={`${usage.emergencyStop ? 'border-red-500' : costPercentage > 80 ? 'border-orange-500' : 'border-green-500'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          API Cost Monitor
          <Button 
            size="sm" 
            variant="outline" 
            onClick={loadCostStatus}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium">Daily Cost</div>
            <div className={`text-2xl font-bold ${costPercentage > 80 ? 'text-red-600' : 'text-green-600'}`}>
              ${usage.dailyCost.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              of ${limits.maxDailyCost} limit ({costPercentage.toFixed(1)}%)
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Daily Calls</div>
            <div className={`text-2xl font-bold ${callsPercentage > 80 ? 'text-red-600' : 'text-green-600'}`}>
              {usage.dailyCalls}
            </div>
            <div className="text-xs text-muted-foreground">
              of {limits.maxDailyCalls} limit ({callsPercentage.toFixed(1)}%)
            </div>
          </div>
        </div>

        {usage.emergencyStop && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="text-red-800 font-semibold">⚠️ EMERGENCY STOP ACTIVE</div>
            <div className="text-red-600 text-sm">All API operations are halted</div>
          </div>
        )}

        {costPercentage > 80 && !usage.emergencyStop && (
          <div className="mt-4">
            <Button 
              onClick={emergencyStop}
              variant="destructive"
              size="sm"
            >
              Emergency Stop
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

## 4. INTEGRATION INSTRUCTIONS

### Add to Your Existing Admin Dashboard
```jsx
// In your admin dashboard component, add these sections:

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Cost Monitor - Always visible */}
  <CostMonitor />
  
  {/* Expansion Controls */}
  <CountyExpansionControls />
  
  {/* Bulk Enrichment */}
  <BulkEnrichmentControls />
</div>
```

### Required Imports
```jsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
```

## 5. AVAILABLE API ENDPOINTS

### Enrichment Endpoints
- `GET /api/admin/enrichment/stats` - Get enrichment statistics
- `GET /api/admin/enrichment/communities-needing-photos` - List communities without photos
- `GET /api/admin/enrichment/communities-needing-reviews` - List communities without reviews
- `POST /api/admin/enrichment/add-photos/:id` - Add photos to specific community
- `POST /api/admin/enrichment/add-reviews/:id` - Add reviews to specific community
- `POST /api/admin/enrichment/bulk-photos` - Bulk add photos to selected communities
- `POST /api/admin/enrichment/bulk-reviews` - Bulk add reviews to selected communities

### Expansion Endpoints
- `GET /api/admin/expansion/available-counties` - Get counties available for expansion
- `POST /api/admin/expansion/research-county` - Research and add communities from county

### Cost Monitoring Endpoints
- `GET /api/admin/api-costs` - Get current API usage and cost status
- `POST /api/admin/api-costs/emergency-stop` - Trigger emergency stop
- `POST /api/admin/api-costs/reset-emergency` - Reset emergency stop (admin only)

## 6. KEY FEATURES

✅ **Cost Protection**: All operations check cost limits before running
✅ **Manual Control**: Nothing runs automatically - only when you click
✅ **Configurable**: Select individual communities or bulk operations
✅ **Immediate Refresh**: Results refresh automatically after operations
✅ **Real-time Monitoring**: Cost status updates every 30 seconds
✅ **Emergency Stop**: Manual override to halt all API operations
✅ **County Expansion**: Add entire counties with one click
✅ **Bulk Operations**: Process multiple communities at once
✅ **Progress Tracking**: See exactly what was added and costs incurred