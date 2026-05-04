import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';
import { getBrandSuggestions, saveBrand } from '@/lib/brandDB';
import { fetchBrandSuggestions } from '@/lib/brandAPI';

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function BrandInput({ value, onChange, onBrandSelected, placeholder = 'Brand...', className = '' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounced = useDebouncedValue(value, 300);
  const containerRef = useRef(null);
  const pendingRef = useRef(0);

  const buildSuggestions = useCallback(async (q) => {
    const id = ++pendingRef.current;
    const personal = getBrandSuggestions(q, 5).map(b => ({ ...b, isPersonal: true }));

    setSuggestions(personal);
    if (personal.length > 0) setShowDropdown(true);

    if (q.length >= 2) {
      setLoading(true);
      const remote = await fetchBrandSuggestions(q);
      if (id !== pendingRef.current) return; // stale
      // merge: personal first, then remote names not already in personal
      const personalNames = new Set(personal.map(b => b.name.toLowerCase()));
      const filtered = remote.filter(b => !personalNames.has(b.name.toLowerCase()));
      const merged = [...personal, ...filtered].slice(0, 7);
      setSuggestions(merged);
      if (merged.length > 0) setShowDropdown(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounced.trim()) {
      buildSuggestions(debounced.trim());
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [debounced, buildSuggestions]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectBrand = (brand) => {
    onChange(brand.name);
    saveBrand(brand);
    onBrandSelected?.(brand);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleBlur = () => {
    // Save manual entry on blur
    if (value.trim()) {
      saveBrand({ name: value.trim(), source: 'manual' });
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
      />
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((b, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => selectBrand(b)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors text-left"
            >
              {b.logo ? (
                <img
                  src={b.logo}
                  alt=""
                  className="w-5 h-5 object-contain rounded"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  {b.name[0]?.toUpperCase()}
                </div>
              )}
              <span className="flex-1 font-mono text-sm text-foreground truncate">{b.name}</span>
              {b.countryFlag && <span className="text-base">{b.countryFlag}</span>}
              {b.isPersonal && <Star className="w-3 h-3 text-secondary fill-secondary shrink-0" />}
              <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                {b.source === 'open_food_facts' ? 'OFF' : b.source === 'wikidata' ? 'WD' : b.source === 'corrected' ? '✓' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}