import { useQuery, useQueryClient } from "@tanstack/react-query";

const AUTH_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const AUTH_GC_TIME = 10 * 60 * 1000;   // 10 minutes

export function useAuth() {
  const { data: authStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/status", {
          credentials: "include",
        });
        const data = await response.json();
        return data;
      } catch {
        return { isAuthenticated: false, user: null };
      }
    },
    retry: false,
    staleTime: AUTH_STALE_TIME,
    gcTime: AUTH_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: fullUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
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
    enabled: authStatus?.isAuthenticated === true,
    staleTime: AUTH_STALE_TIME,
    gcTime: AUTH_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

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
