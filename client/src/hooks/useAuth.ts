import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
    // Don't treat 401 as an error - it just means user isn't logged in
    throwOnError: false,
  });
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isUnauthenticated: !isLoading && !user,
    error,
  };
}