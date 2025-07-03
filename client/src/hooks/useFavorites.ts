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
      return apiRequest("/api/user/favorites", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: number) => {
      return apiRequest(`/api/user/favorites/${communityId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
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
      return apiRequest(`/api/user/favorites/${id}`, {
        method: "PATCH",
        body: updateData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
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
      return apiRequest("/api/user/saved-searches", {
        method: "POST",
        body: data,
      });
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
      return apiRequest(`/api/user/saved-searches/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-searches"] });
    },
  });
}