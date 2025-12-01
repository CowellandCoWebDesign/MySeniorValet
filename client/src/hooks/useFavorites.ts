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
      return apiRequest("POST", "/api/user/favorites", data);
    },
    onSuccess: async () => {
      console.log('✅ Favorite added successfully - refetching favorites list');
      // Force immediate refetch instead of just invalidation
      await queryClient.refetchQueries({ queryKey: ["/api/user/favorites"] });
      console.log('✅ Favorites list refetched');
    },
    onError: (error: any) => {
      // Check if it's "already in favorites" error - still invalidate
      console.error('❌ Failed to add favorite:', error?.message || error);
      if (error?.message?.includes('already in favorites')) {
        queryClient.refetchQueries({ queryKey: ["/api/user/favorites"] });
      }
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
    onSuccess: async () => {
      console.log('✅ Favorite removed successfully - refetching favorites list');
      // Force immediate refetch instead of just invalidation
      await queryClient.refetchQueries({ queryKey: ["/api/user/favorites"] });
      console.log('✅ Favorites list refetched');
    },
    onError: (error: any) => {
      console.error('❌ Failed to remove favorite:', error?.message || error);
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