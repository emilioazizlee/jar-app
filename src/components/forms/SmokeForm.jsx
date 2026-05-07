import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { CURRENCIES } from '@/lib/constants';
import { format } from 'date-fns';

const PACK_SIZES = [10, 20, 25, 30];

export default function SmokeForm({ open, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [isPackPurchase, setIsPackPurchase] = useState(false);

  // Smoke event state
  const [smokeQty, setSmokeQty] = useState(1);
  const [smokeNote, setSmokeNote] = useState('');

  // Pack purchase state
  const [packSize, setPackSize] = useState(20);
  const [packPrice, setPackPrice] = useState('');
  const [packCurrency, setPackCurrency] = useState('EUR');
  const [packNote, setPackNote] = useState('');

  const quickSmokeQty = [1, 2, 3, 5, 10];

  const handleSave = async () => {
    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    if (isPackPurchase) {
      // TYPE B: Pack purchase — counts toward Finance + Daily Spend
      await base44.entities.Item.create({
        type: 'spend',
        title: `Pack of ${packSize}`,
        category: 'cigarettes',
        quantity: packSize,
        amount: packPrice ? Number(packPrice) : undefined,
        currency: packCurrency,
        note: packNote || undefined,
        date: today,
        // Store pack metadata in description for inventory tracking
        description: JSON.stringify({ pack_purchase: true, pack_size: packSize }),
      });
    } else {
      // TYPE A: Smoke event — health tracking ONLY, no finance impact
      await base44.entities.Item.create({
        type: 'spend',
        title: 'Smoked',
        category: 'cigarettes_health',
        quantity: smokeQty,
        note: smokeNote || undefined,
        date: today,
        description: JSON.stringify({ smoke_event: true }),
      });
    }

    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['items-smoke'] });
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm w-full p-0 gap-0 flex flex-col rounded-none sm:rounded-xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[85vh] overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="mono-header text-sm text-secondary flex items-center gap-2">
            🚬 LOG CIGARETTES
          </DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="px-5 pt-4 shrink-0">
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => setIsPackPurchase(false)}
              className={`flex-1 py-2 rounded-lg font-mono text-xs transition-all ${!isPackPurchase ? 'bg-card text-secondary border border-secondary/30' : 'text-muted-foreground'}`}
            >
              🚬 I smoked
            </button>
            <button
              onClick={() => setIsPackPurchase(true)}
              className={`flex-1 py-2 rounded-lg font-mono text-xs transition-all ${isPackPurchase ? 'bg-card text-primary border border-primary/30' : 'text-muted-foreground'}`}
            >
              📦 I bought a pack
            </button>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mt-2 text-center">
            {isPackPurchase
              ? '💳 Counts toward finance & daily spend'
              : '💊 Tracks health & habit only — no spend impact'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-6 overscroll-contain">
          {!isPackPurchase ? (
            /* TYPE A: Smoke event */
            <>
              <div>
                <Label className="text-xs text-muted-foreground font-mono">HOW MANY CIGARETTES?</Label>
                <div className="flex gap-2 mt-2">
                  {quickSmokeQty.map(q => (
                    <button
                      key={q}
                      onClick={() => setSmokeQty(q)}
                      className={`flex-1 py-2.5 rounded-lg font-mono text-sm border transition-all ${smokeQty === q ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-muted border-border text-muted-foreground hover:border-secondary/40'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <Input
                  inputMode="numeric"
                  type="text"
                  value={smokeQty}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    setSmokeQty(v === '' ? '' : Number(v));
                  }}
                  className="bg-muted border-none mt-2 font-mono text-center text-2xl h-14"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-mono">NOTE (optional)</Label>
                <Textarea value={smokeNote} onChange={e => setSmokeNote(e.target.value)} className="bg-muted border-none mt-1" rows={2} placeholder="e.g. after lunch, stress..." />
              </div>
            </>
          ) : (
            /* TYPE B: Pack purchase */
            <>
              <div>
                <Label className="text-xs text-muted-foreground font-mono">PACK SIZE</Label>
                <div className="flex gap-2 mt-2">
                  {PACK_SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => setPackSize(s)}
                      className={`flex-1 py-2.5 rounded-lg font-mono text-sm border transition-all ${packSize === s ? 'bg-primary/20 border-primary text-primary' : 'bg-muted border-border text-muted-foreground hover:border-primary/40'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">cigarettes per pack</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-mono">PRICE <span className="text-destructive">*</span></Label>
                <Input
                  inputMode="decimal"
                  type="text"
                  placeholder="0.00"
                  value={packPrice}
                  onChange={e => setPackPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="bg-muted border-none mt-1 font-mono text-2xl h-14"
                />
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {[3, 4, 5, 6, 7, 8].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setPackPrice(String(amt))}
                      className="px-3 py-1.5 rounded-lg bg-muted border border-border font-mono text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-mono">CURRENCY</Label>
                <Select value={packCurrency} onValueChange={setPackCurrency}>
                  <SelectTrigger className="bg-muted border-none mt-1 font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-mono">NOTE (optional)</Label>
                <Textarea value={packNote} onChange={e => setPackNote(e.target.value)} className="bg-muted border-none mt-1" rows={2} placeholder="e.g. Marlboro, corner shop..." />
              </div>
            </>
          )}
        </div>

        <div className="px-5 pt-3 pb-5 border-t border-border shrink-0 bg-card">
          <Button
            onClick={handleSave}
            disabled={saving || (isPackPurchase && !packPrice)}
            className="w-full font-mono"
            style={{ background: isPackPurchase ? 'hsl(var(--primary))' : 'hsl(var(--secondary))', color: '#0a0a0a' }}
          >
            {saving ? 'SAVING...' : isPackPurchase ? `LOG PACK OF ${packSize}` : `LOG ${smokeQty} CIGARETTE${smokeQty !== 1 ? 'S' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}