import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, FolderKanban, Loader2 } from 'lucide-react';

export const CategoriesTab: React.FC = () => {
  const { currentRestaurant } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name_fr: '', name_ar: '', icon: '☕' });

  // ─── Charger les catégories depuis Supabase ──────────────────────────────────
  const fetchCategories = async () => {
    if (!currentRestaurant) return;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', currentRestaurant.id)
      .order('sort_order');
    if (!error && data) setCategories(data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [currentRestaurant?.id]);

  if (!currentRestaurant) return null;

  // ─── Sauvegarder (création ou modification) ──────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_fr) return;
    setSaving(true);

    if (editingCategory) {
      await supabase
        .from('categories')
        .update({ name_fr: formData.name_fr, name_ar: formData.name_ar || null, icon: formData.icon })
        .eq('id', editingCategory.id);
    } else {
      await supabase
        .from('categories')
        .insert({
          restaurant_id: currentRestaurant.id,
          name_fr: formData.name_fr,
          name_ar: formData.name_ar || null,
          icon: formData.icon,
          sort_order: categories.length + 1,
          is_visible: true,
        });
    }

    await fetchCategories();
    setSaving(false);
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name_fr: '', name_ar: '', icon: '☕' });
  };

  // ─── Supprimer ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette catégorie ?')) return;
    await supabase.from('categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // ─── Réordonner ─────────────────────────────────────────────────────────────
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const list = [...categories];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const reordered = list.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setCategories(reordered);

    // Mettre à jour dans Supabase
    await Promise.all(
      reordered.map(c => supabase.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Gestion des Catégories</h1>
          <p className="text-xs text-slate-400">Organisez les rubriques de votre carte (Cafés, Thés, Pâtisseries...)</p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name_fr: '', name_ar: '', icon: '☕' });
            setShowModal(true);
          }}
          className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Catégorie
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3 border border-slate-800">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Aucune catégorie</h3>
            <p className="text-xs text-slate-400">Créez votre première catégorie pour regrouper vos produits.</p>
          </div>
        ) : (
          categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                  {cat.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{cat.name_fr}</h4>
                  {cat.name_ar && <p className="text-xs text-amber-400/90 font-arabic">{cat.name_ar}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30" title="Monter">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleMove(idx, 'down')} disabled={idx === categories.length - 1} className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30" title="Descendre">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setEditingCategory(cat); setFormData({ name_fr: cat.name_fr, name_ar: cat.name_ar || '', icon: cat.icon }); setShowModal(true); }}
                  className="p-2 rounded-lg bg-slate-900 text-amber-400 hover:bg-slate-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg bg-slate-900 text-rose-400 hover:bg-slate-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Icône / Émoji</label>
                <div className="flex gap-2 flex-wrap">
                  {['☕', '🍵', '🥤', '💧', '🥐', '🧂', '💨', '🃏', '🍕', '🍰', '🧃', '🍹'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg ${
                        formData.icon === emoji ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom en Français</label>
                <input
                  type="text"
                  required
                  value={formData.name_fr}
                  onChange={e => setFormData({ ...formData, name_fr: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Cafés & Boissons Chaudes"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom en Arabe (Optionnel)</label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 text-right font-arabic"
                  placeholder="القهوة والمشروبات الساخنة"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="gold-button w-1/2 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-60">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
