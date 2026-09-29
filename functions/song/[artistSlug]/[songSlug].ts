import { getPublicSongByUrlSlugs, type PublicSong } from '../../_shared/publicSong';
import { getSongPath } from '../../_shared/songUrl';

type AssetsBinding = {
  fetch: (request: Request) => Promise<Response>;
};

type Env = {
  ASSETS?: AssetsBinding;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

type Context = {
  request: Request;
  env: Env;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderLyrics(lyrics: string): string {
  return lyrics
    .split(/\\r?\\n/)
    .map(line => {
      const escaped = escapeHtml(line);
      const withChords = escaped.replace(
        /\\[([A-Za-z0-9#b+\\/]+)\\]/g,
        '<span class="seo-chord">[$1]</span>',
      );
      return `<div class="seo-lyrics-line">${withChords || '&nbsp;'}</div>`;
    })
    .join('');
}

function buildStructuredData(song: PublicSong, canonicalUrl: string): string {
  const musicRecording = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.song_title || song.title || 'Untitled',
    url: canonicalUrl,
    inLanguage: song.language === 'my' ? 'my' : song.language || 'my',
    byArtist: {
      '@type': 'MusicGroup',
      name: song.artist || 'Unknown Artist',
    },
    ...(song.composer
      ? { composer: { '@type': 'Person', name: song.composer } }
      : {}),
    ...(song.image_url ? { image: [song.image_url] } : {}),
    isPartOf: {
      '@type': 'WebSite',
      name: 'GuitarCord',
      url: 'https://guitarcordmm.com/',
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'GuitarCord',
        item: 'https://guitarcordmm.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Songs',
        item: 'https://guitarcordmm.com/songs',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: song.song_title || song.title || 'Song',
        item: canonicalUrl,
      },
    ],
  };

  return JSON.stringify([musicRecording, breadcrumb]).replace(/</g, '\\u003c');
}

function getLyricsPreview(lyrics: string | null | undefined): string {
  const cleanedLines = (lyrics || '')
    .replace(/\\r/g, '')
    .split('\\n')
    .map(line => line
      .replace(/\\[([A-Za-z0-9#b+\\/]+)\\]/g, '')
      .replace(/\\s+/g, ' ')
      .trim()
    )
    .filter(Boolean);

  return cleanedLines.slice(0, 3).join(' ');
}

function seoShell(song: PublicSong, canonicalUrl: string): string {
  const title = song.song_title || song.title || 'Untitled';
  const artist = song.artist || 'Unknown Artist';
  const lyricsPreview = getLyricsPreview(song.lyrics);
  const description = lyricsPreview || `${title} - ${artist} | GuitarCord MM`;
  const lyrics = song.lyrics?.trim() || 'Lyrics and chords are available on this song page.';

  return `
    <main id="seo-song-content" aria-label="Song content">
      <article class="seo-song">
        <header>
          <p class="seo-brand">GuitarCord</p>
          <h1>${escapeHtml(title)}</h1>
          <p class="seo-artist">${escapeHtml(artist)}</p>
          <p class="seo-description">${escapeHtml(description)}</p>
        </header>
        <section aria-label="Lyrics and guitar chords">
          <h2>${escapeHtml(title)} Guitar Chords &amp; Lyrics</h2>
          <div class="seo-lyrics">${renderLyrics(lyrics)}</div>
        </section>
      </article>
    </main>
    <style>
      #seo-song-content{min-height:100vh;background:#000;color:#fff;padding:24px 16px;font-family:Inter,"Noto Sans Myanmar",system-ui,sans-serif}
      .seo-song{max-width:900px;margin:0 auto}
      .seo-brand{font-size:13px;opacity:.55;margin:0 0 16px}
      .seo-song h1{font-size:clamp(28px,5vw,48px);line-height:1.2;margin:0 0 8px}
      .seo-artist{font-size:18px;opacity:.72;margin:0 0 12px}
      .seo-description{font-size:14px;opacity:.58;margin:0 0 28px}
      .seo-song h2{font-size:20px;margin:0 0 16px}
      .seo-lyrics{font-family:"Noto Sans Myanmar",Inter,system-ui,sans-serif;font-size:17px;line-height:1.65;white-space:normal}
      .seo-lyrics-line{min-height:1.65em;overflow-wrap:anywhere}
      .seo-chord{font-weight:700}
    </style>
    <script type="application/ld+json">${buildStructuredData(song, canonicalUrl)}</script>
  `;
}

function injectIntoAppHtml(html: string, content: string, song: PublicSong, canonicalUrl: string): string {
  const title = song.song_title || song.title || 'Untitled';
  const artist = song.artist || 'Unknown Artist';
  const lyricsPreview = getLyricsPreview(song.lyrics);
  const description = lyricsPreview || `${title} - ${artist} | GuitarCord MM`;
  const escapedTitle = escapeHtml(`${artist} - ${title} | GuitarCord MM`);
  const escapedDescription = escapeHtml(description);

  let output = html.replace(
    '<div id="root"></div>',
    `<div id="root">${content}</div>`,
  );

  output = output.replace(/<title>.*?<\/title>/i, `<title>${escapedTitle}</title>`);
  output = output.replace(
    /<meta name="description" content=".*?">/i,
    `<meta name="description" content="${escapedDescription}">`,
  );
  output = output.replace(
    /<link rel="canonical" href=".*?">/i,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`,
  );

  const ogTitle = `<meta property="og:title" content="${escapedTitle}">`;
  const ogDescription = `<meta property="og:description" content="${escapedDescription}">`;
  const ogUrl = `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`;
  output = output.replace(/<meta property="og:title".*?>/i, ogTitle);
  output = output.replace(/<meta property="og:description".*?>/i, ogDescription);
  output = output.replace(/<meta property="og:url".*?>/i, ogUrl);

  return output;
}

export async function onRequest({ request, env }: Context): Promise<Response> {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\\/song\\/([^/]+)\\/([^/]+)\\/?$/);

  if (!match) {
    return env.ASSETS
      ? env.ASSETS.fetch(request)
      : new Response('Asset binding is not configured.', { status: 500 });
  }

  const artistSlug = decodeURIComponent(match[1]);
  const songSlug = decodeURIComponent(match[2]);
  const song = await getPublicSongByUrlSlugs(artistSlug, songSlug, env);

  if (!song || song.status !== 'approved') {
    if (env.ASSETS) {
      const fallback = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      if (fallback.ok) return fallback;
    }
    return new Response('Song not found.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const canonicalUrl = `https://guitarcordmm.com${getSongPath(song)}`;
  const content = seoShell(song, canonicalUrl);

  if (!env.ASSETS) {
    return new Response(`<!doctype html><html lang="my"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(song.song_title || song.title || 'GuitarCord')}</title><link rel="canonical" href="${escapeHtml(canonicalUrl)}"></head><body>${content}</body></html>`, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  }

  const assetResponse = await env.ASSETS.fetch(
    new Request(new URL('/', request.url), request),
  );
  if (!assetResponse.ok) {
    return assetResponse;
  }

  const html = await assetResponse.text();
  const rendered = injectIntoAppHtml(html, content, song, canonicalUrl);

  return new Response(rendered, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}
