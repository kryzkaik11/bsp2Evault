import React from 'react';
import { useAuth } from '../hooks/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

const VerifyEmailPage: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Check Your Inbox</CardTitle>
                    <CardDescription>
                        We've sent a verification link to <strong>{user?.email}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-text-mid">
                        Please click the link in that email to continue. You may need to refresh this page after verifying.
                    </p>
                     <p className="text-xs text-text-low">
                        If you don't see it, be sure to check your spam folder.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyEmailPage;