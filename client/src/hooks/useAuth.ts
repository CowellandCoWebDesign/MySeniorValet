import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["/api/auth/quick-user"],
    retry: false,
    // Don't treat 401 as an error - it just means user isn't logged in
    throwOnError: false,
  });

  // Extract the user from the response
  const user = response?.user || response;
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isUnauthenticated: !isLoading && !user,
    error,
  };
}