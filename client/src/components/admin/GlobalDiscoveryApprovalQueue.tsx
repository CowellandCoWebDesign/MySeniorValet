import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Globe, CheckCircle, XCircle, MapPin, Building, Clock, Phone, Mail, Link2, Loader2, Sparkles, Zap, AlertTriangle, Shield } from 'lucide-react';
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
  enrichmentHistory?: Array<{
    confidenceScore?: number;
    suspiciousReasons?: string[];
    autoApproved?: boolean;
  }>;
}

interface BulkApprovalResult {
  success: boolean;
  approved: number;
  skipped: number;
  message: string;
  skippedReasons?: Array<{ id: number; name: string; reasons: string[] }>;
}

export function GlobalDiscoveryApprovalQueue() {
  const [pendingCommunities, setPendingCommunities] = useState<PendingCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [lastBulkResult, setLastBulkResult] = useState<BulkApprovalResult | null>(null);
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
  
  // Bulk approve all verified communities
  const handleBulkApproveVerified = async () => {
    setIsBulkApproving(true);
    setLastBulkResult(null);
    try {
      const response = await fetch('/api/global-discovery/bulk-approve-verified', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result: BulkApprovalResult = await response.json();
        setLastBulkResult(result);
        
        toast({
          title: 'Bulk Approval Complete',
          description: result.message,
        });
        
        // Refresh the list to show only remaining (suspicious) communities
        await fetchPendingCommunities();
      } else {
        throw new Error('Bulk approval failed');
      }
    } catch (error) {
      console.error('Error in bulk approval:', error);
      toast({
        title: 'Error',
        description: 'Failed to process bulk approval',
        variant: 'destructive'
      });
    } finally {
      setIsBulkApproving(false);
    }
  };
  
  // Get verification info from enrichment history
  const getVerificationInfo = (community: PendingCommunity) => {
    const history = community.enrichmentHistory?.[0];
    return {
      confidenceScore: history?.confidenceScore ?? 0,
      suspiciousReasons: history?.suspiciousReasons ?? [],
      hasContactInfo: !!(community.phone || community.email || community.website)
    };
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
    <Card className="w-full" data-testid="approval-queue-card">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              Global Discovery Approval Queue
            </CardTitle>
            <CardDescription className="max-w-xl">
              New discoveries are automatically approved when verified. This queue shows only communities that need manual review due to missing data or suspicious patterns.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {pendingCommunities.length > 0 && (
              <Button
                onClick={handleBulkApproveVerified}
                disabled={isBulkApproving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                data-testid="button-bulk-approve"
              >
                {isBulkApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Verify & Approve Eligible
                  </>
                )}
              </Button>
            )}
            <Badge variant="outline" className="text-lg px-3 py-1">
              <Sparkles className="w-4 h-4 mr-1" />
              {pendingCommunities.length} Pending
            </Badge>
          </div>
        </div>
        
        {lastBulkResult && (
          <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <Shield className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Last bulk approval:</strong> {lastBulkResult.approved} communities auto-approved, 
              {lastBulkResult.skipped} need manual review
            </AlertDescription>
          </Alert>
        )}
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
            {pendingCommunities.map((community) => {
              const verification = getVerificationInfo(community);
              const isLowConfidence = verification.confidenceScore < 60;
              
              return (
                <Card 
                  key={community.id} 
                  className={`border-l-4 ${isLowConfidence ? 'border-l-orange-500' : 'border-l-yellow-500'}`}
                  data-testid={`card-community-${community.id}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold" data-testid={`text-community-name-${community.id}`}>
                              {community.name}
                            </h3>
                            {isLowConfidence && (
                              <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 dark:bg-orange-950">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Needs Review
                              </Badge>
                            )}
                            {verification.confidenceScore > 0 && (
                              <Badge 
                                variant="outline" 
                                className={verification.confidenceScore >= 60 
                                  ? "text-green-600 border-green-300" 
                                  : "text-gray-500 border-gray-300"
                                }
                              >
                                Score: {verification.confidenceScore}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span data-testid={`text-community-location-${community.id}`}>
                              {community.city}, {community.state}
                              {community.country && community.country !== 'US' && (
                                <span className="ml-1">• {community.country}</span>
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {verification.suspiciousReasons.length > 0 && (
                          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md p-2 text-sm">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-orange-800 dark:text-orange-200">Review reasons:</p>
                                <ul className="text-orange-700 dark:text-orange-300 list-disc list-inside text-xs mt-1">
                                  {verification.suspiciousReasons.map((reason, idx) => (
                                    <li key={idx}>{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {community.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {community.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          {community.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-green-500" />
                              <span>{community.phone}</span>
                            </div>
                          )}
                          {community.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-green-500" />
                              <span>{community.email}</span>
                            </div>
                          )}
                          {community.website && (
                            <div className="flex items-center gap-1">
                              <Link2 className="w-3 h-3 text-green-500" />
                              <a 
                                href={community.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                data-testid={`link-website-${community.id}`}
                              >
                                Website
                              </a>
                            </div>
                          )}
                          {!verification.hasContactInfo && (
                            <span className="text-orange-600 text-xs flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              No contact info
                            </span>
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
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => handleApprove(community.id)}
                          disabled={processingId === community.id}
                          data-testid={`button-approve-${community.id}`}
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
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleReject(community.id)}
                          disabled={processingId === community.id}
                          data-testid={`button-reject-${community.id}`}
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
              );
            })}
          </div>
        )}
        
        {pendingCommunities.length > 0 && (
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Communities with low confidence scores need manual verification
            </p>
            <Button 
              onClick={fetchPendingCommunities} 
              variant="outline" 
              size="sm"
              data-testid="button-refresh-queue"
            >
              Refresh Queue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}