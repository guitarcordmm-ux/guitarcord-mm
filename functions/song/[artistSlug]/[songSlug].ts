import { getPublicSongBySlug } from '../../_shared/publicSong';
import { getSongPath } from '../../_shared/songUrl';

type AssetsBinding = { fetch: (request: Request) => Promise<Response> };
type Env = {
  ASSETS?: AssetsBinding;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/song\/([^/]+)\/([^/]+)\/?$/);

  if (!match) {
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Asset binding is not configured.', { status: 500 });
  }

  const artistSlug = decodeURIComponent(match[1]);
  const songSlug = decodeURIComponent(match[2]);
  const song = await getPublicSongBySlug(artistSlug, songSlug, env);

  if (!song || song.status !== 'approved') {
    return env.ASSETS
      ? env.ASSETS.fetch(new Request(new URL('/', request.url), request))
      : new Response('Song not found.', { status: 404 });
  }

  const canonical = new URL(`https://guitarcordmm.com${getSongPath(song)}`);
  return new Response(null, {
    status: 301,
    headers: {
      Location: canonical.toString(),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
