import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secureFilter, secureCreate, secureUpdate, secureDelete } from '@/lib/secureQuery';
import { QUERY_LIMITS } from '@/lib/appConstants';
import { CACHE_KEYS } from '@/lib/queryConfig';

export function useGroceryShops(options = {}) {
  const { limit = QUERY_LIMITS.GROCERIES, enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.GROCERY_SHOPS, { limit }],
    queryFn: () => secureFilter('GroceryShop', {}, '-created_date', limit),
    enabled,
    staleTime: 30000,
  });
}

export function useCreateGroceryShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('GroceryShop', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GROCERY_SHOPS] }),
  });
}

export function useUpdateGroceryShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('GroceryShop', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GROCERY_SHOPS] }),
  });
}

export function useDeleteGroceryShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('GroceryShop', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GROCERY_SHOPS] }),
  });
}

export function useGroceryProducts(options = {}) {
  const { limit = QUERY_LIMITS.GROCERIES, enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.GROCERY_PRODUCTS, { limit }],
    queryFn: () => secureFilter('GroceryProduct', {}, 'name', limit),
    enabled,
    staleTime: 60000,
  });
}

export function useCreateGroceryProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('GroceryProduct', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GROCERY_PRODUCTS] }),
  });
}

export function useUpdateGroceryProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('GroceryProduct', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GROCERY_PRODUCTS] }),
  });
}

export function useShoppingList(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.SHOPPING_LIST],
    queryFn: () => secureFilter('ShoppingListItem', {}, '-created_date', QUERY_LIMITS.DEFAULT),
    enabled,
    staleTime: 15000,
  });
}

export function useCreateShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('ShoppingListItem', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SHOPPING_LIST] }),
  });
}

export function useUpdateShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('ShoppingListItem', id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [CACHE_KEYS.SHOPPING_LIST] });
      const snapshot = queryClient.getQueryData([CACHE_KEYS.SHOPPING_LIST]);
      queryClient.setQueryData([CACHE_KEYS.SHOPPING_LIST], (old) =>
        Array.isArray(old) ? old.map(i => i.id === id ? { ...i, ...data } : i) : old
      );
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData([CACHE_KEYS.SHOPPING_LIST], context?.snapshot);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SHOPPING_LIST] }),
  });
}

export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('ShoppingListItem', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SHOPPING_LIST] }),
  });
}

export function usePantryItems(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: [CACHE_KEYS.PANTRY],
    queryFn: () => secureFilter('PantryItem', {}, '-created_date', QUERY_LIMITS.GROCERIES),
    enabled,
    staleTime: 30000,
  });
}

export function useUpdatePantryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => secureUpdate('PantryItem', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PANTRY] }),
  });
}

export function useCreatePantryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => secureCreate('PantryItem', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PANTRY] }),
  });
}

export function useDeletePantryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => secureDelete('PantryItem', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PANTRY] }),
  });
}