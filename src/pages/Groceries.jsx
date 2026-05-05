import React, { useState } from 'react';
import { ShoppingBasket } from 'lucide-react';
import GroceriesDashboard from '@/components/groceries/GroceriesDashboard';
import AtHomePage from '@/components/groceries/AtHomePage';
import ShoppingListPage from '@/components/groceries/ShoppingListPage';
import ShopLogPage from '@/components/groceries/ShopLogPage';
import ItemsDatabasePage from '@/components/groceries/ItemsDatabasePage';
import StoresPage from '@/components/groceries/StoresPage';
import TemplatesPage from '@/components/groceries/TemplatesPage';
import ReceiptMode from '@/components/groceries/ReceiptMode';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'athome', label: 'At Home' },
  { id: 'list', label: 'Shopping List' },
  { id: 'log', label: 'Shop Log' },
  { id: 'items', label: 'Items DB' },
  { id: 'stores', label: 'Stores' },
  { id: 'templates', label: 'Templates' },
];

export default function Groceries() {
  const [tab, setTab] = useState('dashboard');
  const [receiptOpen, setReceiptOpen] = useState(false);

  const openReceiptMode = () => {
    setReceiptOpen(true);
    setTab('log');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
            <ShoppingBasket className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h1 className="mono-header text-lg text-foreground">GROCERIES</h1>
            <p className="font-mono text-[10px] text-muted-foreground hidden sm:block">pantry · shopping · receipts · prices</p>
          </div>
        </div>
        <button
          onClick={openReceiptMode}
          className="px-3 md:px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-mono text-sm font-bold hover:bg-secondary/90 transition-colors min-h-[44px] shrink-0 active:scale-95"
        >
          + NEW SHOP
        </button>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none bg-muted/50 p-1 rounded-xl">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`shrink-0 flex-1 min-w-[70px] px-3 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${tab === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {tab === 'dashboard' && <GroceriesDashboard />}
        {tab === 'athome' && <AtHomePage />}
        {tab === 'list' && <ShoppingListPage onOpenReceiptMode={openReceiptMode} />}
        {tab === 'log' && <ShopLogPage onNewShop={() => setReceiptOpen(true)} />}
        {tab === 'items' && <ItemsDatabasePage />}
        {tab === 'stores' && <StoresPage />}
        {tab === 'templates' && <TemplatesPage />}
      </div>

      <ReceiptMode
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        onSaved={() => {
          setTab('log');
        }}
      />
    </div>
  );
}