
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Always start in a loading state
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage('onboardingCompleted', false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            try {
                const userProfile = await getProfileForUser(currentUser);
                if (userProfile) {
                    setProfile(userProfile);
                    if (currentUser.created_at === currentUser.last_sign_in_at) {
                        setOnboardingCompleted(false);
                    }
                    // Only stop loading when user and profile are in a consistent state
                    setLoading(false);
                } else {
                    console.error("Critical: User is authenticated but profile could not be fetched or created. Signing out.");
                    await supabase.auth.signOut();
                    // The next 'SIGNED_OUT' event will handle setting loading to false.
                }
            } catch (error) {
                console.error("Error fetching profile, signing out:", error);
                await supabase.auth.signOut();
            }
        } else {
            // No user, so we're ready to show the login screen.
            setProfile(null);
            setOnboardingCompleted(false);
            setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setLoading(true); // Set loading to true for a smooth transition
    await supabase.auth.signOut();
    // onAuthStateChange will handle setting user/profile to null and loading back to false
  };
  
  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };
  
  const updateUserSettings = async (settingsUpdate: Partial<UserProfile['settings']>) => {
    if (!profile) return;
    const newSettings = { ...profile.settings, ...settingsUpdate };
    // In a real app, you would call an API to update the user's settings.
    setProfile(currentProfile => {
      if (!currentProfile) return null;
      return {
        ...currentProfile,
        settings: newSettings,
      };
    });
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, logout, loading, onboardingCompleted, completeOnboarding, updateUserSettings }}>
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
