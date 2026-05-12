import { base44 } from '@/api/base44Client';

/**
 * Verifies RLS is working — runs only in dev mode.
 * Checks that no fetched items belong to a different user.
 */
export async function verifyRLS() {
  if (import.meta.env.PROD) return; // skip in production
  try {
    const me = await base44.auth.me();
    if (!me?.email) return;
    const items = await base44.entities.Item.list('-created_date', 20);
    const violations = items.filter(i => i.created_by && i.created_by !== me.email);
    if (violations.length > 0) {
      console.error('[RLS VIOLATION] Seeing other users\' data:', violations.map(i => i.created_by));
    } else {
      console.log('[RLS OK] Data properly isolated for', me.email);
    }
  } catch {
    // silent — don't break the app for a dev check
  }
}