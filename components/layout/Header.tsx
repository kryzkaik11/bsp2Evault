import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/AuthContext';
import { SearchIcon, ChevronDownIcon, MenuIcon, UserIcon, SettingsIcon, LogoutIcon } from './icons/Icons';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useClickOutside } from '../../hooks/useClickOutside';

interface HeaderProps {
    onMenuClick: () => void;
    onAccountClick: (tab: 'profile' | 'settings') => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onAccountClick }) => {
  const { profile, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  return (
    <header className="p-4 border-b border-border flex items-center justify-between bg-background z-20">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick} aria-label="Open sidebar">
            <MenuIcon size={24} />
        </Button>
        <div className="relative w-full max-w-md hidden sm:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-text-low" />
            </div>
            <Input
            type="search"
            placeholder="Search files, tags, course codes..."
            className="pl-10"
            />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-surface">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {profile?.display_name?.charAt(0).toUpperCase()}
              </div>
              <div className='hidden sm:flex flex-col items-start'>
                <span className="text-text-high font-medium leading-tight">{profile?.display_name}</span>
                <span className="text-text-low text-xs leading-tight">BSP-2E</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-text-low transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-56 origin-top-right bg-card border border-border rounded-md shadow-lg z-50"
                    >
                        <div className="p-2">
                           <div className="px-3 py-2">
                                <p className="text-sm font-medium text-text-high">{profile?.display_name}</p>
                                <p className="text-sm text-text-mid capitalize">{profile?.role} Role</p>
                           </div>
                           <div className="my-1 h-px bg-border" />
                            <MenuItem icon={<UserIcon size={16}/>} onClick={() => { onAccountClick('profile'); setIsMenuOpen(false); }}>Profile</MenuItem>
                            <MenuItem icon={<SettingsIcon size={16}/>} onClick={() => { onAccountClick('settings'); setIsMenuOpen(false); }}>Settings</MenuItem>
                           <div className="my-1 h-px bg-border" />
                            <MenuItem icon={<LogoutIcon size={16}/>} onClick={logout}>Logout</MenuItem>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const MenuItem: React.FC<{icon: React.ReactNode; children: React.ReactNode; onClick?: () => void}> = ({ icon, children, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-mid rounded-md hover:bg-surface hover:text-text-high transition-colors"
    >
        {icon}
        <span>{children}</span>
    </button>
);


export default Header;