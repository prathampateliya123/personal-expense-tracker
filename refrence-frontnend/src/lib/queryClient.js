import { QueryClient } from "@tanstack/react-query";


const DEFAULT_STALE_TIME_MS = 5 * 60 * 1000;

const DEFAULT_GC_TIME_MS = 30 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME_MS,
      gcTime: DEFAULT_GC_TIME_MS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,

      refetchOnMount: true,
      retry: 1
    },
    mutations: {
      retry: false
    }
  }
});

export default queryClient;