const DEFAULT_SITE_URL = 'https://guitarcordmm.com';

export function slugifyText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('my-MM')
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function getSongPath(artist: string, songTitle: string): string {
  const artistSlug = slugifyText(artist) || 'artist';
  const songSlug = slugifyText(songTitle) || 'song';
  return `/song/${encodeURIComponent(artistSlug)}/${encodeURIComponent(songSlug)}`;
}

export function getSongUrl(artist: string, songTitle: string): string {
  const origin = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim() || DEFAULT_SITE_URL;
  return `${origin.replace(/\/$/, '')}${getSongPath(artist, songTitle)}`;
}
