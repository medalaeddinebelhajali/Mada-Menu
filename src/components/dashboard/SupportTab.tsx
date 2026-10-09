import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTickets, createTicket } from '../../lib/supabase';
import { SupportTicket } from '../../types';
import { HelpCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';

export const SupportTab: React.FC = () => {
  const { currentRestaurant, user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    getTickets(user.id).then(data => {
      setTickets(data);
      setLoading(false);
    });
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message || !user) return;
    setSubmitting(true);

    const newTicket = await createTicket({
      user_id: user.id,
      restaurant_id: currentRestaurant?.id,
      subject,
      message,
      status: 'open',
      priority: 'medium',
    });

    setTickets(prev => [newTicket, ...prev]);
    setSubject('');
    setMessage('');
    setSubmitting(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Support Client & Assistance</h1>
        <p className="text-xs text-slate-400">Posez vos questions ou signalez un problème technique à notre équipe</p>
      </div>

      {sent && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Votre demande de support a bien été transmise à notre équipe.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          Nouveau Ticket de Support
        </h3>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Sujet</label>
          <input
            type="text"
            required
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Ex: Aide pour l'intégration de mon logo"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Message détaillé</label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Décrivez votre besoin..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
        <button type="submit" disabled={submitting} className="gold-button w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
        </button>
      </form>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white">Vos Demandes de Support</h3>
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-amber-400 animate-spin" /></div>
        ) : tickets.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune demande de support pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {tickets.map(t => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{t.subject}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 capitalize">{t.status}</span>
                </div>
                <p className="text-xs text-slate-400">{t.message}</p>
                <p className="text-[10px] text-slate-500 pt-1">{new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
