import { createClient } from '@supabase/supabase-js';

const allowedOrigins = new Set([
  'https://guitarcord-mm.vercel.app',
  'https://guitarcordmm.com',
  'https://www.guitarcordmm.com',
  'https://localhost',
  'capacitor://localhost',
  'http://localhost',
  'http://localhost:5173',
]);

function response(request: Request, body: Record<string, string>, status: number): Response {
  const origin = request.headers.get('origin');
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  });

  if (origin && allowedOrigins.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    headers.set('Access-Control-Max-Age', '86400');
  }

  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') return response(request, {}, 204);
    if (request.method !== 'POST') return response(request, { error: 'Method not allowed.' }, 405);

    const origin = request.headers.get('origin');
    if (origin && !allowedOrigins.has(origin)) {
      return response(request, { error: 'This app origin is not allowed.' }, 403);
    }

    const url = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !serviceRoleKey) {
      console.error('Account deletion API is missing server-side Supabase configuration.');
      return response(request, { error: 'Account deletion is temporarily unavailable.' }, 503);
    }

    const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return response(request, { error: 'Please sign in and try again.' }, 401);

    let confirmation: unknown;
    try {
      const body: unknown = await request.json();
      confirmation = typeof body === 'object' && body !== null && 'confirmation' in body
        ? (body as { confirmation?: unknown }).confirmation
        : undefined;
    } catch {
      return response(request, { error: 'Invalid request.' }, 400);
    }
    if (confirmation !== 'DELETE') {
      return response(request, { error: 'Please confirm account deletion.' }, 400);
    }

    const supabase = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error: authError } = await supabase.auth.getUser(token);
    if (authError || !data.user) return response(request, { error: 'Your session expired. Please sign in again.' }, 401);

    const userId = data.user.id;
    const { error: songsError } = await supabase.from('songs').delete().eq('user_id', userId);
    if (songsError) {
      console.error('Could not remove account song submissions:', songsError.message);
      return response(request, { error: 'Could not remove your submitted songs. No account was deleted.' }, 500);
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Could not delete Supabase account:', deleteError.message);
      return response(request, { error: 'Your songs were removed, but the account could not be deleted. Contact support@guitarcordmm.com.' }, 500);
    }

    return response(request, { message: 'Your account and submitted songs have been deleted.' }, 200);
  },
};
