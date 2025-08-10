import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { CloseIcon } from './layout/icons/Icons';
import { useAuth } from '../hooks/AuthContext';
import Input from './ui/Input';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'profile' | 'settings';
}

const TabButton: React.FC<{isActive: boolean, onClick: () => void, children: React.ReactNode}> = ({isActive, onClick, children}) => (
    <button
        onClick={onClick}
        className={`relative px-4 py-2 text-sm font-medium transition-colors ${
            isActive ? 'text-primary' : 'text-text-mid hover:text-text-high'
        }`}
    >
        {children}
        {isActive && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" layoutId="accountTab" />}
    </button>
)

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { profile } = useAuth();
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
                className="relative w-full max-w-lg bg-card border border-border rounded-lg shadow-xl"
            >
                <CardHeader className="flex-row items-center justify-between p-4 border-b border-border">
                    <CardTitle>My Account</CardTitle>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close Account Modal">
                        <CloseIcon size={20}/>
                    </Button>
                </CardHeader>
                <div className="p-6">
                    <div className="flex border-b border-border mb-6">
                        <TabButton isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>Profile</TabButton>
                        <TabButton isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</TabButton>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {activeTab === 'profile' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-text-high">Profile Information</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-mid">Display Name</label>
                                    <Input value={profile?.display_name} disabled className="bg-surface/50"/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-mid">Role</label>
                                    <Input value={profile?.role} disabled className="bg-surface/50 capitalize"/>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-4 text-center">
                                 <h3 className="text-lg font-semibold text-text-high">Settings</h3>
                                 <div className="p-8 bg-surface rounded-lg">
                                    <p className="text-text-mid">Settings are not yet implemented in this demo.</p>
                                    <p className="text-text-low text-sm mt-2">Future options like theme selection and notification preferences will appear here.</p>
                                 </div>
                            </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    </AnimatePresence>
  );
};

export default AccountModal;