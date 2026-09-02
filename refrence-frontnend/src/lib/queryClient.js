import { QueryClient } from "@tanstack/react-query";

/** Fresh for 5 min — remount/navigation reuses cache; hard refresh gets new data. */
const DEFAULT_STALE_TIME_MS = 5 * 60 * 1000;
/** Keep unused cache for 30 min so back-navigation is instant. */
const DEFAULT_GC_TIME_MS = 30 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME_MS,
      gcTime: DEFAULT_GC_TIME_MS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Only refetch on mount when data is stale (see staleTime)
      refetchOnMount: true,
      retry: 1
    },
    mutations: {
      retry: false
    }
  }
});

export default queryClient;