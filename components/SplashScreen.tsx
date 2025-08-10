
import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen login-gradient-bg">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-center"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "loop",
                    }}
                >
                    <svg className="w-24 h-24 text-primary mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 .9C5.88.9.9 5.88.9 12s4.98 11.1 11.1 11.1 11.1-4.98 11.1-11.1S18.12.9 12 .9zm0 20.28c-5.04 0-9.18-4.14-9.18-9.18S6.96 2.82 12 2.82s9.18 4.14 9.18 9.18-4.14 9.18-9.18 9.18zm-.9-13.95h1.8v7.2h-1.8zM12 16.2c.75 0 1.35-.6 1.35-1.35s-.6-1.35-1.35-1.35-1.35.6-1.35 1.35.6 1.35 1.35 1.35z"/>
                    </svg>
                </motion.div>
                <h1 className="text-3xl font-bold text-text-high">Academic Vault</h1>
                <p className="text-text-mid mt-2">Loading your study space...</p>
            </motion.div>
        </div>
    );
};

export default SplashScreen;
