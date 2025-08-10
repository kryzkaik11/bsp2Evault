import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { useAuth } from '../hooks/AuthContext';

interface OnboardingProps {
    onComplete: () => void;
    addSampleFiles: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, addSampleFiles }) => {
    const [step, setStep] = useState(1);
    const { profile } = useAuth();

    const handleAddSamples = () => {
        addSampleFiles();
        setStep(2);
    }

    const handleSkipSamples = () => {
        setStep(2);
    }

    const handleFinish = () => {
        onComplete();
    }

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                     <>
                        <CardHeader>
                            <CardTitle className="text-2xl">Welcome to Academic Vault, {profile?.display_name}!</CardTitle>
                            <CardDescription>Would you like to add a few sample files to your vault to see how things work?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-text-mid">You can see how AI generates notes from a lecture video and a research paper. You can always delete them later.</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-4">
                            <Button variant="ghost" onClick={handleSkipSamples}>Skip for now</Button>
                            <Button onClick={handleAddSamples}>Add Sample Files</Button>
                        </CardFooter>
                    </>
                );
            case 2:
                return (
                    <>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">You're All Set!</CardTitle>
                            <CardDescription>Your Academic Vault is ready. Dive in and start organizing your knowledge.</CardDescription>
                        </CardHeader>
                         <CardContent className="flex justify-center">
                            <Button onClick={handleFinish} className="w-1/2">Explore the Dashboard</Button>
                        </CardContent>
                    </>
                )
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl">
               {renderStep()}
            </Card>
        </div>
    )
}

export default Onboarding;