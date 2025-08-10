

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import Login from './pages/Login';
import AppLayout from './components/layout/AppLayout';
import VerifyEmailPage from './pages/VerifyEmail';
import SplashScreen from './components/SplashScreen';
import SignUp from './pages/SignUp';

const AuthGate: React.FC = () => {
    const { user, profile, onboardingCompleted } = useAuth();
    
    if (!user || !profile) return null;

    if (!user.email_confirmed_at) {
        return <VerifyEmailPage />;
    }
    
    // Check for onboarding
    const showOnboarding = !!user.created_at && !onboardingCompleted;
    
    return <AppLayout showOnboarding={showOnboarding} />;
}


const AppContent: React.FC = () => {
    const { user, isAuthReady } = useAuth();
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');

    if (!isAuthReady) {
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