import type { Song } from '../../types';

export type SongSearchResult = {
  song: Song;
  lyricMatch: string;
  score: number;
};

function normalizeSearchText(value: string) {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('my-MM')
    .replace(/[၊။]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function songSearchText(song: Song) {
  const fields = [
    song.songTitle,
    song.title,
    song.artist,
    song.composer,
    song.album,
    song.genre,
    ...(song.tags ?? []),
    song.lyrics,
  ];

  return fields
    .filter(Boolean)
    .map(value => normalizeSearchText(value ?? ''))
    .join(' ');
}

function getLyricMatch(song: Song, normalizedQuery: string) {
  if (!normalizedQuery || !song.lyrics) return '';

  return song.lyrics
    .split('\n')
    .map(line => line.replace(/\[([^\]]+)\]/g, '').trim())
    .find(line => normalizeSearchText(line).includes(normalizedQuery)) ?? '';
}

export function searchSongs(songs: Song[], query: string): SongSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return songs.map(song => ({ song, lyricMatch: '', score: 0 }));
  }

  const terms = normalizedQuery.split(' ').filter(Boolean);

  return songs
    .map(song => {
      const text = songSearchText(song);
      const lyricMatch = getLyricMatch(song, normalizedQuery);
      const phraseMatch = text.includes(normalizedQuery);
      const termMatches = terms.filter(term => text.includes(term)).length;
      const score = (phraseMatch ? 100 : 0) + (lyricMatch ? 30 : 0) + termMatches;

      return { song, lyricMatch, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);
}
