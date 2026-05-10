import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Central premium gate hook.
 * Returns { isPremium, isLoading, subscription, activateTrial }
 */
export function usePremium() {
  const { user } = useCurrentUser();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: () => user ? base44.entities.Subscription.filter({ user_id: user.email }, '-start_date', 1) : [],
    enabled: !!user,
    staleTime: 60_000,
  });

  const sub = subscriptions[0] || null;

  // Check user entity flag OR active subscription record
  const now = new Date();
  const isPremiumFromUser = user?.is_premium && (!user?.premium_expires_at || new Date(user.premium_expires_at) > now);
  const isPremiumFromSub = sub && (sub.status === 'active' || sub.status === 'trial') && sub.tier === 'premium' && (!sub.end_date || new Date(sub.end_date) > now);

  const isPremium = isPremiumFromUser || isPremiumFromSub;

  const activateTrial = async () => {
    if (!user) return;
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    await base44.entities.Subscription.create({
      user_id: user.email,
      tier: 'premium',
      status: 'trial',
      start_date: new Date().toISOString(),
      end_date: trialEnd.toISOString(),
      trial_end_date: trialEnd.toISOString(),
      amount: 0,
      currency: 'EUR',
    });
    await base44.auth.updateMe({ is_premium: true, premium_expires_at: trialEnd.toISOString() });
  };

  return { isPremium, isLoading, subscription: sub };
}