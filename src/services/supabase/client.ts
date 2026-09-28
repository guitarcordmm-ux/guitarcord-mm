import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR_') && !supabaseAnonKey.includes('YOUR_'));

let clientInstance: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return clientInstance;
}
export const supabase = getSupabase();

export type UnifiedUser = User;
export function formatSupabaseUser(user: SupabaseUser | null): UnifiedUser | null {
  if (!user) return null;
  return {
    uid: user.id,
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    role: typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : undefined,
    isAnonymous: false,
  };
}
