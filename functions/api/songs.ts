interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

const PUBLIC_LIST_FIELDS = [
  'id',
  'song_title',
  'title',
  'artist',
  'composer',
  'album',
  'genre',
  'image_url',
  'tutorial_url',
  'tags',
  'status',
  'is_watermarked',
  'created_at',
  'updated_at',
].join(',');

const PUBLIC_SONG_FIELDS = `${PUBLIC_LIST_FIELDS},lyrics`;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const supabaseUrl = env.SUPABASE_URL?.trim() || env.VITE_SUPABASE_URL?.trim();
  const supabaseKey = env.SUPABASE_ANON_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return Response.json(
      { error: 'Supabase proxy is not configured on Cloudflare.' },
      { status: 500 },
    );
  }

  const params = new URL(request.url).searchParams;
  const id = params.get('id')?.trim();
  const searchQuery = params.get('q')?.trim();
  const requestedLimit = Number.parseInt(params.get('limit') || `${DEFAULT_PAGE_SIZE}`, 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;
  const offset = Math.max(Number.parseInt(params.get('offset') || '0', 10) || 0, 0);

  if (searchQuery) {
    const searchUrl = new URL('/rest/v1/rpc/search_public_songs', supabaseUrl);
    const searchResponse = await fetch(searchUrl.toString(), {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        search_query: searchQuery,
        result_limit: limit,
        result_offset: offset,
      }),
    });

    const searchBody = await searchResponse.text();
    const searchHeaders = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=20, s-maxage=60',
    });

    if (!searchResponse.ok) {
      console.error('Supabase song search upstream error:', searchResponse.status, searchBody.slice(0, 500));
      return new Response(JSON.stringify({ error: 'Supabase song search failed.' }), {
        status: searchResponse.status,
        headers: searchHeaders,
      });
    }

    return new Response(JSON.stringify({ songs: JSON.parse(searchBody) }), {
      status: 200,
      headers: searchHeaders,
    });
  }

  const upstreamUrl = new URL('/rest/v1/songs', supabaseUrl);
  upstreamUrl.searchParams.set('select', id ? PUBLIC_SONG_FIELDS : PUBLIC_LIST_FIELDS);
  upstreamUrl.searchParams.set('status', 'eq.approved');
  upstreamUrl.searchParams.set('order', 'created_at.desc');
  upstreamUrl.searchParams.set('limit', String(id ? 1 : limit));
  if (!id) upstreamUrl.searchParams.set('offset', String(offset));
  if (id) upstreamUrl.searchParams.set('id', `eq.${id}`);

  try {
    const upstream = await fetch(upstreamUrl.toString(), {
      method: 'GET',
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
    console.error('Supabase songs proxy error:', error);
    return Response.json(
      { error: 'Unable to reach Supabase from the Cloudflare edge.' },
      { status: 502 },
    );
  }
}
