import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Globe, CheckCircle, XCircle, MapPin, Building, Clock, Phone, Mail, Link2, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingCommunity {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  careTypes?: string[];
  discoverySource?: string;
  discoveryDate?: string;
  data_source?: string;
}

export function GlobalDiscoveryApprovalQueue() {
  const [pendingCommunities, setPendingCommunities] = useState<PendingCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Fetch pending communities
  const fetchPendingCommunities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/global-discovery/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingCommunities(data.communities || []);
      }
    } catch (error) {
      console.error('Error fetching pending communities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending communities',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Approve a community
  const handleApprove = async (communityId: number) => {
    setProcessingId(communityId);
    try {
      const response = await fetch(`/api/global-discovery/approve/${communityId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: 'Community Approved',
          description: 'The community has been verified and approved',
        });
        // Remove from pending list
        setPendingCommunities(prev => prev.filter(c => c.id !== communityId));
      } else {
        throw new Error('Approval failed');
      }
    } catch (error) {
      console.error('Error approving community:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve community',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  // Reject a community
  const handleReject = async (communityId: number) => {
    setProcessingId(communityId);
    try {
      const response = await fetch(`/api/global-discovery/reject/${communityId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: 'Community Rejected',
          description: 'The community has been removed from pending queue',
        });
        // Remove from pending list
        setPendingCommunities(prev => prev.filter(c => c.id !== communityId));
      } else {
        throw new Error('Rejection failed');
      }
    } catch (error) {
      console.error('Error rejecting community:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject community',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  useEffect(() => {
    fetchPendingCommunities();
  }, []);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading pending communities...
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              Global Discovery Approval Queue
            </CardTitle>
            <CardDescription>
              Review and approve communities discovered through global searches
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Sparkles className="w-4 h-4 mr-1" />
            {pendingCommunities.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {pendingCommunities.length === 0 ? (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              No communities pending approval. The queue is clear!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {pendingCommunities.map((community) => (
              <Card key={community.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold">{community.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {community.city}, {community.state}
                            {community.country && community.country !== 'US' && (
                              <span className="ml-1">• {community.country}</span>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {community.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {community.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        {community.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <span>{community.phone}</span>
                          </div>
                        )}
                        {community.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span>{community.email}</span>
                          </div>
                        )}
                        {community.website && (
                          <div className="flex items-center gap-1">
                            <Link2 className="w-3 h-3 text-gray-500" />
                            <a 
                              href={community.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {community.careTypes && community.careTypes.map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span>Source: {community.discoverySource || 'Global Discovery'}</span>
                        </div>
                        {community.discoveryDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              Discovered: {new Date(community.discoveryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApprove(community.id)}
                        disabled={processingId === community.id}
                      >
                        {processingId === community.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleReject(community.id)}
                        disabled={processingId === community.id}
                      >
                        {processingId === community.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {pendingCommunities.length > 0 && (
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review each community carefully before approval
            </p>
            <Button onClick={fetchPendingCommunities} variant="outline" size="sm">
              Refresh Queue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}