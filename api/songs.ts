interface SupabaseEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

const PUBLIC_LIST_FIELDS = [
  'id', 'song_title', 'title', 'artist', 'composer', 'album', 'genre', 'image_url',
  'tutorial_url', 'tags', 'status', 'is_watermarked', 'created_at', 'updated_at',
  'artist_slug', 'song_slug', 'language', 'difficulty', 'play_count',
].join(',');
const PUBLIC_SONG_FIELDS = `${PUBLIC_LIST_FIELDS},lyrics`;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function addCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(corsHeaders)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function callRpc(
  url: URL,
  key: string,
  body: Record<string, unknown>,
  cacheControl: string,
  errorMessage: string,
): Promise<Response> {
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('Supabase RPC network error:', error);
    return Response.json({ error: 'Unable to reach Supabase from the API server.' }, { status: 502 });
  }

  const text = await upstream.text();
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cacheControl,
  });
  if (!upstream.ok) {
    console.error(errorMessage, upstream.status, text.slice(0, 500));
    return new Response(JSON.stringify({ error: errorMessage }), { status: upstream.status, headers });
  }
  return new Response(text, { status: 200, headers });
}

async function handleGet(request: Request, env: SupabaseEnv): Promise<Response> {
  const supabaseUrl = env.SUPABASE_URL?.trim() || env.VITE_SUPABASE_URL?.trim();
  const supabaseKey = env.SUPABASE_ANON_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseKey) {
    return Response.json(
      { error: 'The API server is not configured with Supabase credentials.' },
      { status: 500 },
    );
  }

  const params = new URL(request.url).searchParams;
  const id = params.get('id')?.trim();
  const searchQuery = params.get('q')?.trim();
  const artistSlug = params.get('artist_slug')?.trim();
  const songSlug = params.get('song_slug')?.trim();
  const category = params.get('category')?.trim();
  const requestedLimit = Number.parseInt(params.get('limit') || `${DEFAULT_PAGE_SIZE}`, 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;
  const offset = Math.max(Number.parseInt(params.get('offset') || '0', 10) || 0, 0);

  if (category && !searchQuery && !id && !artistSlug && !songSlug) {
    const response = await callRpc(
      new URL('/rest/v1/rpc/get_home_songs', supabaseUrl),
      supabaseKey,
      { category, result_limit: limit, result_offset: offset },
      'public, max-age=30, s-maxage=120',
      'Supabase home category request failed.',
    );
    if (!response.ok) return response;
    return Response.json({ songs: await response.json() }, { headers: response.headers });
  }

  if (searchQuery) {
    const response = await callRpc(
      new URL('/rest/v1/rpc/search_public_songs', supabaseUrl),
      supabaseKey,
      { search_query: searchQuery, result_limit: limit, result_offset: offset },
      'public, max-age=20, s-maxage=60',
      'Supabase song search failed.',
    );
    if (!response.ok) return response;
    return Response.json({ songs: await response.json() }, { headers: response.headers });
  }

  if (artistSlug && songSlug && !id) {
    const response = await callRpc(
      new URL('/rest/v1/rpc/get_public_song_by_slug', supabaseUrl),
      supabaseKey,
      { p_artist_slug: artistSlug, p_song_slug: songSlug },
      'public, max-age=60, s-maxage=300',
      'Supabase song lookup failed.',
    );
    return response;
  }

  const upstreamUrl = new URL('/rest/v1/songs', supabaseUrl);
  upstreamUrl.searchParams.set('select', id ? PUBLIC_SONG_FIELDS : PUBLIC_LIST_FIELDS);
  upstreamUrl.searchParams.set('status', 'eq.approved');
  upstreamUrl.searchParams.set('order', 'created_at.desc');
  upstreamUrl.searchParams.set('limit', String(id || (artistSlug && songSlug) ? 1 : limit));
  if (!id && !(artistSlug && songSlug)) upstreamUrl.searchParams.set('offset', String(offset));
  if (id) upstreamUrl.searchParams.set('id', `eq.${id}`);
  if (artistSlug && songSlug) {
    upstreamUrl.searchParams.set('artist_slug', `eq.${artistSlug}`);
    upstreamUrl.searchParams.set('song_slug', `eq.${songSlug}`);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json',
      },
    });
    const body = await upstream.text();
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': id ? 'public, max-age=60, s-maxage=300' : 'public, max-age=30, s-maxage=120',
    });
    if (!upstream.ok) {
      console.error('Supabase songs proxy upstream error:', upstream.status, body.slice(0, 500));
      return new Response(JSON.stringify({ error: 'Supabase request failed.' }), {
        status: upstream.status,
        headers,
      });
    }
    return new Response(body, { status: 200, headers });
  } catch (error) {
    console.error('Supabase songs proxy network error:', error);
    return Response.json({ error: 'Unable to reach Supabase from the API server.' }, { status: 502 });
  }
}

/** Standalone Vercel Web Handler; it does not import Cloudflare-only files. */
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') return addCors(new Response(null, { status: 204 }));

    try {
      const env: SupabaseEnv = {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      };
      return addCors(await handleGet(request, env));
    } catch (error) {
      console.error('Vercel songs API handler failed:', error);
      return addCors(Response.json({ error: 'The songs API could not process this request.' }, { status: 500 }));
    }
  },
};
