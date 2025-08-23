

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Use runtime configuration object for credentials
let supabaseUrl: string | undefined;
let supabaseAnonKey: string | undefined;

// First, try to get credentials from Vite's env for local development
if (import.meta.env.VITE_SUPABASE_URL) {
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
}
if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
}

// If not found, fall back to the window config (for deployments like Cloudflare Pages)
if (!supabaseUrl && window.APP_CONFIG && !window.APP_CONFIG.VITE_SUPABASE_URL.startsWith('__')) {
    supabaseUrl = window.APP_CONFIG.VITE_SUPABASE_URL;
}
if (!supabaseAnonKey && window.APP_CONFIG && !window.APP_CONFIG.VITE_SUPABASE_ANON_KEY.startsWith('__')) {
    supabaseAnonKey = window.APP_CONFIG.VITE_SUPABASE_ANON_KEY;
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is not configured. Please check your environment variables or deployment settings.");
}

export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey);
