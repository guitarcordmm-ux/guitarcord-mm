import { onRequestGet, onRequestOptions } from '../functions/api/songs.ts';

/** Vercel Web Handler adapter for the shared Cloudflare-compatible route. */
export default {
  async fetch(request: Request): Promise<Response> {
    const env = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    };

    return request.method === 'OPTIONS'
      ? onRequestOptions()
      : onRequestGet({ request, env });
  },
};
