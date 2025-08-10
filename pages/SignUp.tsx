import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

interface SignUpProps {
    setAuthView: (view: 'login' | 'signup') => void;
}

const SignUp: React.FC<SignUpProps> = ({ setAuthView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
        setError("You must agree to the terms of service and privacy policy.");
        return;
    }
    setError('');
    setLoading(true);

    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                }
            }
        });
        if (error) throw error;
        // The auth context will automatically show the "Verify Email" page
    } catch (err: any) {
        setError(err.error_description || err.message);
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Start organizing your academic life.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
             <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-text-mid">Display Name</label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your Name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-text-mid">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-text-mid">Password</label>
                <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-surface text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-text-mid">
                    I agree to the <a href="#" className="underline text-primary">Terms of Service</a> and <a href="#" className="underline text-primary">Privacy Policy</a>.
                </label>
            </div>
            {error && <p className="text-sm text-error text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !agreedToTerms}>
              {loading ? <Spinner /> : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
            <p className="text-text-mid">
                Already have an account?{' '}
                <button onClick={() => setAuthView('login')} className="font-semibold text-primary hover:underline">
                    Sign in
                </button>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;