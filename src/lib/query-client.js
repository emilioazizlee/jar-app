import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,           // 30s — avoid redundant refetches
      gcTime: 5 * 60 * 1000,     // 5min garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 1,
      structuralSharing: true,   // deduplicate identical query results
    },
    mutations: {
      retry: 0,
    },
  },
});