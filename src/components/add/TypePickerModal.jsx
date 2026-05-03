import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { CheckSquare, DollarSign, RefreshCw, CreditCard, Users, FileText, Target, User, Sparkles } from 'lucide-react';
import { ITEM_TYPES } from '@/lib/constants';
import TaskForm from '../forms/TaskForm';
import SpendForm from '../forms/SpendForm';
import QuickItemForm from '../forms/QuickItemForm';
import SubscriptionForm from '../forms/SubscriptionForm';

const iconMap = {
  CheckSquare, DollarSign, RefreshCw, CreditCard, Users, FileText, Target, User,
};

export default function TypePickerModal({ open, onClose }) {
  const [selectedType, setSelectedType] = useState(null);

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  const handleSaved = () => {
    handleClose();
  };

  if (selectedType === 'task') {
    return <TaskForm open={open} onClose={handleClose} onSaved={handleSaved} />;
  }
  if (selectedType === 'spend') {
    return <SpendForm open={open} onClose={handleClose} onSaved={handleSaved} />;
  }
  if (selectedType === 'subscription') {
    return <SubscriptionForm open={open} onClose={handleClose} onSaved={handleSaved} />;
  }
  if (selectedType) {
    return <QuickItemForm open={open} onClose={handleClose} onSaved={handleSaved} itemType={selectedType} />;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-center text-muted-foreground">
            What are you logging?
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 pt-2">
          {ITEM_TYPES.map((type, i) => {
            const Icon = iconMap[type.icon] || FileText;
            return (
              <motion.button
                key={type.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedType(type.key)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/40 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ backgroundColor: type.color + '15' }}
                >
                  <Icon className="w-5 h-5" style={{ color: type.color }} />
                </div>
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {type.label}
                </span>
              </motion.button>
            );
          })}
          {/* Custom type */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={() => setSelectedType('note')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border border-dashed hover:border-primary/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted transition-all group-hover:scale-110">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              Custom
            </span>
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}