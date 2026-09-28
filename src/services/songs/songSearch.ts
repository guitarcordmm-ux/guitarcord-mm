import type { Song } from '../../types';

export type SongSearchResult = {
  song: Song;
  lyricMatch: string;
  score: number;
};

type SearchApiRow = Song & {
  song_title?: string;
  image_url?: string | null;
  tutorial_url?: string | null;
  tags?: unknown;
  search_aliases?: unknown;
  is_watermarked?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  lyric_match?: string | null;
  artist_slug?: string | null;
  song_slug?: string | null;
  language?: string | null;
  difficulty?: string | null;
  play_count?: number | null;
};

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('my-MM')
    .replace(/[၊။]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mapSearchRow(value: unknown): SongSearchResult | null {
  if (!isRecord(value) || typeof value.id !== 'string') return null;

  const row = value as SearchApiRow;
  const tags = Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === 'string') : [];
  const searchAliases = Array.isArray(row.search_aliases)
    ? row.search_aliases.filter((alias): alias is string => typeof alias === 'string')
    : [];

  return {
    song: {
      id: row.id,
      songTitle: row.song_title || row.title || 'Untitled',
      title: row.title || row.song_title || 'Untitled',
      artist: row.artist || 'Unknown Artist',
      composer: row.composer || '',
      album: row.album || '',
      genre: row.genre || '',
      imageURL: row.image_url || '',
      tutorialURL: row.tutorial_url || '',
      lyrics: row.lyrics || '',
      tags,
      searchAliases,
      artistSlug: row.artist_slug || undefined,
      songSlug: row.song_slug || undefined,
      language: row.language || 'my',
      difficulty: row.difficulty || 'intermediate',
      playCount: row.play_count ?? 0,
      status: row.status || 'approved',
      isWatermarked: row.is_watermarked ?? true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    lyricMatch: typeof row.lyric_match === 'string' ? row.lyric_match : '',
    score: typeof row.score === 'number' ? row.score : 0,
  };
}

export async function searchSongs(
  query: string,
  options: { limit?: number; offset?: number; signal?: AbortSignal } = {},
): Promise<SongSearchResult[]> {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);
  const offset = Math.max(options.offset ?? 0, 0);
  const params = new URLSearchParams({
    q: normalizedQuery,
    limit: String(limit),
    offset: String(offset),
  });

  const response = await fetch(`/api/songs?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal: options.signal,
    cache: 'default',
  });

  if (!response.ok) {
    throw new Error(`Song search request failed (${response.status})`);
  }

  const payload: unknown = await response.json();
  const rows = isRecord(payload) && Array.isArray(payload.songs)
    ? payload.songs
    : Array.isArray(payload)
      ? payload
      : [];

  return rows
    .map(mapSearchRow)
    .filter((result): result is SongSearchResult => result !== null);
}
