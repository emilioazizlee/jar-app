import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import { analyzeSubscriptions } from '@/lib/subscriptionAnalyzer';

export default function SubscriptionInsights({ items }) {
  const navigate = useNavigate();
  const { totalMonthly, upcomingRenewals, unusedSuggestions } = analyzeSubscriptions(items);

  const hasInsights = upcomingRenewals.length > 0 || unusedSuggestions.length > 0;
  if (!hasInsights && totalMonthly === 0) return null;

  const currSym = '€'; // TODO: pull from user settings

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-all"
      onClick={() => navigate('/subscriptions')}
    >
      <p className="mono-header text-[10px] text-muted-foreground mb-3">SUBSCRIPTION INSIGHTS</p>

      {/* Total cost */}
      {totalMonthly > 0 && (
        <p className="font-mono text-sm text-foreground mb-3">
          Paying <span className="text-secondary font-bold">{currSym}{totalMonthly.toFixed(2)}/mo</span> across subscriptions
        </p>
      )}

      {/* Upcoming renewals */}
      {upcomingRenewals.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {upcomingRenewals.slice(0, 3).map(sub => (
            <div key={sub.id} className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-yellow-500 shrink-0" />
              <span className="font-mono text-xs text-foreground truncate flex-1">{sub.title}</span>
              <span className="font-mono text-[10px] text-yellow-500 shrink-0">
                {sub.daysUntil === 0 ? 'today' : `${sub.daysUntil}d`} · {currSym}{sub.amount?.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Unused suggestions */}
      {unusedSuggestions.length > 0 && (
        <div className="border-t border-border/40 pt-3 space-y-1.5">
          {unusedSuggestions.slice(0, 2).map(sub => (
            <div key={sub.id} className="flex items-center gap-2">
              <TrendingDown className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="font-mono text-xs text-muted-foreground truncate flex-1">{sub.title}</span>
              <span className="font-mono text-[10px] text-muted-foreground shrink-0">60d+ unused</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}