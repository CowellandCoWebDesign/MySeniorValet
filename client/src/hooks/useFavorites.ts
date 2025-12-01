import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Favorite {
  id: number;
  communityId: string | number; // CRITICAL: stored as TEXT in database, can be string or number
  notes?: string;
  priority: number;
  tags: string[];
  addedAt: string;
  community: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    careTypes: string[];
    photos: string[];
    overallRating?: number;
    pricing?: any;
  };
}

export function useFavorites() {
  return useQuery<Favorite[]>({
    queryKey: ["/api/user/favorites"],
    queryFn: async () => {
      console.log('📋 useFavorites: Fetching favorites from /api/user/favorites');
      const res = await fetch('/api/user/favorites', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          console.log('📋 useFavorites: User not authenticated, returning empty array');
          return [];
        }
        throw new Error(`Failed to fetch favorites: ${res.status}`);
      }
      const data = await res.json();
      console.log('📋 useFavorites: Received favorites:', data.length, 'items');
      return data;
    },
    staleTime: 0,
    refetchOnMount: true,
    retry: 1,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      communityId: number;
      notes?: string;
      priority?: number;
      tags?: string[];
    }) => {
      console.log('📌 Adding favorite:', data);
      
      // Pre-check: If already in cache, skip the API call
      const currentFavorites = queryClient.getQueryData<Favorite[]>(["/api/user/favorites"]) || [];
      const alreadyExists = currentFavorites.some(f => String(f.communityId) === String(data.communityId));
      if (alreadyExists) {
        console.log('⚠️ Already in cache, skipping API call');
        return { alreadyExists: true };
      }
      
      return apiRequest("POST", "/api/user/favorites", data);
    },
    onMutate: async (newFavorite) => {
      console.log('⚡ Optimistic add for:', newFavorite.communityId);
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["/api/user/favorites"] });
      
      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<Favorite[]>(["/api/user/favorites"]);
      
      // Check if already in cache (prevent duplicate optimistic updates)
      const alreadyInCache = previousFavorites?.some(f => String(f.communityId) === String(newFavorite.communityId));
      if (alreadyInCache) {
        console.log('⚡ Already in optimistic cache, skipping update');
        return { previousFavorites, skipped: true };
      }
      
      // Optimistically update the cache immediately
      queryClient.setQueryData<Favorite[]>(["/api/user/favorites"], (old = []) => [
        ...old,
        {
          id: Date.now(), // Temporary ID
          communityId: String(newFavorite.communityId),
          notes: newFavorite.notes || '',
          priority: newFavorite.priority || 0,
          tags: newFavorite.tags || [],
          addedAt: new Date().toISOString(),
          community: { id: newFavorite.communityId, name: '', address: '', city: '', state: '', careTypes: [], photos: [] }
        }
      ]);
      
      console.log('⚡ Optimistic cache updated - heart should be filled now');
      
      // Return context with snapshot for rollback
      return { previousFavorites, skipped: false };
    },
    onError: (error: any, _variables, context) => {
      const errorMessage = error?.message || String(error);
      console.error('❌ Failed to add favorite:', errorMessage);
      
      // DON'T rollback if the error is "already in favorites" - this is expected for duplicate calls
      if (errorMessage.includes('already in favorites') || errorMessage.includes('Already')) {
        console.log('ℹ️ Already favorited - keeping optimistic update');
        return;
      }
      
      // Rollback to previous state on other errors
      if (context?.previousFavorites && !context.skipped) {
        console.log('🔄 Rolling back optimistic update');
        queryClient.setQueryData(["/api/user/favorites"], context.previousFavorites);
      }
    },
    onSettled: async (_data, _error, _variables, context) => {
      // Skip refetch if this was a duplicate call
      if (context?.skipped) {
        console.log('⏭️ Skipping refetch for duplicate call');
        return;
      }
      console.log('✅ Refetching favorites to sync with server');
      // Always refetch to get accurate server state
      await queryClient.refetchQueries({ queryKey: ["/api/user/favorites"] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: number) => {
      console.log('🗑️ Removing favorite:', communityId);
      return apiRequest("DELETE", `/api/user/favorites/${communityId}`);
    },
    onMutate: async (communityId) => {
      console.log('⚡ Optimistic remove for:', communityId);
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["/api/user/favorites"] });
      
      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<Favorite[]>(["/api/user/favorites"]);
      
      // Optimistically remove from cache immediately
      queryClient.setQueryData<Favorite[]>(["/api/user/favorites"], (old = []) => 
        old.filter(fav => String(fav.communityId) !== String(communityId))
      );
      
      console.log('⚡ Optimistic cache updated - heart should be unfilled now');
      
      // Return context with snapshot for rollback
      return { previousFavorites };
    },
    onError: (error: any, _variables, context) => {
      console.error('❌ Failed to remove favorite:', error?.message || error);
      // Rollback to previous state on error
      if (context?.previousFavorites) {
        console.log('🔄 Rolling back optimistic update');
        queryClient.setQueryData(["/api/user/favorites"], context.previousFavorites);
      }
    },
    onSettled: async () => {
      console.log('✅ Refetching favorites to sync with server');
      // Always refetch to get accurate server state
      await queryClient.refetchQueries({ queryKey: ["/api/user/favorites"] });
    },
  });
}

export function useUpdateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: number;
      notes?: string;
      priority?: number;
      tags?: string[];
    }) => {
      const { id, ...updateData } = data;
      console.log('📝 Updating favorite:', id, updateData);
      return apiRequest("PATCH", `/api/user/favorites/${id}`, updateData);
    },
    onSuccess: () => {
      console.log('✅ Favorite updated successfully');
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
    },
    onError: (error) => {
      console.error('❌ Failed to update favorite:', error);
    },
  });
}

export interface SavedSearch {
  id: number;
  searchName: string;
  searchParams: Record<string, any>;
  alertsEnabled: boolean;
  createdAt: string;
  lastRunAt?: string;
}

export function useSavedSearches() {
  return useQuery<SavedSearch[]>({
    queryKey: ["/api/user/saved-searches"],
  });
}

export function useSaveSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      searchName: string;
      searchParams: Record<string, any>;
      alertsEnabled?: boolean;
    }) => {
      return apiRequest("POST", "/api/user/saved-searches", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-searches"] });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/user/saved-searches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-searches"] });
    },
  });
}