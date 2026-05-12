import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secureFilter, secureCreate, secureUpdate, secureDelete } from '@/lib/secureQuery';
import { QUERY_LIMITS } from '@/lib/appConstants';
import { CACHE_KEYS } from '@/lib/queryConfig';

export function useDietLogs(options = {}) {
  const { limit = QUERY_LIMITS.DIET, enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.DIET, { limit }],
    queryFn: () => secureFilter('DietLog', {}, '-created_date', limit),
    enabled,
    staleTime: 30000,
  });
}

export function useCreateDietLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('DietLog', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.DIET] }),
  });
}

export function useUpdateDietLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('DietLog', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.DIET] }),
  });
}

export function useDeleteDietLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('DietLog', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.DIET] }),
  });
}

export function useRecipes(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.RECIPES],
    queryFn: () => secureFilter('Recipe', {}, '-created_date', QUERY_LIMITS.DEFAULT),
    enabled,
    staleTime: 60000,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('Recipe', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.RECIPES] }),
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('Recipe', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.RECIPES] }),
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('Recipe', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.RECIPES] }),
  });
}