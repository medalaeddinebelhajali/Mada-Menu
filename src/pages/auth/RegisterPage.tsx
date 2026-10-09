import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'free';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setSubmitting(true);
    const { error: authError } = await register(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone
    );
    setSubmitting(false);
    if (authError) {
      if (authError.includes('User already registered')) {
        setError('Cet email est déjà utilisé. Essayez de vous connecter.');
      } else {
        setError(authError);
      }
      return;
    }
    // Redirect to onboarding after successful registration
    navigate('/onboarding');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">

        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg">
              <QrCode className="w-6 h-6 stroke-[2.5]" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-white">Créer Votre Compte</h2>
          <p className="text-xs text-slate-400">
            14 jours d'essai gratuit. Offre sélectionnée :{' '}
            <span className="font-bold text-amber-400 uppercase">{selectedPlan}</span>
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom & Prénom *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="Sami Ben Ali"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="patron@cafecentral.tn"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone Mobile (Tunisie)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="+216 98 123 456"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe * (6 caractères min.)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-400">
              Vos données sont sécurisées par Supabase avec chiffrement AES-256. Aucune carte bancaire requise pour l'essai.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="gold-button w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{submitting ? 'Création du compte...' : 'Continuer vers la configuration'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-amber-400 font-bold hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};
