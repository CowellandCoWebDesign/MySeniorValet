import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Favorite {
  id: number;
  communityId: number;
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
    onSuccess: () => {
      console.log('✅ Favorite added successfully');
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
    },
    onError: (error) => {
      console.error('❌ Failed to add favorite:', error);
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
    onSuccess: () => {
      console.log('✅ Favorite removed successfully');
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
    },
    onError: (error) => {
      console.error('❌ Failed to remove favorite:', error);
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