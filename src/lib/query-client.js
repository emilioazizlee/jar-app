import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5min — serve cached data longer
      gcTime: 10 * 60 * 1000,    // 10min garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: false,      // don't re-fetch if data is fresh
      retry: 1,
      structuralSharing: true,   // deduplicate identical query results
    },
    mutations: {
      retry: 0,
    },
  },
});