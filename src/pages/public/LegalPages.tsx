import React from 'react';

export const TermsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-slate-300">
    <h1 className="text-3xl font-black text-white">Conditions Générales d'Utilisation (CGU)</h1>
    <p className="text-sm leading-relaxed">
      Bienvenue sur Mada Menu. En utilisant notre service SaaS de menus digitaux, vous acceptez les présentes conditions générales d'utilisation.
    </p>
    <h3 className="text-xl font-bold text-white pt-4">1. Inscription et Accès au Compte</h3>
    <p className="text-sm leading-relaxed">
      Vous devez fournir des informations exactes lors de la création de votre établissement. Vous êtes responsable du maintien de la confidentialité de vos identifiants.
    </p>
    <h3 className="text-xl font-bold text-white pt-4">2. Propriété du Contenu</h3>
    <p className="text-sm leading-relaxed">
      Vous conservez l'intégralité des droits de propriété intellectuelle sur les photos, logos et tarifs chargés sur votre menu digital Mada Menu.
    </p>
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-slate-300">
    <h1 className="text-3xl font-black text-white">Politique de Confidentialité</h1>
    <p className="text-sm leading-relaxed">
      La protection de vos données personnelles et de celles de vos clients est notre priorité absolue.
    </p>
    <h3 className="text-xl font-bold text-white pt-4">1. Données Collectées</h3>
    <p className="text-sm leading-relaxed">
      Nous collectons uniquement les informations nécessaires au bon fonctionnement de votre service : adresse email, nom de l'établissement, numéro de téléphone et données de facturation.
    </p>
    <h3 className="text-xl font-bold text-white pt-4">2. Absence de Traçage des Visiteurs</h3>
    <p className="text-sm leading-relaxed">
      Les visiteurs qui consultent votre menu public QR ne sont soumis à aucun profilage publicitaire et aucune donnée personnelle n'est exigée pour consulter votre carte.
    </p>
  </div>
);

export const BillingPolicyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-slate-300">
    <h1 className="text-3xl font-black text-white">Politique de Facturation & Annulation</h1>
    <p className="text-sm leading-relaxed">
      Les abonnements Mada Menu sont facturés sur une base mensuelle en Dinars Tunisien (TND).
    </p>
    <h3 className="text-xl font-bold text-white pt-4">1. Résiliation sans Frais</h3>
    <p className="text-sm leading-relaxed">
      Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Votre accès reste actif jusqu'à la fin de la période mensuelle déjà payée.
    </p>
    <h3 className="text-xl font-bold text-white pt-4">2. Conservation des Données</h3>
    <p className="text-sm leading-relaxed">
      En cas de résiliation ou d'expiration de l'abonnement, vos données de menu et de restaurant ne sont pas immédiatement supprimées. Vous conservez la possibilité de réactiver votre abonnement sans perte d'information.
    </p>
  </div>
);
