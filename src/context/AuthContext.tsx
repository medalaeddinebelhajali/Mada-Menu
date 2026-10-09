import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Restaurant } from '../types';

interface AuthContextType {
  user: Profile | null;
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  setCurrentRestaurant: (res: Restaurant) => void;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshRestaurants: () => Promise<void>;
  addRestaurant: (newRes: Restaurant) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurantState] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Charger le profil depuis Supabase ───────────────────────────────────────
  const loadProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Erreur chargement profil:', error.message);
      return null;
    }
    return data as Profile;
  };

  // ─── Charger les restaurants de l'utilisateur ────────────────────────────────
  const loadRestaurants = async (userId: string): Promise<Restaurant[]> => {
    const { data, error } = await supabase
      .from('restaurant_members')
      .select('restaurant_id, restaurants(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur chargement restaurants:', error.message);
      return [];
    }
    return (data?.map((m: any) => m.restaurants).filter(Boolean) || []) as Restaurant[];
  };

  // ─── Initialisation : écouter la session Supabase ───────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        setUser(profile);
        if (profile) {
          const rests = await loadRestaurants(session.user.id);
          setRestaurants(rests);
          const savedId = localStorage.getItem('mada_current_res_id');
          const found = rests.find(r => r.id === savedId) || rests[0] || null;
          setCurrentRestaurantState(found);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Écouter les changements d'état auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await loadProfile(session.user.id);
        setUser(profile);
        if (profile) {
          const rests = await loadRestaurants(session.user.id);
          setRestaurants(rests);
          const savedId = localStorage.getItem('mada_current_res_id');
          const found = rests.find(r => r.id === savedId) || rests[0] || null;
          setCurrentRestaurantState(found);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRestaurants([]);
        setCurrentRestaurantState(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  // ─── Inscription ─────────────────────────────────────────────────────────────
  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, preferred_language: 'fr' },
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  // ─── Déconnexion ─────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('mada_current_res_id');
  };

  // ─── Réinitialisation mot de passe ───────────────────────────────────────────
  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  // ─── Définir restaurant courant ──────────────────────────────────────────────
  const setCurrentRestaurant = (res: Restaurant) => {
    setCurrentRestaurantState(res);
    localStorage.setItem('mada_current_res_id', res.id);
  };

  // ─── Rafraîchir les restaurants ──────────────────────────────────────────────
  const refreshRestaurants = async () => {
    if (!user) return;
    const rests = await loadRestaurants(user.id);
    setRestaurants(rests);
    if (rests.length > 0 && (!currentRestaurant || !rests.find(r => r.id === currentRestaurant.id))) {
      setCurrentRestaurant(rests[0]);
    }
  };

  // ─── Ajouter un restaurant (après création) ──────────────────────────────────
  const addRestaurant = (newRes: Restaurant) => {
    const updated = [newRes, ...restaurants];
    setRestaurants(updated);
    setCurrentRestaurant(newRes);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurants,
        currentRestaurant,
        setCurrentRestaurant,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        resetPassword,
        refreshRestaurants,
        addRestaurant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
