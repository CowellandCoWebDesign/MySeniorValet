import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Check authentication status from both Replit OAuth and bypass
  const { data: authStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/status");
        const data = await response.json();
        return data;
      } catch {
        return { isAuthenticated: false, user: null };
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  
  // Also check Replit OAuth for backward compatibility
  const { data: replitUser, isLoading: replitLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (!response.ok) return null;
        return await response.json();
      } catch {
        return null;
      }
    },
    retry: false,
    enabled: !authStatus?.isAuthenticated, // Only check if bypass auth failed
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  
  const user = authStatus?.user || replitUser;
  const isLoading = statusLoading || (replitLoading && !authStatus?.isAuthenticated);
  const isAuthenticated = !!(authStatus?.isAuthenticated || replitUser);
  
  return {
    user,
    isLoading,
    isAuthenticated,
    isUnauthenticated: !isLoading && !isAuthenticated,
    error: null,
  };
}