import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Check, Loader2 } from 'lucide-react';

export const AppearanceTab: React.FC = () => {
  const { currentRestaurant, setCurrentRestaurant, refreshRestaurants } = useAuth();

  const [formData, setFormData] = useState({
    name: currentRestaurant?.name || '',
    description: currentRestaurant?.description || '',
    phone: currentRestaurant?.phone || '',
    whatsapp: currentRestaurant?.whatsapp || '',
    address: currentRestaurant?.address || '',
    city: currentRestaurant?.city || 'Tunis',
    theme_color: currentRestaurant?.theme_color || '#d97706',
    logo_url: currentRestaurant?.logo_url || '',
    cover_url: currentRestaurant?.cover_url || '',
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!currentRestaurant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        name:        formData.name,
        description: formData.description || null,
        phone:       formData.phone || null,
        whatsapp:    formData.whatsapp || null,
        address:     formData.address || null,
        city:        formData.city,
        theme_color: formData.theme_color,
        logo_url:    formData.logo_url || null,
        cover_url:   formData.cover_url || null,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', currentRestaurant.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Mettre à jour le contexte local
    setCurrentRestaurant({ ...currentRestaurant, ...formData });
    await refreshRestaurants();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const presets = ['#d97706', '#0284c7', '#10b981', '#8b5cf6', '#f43f5e', '#f97316'];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Apparence & Image de Marque</h1>
        <p className="text-xs text-slate-400">Personnalisez le design et les informations de votre menu QR public</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Modifications enregistrées avec succès !</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800">

        {/* Color Palette */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Couleur Principale du Thème</label>
          <div className="flex items-center gap-3 flex-wrap">
            {presets.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, theme_color: color })}
                className={`w-10 h-10 rounded-xl transition-transform ${
                  formData.theme_color === color ? 'scale-110 ring-2 ring-white' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={formData.theme_color}
              onChange={e => setFormData({ ...formData, theme_color: e.target.value })}
              className="w-10 h-10 rounded-xl border border-slate-700 cursor-pointer bg-slate-900"
              title="Couleur personnalisée"
            />
          </div>
        </div>

        {/* Store Name & Desc */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de l'Établissement</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Slogan</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Visual URLs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">URL Logo (Format carré PNG/JPG)</label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="https://..."
            />
            {formData.logo_url && (
              <img src={formData.logo_url} alt="Logo preview" className="mt-2 w-16 h-16 rounded-xl object-cover border border-slate-700" />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">URL Photo de Couverture (Bannière)</label>
            <input
              type="url"
              value={formData.cover_url}
              onChange={e => setFormData({ ...formData, cover_url: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="+216 71 123 456"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="+216 98 123 456"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Physique</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ville</label>
            <select
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
            >
              {['Tunis','Sfax','Sousse','Monastir','La Marsa','Carthage','Hammamet','Nabeul','Bizerte','Kairouan','Gabès'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="gold-button w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? 'Enregistrement...' : "Enregistrer l'Apparence"}
        </button>
      </form>
    </div>
  );
};
