import React, { useState, useEffect } from 'react';
import { getAllBrands, deleteBrand, saveBrand, addBrandManually } from '@/lib/brandDB';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Trash2, Plus, Edit2, Check, X } from 'lucide-react';

const SOURCE_LABELS = {
  open_food_facts: 'Open Food Facts',
  wikidata: 'Wikidata',
  wikipedia: 'Wikipedia',
  manual: 'Manual',
  corrected: 'Corrected',
};

function BrandRow({ brand, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(brand);

  const commit = () => {
    onSave(brand.name, draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="p-3 rounded-lg bg-muted border border-primary/30 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="font-mono text-[10px] text-muted-foreground">NAME</Label>
            <Input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} className="bg-background border-border font-mono text-sm h-7 mt-0.5" />
          </div>
          <div>
            <Label className="font-mono text-[10px] text-muted-foreground">COUNTRY</Label>
            <Input value={draft.country || ''} onChange={e => setDraft(d => ({ ...d, country: e.target.value }))} className="bg-background border-border font-mono text-sm h-7 mt-0.5" placeholder="us, de, fr..." />
          </div>
          <div>
            <Label className="font-mono text-[10px] text-muted-foreground">WEBSITE</Label>
            <Input value={draft.website || ''} onChange={e => setDraft(d => ({ ...d, website: e.target.value }))} className="bg-background border-border font-mono text-sm h-7 mt-0.5" placeholder="https://..." />
          </div>
          <div>
            <Label className="font-mono text-[10px] text-muted-foreground">LOGO URL</Label>
            <Input value={draft.logo || ''} onChange={e => setDraft(d => ({ ...d, logo: e.target.value }))} className="bg-background border-border font-mono text-sm h-7 mt-0.5" placeholder="https://..." />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={commit} className="h-7 text-xs font-mono bg-primary text-primary-foreground"><Check className="w-3 h-3 mr-1" />Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 text-xs font-mono"><X className="w-3 h-3" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
      {brand.logo ? (
        <img src={brand.logo} alt="" className="w-7 h-7 object-contain rounded" onError={e => { e.target.style.display = 'none'; }} />
      ) : (
        <div className="w-7 h-7 rounded bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">{brand.name[0]?.toUpperCase()}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-medium truncate">{brand.name}</span>
          {brand.countryFlag && <span>{brand.countryFlag}</span>}
          {brand.source === 'corrected' && <Star className="w-3 h-3 text-secondary fill-secondary" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-[10px] text-muted-foreground">{SOURCE_LABELS[brand.source] || brand.source}</span>
          {brand.website && <a href={brand.website} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-primary hover:underline truncate max-w-[120px]">{brand.website.replace(/^https?:\/\//, '')}</a>}
          <span className="font-mono text-[10px] text-muted-foreground ml-auto">×{brand.useCount}</span>
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="p-1 rounded hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => onDelete(brand.name)} className="p-1 rounded hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

export default function MyBrands() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', website: '', country: '', logo: '' });

  const reload = () => setBrands(getAllBrands());

  useEffect(() => { reload(); }, []);

  const handleDelete = (name) => { deleteBrand(name); reload(); };

  const handleSave = (originalName, updates) => {
    const all = brands.map(b => b.name.toLowerCase() === originalName.toLowerCase() ? { ...b, ...updates, source: 'corrected' } : b);
    localStorage.setItem('jar_brands_v1', JSON.stringify(all));
    reload();
  };

  const handleAdd = () => {
    if (!newBrand.name.trim()) return;
    addBrandManually(newBrand);
    setNewBrand({ name: '', website: '', country: '', logo: '' });
    setAdding(false);
    reload();
  };

  const filtered = search ? brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase())) : brands;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-sm font-bold text-foreground">MY BRANDS</h2>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">{brands.length} brands saved</p>
        </div>
        <Button size="sm" onClick={() => setAdding(a => !a)} className="h-7 text-xs font-mono bg-secondary text-secondary-foreground">
          <Plus className="w-3 h-3 mr-1" />ADD BRAND
        </Button>
      </div>

      {adding && (
        <div className="p-3 rounded-lg bg-muted border border-secondary/30 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="font-mono text-[10px] text-muted-foreground">NAME *</Label>
              <Input value={newBrand.name} onChange={e => setNewBrand(d => ({ ...d, name: e.target.value }))} className="bg-background border-border font-mono text-sm h-7 mt-0.5" placeholder="Brand name" />
            </div>
            <div>
              <Label className="font-mono text-[10px] text-muted-foreground">COUNTRY CODE</Label>
              <Input value={newBrand.country} onChange={e => setNewBrand(d => ({ ...d, country: e.target.value }))} className="bg-background border-border font-mono text-sm h-7 mt-0.5" placeholder="us, de, fr..." />
            </div>
            <div>
              <Label className="font-mono text-[10px] text-muted-foreground">WEBSITE</Label>
              <Input value={newBrand.website} onChange={e => setNewBrand(d => ({ ...d, website: e.target.value }))} className="bg-background border-border font-mono text-sm h-7 mt-0.5" placeholder="https://..." />
            </div>
            <div>
              <Label className="font-mono text-[10px] text-muted-foreground">LOGO URL</Label>
              <Input value={newBrand.logo} onChange={e => setNewBrand(d => ({ ...d, logo: e.target.value }))} className="bg-background border-border font-mono text-sm h-7 mt-0.5" placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!newBrand.name.trim()} className="h-7 text-xs font-mono"><Check className="w-3 h-3 mr-1" />Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-7 text-xs font-mono"><X className="w-3 h-3" /></Button>
          </div>
        </div>
      )}

      <Input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search brands..."
        className="bg-muted border-none font-mono text-sm h-8"
      />

      {filtered.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground text-center py-6">
          {search ? 'No brands match.' : 'No brands saved yet. Use any Brand field to build your directory.'}
        </p>
      ) : (
        <div className="space-y-0.5">
          {filtered.map(b => (
            <BrandRow key={b.name} brand={b} onDelete={handleDelete} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  );
}