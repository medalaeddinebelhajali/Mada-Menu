import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProducts, getCategories, getSubscription, createProduct, updateProduct, deleteProduct } from '../../lib/supabase';
import { Product, Category, Subscription } from '../../types';
import { Plus, Edit2, Trash2, Check, AlertCircle, Search, Loader2, Upload } from 'lucide-react';

export const ProductsTab: React.FC = () => {
  const { currentRestaurant } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name_fr: '',
    name_ar: '',
    description_fr: '',
    description_ar: '',
    price: '2.000',
    category_id: '',
    image_url: '',
    is_available: true,
  });

  const fetchData = async () => {
    if (!currentRestaurant) return;
    const [prods, cats, subscription] = await Promise.all([
      getProducts(currentRestaurant.id),
      getCategories(currentRestaurant.id),
      getSubscription(currentRestaurant.id),
    ]);
    setProducts(prods);
    setCategories(cats);
    setSub(subscription);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [currentRestaurant?.id]);

  if (!currentRestaurant) return null;

  const maxProducts = sub?.plan?.max_products_per_restaurant || 15;

  const handleOpenAdd = () => {
    if (products.length >= maxProducts) {
      setErrorMsg(`Limite atteinte (${products.length}/${maxProducts} produits). Veuillez mettre à jour votre abonnement.`);
      return;
    }
    setErrorMsg('');
    setEditingProduct(null);
    setFormData({ name_fr: '', name_ar: '', description_fr: '', description_ar: '', price: '2.000', category_id: categories[0]?.id || '', image_url: '', is_available: true });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_fr || !formData.price) return;
    setSaving(true);
    const numPrice = parseFloat(formData.price.replace(',', '.'));

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name_fr: formData.name_fr,
        name_ar: formData.name_ar || undefined,
        description_fr: formData.description_fr,
        description_ar: formData.description_ar || undefined,
        price: numPrice,
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
        is_available: formData.is_available,
      });
    } else {
      await createProduct({
        restaurant_id: currentRestaurant.id,
        category_id: formData.category_id || null,
        name_fr: formData.name_fr,
        name_ar: formData.name_ar || undefined,
        description_fr: formData.description_fr,
        description_ar: formData.description_ar || undefined,
        price: numPrice,
        image_url: formData.image_url || null,
        is_available: formData.is_available,
        is_featured: false,
        sort_order: products.length + 1,
      });
    }

    await fetchData();
    setSaving(false);
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleAvailability = async (product: Product) => {
    await updateProduct(product.id, { is_available: !product.is_available });
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p));
  };

  const filtered = products.filter(p => {
    const matchesCat = filterCategory === 'all' || p.category_id === filterCategory;
    const matchesSearch = p.name_fr.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Gestion des Produits ({products.length}/{maxProducts === 9999 ? '∞' : maxProducts})</h1>
          <p className="text-xs text-slate-400">Gérez les articles, prix et visuels de votre carte</p>
        </div>
        <button onClick={handleOpenAdd} className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />Nouveau Produit
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 underline font-bold">Fermer</button>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_fr}</option>)}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(product => (
          <div key={product.id} className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-slate-800/80 hover:border-slate-700 transition-all">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name_fr} className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center text-xl text-slate-600 shrink-0">☕</div>
            )}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">{product.name_fr}</h4>
                <span className="text-amber-400 font-bold text-xs">{product.price.toFixed(3)} TND</span>
              </div>
              {product.name_ar && <p className="text-xs text-amber-400/80 font-arabic">{product.name_ar}</p>}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => toggleAvailability(product)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${product.is_available ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-rose-500/30 text-rose-400 bg-rose-500/10'}`}
                >
                  {product.is_available ? 'Disponible' : 'Épuisé'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setFormData({ name_fr: product.name_fr, name_ar: product.name_ar || '', description_fr: product.description_fr || '', description_ar: product.description_ar || '', price: product.price.toString(), category_id: product.category_id || '', image_url: product.image_url || '', is_available: product.is_available });
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 text-amber-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg bg-slate-900 text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">{editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie</label>
                <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500">
                  <option value="">Sans catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_fr}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom (Français) *</label>
                  <input type="text" required value={formData.name_fr} onChange={e => setFormData({ ...formData, name_fr: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500" placeholder="Expresso Arabica" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom (Arabe)</label>
                  <input type="text" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs text-right font-arabic focus:outline-none focus:border-amber-500" placeholder="إسبريسو" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prix (TND) *</label>
                <input type="number" step="0.100" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500" placeholder="2.500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Français)</label>
                <textarea rows={2} value={formData.description_fr} onChange={e => setFormData({ ...formData, description_fr: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500" placeholder="Notes de torréfaction intenses..." />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Photo du Produit</label>
                <div className="flex items-center gap-3">
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0 text-xl">☕</div>
                  )}
                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 inline-flex items-center gap-2 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Importer une photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, image_url: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                      placeholder="Ou URL (https://...)"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="avail" checked={formData.is_available} onChange={e => setFormData({ ...formData, is_available: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                <label htmlFor="avail" className="text-xs text-slate-300 font-semibold cursor-pointer">Produit actuellement disponible à la vente</label>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">Annuler</button>
                <button type="submit" disabled={saving} className="gold-button w-1/2 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-60">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
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
