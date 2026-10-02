import { getSupabase, formatSupabaseUser, UnifiedUser } from './supabase';

export const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME?.trim() || '';
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase() || '';

export function isUserAdmin(user: UnifiedUser | null): boolean {
  return user?.role === 'admin';
}

export async function getCurrentUser(): Promise<UnifiedUser | null> {
  const client = getSupabase();
  if (!client) {
    try {
      const raw = localStorage.getItem('supabase_fallback_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem('supabase_fallback_user');
      return null;
    }
  }

  const { data: { user } } = await client.auth.getUser();
  return formatSupabaseUser(user);
}

export function subscribeToAuthChanges(callback: (user: UnifiedUser | null) => void) {
  const client = getSupabase();

  if (!client) {
    try {
      const raw = localStorage.getItem('supabase_fallback_user');
      callback(raw ? JSON.parse(raw) : null);
    } catch {
      localStorage.removeItem('supabase_fallback_user');
      callback(null);
    }
    return () => {};
  }

  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      callback(null);
      return;
    }
    callback(formatSupabaseUser(session.user));
  });

  return () => subscription.unsubscribe();
}

export async function signInWithEmail(emailOrUsername: string, password: string): Promise<UnifiedUser> {
  const client = getSupabase();
  if (!client) throw new Error('Authentication service is not configured.');

  const normalized = emailOrUsername.trim();
  const isConfiguredAdminUsername = ADMIN_USERNAME && normalized.toLowerCase() === ADMIN_USERNAME.toLowerCase();
  const loginEmail = isConfiguredAdminUsername ? ADMIN_EMAIL : normalized;

  if (!loginEmail) throw new Error('Admin email is not configured.');

  const { data, error } = await client.auth.signInWithPassword({ email: loginEmail, password });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned after login');

  return formatSupabaseUser(data.user)!;
}

export async function signUpWithEmail(email: string, password: string, username?: string): Promise<UnifiedUser> {
  const client = getSupabase();
  if (!client) throw new Error('Authentication service is not configured.');

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { username: username?.toLowerCase(), full_name: username } },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Registration failed');
  return formatSupabaseUser(data.user)!;
}

export async function signInWithGoogleOAuth(): Promise<void> {
  const client = getSupabase();
  if (!client) throw new Error('Authentication service is not configured.');

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const client = getSupabase();
  if (!client) throw new Error('Authentication service is not configured.');

  // Use the configured Site URL as the recovery callback. This avoids
  // failures when /reset-password is not yet in Supabase's redirect allowlist.
  const redirectTo = window.location.origin;
  const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  const client = getSupabase();
  if (!client) throw new Error('Authentication service is not configured.');

  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOutUser(): Promise<void> {
  const client = getSupabase();

  localStorage.removeItem('supabase_fallback_user');

  if (!client) return;

  const { error } = await client.auth.signOut({ scope: 'local' });
  if (error) throw error;

  localStorage.removeItem('supabase_fallback_user');
}
