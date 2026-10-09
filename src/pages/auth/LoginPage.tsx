import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setSubmitting(true);
    const { error: authError } = await login(email, password);
    setSubmitting(false);
    if (authError) {
      if (authError.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else if (authError.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter.');
      } else {
        setError(authError);
      }
      return;
    }
    navigate('/dashboard');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    const { error: resetError } = await resetPassword(resetEmail);
    setResetLoading(false);
    if (resetError) {
      setError(resetError);
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative">

        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg">
              <QrCode className="w-6 h-6 stroke-[2.5]" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-white">Espace Commerçant</h2>
          <p className="text-xs text-slate-400">Accédez au gestionnaire de votre menu digital Mada Menu</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="patron@cafecentral.tn"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Mot de passe</label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-[11px] font-medium text-amber-400 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="gold-button w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{submitting ? 'Connexion...' : 'Se Connecter'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-amber-400 font-bold hover:underline">
            Créer un compte gratuit
          </Link>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Réinitialisation du mot de passe</h3>
            {resetSent ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-300">Un lien de réinitialisation vous a été envoyé par email.</p>
                <button
                  onClick={() => { setShowResetModal(false); setResetSent(false); }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-xs text-slate-400">Entrez votre adresse email pour recevoir les instructions.</p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="votre-email@exemple.tn"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="gold-button w-1/2 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-60"
                  >
                    {resetLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Envoyer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
