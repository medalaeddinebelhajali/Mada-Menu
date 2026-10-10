import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Store, MapPin, Phone, Sparkles, Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { user, refreshRestaurants } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    phone: '',
    address: '',
    city: 'Tunis',
    includeDemoData: true,
  });

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlever accents
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setError('Veuillez renseigner le nom et le slug.');
      return;
    }
    if (!user) {
      setError('Session utilisateur introuvable. Veuillez vous reconnecter.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Vérifier si le slug est disponible (maybeSingle pour éviter PGRST116)
      const { data: existing } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', formData.slug)
        .maybeSingle();

      if (existing) {
        setError('Ce slug est déjà utilisé. Veuillez en choisir un autre.');
        setSubmitting(false);
        return;
      }

      // 2. Créer le restaurant via la fonction RPC SQL ou par insertion directe
      let restaurantId: string | null = null;

      const { data: rpcRes, error: rpcErr } = await supabase
        .rpc('create_restaurant_with_trial', {
          p_name: formData.name,
          p_slug: formData.slug,
          p_city: formData.city,
          p_description: formData.description || 'Bienvenue dans notre établissement.',
          p_phone: formData.phone || null,
          p_owner_id: user.id,
        });

      if (!rpcErr && rpcRes) {
        restaurantId = typeof rpcRes === 'object' ? rpcRes.id : rpcRes;
      } else {

        // Fallback: Insertion directe dans la base de données
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email || 'user@mada-menu.tn',
          full_name: user.full_name || user.email,
        });

        const { data: newRest, error: restErr } = await supabase
          .from('restaurants')
          .insert({
            name: formData.name,
            slug: formData.slug,
            city: formData.city,
            description: formData.description || 'Bienvenue dans notre établissement.',
            phone: formData.phone || null,
            address: formData.address || null,
          })
          .select()
          .single();

        if (restErr) throw new Error(restErr.message);
        restaurantId = newRest.id;

        await supabase.from('restaurant_members').insert({
          restaurant_id: restaurantId,
          user_id: user.id,
          role: 'owner',
        });

        await supabase.from('subscriptions').insert({
          restaurant_id: restaurantId,
          plan_id: 'free',
          status: 'trial',
        });
      }

      // 3. Insérer les données démo si demandé
      if (formData.includeDemoData && restaurantId) {
        try {
          const demoCategories = [
            { restaurant_id: restaurantId, name_fr: 'Café & Boissons Chaudes', name_ar: 'القهوة', icon: '☕', sort_order: 1 },
            { restaurant_id: restaurantId, name_fr: 'Thés & Infusions',        name_ar: 'الشاي',  icon: '🍵', sort_order: 2 },
            { restaurant_id: restaurantId, name_fr: 'Jus Frais & Boissons',    name_ar: 'العصائر', icon: '🥤', sort_order: 3 },
            { restaurant_id: restaurantId, name_fr: 'Pâtisseries & Desserts',  name_ar: 'الحلويات', icon: '🥐', sort_order: 4 },
            { restaurant_id: restaurantId, name_fr: 'Narguile Premium',        name_ar: 'الشيشة',  icon: '💨', sort_order: 5 },
          ];

          const { data: cats } = await supabase
            .from('categories')
            .insert(demoCategories)
            .select();

          if (cats && cats.length > 0) {
            const catByOrder = (o: number) => cats.find((c: any) => c.sort_order === o)?.id;
            const demoProducts = [
              { restaurant_id: restaurantId, category_id: catByOrder(1), name_fr: 'Expresso', description_fr: 'Arôme riche 100% Arabica', price: 2.200, is_available: true, is_featured: true,  sort_order: 1 },
              { restaurant_id: restaurantId, category_id: catByOrder(1), name_fr: 'Capussin',  description_fr: 'Espresso avec lait moussé',  price: 2.400, is_available: true, is_featured: false, sort_order: 2 },
              { restaurant_id: restaurantId, category_id: catByOrder(1), name_fr: 'Chocolat Chaud', description_fr: 'Servi avec crème chantilly', price: 4.500, is_available: true, is_featured: false, sort_order: 3 },
              { restaurant_id: restaurantId, category_id: catByOrder(2), name_fr: 'Thé Vert aux Amandes', description_fr: 'Traditionnel infusé aux amandes', price: 3.500, is_available: true, is_featured: true,  sort_order: 4 },
              { restaurant_id: restaurantId, category_id: catByOrder(3), name_fr: "Jus d'Orange Frais", description_fr: 'Pressé à la minute', price: 3.800, is_available: true, is_featured: false, sort_order: 5 },
              { restaurant_id: restaurantId, category_id: catByOrder(4), name_fr: 'Tiramisu Maison',    description_fr: 'Au café espresso et mascarpone', price: 5.500, is_available: true, is_featured: true,  sort_order: 6 },
              { restaurant_id: restaurantId, category_id: catByOrder(5), name_fr: 'Chicha Pomme Menthe', description_fr: 'Qualité supérieure', price: 6.000, is_available: true, is_featured: false, sort_order: 7 },
            ];
            await supabase.from('products').insert(demoProducts);
          }
        } catch (demoErr) {
          // Ignorer l'erreur des données démo
        }
      }

      // 4. Rafraîchir les restaurants et naviguer vers le tableau de bord
      await refreshRestaurants();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
            <span>Étape {step} sur 2</span>
            <span>Configuration de l'établissement</span>
          </div>
          <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
            <div className={`h-full bg-amber-500 transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Identité de l'Établissement</h2>
              <p className="text-xs text-slate-400">Renseignez le nom de votre café ou restaurant</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du Café / Restaurant</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Café Express La Marsa"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">URL Publique (Slug)</label>
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-400">
                <span>mada-menu.tn/m/</span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-transparent text-amber-400 font-bold focus:outline-none flex-1 ml-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description courte</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="Spécialités espresso, jus frais et narguilé..."
              />
            </div>

            <button
              onClick={() => { if (formData.name && formData.slug) setStep(2); }}
              disabled={!formData.name || !formData.slug}
              className="gold-button w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Suivant : Coordonnées</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Coordonnées & Menu Démo</h2>
              <p className="text-xs text-slate-400">Ajoutez votre adresse et activez les exemples</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone de contact</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="+216 71 123 456"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse physique</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Avenue Habib Bourguiba"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ville</label>
              <select
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                {['Tunis','Sfax','Sousse','Monastir','Mahdia','Nabeul','Hammamet','La Marsa','Carthage','Bizerte','Kairouan','Gabès'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <input
                type="checkbox"
                id="demo"
                checked={formData.includeDemoData}
                onChange={e => setFormData({ ...formData, includeDemoData: e.target.checked })}
                className="w-4 h-4 accent-amber-500"
              />
              <label htmlFor="demo" className="text-xs text-slate-300 font-medium cursor-pointer flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pré-charger des catégories et produits démo (Cafés, Thés, Pâtisseries)
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="gold-button w-2/3 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Check className="w-4 h-4" />
                }
                {submitting ? 'Création en cours...' : 'Finaliser & Ouvrir le Dashboard'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
