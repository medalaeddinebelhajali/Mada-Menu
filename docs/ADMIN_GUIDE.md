# GUIDE SUPER ADMINISTRATEUR: MADA MENU

## 1. Vue d'Ensemble du Rôle Super Admin

Le panneau Super Admin (`/super-admin`) permet aux administrateurs système Mada Menu de superviser l'ensemble de la plateforme SaaS.

---

## 2. Fonctionnalités Administratives

1. **Tableau de Bord Global** : Visualisation du chiffre d'affaires cumulé en TND, du nombre total d'établissements enregistrés et du volume de transactions.
2. **Gestion des Établissements** : Liste de tous les cafés et restaurants clients, accès direct aux menus publics et possibilité de suspension administrative.
3. **Configuration des Plans SaaS** : Modification des tarifs mensuels en Dinars Tunisien (Free 0 TND, Starter 49 TND, Pro 89 TND) et des limites de quota de produits par établissement.
4. **Gestion des Licences Logiciel** : Génération de clés de licences uniques (`MADA-LIC-XXXX-XXXX`) pour les contrats d'achat de licence perpétuelle hors abonnement mensuel.
5. **Tickets de Support** : Consultation et suivi des demandes d'assistance soumises par les commerçants.

---

## 3. Sécurité & Contrôle d'Accès

- L'accès est strictement réservé aux utilisateurs disposant du drapeau `is_super_admin = true` dans la table `profiles`.
- Toutes les opérations sensibles sont validées côté serveur et protégées par les politiques RLS Supabase PostgreSQL.
