import React, { useState, useEffect } from 'react';
import { getAllBrands, deleteBrand, updateBrand } from '@/lib/brandDB';
import { format } from 'date-fns';
import { Search, Image, Globe, Edit2, Trash2 } from 'lucide-react';
import BrandLogo from '@/components/subscriptions/BrandLogo';

export default function MyBrands() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('most_used');

  useEffect(() => {
    setBrands(getAllBrands());
  }, []);

  const filtered = brands
    .filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'most_used') return (b.useCount || 0) - (a.useCount || 0);
      if (sort === 'recent') return new Date(b.firstUsed || 0).getTime() - new Date(a.firstUsed || 0).getTime();
      return a.name.localeCompare(b.name);
    });

  const handleDelete = (name) => {
    deleteBrand(name);
    setBrands(getAllBrands());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a]">MY BRANDS DIRECTORY</h1>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a7a]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search directory..."
            className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg pl-10 pr-3 py-2 text-sm font-mono text-white outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs font-mono text-[#aaa] outline-none"
        >
          <option value="most_used">Most Used</option>
          <option value="recent">Recently Added</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(brand => (
          <div
            key={brand.name}
            className="flex items-center gap-4 bg-[#141414] border border-[#1f1f1f] rounded-xl p-3 hover:border-[#2a2a2a] transition-colors group"
          >
            <div className="w-10 h-10 shrink-0">
              <BrandLogo domain={brand.website} name={brand.name} size={40} className="rounded-lg border border-[#2a2a2a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{brand.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-[10px] text-[#7a7a7a] bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#2a2a2a]">
                  {brand.useCount || 1} uses
                </span>
                {brand.website && <span className="font-mono text-[10px] text-[#555] truncate max-w-[120px]">{brand.website}</span>}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 text-[#555] hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(brand.name)} className="p-1.5 text-[#555] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="font-mono text-sm text-[#555]">No brands found.</p>
          </div>
        )}
      </div>
    </div>
  );
}