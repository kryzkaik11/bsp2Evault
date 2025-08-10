
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import Button from './ui/Button';
import { CloseIcon, SparklesIcon, ChatBubbleIcon, HomeIcon } from './layout/icons/Icons';

interface WhatsNewModalProps {
  onClose: () => void;
}

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-primary pt-1">{icon}</div>
        <div>
            <h4 className="font-semibold text-text-high">{title}</h4>
            <p className="text-text-mid text-sm">{children}</p>
        </div>
    </div>
);

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        />
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg"
        >
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl text-primary flex items-center gap-2">
                                <SparklesIcon size={28}/> What's New in Academic Vault
                            </CardTitle>
                            <CardDescription className="mt-2">We've been busy making your study experience even better!</CardDescription>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                            <CloseIcon size={20}/>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Feature icon={<ChatBubbleIcon size={24} />} title="Upgraded 'Study Coach'">
                        The AI Chat is now fully conversational! It remembers your previous questions about a file, allowing for natural follow-up discussions to deepen your understanding.
                    </Feature>
                     <Feature icon={<div className="w-6 h-6 rounded-full login-gradient-bg mt-1" />} title="Polished Design & UI">
                        We've refreshed the entire app with a more polished design, a new splash screen, and a functional user menu in the header for a more professional feel.
                    </Feature>
                     <Feature icon={<HomeIcon size={24}/>} title="A More Powerful Dashboard">
                       Quick actions are now more prominent, and we've added custom greetings to make your return to the vault more personal and welcoming.
                    </Feature>
                </CardContent>
                <CardFooter>
                    <Button onClick={onClose} className="w-full">
                        Got it, Let's Go!
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    </div>
  );
};

export default WhatsNewModal;
