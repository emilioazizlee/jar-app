import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Heart, Clock, Users, ShoppingCart, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductAutocomplete from '@/components/shared/ProductAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink', 'Dessert'];
const UNITS = ['g', 'ml', 'pcs', 'serving', 'cup', 'tbsp', 'tsp'];

function RecipeCard({ recipe, onDelete, onToggleFav, onAddToShoppingList, isAddingToList }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors text-left" onClick={() => setExpanded(e => !e)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold truncate">{recipe.name}</span>
            {recipe.is_favorite && <Heart className="w-3.5 h-3.5 text-destructive fill-destructive shrink-0" />}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {recipe.category && <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{recipe.category}</span>}
            {recipe.prep_time_minutes && <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><Clock className="w-2.5 h-2.5" />{recipe.prep_time_minutes}min</span>}
            {recipe.servings && <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><Users className="w-2.5 h-2.5" />{recipe.servings}</span>}
          </div>
        </div>
        {recipe.calories_per_serving && (
          <span className="font-mono text-sm text-primary shrink-0">{Math.round(recipe.calories_per_serving)} kcal</span>
        )}
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-border p-4 space-y-4">
              {recipe.calories_per_serving && (
                <div className="grid grid-cols-4 gap-2 text-center bg-muted rounded-lg p-2">
                  {[
                    { label: 'KCAL', value: recipe.calories_per_serving },
                    { label: 'PROT', value: recipe.protein_per_serving, unit: 'g' },
                    { label: 'CARBS', value: recipe.carbs_per_serving, unit: 'g' },
                    { label: 'FAT', value: recipe.fat_per_serving, unit: 'g' },
                  ].map(({ label, value, unit }) => (
                    <div key={label}>
                      <div className="font-mono text-[10px] text-muted-foreground">{label}</div>
                      <div className="font-mono text-xs text-primary">{value ? `${value.toFixed(0)}${unit || ''}` : '—'}</div>
                    </div>
                  ))}
                </div>
              )}

              {(recipe.ingredients || []).length > 0 && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground mb-2">INGREDIENTS</p>
                  <div className="space-y-1">
                    {recipe.ingredients.map((ing, i) => (
                      <div key={i} className="flex gap-3 font-mono text-xs text-muted-foreground">
                        <span className="text-foreground">{ing.quantity} {ing.unit}</span>
                        <span>{ing.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recipe.instructions && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground mb-1">INSTRUCTIONS</p>
                  <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">{recipe.instructions}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-border">
                <button onClick={() => onToggleFav(recipe)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${recipe.is_favorite ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                  <Heart className="w-3 h-3" />{recipe.is_favorite ? 'Unfav' : 'Favorite'}
                </button>
                <button onClick={() => onAddToShoppingList(recipe)} disabled={isAddingToList} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/20 text-secondary text-xs font-mono hover:bg-secondary/30 transition-colors disabled:opacity-50">
                  {isAddingToList ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingCart className="w-3 h-3" />}
                  {isAddingToList ? 'Adding...' : 'Add to Shopping List'}
                </button>
                <button onClick={() => onDelete(recipe.id)} className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NewRecipeForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', category: 'Dinner', servings: 2, prep_time_minutes: '', calories_per_serving: '', protein_per_serving: '', carbs_per_serving: '', fat_per_serving: '', instructions: '' });
  const [ingredients, setIngredients] = useState([{ name: '', quantity: 100, unit: 'g' }]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave({ ...form, ingredients: ingredients.filter(i => i.name.trim()), is_favorite: false, calories_per_serving: Number(form.calories_per_serving) || undefined, protein_per_serving: Number(form.protein_per_serving) || undefined, carbs_per_serving: Number(form.carbs_per_serving) || undefined, fat_per_serving: Number(form.fat_per_serving) || undefined, prep_time_minutes: Number(form.prep_time_minutes) || undefined, servings: Number(form.servings) || 1 });
    setSaving(false);
  };

  return (
    <div className="bg-muted rounded-xl p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Label className="font-mono text-[10px] text-muted-foreground">RECIPE NAME *</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-background border-none font-mono text-sm h-8 mt-0.5" placeholder="e.g. Oatmeal with fruits" />
        </div>
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">CATEGORY</Label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-background border border-input rounded-md font-mono text-sm h-8 mt-0.5 px-2">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[['Calories', 'calories_per_serving', 'kcal'], ['Protein', 'protein_per_serving', 'g'], ['Carbs', 'carbs_per_serving', 'g'], ['Fat', 'fat_per_serving', 'g']].map(([label, key, unit]) => (
          <div key={key}>
            <Label className="font-mono text-[10px] text-muted-foreground">{label.toUpperCase()} ({unit})</Label>
            <Input type="number" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="bg-background border-none font-mono text-sm h-8 mt-0.5" placeholder="0" />
          </div>
        ))}
      </div>
      <div>
        <Label className="font-mono text-[10px] text-muted-foreground mb-2 block">INGREDIENTS</Label>
        {ingredients.map((ing, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 mb-1.5">
            <ProductAutocomplete value={ing.name} onChange={v => setIngredients(items => items.map((it, j) => j === i ? { ...it, name: v } : it))} onProductSelected={p => setIngredients(items => items.map((it, j) => j === i ? { ...it, name: p.name } : it))} mode="diet" placeholder="Ingredient..." className="col-span-3 bg-background border-none font-mono text-sm h-8" />
            <Input type="number" value={ing.quantity} onChange={e => setIngredients(items => items.map((it, j) => j === i ? { ...it, quantity: Number(e.target.value) } : it))} className="col-span-1 bg-background border-none font-mono text-sm h-8" />
            <select value={ing.unit} onChange={e => setIngredients(items => items.map((it, j) => j === i ? { ...it, unit: e.target.value } : it))} className="col-span-1 bg-background border border-input rounded-md font-mono text-xs h-8 px-1">
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        ))}
        <button onClick={() => setIngredients(items => [...items, { name: '', quantity: 100, unit: 'g' }])} className="text-xs font-mono text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"><Plus className="w-3 h-3" />Add Ingredient</button>
      </div>
      <div>
        <Label className="font-mono text-[10px] text-muted-foreground">INSTRUCTIONS (optional)</Label>
        <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} className="w-full bg-background border border-input rounded-md font-mono text-sm p-2 mt-0.5 h-20 resize-none" placeholder="Step by step..." />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="font-mono text-sm bg-primary text-primary-foreground">{saving ? 'SAVING...' : 'SAVE RECIPE'}</Button>
        <Button variant="ghost" onClick={onCancel} className="font-mono text-sm">Cancel</Button>
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  const { data: recipes = [] } = useQuery({ queryKey: ['recipes'], queryFn: () => base44.entities.Recipe.list('-created_date', 100) });

  const sortedRecipes = [...recipes].sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));

  const saveRecipe = async (data) => {
    await base44.entities.Recipe.create(data);
    qc.invalidateQueries({ queryKey: ['recipes'] });
    setAdding(false);
  };

  const deleteRecipe = async (id) => {
    await base44.entities.Recipe.delete(id);
    qc.invalidateQueries({ queryKey: ['recipes'] });
  };

  const toggleFav = async (recipe) => {
    await base44.entities.Recipe.update(recipe.id, { is_favorite: !recipe.is_favorite });
    qc.invalidateQueries({ queryKey: ['recipes'] });
  };

  const [addingToList, setAddingToList] = useState(null);

  const addToShoppingList = async (recipe) => {
    setAddingToList(recipe.id);
    const res = await base44.functions.invoke('recipeToShoppingList', { recipe_id: recipe.id });
    const { added = 0, skipped = 0 } = res.data || {};
    qc.invalidateQueries({ queryKey: ['shopping-list'] });
    setAddingToList(null);
    toast(`Added ${added} items to shopping list${skipped ? ` (${skipped} already in pantry)` : ''}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm text-muted-foreground">{recipes.length} recipes</p>
        <Button size="sm" onClick={() => setAdding(a => !a)} className="h-8 text-xs font-mono bg-muted text-foreground"><Plus className="w-3 h-3 mr-1" />New Recipe</Button>
      </div>
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <NewRecipeForm onSave={saveRecipe} onCancel={() => setAdding(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      {sortedRecipes.length === 0 && !adding ? (
        <div className="text-center py-16 text-muted-foreground font-mono text-sm">No recipes yet. Add your first!</div>
      ) : (
        <div className="space-y-3">{sortedRecipes.map(r => <RecipeCard key={r.id} recipe={r} onDelete={deleteRecipe} onToggleFav={toggleFav} onAddToShoppingList={addToShoppingList} isAddingToList={addingToList === r.id} />)}</div>
      )}
    </div>
  );
}