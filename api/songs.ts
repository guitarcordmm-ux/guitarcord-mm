import { onRequestGet, onRequestOptions } from '../functions/api/songs';

interface VercelRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string | Uint8Array): void;
}

/** Vercel Node serverless adapter for the shared Cloudflare-compatible handler. */
export default async function songsApi(req: VercelRequest, res: VercelResponse): Promise<void> {
  const hostValue = req.headers.host;
  const host = Array.isArray(hostValue) ? hostValue[0] : hostValue;
  const requestUrl = new URL(req.url || '/api/songs', `https://${host || 'localhost'}`);
  const headers = new Headers();

  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }

  const request = new Request(requestUrl, { method: req.method || 'GET', headers });
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  };
  const response = request.method === 'OPTIONS'
    ? onRequestOptions()
    : await onRequestGet({ request, env });

  res.statusCode = response.status;
  response.headers.forEach((value, name) => res.setHeader(name, value));
  res.end(new Uint8Array(await response.arrayBuffer()));
}
