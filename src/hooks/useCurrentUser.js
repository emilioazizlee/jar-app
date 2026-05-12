import { useAuth } from '@/lib/AuthContext';

/**
 * Returns the current authenticated user object.
 * Use this in pages/components that need to scope queries to the current user.
 * 
 * Example query usage:
 *   const { user } = useCurrentUser();
 *   base44.entities.Item.filter({ created_by: user?.email }, '-created_date', 200)
 */
export function useCurrentUser() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  return { user, isAuthenticated, isLoading: isLoadingAuth };
}