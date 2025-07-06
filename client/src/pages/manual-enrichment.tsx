import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PhotoIcon, StarIcon, InfoIcon } from 'lucide-react';

interface EnrichmentStats {
  total: number;
  withPhotos: number;
  withReviews: number;
  needingPhotos: number;
  needingReviews: number;
}

interface Community {
  id: number;
  name: string;
  city: string;
}

export default function ManualEnrichment() {
  const [stats, setStats] = useState<EnrichmentStats | null>(null);
  const [communitiesNeedingPhotos, setCommunitiesNeedingPhotos] = useState<Community[]>([]);
  const [communitiesNeedingReviews, setCommunitiesNeedingReviews] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, photosRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/enrichment/stats'),
        fetch('/api/admin/enrichment/communities-needing-photos'),
        fetch('/api/admin/enrichment/communities-needing-reviews')
      ]);

      const statsData = await statsRes.json();
      const photosData = await photosRes.json();
      const reviewsData = await reviewsRes.json();

      setStats(statsData);
      setCommunitiesNeedingPhotos(photosData);
      setCommunitiesNeedingReviews(reviewsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load enrichment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enrichCommunity = async (communityId: number, type: 'photos' | 'reviews') => {
    setEnriching(communityId);
    try {
      const response = await fetch(`/api/admin/enrichment/add-${type}/${communityId}`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Reload data to reflect changes
        loadData();
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to add ${type}`,
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manual Enrichment System</h1>
        <p className="text-muted-foreground">
          Add photos and reviews to communities only when you choose. No automatic processes.
        </p>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Communities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.withPhotos}</div>
              <p className="text-sm text-muted-foreground">Have Photos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.withReviews}</div>
              <p className="text-sm text-muted-foreground">Have Reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.needingPhotos}</div>
              <p className="text-sm text-muted-foreground">Need Photos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.needingReviews}</div>
              <p className="text-sm text-muted-foreground">Need Reviews</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert about the correct approach */}
      <Card className="mb-8 border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Correct Approach</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            This system only enriches communities when you explicitly click the buttons below. 
            All data is stored permanently in the database and displayed on your website without any additional API calls.
            <strong> No automatic background processes are running.</strong>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Communities Needing Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhotoIcon className="h-5 w-5" />
              Communities Needing Photos
            </CardTitle>
            <CardDescription>
              Click "Add Photos" to manually fetch and store photos for a community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {communitiesNeedingPhotos.length === 0 ? (
                <p className="text-muted-foreground">All communities have photos!</p>
              ) : (
                communitiesNeedingPhotos.map((community) => (
                  <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{community.name}</div>
                      <div className="text-sm text-muted-foreground">{community.city}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => enrichCommunity(community.id, 'photos')}
                      disabled={enriching === community.id}
                    >
                      {enriching === community.id ? 'Adding...' : 'Add Photos'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Communities Needing Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StarIcon className="h-5 w-5" />
              Communities Needing Reviews
            </CardTitle>
            <CardDescription>
              Click "Add Reviews" to manually fetch and store reviews for a community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {communitiesNeedingReviews.length === 0 ? (
                <p className="text-muted-foreground">All communities have reviews!</p>
              ) : (
                communitiesNeedingReviews.map((community) => (
                  <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{community.name}</div>
                      <div className="text-sm text-muted-foreground">{community.city}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => enrichCommunity(community.id, 'reviews')}
                      disabled={enriching === community.id}
                    >
                      {enriching === community.id ? 'Adding...' : 'Add Reviews'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}