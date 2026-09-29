import { Helmet } from 'react-helmet-async';
import type { Song } from '../../../types';
import { getSongUrl } from '../../../lib/seo';

export function SongSeo({ song }: { song: Song }) {
  const canonicalUrl = getSongUrl(song);
  const title = `${song.artist} - ${song.songTitle} | GuitarCord MM`;
  const description = `Learn ${song.songTitle} guitar chords and lyrics by ${song.artist} on GuitarCord.`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.songTitle,
    url: canonicalUrl,
    inLanguage: song.language === 'my' ? 'my' : song.language || 'my',
    byArtist: { '@type': 'MusicGroup', name: song.artist },
    ...(song.composer ? { composer: { '@type': 'Person', name: song.composer } } : {}),
    ...(song.imageURL ? { image: [song.imageURL] } : {}),
    isPartOf: { '@type': 'WebSite', name: 'GuitarCord', url: 'https://guitarcordmm.com/' },
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GuitarCord', item: 'https://guitarcordmm.com/' },
      { '@type': 'ListItem', position: 2, name: 'Songs', item: 'https://guitarcordmm.com/songs' },
      { '@type': 'ListItem', position: 3, name: song.songTitle, item: canonicalUrl },
    ],
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="music.song" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {song.imageURL && <meta property="og:image" content={song.imageURL} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {song.imageURL && <meta name="twitter:image" content={song.imageURL} />}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
    </Helmet>
  );
}
