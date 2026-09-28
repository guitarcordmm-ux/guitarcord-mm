interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export async function onRequest({
  params,
  env,
}: {
  params: { chordId?: string };
  env: Env;
}): Promise<Response> {
  const id = params.chordId?.trim();
  const supabaseUrl = env.SUPABASE_URL?.trim() || env.VITE_SUPABASE_URL?.trim();
  const supabaseKey = env.SUPABASE_ANON_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!id || !supabaseUrl || !supabaseKey) {
    return new Response('Not found', { status: 404 });
  }

  const url = new URL('/rest/v1/songs', supabaseUrl);
  url.searchParams.set('select', 'artist,song_title,artist_slug,song_slug,status');
  url.searchParams.set('id', `eq.${id}`);
  url.searchParams.set('status', 'eq.approved');
  url.searchParams.set('limit', '1');

  const upstream = await fetch(url.toString(), {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: 'application/json',
    },
  });

  if (!upstream.ok) return new Response('Not found', { status: 404 });

  const rows = await upstream.json() as Array<{
    artist?: string;
    song_title?: string;
    artist_slug?: string | null;
    song_slug?: string | null;
    status?: string;
  }>;

  const song = rows[0];
  if (!song) return new Response('Not found', { status: 404 });

  const artistSlug = song.artist_slug || song.artist || 'artist';
  const songSlug = song.song_slug || song.song_title || 'song';
  const target = `/song/${encodeURIComponent(artistSlug)}/${encodeURIComponent(songSlug)}`;

  return new Response(null, {
    status: 301,
    headers: {
      Location: target,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
