export type PublicSong = {
  id: string;
  song_title?: string | null;
  title?: string | null;
  artist?: string | null;
  composer?: string | null;
  image_url?: string | null;
  lyrics?: string | null;
  language?: string | null;
  artist_slug?: string | null;
  song_slug?: string | null;
  status?: string | null;
};

type SongEnv = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

export async function getPublicSongById(id: string, env: SongEnv): Promise<PublicSong | null> {
  const supabaseUrl = env.SUPABASE_URL?.trim() || env.VITE_SUPABASE_URL?.trim();
  const supabaseKey = env.SUPABASE_ANON_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseKey || !id) return null;

  const url = new URL('/rest/v1/songs', supabaseUrl);
  url.searchParams.set('select', 'id,song_title,title,artist,composer,image_url,lyrics,language,artist_slug,song_slug,status');
  url.searchParams.set('id', `eq.${id}`);
  url.searchParams.set('status', 'eq.approved');
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString(), {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error('SSR song ID lookup failed:', response.status);
    return null;
  }

  const payload: unknown = await response.json();
  return Array.isArray(payload) ? ((payload[0] as PublicSong | undefined) || null) : null;
}

export async function getPublicSongBySlug(
  artistSlug: string,
  songSlug: string,
  env: SongEnv,
): Promise<PublicSong | null> {
  const supabaseUrl = env.SUPABASE_URL?.trim() || env.VITE_SUPABASE_URL?.trim();
  const supabaseKey = env.SUPABASE_ANON_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) return null;

  const url = new URL('/rest/v1/rpc/get_public_song_by_slug', supabaseUrl);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      p_artist_slug: artistSlug,
      p_song_slug: songSlug,
    }),
  });

  if (!response.ok) {
    console.error('SSR song lookup failed:', response.status);
    return null;
  }

  const payload: unknown = await response.json();
  if (Array.isArray(payload)) {
    return (payload[0] as PublicSong | undefined) || null;
  }

  return payload && typeof payload === 'object' ? payload as PublicSong : null;
}
