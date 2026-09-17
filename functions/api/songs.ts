interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const PUBLIC_FIELDS = [
  'id',
  'song_title',
  'title',
  'artist',
  'composer',
  'album',
  'genre',
  'image_url',
  'tutorial_url',
  'lyrics',
  'tags',
  'status',
  'is_watermarked',
  'created_at',
  'updated_at',
].join(',');

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return Response.json(
      { error: 'Supabase proxy is not configured on Cloudflare.' },
      { status: 500 },
    );
  }

  const upstreamUrl = new URL('/rest/v1/songs', env.SUPABASE_URL);
  upstreamUrl.searchParams.set('select', PUBLIC_FIELDS);
  upstreamUrl.searchParams.set('status', 'eq.approved');
  upstreamUrl.searchParams.set('order', 'created_at.desc');

  try {
    const upstream = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    const body = await upstream.text();
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=30, s-maxage=120',
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: 'Supabase request failed.', details: body }), {
        status: upstream.status,
        headers,
      });
    }

    return new Response(body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Supabase songs proxy error:', error);
    return Response.json(
      { error: 'Unable to reach Supabase from the Cloudflare edge.' },
      { status: 502 },
    );
  }
}
