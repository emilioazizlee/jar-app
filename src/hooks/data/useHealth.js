import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secureFilter, secureCreate, secureUpdate, secureDelete } from '@/lib/secureQuery';
import { QUERY_LIMITS } from '@/lib/appConstants';
import { CACHE_KEYS } from '@/lib/queryConfig';

export function useWaterLogs(options = {}) {
  const { limit = QUERY_LIMITS.DEFAULT, enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.WATER_LOGS, { limit }],
    queryFn: () => secureFilter('WaterLog', {}, '-created_date', limit),
    enabled,
    staleTime: 15000,
  });
}

export function useCreateWaterLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('WaterLog', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.WATER_LOGS] }),
  });
}

export function useDeleteWaterLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('WaterLog', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.WATER_LOGS] }),
  });
}

export function useDietGoals(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.DIET_GOALS],
    queryFn: () => secureFilter('DietGoals', {}, '-created_date', 1),
    enabled,
    staleTime: 300000, // 5 min — goals change rarely
  });
}

export function useCreateDietGoals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('DietGoals', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.DIET_GOALS] }),
  });
}

export function useUpdateDietGoals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('DietGoals', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.DIET_GOALS] }),
  });
}

export function useEatingOut(options = {}) {
  const { limit = QUERY_LIMITS.DEFAULT, enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.EATING_OUT, { limit }],
    queryFn: () => secureFilter('EatingOut', {}, '-created_date', limit),
    enabled,
    staleTime: 30000,
  });
}

export function useCreateEatingOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('EatingOut', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.EATING_OUT] }),
  });
}

export function useDeleteEatingOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('EatingOut', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.EATING_OUT] }),
  });
}