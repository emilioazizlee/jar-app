import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Star, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getLocalProductCache, setLocalProductCache, searchLocalProducts } from '@/lib/productDB';
import { searchOFF } from '@/lib/openFoodFacts';

function useDebouncedValue(value, delay = 300) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

export default function ProductAutocomplete({
  value, onChange, onProductSelected,
  placeholder = 'Product name...', className = '',
  mode = 'both', // 'groceries' | 'diet' | 'both'
}) {
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(value, 280);
  const containerRef = useRef(null);
  const pendingRef = useRef(0);

  useEffect(() => {
    const cached = getLocalProductCache();
    if (cached) { setAllProducts(cached); return; }
    base44.entities.GroceryProduct.list().then(products => {
      setAllProducts(products);
      setLocalProductCache(products);
    });
  }, []);

  const buildSuggestions = useCallback(async (q) => {
    const id = ++pendingRef.current;
    const personal = searchLocalProducts(q, allProducts).map(p => ({ ...p, isPersonal: true }));
    setSuggestions(personal);
    if (personal.length > 0) setShowDropdown(true);

    if (q.length >= 2) {
      setLoading(true);
      const remote = await searchOFF(q);
      if (id !== pendingRef.current) return;
      const personalNames = new Set(personal.map(p => `${p.name.toLowerCase()}|${(p.brand || '').toLowerCase()}`));
      const filtered = remote.filter(r => !personalNames.has(`${r.name.toLowerCase()}|${(r.brand || '').toLowerCase()}`));
      const merged = [...personal, ...filtered].slice(0, 10);
      setSuggestions(merged);
      if (merged.length > 0) setShowDropdown(true);
      setLoading(false);
    }
  }, [allProducts]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      buildSuggestions(debouncedQuery.trim());
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [debouncedQuery, buildSuggestions]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectProduct = (product) => {
    onChange(product.name);
    onProductSelected?.(product);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const getNutritionHint = (p) => {
    if (!p.calories_per_100) return null;
    return `${Math.round(p.calories_per_100)} kcal/100`;
  };

  const getPriceHint = (p) => {
    if (!p.last_price) return null;
    return `€${p.last_price.toFixed(2)}/${p.default_unit || 'unit'}`;
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
        placeholder={placeholder}
        className={className}
      />
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((p, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => selectProduct(p)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors text-left group"
            >
              {p.image_url ? (
                <img src={p.image_url} alt="" className="w-6 h-6 object-contain rounded shrink-0" onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                  {p.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-foreground truncate">{p.name}</div>
                {p.brand && <div className="font-mono text-[10px] text-muted-foreground truncate">{p.brand}</div>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {mode !== 'groceries' && getNutritionHint(p) && (
                  <span className="font-mono text-[10px] text-primary">{getNutritionHint(p)}</span>
                )}
                {mode !== 'diet' && getPriceHint(p) && (
                  <span className="font-mono text-[10px] text-secondary">{getPriceHint(p)}</span>
                )}
                {p.isPersonal && <Star className="w-3 h-3 text-secondary fill-secondary" />}
                {p.source === 'open_food_facts' && <Zap className="w-3 h-3 text-primary/60" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}