import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Wraps a query result to show skeleton, error, or children.
 * Usage:
 *   <QueryStateWrapper isLoading={isLoading} error={error} onRetry={refetch} skeletonCount={3}>
 *     {children}
 *   </QueryStateWrapper>
 */
export default function QueryStateWrapper({ isLoading, error, onRetry, skeletonCount = 4, skeletonHeight = 'h-16', children }) {
  if (isLoading) {
    return (
      <div role="status" aria-label="Loading content" className="space-y-2">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className={`${skeletonHeight} rounded-xl bg-muted animate-pulse`}
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12" role="alert">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <p className="font-mono text-sm text-foreground mb-1">Failed to load data</p>
        <p className="text-xs text-muted-foreground mb-4">
          {error?.message || 'Something went wrong'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl font-mono text-sm text-foreground hover:border-primary/40 transition-all mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}