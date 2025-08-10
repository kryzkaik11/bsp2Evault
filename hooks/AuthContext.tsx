
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, Role } from '../types';
import { supabase } from '../services/supabase';
import { getProfileForUser } from '../services/api';
import { useLocalStorage } from '../hooks/useLocalStorage';


interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  logout: () => void;
  loading: boolean;
  onboardingCompleted: boolean;
  completeOnboarding: () => void;
  updateUserSettings: (settings: Partial<UserProfile['settings']>) => void;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage('onboardingCompleted', false);
  const [isAuthReady, setIsAuthReady] = useState(false);

   useEffect(() => {
    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
            const userProfile = await getProfileForUser(session.user);
            setProfile(userProfile);
        }
        setIsAuthReady(true);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            setLoading(true);
            const userProfile = await getProfileForUser(currentUser);
            setProfile(userProfile);
            setLoading(false);
            if (currentUser.created_at === currentUser.last_sign_in_at) {
                setOnboardingCompleted(false);
            }
        } else {
            setProfile(null);
            setOnboardingCompleted(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };
  
  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };
  
  const updateUserSettings = async (settingsUpdate: Partial<UserProfile['settings']>) => {
    if (!profile) return;
    const newSettings = { ...profile.settings, ...settingsUpdate };
    // Here you would call an API to update the user's settings in the database
    // For now, just updating local state
    setProfile(currentProfile => {
      if (!currentProfile) return null;
      return {
        ...currentProfile,
        settings: newSettings,
      };
    });
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, logout, loading, onboardingCompleted, completeOnboarding, updateUserSettings, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
