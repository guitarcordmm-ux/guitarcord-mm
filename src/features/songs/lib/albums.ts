import type { Song } from '../../../types';

export function groupSongsByAlbum(songs: Song[]) {
  const albums = new Map<string, { name: string; songs: Song[] }>();
  for (const song of songs) {
    const name = (song.album || '').trim().normalize('NFC');
    if (!name) continue;
    const key = name.toLocaleLowerCase();
    const album = albums.get(key);
    if (album) album.songs.push(song);
    else albums.set(key, { name, songs: [song] });
  }
  return [...albums.values()].sort((a, b) => a.name.localeCompare(b.name, 'my'));
}
