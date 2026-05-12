import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secureFilter, secureCreate, secureUpdate, secureDelete } from '@/lib/secureQuery';
import { QUERY_LIMITS } from '@/lib/appConstants';
import { CACHE_KEYS } from '@/lib/queryConfig';

/**
 * Fetch items, optionally filtered by type.
 * @param {{ type?: string, limit?: number, enabled?: boolean }} options
 */
export function useItems(options = {}) {
  const { type = null, limit = QUERY_LIMITS.ITEMS, enabled = true } = options;

  return useQuery({
    queryKey: [CACHE_KEYS.ITEMS, { type, limit }],
    queryFn: async () => {
      const items = await secureFilter('Item', {}, '-created_date', limit);
      return type ? items.filter(i => i.type === type) : items;
    },
    enabled,
    staleTime: 30000,
  });
}

/** Create a new Item with automatic cache invalidation. */
export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('Item', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ITEMS] }),
  });
}

/** Update an Item with optimistic update + rollback on error. */
export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('Item', id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [CACHE_KEYS.ITEMS] });
      const snapshot = queryClient.getQueriesData({ queryKey: [CACHE_KEYS.ITEMS] });
      queryClient.setQueriesData({ queryKey: [CACHE_KEYS.ITEMS] }, (old) =>
        Array.isArray(old) ? old.map(item => item.id === id ? { ...item, ...data } : item) : old
      );
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      context?.snapshot?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ITEMS] }),
  });
}

/** Delete an Item with optimistic removal + rollback on error. */
export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('Item', id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [CACHE_KEYS.ITEMS] });
      const snapshot = queryClient.getQueriesData({ queryKey: [CACHE_KEYS.ITEMS] });
      queryClient.setQueriesData({ queryKey: [CACHE_KEYS.ITEMS] }, (old) =>
        Array.isArray(old) ? old.filter(item => item.id !== id) : old
      );
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      context?.snapshot?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ITEMS] }),
  });
}