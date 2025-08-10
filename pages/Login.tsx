import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { UserIcon, LockClosedIcon } from '../components/layout/icons/Icons';
import Spinner from '../components/ui/Spinner';

interface LoginProps {
    setAuthView: (view: 'login' | 'signup') => void;
}


const Login: React.FC<LoginProps> = ({ setAuthView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }
        // Auth context will handle redirect on success
    } catch (err: any) {
        setError(err.error_description || err.message);
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen login-gradient-bg">
      <Card className="w-full max-w-sm animate-fade-in bg-card/80 backdrop-blur-sm border-border/50">
        <form onSubmit={handleLogin}>
            <CardHeader className="text-center">
              <svg className="w-16 h-16 text-primary mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .9C5.88.9.9 5.88.9 12s4.98 11.1 11.1 11.1 11.1-4.98 11.1-11.1S18.12.9 12 .9zm0 20.28c-5.04 0-9.18-4.14-9.18-9.18S6.96 2.82 12 2.82s9.18 4.14 9.18 9.18-4.14 9.18-9.18 9.18zm-.9-13.95h1.8v7.2h-1.8zM12 16.2c.75 0 1.35-.6 1.35-1.35s-.6-1.35-1.35-1.35-1.35.6-1.35 1.35.6 1.35 1.35 1.35z"/>
              </svg>
              <CardTitle className="text-2xl">Academic Vault</CardTitle>
              <CardDescription>Sign in to your study partner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                 <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-text-mid">Email</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-low"/>
                        <Input 
                            id="email" 
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoFocus
                            className="pl-10"
                        />
                    </div>
                </div>
                 <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-text-mid">Password</label>
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-low"/>
                        <Input 
                            id="password" 
                            type="password"
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="pl-10"
                        />
                    </div>
               </div>
              {error && <p className="text-sm text-error text-center pt-2">{error}</p>}
              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                 {loading ? <Spinner /> : "Sign In"}
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center text-sm">
                <p className="text-text-mid">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setAuthView('signup')} className="font-semibold text-primary hover:underline">
                        Sign Up
                    </button>
                </p>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;