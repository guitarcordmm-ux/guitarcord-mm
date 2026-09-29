interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

type SitemapSong = {
  id: string;
  song_title?: string | null;
  title?: string | null;
  song_slug?: string | null;
  artist?: string | null;
  updated_at?: string | null;
};

import { getSongPath } from './_shared/songUrl';


export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  const supabaseUrl = env.SUPABASE_URL?.trim() || env.VITE_SUPABASE_URL?.trim();
  const supabaseKey = env.SUPABASE_ANON_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) return new Response('Sitemap unavailable', { status: 500 });

  const songs: SitemapSong[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const url = new URL('/rest/v1/songs', supabaseUrl);
    url.searchParams.set('select', 'id,song_title,title,artist,song_slug,updated_at');
    url.searchParams.set('status', 'eq.approved');
    url.searchParams.set('order', 'created_at.asc');
    url.searchParams.set('limit', String(pageSize));
    url.searchParams.set('offset', String(offset));

    const response = await fetch(url.toString(), {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: 'application/json' },
    });
    if (!response.ok) return new Response('Sitemap unavailable', { status: 502 });

    const page = (await response.json()) as SitemapSong[];
    songs.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  const base = 'https://guitarcordmm.com';
  const staticUrls = [`${base}/`, `${base}/songs`];

  const urls = [
    ...staticUrls.map(loc => `<url><loc>${loc}</loc></url>`),
    ...songs.map(song => {
      const loc = `${base}${getSongPath({ artist: song.artist || 'artist', songTitle: song.song_title || song.title || 'song', song_slug: song.song_slug })}`;
      const lastmod = song.updated_at ? `<lastmod>${new Date(song.updated_at).toISOString()}</lastmod>` : '';
      return `<url><loc>${loc}</loc>${lastmod}</url>`;
    }),
  ].join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
