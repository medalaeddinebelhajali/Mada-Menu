import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black text-white">Contactez Notre Équipe</h1>
        <p className="text-slate-400 text-base">Une question sur nos offres ou besoin d'une démonstration personnalisée ? Écrivez-nous.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Contact Info */}
        <div className="glass-panel p-8 rounded-3xl space-y-8">
          <h3 className="text-2xl font-bold text-white">Mada Menu Tunisie</h3>
          <div className="space-y-6 text-slate-300 text-sm">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
              <div>
                <h5 className="font-semibold text-white">Adresse</h5>
                <p>Immeuble Horizon, Les Berges du Lac 2, 1053 Tunis, Tunisie</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
              <div>
                <h5 className="font-semibold text-white">Téléphone & WhatsApp</h5>
                <p>+216 71 900 800 / +216 98 123 456</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
              <div>
                <h5 className="font-semibold text-white">Email</h5>
                <p>contact@mada-menu.tn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="glass-panel p-8 rounded-3xl">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
              <h3 className="text-2xl font-bold text-white">Message Envoyé !</h3>
              <p className="text-slate-300 text-sm">Merci de nous avoir contactés. Notre équipe commerciale vous répondra sous 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Sami Ben Ali"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  placeholder="sami@cafecentral.tn"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  placeholder="+216 98 123 456"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Votre Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Bonjour, je souhaite digitaliser le menu de mon salon de thé..."
                />
              </div>

              <button
                type="submit"
                className="gold-button w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-slate-950" />
                Envoyer le Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
