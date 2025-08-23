

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

let supabaseUrl: string | undefined;
if (window.APP_CONFIG && !window.APP_CONFIG.VITE_SUPABASE_URL.startsWith('__')) {
    supabaseUrl = window.APP_CONFIG.VITE_SUPABASE_URL;
}

let supabaseAnonKey: string | undefined;
if (window.APP_CONFIG && !window.APP_CONFIG.VITE_SUPABASE_ANON_KEY.startsWith('__')) {
    supabaseAnonKey = window.APP_CONFIG.VITE_SUPABASE_ANON_KEY;
}

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided. Check your environment variables or that placeholders in index.html are replaced.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
