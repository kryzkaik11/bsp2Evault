/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// First, try to get from Vite's env variables (for local dev)
let supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;


// If not found, fall back to the window config (for deployments like Cloudflare Pages)
if (!supabaseUrl && window.APP_CONFIG && !window.APP_CONFIG.VITE_SUPABASE_URL.startsWith('__')) {
    supabaseUrl = window.APP_CONFIG.VITE_SUPABASE_URL;
}
if (!supabaseAnonKey && window.APP_CONFIG && !window.APP_CONFIG.VITE_SUPABASE_ANON_KEY.startsWith('__')) {
    supabaseAnonKey = window.APP_CONFIG.VITE_SUPABASE_ANON_KEY;
}

if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = 'Supabase URL and Anon Key must be provided. Check your environment variables or that placeholders in index.html are replaced.';
    console.error("Supabase credentials not found. Ensure you have a .env file for local development, or that your deployment process correctly replaces placeholders in index.html.");
    
    // Display a user-friendly error message on the screen, as the app cannot start.
    const rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.innerHTML = `
            <div style="font-family: 'Inter', sans-serif; padding: 2rem; color: #E6EAF5; background-color: #0B1020; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <svg style="width: 4rem; height: 4rem; color: #F05252; margin-bottom: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <h1 style="color: #F05252; font-size: 1.5rem; font-weight: bold;">Application Configuration Error</h1>
                <p style="font-size: 1rem; margin-top: 1rem; color: #B6BBD2; max-width: 600px;">The application could not start because it's missing its connection details.</p>
                <div style="background-color: #11162A; border: 1px solid #2A3047; padding: 1.5rem; margin-top: 2rem; border-radius: 8px; text-align: left;">
                    <h2 style="font-size: 1.1rem; color: #7AA2F7; font-weight: 600;">How to Fix This</h2>
                    <p style="margin-top: 0.75rem; color: #B6BBD2;">If you are the administrator of this application, please ensure that the environment variables for Supabase are correctly configured in your deployment environment (e.g., Cloudflare Pages).</p>
                    <p style="margin-top: 0.75rem; color: #B6BBD2;">The placeholder values in <code>index.html</code> (like <code>__VITE_SUPABASE_URL__</code>) must be replaced with your actual Supabase credentials during the build or deployment process.</p>
                </div>
            </div>
        `;
    }

    throw new Error(errorMessage);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
