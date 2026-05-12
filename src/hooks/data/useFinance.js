import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secureFilter, secureCreate, secureUpdate, secureDelete } from '@/lib/secureQuery';
import { QUERY_LIMITS } from '@/lib/appConstants';
import { CACHE_KEYS } from '@/lib/queryConfig';

export function useFinanceSnapshots(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.FINANCE_SNAPSHOTS],
    queryFn: () => secureFilter('FinanceSnapshot', {}, '-date', QUERY_LIMITS.DEFAULT),
    enabled,
    staleTime: 60000,
  });
}

export function useCreateFinanceSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('FinanceSnapshot', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.FINANCE_SNAPSHOTS] }),
  });
}

export function useUpdateFinanceSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('FinanceSnapshot', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.FINANCE_SNAPSHOTS] }),
  });
}

export function useFinanceGoals(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.FINANCE_GOALS],
    queryFn: () => secureFilter('FinanceGoal', {}, '-created_date', QUERY_LIMITS.DEFAULT),
    enabled,
    staleTime: 60000,
  });
}

export function useCreateFinanceGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('FinanceGoal', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.FINANCE_GOALS] }),
  });
}

export function useUpdateFinanceGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('FinanceGoal', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.FINANCE_GOALS] }),
  });
}

export function useDeleteFinanceGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('FinanceGoal', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.FINANCE_GOALS] }),
  });
}