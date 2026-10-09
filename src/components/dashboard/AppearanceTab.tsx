import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, uploadImage } from '../../lib/supabase';
import { Check, Loader2, Upload, Image, Trash2 } from 'lucide-react';

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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState('');

  if (!currentRestaurant) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'cover_url') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('La taille du fichier ne doit pas dépasser 5 Mo.');
      return;
    }
    setError('');
    if (field === 'logo_url') setUploadingLogo(true);
    else setUploadingCover(true);

    try {
      const publicUrl = await uploadImage(file, field === 'logo_url' ? 'logos' : 'covers');
      setFormData(prev => ({ ...prev, [field]: publicUrl }));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'image.');
    } finally {
      if (field === 'logo_url') setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

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

  const presets = ['#d97706', '#0284c7', '#10b981', '#8b5cf6', '#f43f5e', '#f97316', '#e11d48', '#059669'];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Apparence & Image de Marque</h1>
        <p className="text-xs text-slate-400">Personnalisez le design et les visuels de votre menu QR public</p>
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
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">Couleur Principale du Thème (Menu Public)</label>
          <div className="flex items-center gap-3 flex-wrap">
            {presets.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, theme_color: color })}
                className={`w-10 h-10 rounded-xl transition-transform ${
                  formData.theme_color === color ? 'scale-110 ring-2 ring-white shadow-lg' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
              <input
                type="color"
                value={formData.theme_color}
                onChange={e => setFormData({ ...formData, theme_color: e.target.value })}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                title="Choisir une couleur personnalisée"
              />
              <span className="text-xs font-mono text-slate-300 uppercase pr-2">{formData.theme_color}</span>
            </div>
          </div>
        </div>

        {/* Store Name & Desc */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de l'Établissement *</label>
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
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="Spécialités café, petits-déjeuners et desserts..."
            />
          </div>
        </div>

        {/* Visual Uploads (Logo & Banner) */}
        <div className="space-y-6 pt-2 border-t border-slate-800/80">

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Logo de l'Établissement (Format carré)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-slate-500 shadow-md">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-8 h-8 opacity-40" />
                )}
              </div>
              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-400 inline-flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Choisir une photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'logo_url')} />
                  </label>
                  {formData.logo_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_url: '' })}
                      className="px-3 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  placeholder="Ou coller une URL d'image (https://...)"
                />
              </div>
            </div>
          </div>

          {/* Cover Banner Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Photo de Couverture / Bannière (Format paysage)</label>
            <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              {formData.cover_url && (
                <div className="h-28 w-full rounded-xl overflow-hidden border border-slate-700 relative">
                  <img src={formData.cover_url} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, cover_url: '' })}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-rose-400 border border-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-400 inline-flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Choisir une photo de couverture</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'cover_url')} />
                </label>
              </div>
              <input
                type="text"
                value={formData.cover_url}
                onChange={e => setFormData({ ...formData, cover_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                placeholder="Ou coller une URL d'image (https://...)"
              />
            </div>
          </div>

        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
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
              placeholder="Ex: Rue du Lac, Les Berges du Lac"
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
          className="gold-button w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-xl"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? 'Enregistrement en cours...' : "Enregistrer l'Apparence"}
        </button>
      </form>
    </div>
  );
};
