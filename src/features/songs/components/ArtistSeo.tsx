import { Helmet } from 'react-helmet-async';
import type { Song } from '../../../types';
import { getArtistUrl, getSongUrl } from '../../../lib/seo';

type Props = {
  artistName: string;
  artistSlug: string;
  artistImage?: string;
  songs: Song[];
};

export function ArtistSeo({ artistName, artistSlug, artistImage = '', songs }: Props) {
  const canonicalUrl = getArtistUrl({ slug: artistSlug, name: artistName });
  const title = artistName + ' Guitar Chords & Lyrics | GuitarCord MM';
  const description = 'Browse ' + songs.length + ' Myanmar guitar chord' + (songs.length === 1 ? '' : 's') + ' and lyrics by ' + artistName + ' on GuitarCord.';

  const itemListElement = songs.slice(0, 50).map((song, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: song.songTitle,
    url: getSongUrl(song),
  }));

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artistName,
    url: canonicalUrl,
    ...(artistImage ? { image: artistImage } : {}),
    subjectOf: {
      '@type': 'ItemList',
      name: 'Songs by ' + artistName,
      numberOfItems: songs.length,
      itemListElement,
    },
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GuitarCord', item: 'https://guitarcordmm.com/' },
      { '@type': 'ListItem', position: 2, name: 'Artists', item: 'https://guitarcordmm.com/artists' },
      { '@type': 'ListItem', position: 3, name: artistName, item: canonicalUrl },
    ],
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {artistImage && <meta property="og:image" content={artistImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {artistImage && <meta name="twitter:image" content={artistImage} />}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
    </Helmet>
  );
}
