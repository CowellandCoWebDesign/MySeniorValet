import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Disable all caching for fresh auth data
      gcTime: 0, // Don't keep cached data
      refetchOnMount: true, // Always refetch on mount
      refetchOnReconnect: true, // Always refetch on reconnect
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Function to clear all authentication caches
export const clearAuthCaches = () => {
  queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
  queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  queryClient.removeQueries({ queryKey: ['/api/auth/status'] });
  queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
  console.log('✅ Auth caches cleared');
};
