
import { createClient, SupabaseClient, Session, User, AuthError, Subscription } from '@supabase/supabase-js';
import { Database } from './database.types';
import { MOCK_USER_ID } from './mockData';

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

export let supabase: SupabaseClient<Database>;
export let isDemoMode = false;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not found. Running in demo mode.");
    isDemoMode = true;

    const mockUser: User = {
        id: MOCK_USER_ID,
        app_metadata: { provider: 'email' },
        user_metadata: { display_name: 'Demo User' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'demo@example.com',
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
    };

    const mockSession: Session = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
    };

    // Create a mock Supabase client
    supabase = {
        auth: {
            getSession: async (): Promise<{ data: { session: Session | null }; error: AuthError | null }> => ({
                data: { session: mockSession },
                error: null,
            }),
            onAuthStateChange: (_event: string, callback: (event: string, session: Session | null) => void): { data: { subscription: Subscription } } => {
                // Immediately call back with a mock session to simulate login
                callback('INITIAL_SESSION', mockSession);
                return { data: { subscription: { id: 'mock-subscription', callback, unsubscribe: () => {} } } };
            },
            signOut: async () => { console.log("Demo mode: signOut called"); return { error: null }; },
            signInWithPassword: async () => ({ data: { session: mockSession, user: mockUser }, error: null }),
            signUp: async () => ({ data: { session: mockSession, user: mockUser }, error: null }),
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            insert: () => Promise.resolve({ data: null, error: null }),
            update: () => Promise.resolve({ data: null, error: null }),
            delete: () => Promise.resolve({ data: null, error: null }),
            rpc: () => Promise.resolve({ data: null, error: null }),
        }),
        storage: {
            from: () => ({
                upload: () => Promise.resolve({ data: { path: 'mock/path' }, error: null }),
                download: () => Promise.resolve({ data: new Blob(["mock content"]), error: null }),
                remove: () => Promise.resolve({ data: [], error: null }),
            })
        }
    } as unknown as SupabaseClient<Database>;

} else {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
}
