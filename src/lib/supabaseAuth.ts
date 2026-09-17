import { getSupabase, formatSupabaseUser, UnifiedUser } from './supabase';

export const ADMIN_EMAIL = 'guitarcordmm@gmail.com';
export const ADMIN_USERNAME = 'Cordmmadmin';

export function isUserAdmin(user: UnifiedUser | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export async function getCurrentUser(): Promise<UnifiedUser | null> {
  const client = getSupabase();
  if (!client) {
    const local = localStorage.getItem('supabase_fallback_user');
    return local ? JSON.parse(local) : null;
  }

  const { data: { user } } = await client.auth.getUser();
  return formatSupabaseUser(user);
}

export function subscribeToAuthChanges(callback: (user: UnifiedUser | null) => void) {
  const client = getSupabase();
  if (!client) {
    const local = localStorage.getItem('supabase_fallback_user');
    callback(local ? JSON.parse(local) : null);
    return () => {};
  }

  client.auth.getUser().then(({ data: { user } }) => {
    callback(formatSupabaseUser(user));
  });

  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    callback(formatSupabaseUser(session?.user || null));
  });

  return () => subscription.unsubscribe();
}

export async function signInWithEmail(emailOrUsername: string, password: string): Promise<UnifiedUser> {
  const client = getSupabase();
  const normalized = emailOrUsername.trim();
  const isAdminUsername = normalized.toLowerCase() === ADMIN_USERNAME.toLowerCase();
  const loginEmail = isAdminUsername ? ADMIN_EMAIL : normalized;

  if (!client) {
    if (isAdminUsername) {
      const localUser: UnifiedUser = {
        uid: 'admin_demo_id',
        id: 'admin_demo_id',
        email: ADMIN_EMAIL,
        displayName: ADMIN_USERNAME,
        isAnonymous: false,
      };
      localStorage.setItem('supabase_fallback_user', JSON.stringify(localUser));
      return localUser;
    }
    throw new Error('Invalid administrator credentials');
  }

  const { data, error } = await client.auth.signInWithPassword({ email: loginEmail, password });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned after login');
  return formatSupabaseUser(data.user)!;
}

export async function signUpWithEmail(email: string, password: string, username?: string): Promise<UnifiedUser> {
  const client = getSupabase();
  if (!client) {
    const localUser: UnifiedUser = {
      uid: 'usr_' + Date.now(),
      id: 'usr_' + Date.now(),
      email: email.toLowerCase(),
      displayName: username || email.split('@')[0],
      isAnonymous: false,
    };
    localStorage.setItem('supabase_fallback_user', JSON.stringify(localUser));
    return localUser;
  }

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
  if (!client) {
    const localUser: UnifiedUser = {
      uid: 'admin_demo_id',
      id: 'admin_demo_id',
      email: ADMIN_EMAIL,
      displayName: ADMIN_USERNAME,
      isAnonymous: false,
    };
    localStorage.setItem('supabase_fallback_user', JSON.stringify(localUser));
    window.location.reload();
    return;
  }

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOutUser(): Promise<void> {
  const client = getSupabase();
  localStorage.removeItem('supabase_fallback_user');
  if (client) await client.auth.signOut();
}
