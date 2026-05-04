/**
 * StepTemplatePrompt — shown when a similar step template exists
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StepTemplatePrompt({ template, onApply, onDismiss }) {
  if (!template || !template.steps?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-start gap-3 p-3 bg-secondary/10 border border-secondary/30 rounded-xl text-sm"
    >
      <Layers className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-secondary mb-1">SIMILAR TASK FOUND</p>
        <p className="text-xs text-muted-foreground mb-2">
          "{template.title}" has {template.steps.length} saved steps. Use them?
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {template.steps.slice(0, 4).map((s, i) => (
            <span key={i} className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
              {i + 1}. {s.name}
            </span>
          ))}
          {template.steps.length > 4 && (
            <span className="text-[10px] font-mono text-muted-foreground">+{template.steps.length - 4} more</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onApply} className="h-7 text-xs font-mono gap-1">
            <Check className="w-3 h-3" /> APPLY
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss} className="h-7 text-xs font-mono gap-1">
            <X className="w-3 h-3" /> SKIP
          </Button>
        </div>
      </div>
    </motion.div>
  );
}