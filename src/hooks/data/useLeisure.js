import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secureFilter, secureCreate, secureUpdate, secureDelete } from '@/lib/secureQuery';
import { QUERY_LIMITS } from '@/lib/appConstants';
import { CACHE_KEYS } from '@/lib/queryConfig';

export function useLeisure(options = {}) {
  const { limit = QUERY_LIMITS.LEISURE, enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.LEISURE, { limit }],
    queryFn: () => secureFilter('LeisureEntry', {}, '-created_date', limit),
    enabled,
    staleTime: 30000,
  });
}

export function useCreateLeisure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('LeisureEntry', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.LEISURE] }),
  });
}

export function useUpdateLeisure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('LeisureEntry', id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [CACHE_KEYS.LEISURE] });
      const snapshot = queryClient.getQueriesData({ queryKey: [CACHE_KEYS.LEISURE] });
      queryClient.setQueriesData({ queryKey: [CACHE_KEYS.LEISURE] }, (old) =>
        Array.isArray(old) ? old.map(e => e.id === id ? { ...e, ...data } : e) : old
      );
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      context?.snapshot?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.LEISURE] }),
  });
}

export function useDeleteLeisure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('LeisureEntry', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.LEISURE] }),
  });
}