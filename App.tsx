

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import Login from './pages/Login';
import AppLayout from './components/layout/AppLayout';
import VerifyEmailPage from './pages/VerifyEmail';
import SplashScreen from './components/SplashScreen';
import SignUp from './pages/SignUp';

const AuthGate: React.FC = () => {
    const { user, profile, onboardingCompleted } = useAuth();
    
    // Fallback to splash screen if user/profile data is not ready. This prevents blank pages.
    if (!user || !profile) {
        return <SplashScreen />;
    }

    if (!user.email_confirmed_at) {
        return <VerifyEmailPage />;
    }
    
    // Check for onboarding for new users
    const showOnboarding = !!user.created_at && user.created_at === user.last_sign_in_at && !onboardingCompleted;
    
    return <AppLayout showOnboarding={showOnboarding} />;
}


const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');

    // Show splash screen during initial load and subsequent auth changes (login/logout).
    if (loading) {
        return <SplashScreen />;
    }

    if (!user) {
        return authView === 'login' ? <Login setAuthView={setAuthView} /> : <SignUp setAuthView={setAuthView} />;
    }
    
    return <AuthGate />;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  );
};

export default App;
