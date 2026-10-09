-- Ajoute le choix du template de menu (restaurant | cafe)
alter table public.restaurants
  add column if not exists menu_template text not null default 'restaurant'
  check (menu_template in ('restaurant', 'cafe'));

-- IMPORTANT : la fonction get_public_menu doit renvoyer cette colonne dans "restaurant".
-- Si elle construit l'objet avec to_jsonb(r) / row_to_json(r), c'est automatique.
-- Si elle liste les colonnes une par une, ajoute : 'menu_template', r.menu_template
