import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface VirtualTourResult {
  found: boolean;
  platform?: string;
  tourUrl?: string;
  embedUrl?: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'perplexity' | 'website' | 'cached';
  detectionMethod?: string;
  lastChecked: string;
}

interface UseVirtualTourDetectionOptions {
  communityId: number;
  communityName: string;
  website?: string;
  enabled?: boolean;
  forceRefresh?: boolean;
}

export function useVirtualTourDetection({
  communityId,
  communityName,
  website,
  enabled = true,
  forceRefresh = false
}: UseVirtualTourDetectionOptions) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['virtual-tour', communityId, forceRefresh],
    queryFn: async () => {
      setIsDetecting(true);
      try {
        const response = await fetch(`/api/communities/${communityId}/virtual-tour?refresh=${forceRefresh}`);
        if (!response.ok) {
          throw new Error(`Failed to detect virtual tour: ${response.statusText}`);
        }
        const data = await response.json();
        return data as VirtualTourResult;
      } finally {
        setIsDetecting(false);
      }
    },
    enabled: enabled && communityId > 0,
    staleTime: 3600000, // 1 hour
    gcTime: 7200000, // 2 hours (renamed from cacheTime)
    retry: (failureCount, error) => {
      // Retry up to 2 times with exponential backoff
      if (failureCount < 2) {
        setRetryCount(failureCount + 1);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Auto-refresh if no tour found and it's been more than 24 hours
  useEffect(() => {
    if (data && !data.found && data.lastChecked) {
      const lastCheckedDate = new Date(data.lastChecked);
      const hoursSinceLastCheck = (Date.now() - lastCheckedDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastCheck > 24) {
        console.log(`🔄 Auto-refreshing virtual tour detection for ${communityName} (last checked ${hoursSinceLastCheck.toFixed(0)} hours ago)`);
        refetch();
      }
    }
  }, [data, communityName, refetch]);

  // Fallback detection if primary detection fails
  useEffect(() => {
    if (error && retryCount >= 2) {
      console.error(`❌ Virtual tour detection failed after ${retryCount} retries for ${communityName}`, error);
      
      // Attempt fallback detection using website URL
      if (website && !isDetecting) {
        console.log(`🔍 Attempting fallback detection using website: ${website}`);
        setIsDetecting(true);
        
        // Check if website contains known virtual tour platforms
        const knownPlatforms = [
          'matterport.com',
          'youvisit.com',
          'kuula.co',
          'roundme.com',
          '360.io',
          'panoskin.com',
          'eyespy360.com',
          'cupix.com'
        ];
        
        const foundPlatform = knownPlatforms.find(platform => 
          website.toLowerCase().includes(platform)
        );
        
        if (foundPlatform) {
          console.log(`✅ Found potential virtual tour platform in website URL: ${foundPlatform}`);
        }
        
        setIsDetecting(false);
      }
    }
  }, [error, retryCount, website, communityName, isDetecting]);

  const refreshDetection = async () => {
    setRetryCount(0);
    return refetch();
  };

  return {
    virtualTour: data,
    isLoading: isLoading || isDetecting,
    error,
    refreshDetection,
    retryCount,
    detectionStatus: getDetectionStatus(data, isLoading, isDetecting, error)
  };
}

function getDetectionStatus(
  data: VirtualTourResult | undefined,
  isLoading: boolean,
  isDetecting: boolean,
  error: any
): string {
  if (isLoading || isDetecting) {
    return 'Searching for virtual tours...';
  }
  
  if (error) {
    return 'Unable to check for virtual tours';
  }
  
  if (!data) {
    return 'Not checked';
  }
  
  if (data.found) {
    switch (data.confidence) {
      case 'high':
        return `✅ ${data.platform || 'Virtual tour'} available`;
      case 'medium':
        return `🔍 ${data.platform || 'Virtual tour'} likely available`;
      case 'low':
        return '❓ Virtual tour may be available';
      default:
        return 'Virtual tour detected';
    }
  }
  
  if (data.source === 'cached') {
    const lastCheckedDate = new Date(data.lastChecked);
    const hoursAgo = (Date.now() - lastCheckedDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursAgo < 1) {
      return 'No virtual tour found (checked recently)';
    } else if (hoursAgo < 24) {
      return `No virtual tour found (checked ${Math.floor(hoursAgo)} hours ago)`;
    } else {
      return `No virtual tour found (checked ${Math.floor(hoursAgo / 24)} days ago)`;
    }
  }
  
  return 'No virtual tour currently available';
}

// Hook to batch detect virtual tours for multiple communities
export function useVirtualTourBatchDetection(communityIds: number[], enabled = false) {
  const [results, setResults] = useState<Record<number, VirtualTourResult>>({});
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['virtual-tours-batch', communityIds],
    queryFn: async () => {
      const response = await apiRequest('/api/communities/virtual-tours/batch', {
        method: 'POST',
        body: JSON.stringify({ communityIds, forceRefresh: false })
      });
      
      if (response.results) {
        const resultsMap: Record<number, VirtualTourResult> = {};
        response.results.forEach((result: any) => {
          resultsMap[result.communityId] = result;
        });
        return resultsMap;
      }
      
      return {};
    },
    enabled: enabled && communityIds.length > 0 && communityIds.length <= 10,
    staleTime: 3600000, // 1 hour
    gcTime: 7200000 // 2 hours
  });

  useEffect(() => {
    if (data) {
      setResults(data);
    }
  }, [data]);

  return {
    results,
    isLoading,
    error,
    refetch
  };
}