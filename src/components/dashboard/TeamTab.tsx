import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, Shield, Check } from 'lucide-react';

export const TeamTab: React.FC = () => {
  const { currentRestaurant, user } = useAuth();
  const [members, setMembers] = useState([
    { id: '1', name: user?.full_name || 'Sami Ben Ali', email: user?.email || 'patron@cafecentral.tn', role: 'owner' },
    { id: '2', name: 'Karim Manager', email: 'karim@cafecentral.tn', role: 'manager' },
  ]);

  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'manager' | 'staff'>('staff');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setMembers([
      ...members,
      { id: Date.now().toString(), name: emailInput.split('@')[0], email: emailInput, role: roleInput }
    ]);
    setEmailInput('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Équipe & Rôles</h1>
        <p className="text-xs text-slate-400">Gérez les accès et autorisations des membres de votre établissement</p>
      </div>

      <form onSubmit={handleInvite} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-amber-400" />
          Inviter un Membre
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="email"
            required
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            placeholder="email@collaborateur.tn"
            className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
          />
          <select
            value={roleInput}
            onChange={e => setRoleInput(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="manager">Manager</option>
            <option value="staff">Serveur / Staff</option>
          </select>
        </div>
        <button type="submit" className="gold-button w-full py-2.5 rounded-xl text-xs font-bold">
          Envoyer l'invitation
        </button>
      </form>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white">Membres Actifs ({members.length})</h3>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs">{m.name}</h4>
                <p className="text-[11px] text-slate-400">{m.email}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold capitalize">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
