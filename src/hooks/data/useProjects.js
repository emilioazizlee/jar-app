import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secureFilter, secureCreate, secureUpdate, secureDelete } from '@/lib/secureQuery';
import { QUERY_LIMITS } from '@/lib/appConstants';
import { CACHE_KEYS } from '@/lib/queryConfig';

export function useProjects(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.PROJECTS],
    queryFn: () => secureFilter('Project', {}, 'name', QUERY_LIMITS.PROJECTS),
    enabled,
    staleTime: 60000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('Project', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PROJECTS] }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('Project', id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [CACHE_KEYS.PROJECTS] });
      const snapshot = queryClient.getQueryData([CACHE_KEYS.PROJECTS]);
      queryClient.setQueryData([CACHE_KEYS.PROJECTS], (old) =>
        Array.isArray(old) ? old.map(p => p.id === id ? { ...p, ...data } : p) : old
      );
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData([CACHE_KEYS.PROJECTS], context?.snapshot);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PROJECTS] }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('Project', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PROJECTS] }),
  });
}