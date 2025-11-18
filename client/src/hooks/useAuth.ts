import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Check authentication status from both Replit OAuth and bypass
  const { data: authStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/status", {
          credentials: "include", // Include cookies with request
        });
        const data = await response.json();
        return data;
      } catch {
        return { isAuthenticated: false, user: null };
      }
    },
    retry: false,
    staleTime: 0, // NO CACHE - always fetch fresh
    gcTime: 0, // NO CACHE - don't keep stale data
    refetchOnMount: true, // Always refetch on mount
    refetchOnReconnect: true, // Always refetch on reconnect
  });
  
  // ALWAYS fetch full user data including role when authenticated
  const { data: fullUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include", // Include cookies with request
        });
        if (!response.ok) return null;
        const userData = await response.json();
        console.log('useAuth: Full user data fetched:', userData.email, 'Role:', userData.role);
        return userData;
      } catch {
        return null;
      }
    },
    retry: false,
    enabled: authStatus?.isAuthenticated === true, // CHANGED: Fetch when authenticated to get role
    staleTime: 0, // NO CACHE - always fetch fresh
    gcTime: 0, // NO CACHE - don't keep stale data
    refetchOnMount: true, // Always refetch on mount
    refetchOnReconnect: true, // Always refetch on reconnect
  });
  
  // Use fullUser when available as it has the complete data including role
  const user = fullUser || authStatus?.user;
  const isLoading = statusLoading || (userLoading && authStatus?.isAuthenticated);
  const isAuthenticated = !!(authStatus?.isAuthenticated || fullUser);
  
  return {
    user,
    isLoading,
    isAuthenticated,
    isUnauthenticated: !isLoading && !isAuthenticated,
    error: null,
  };
}