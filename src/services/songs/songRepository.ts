import type { Song } from '../../types';
import { getSupabase } from '../supabase/client';
import { slugifyText } from '../../lib/seo';

type SongRow = {
  id: string; song_title?: string | null; title?: string | null; artist?: string | null;
  composer?: string | null; album?: string | null; genre?: string | null; image_url?: string | null; search_aliases?: unknown;
  tutorial_url?: string | null; lyrics?: string | null; tags?: unknown;
  status?: Song['status'] | null; is_watermarked?: boolean | null; artist_slug?: string | null; song_slug?: string | null; language?: string | null; difficulty?: string | null; play_count?: number | null;
  created_at?: string | null; updated_at?: string | null; user_id?: string | null;
};
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function isSongRow(value: unknown): value is SongRow {
  return isRecord(value) && typeof value.id === 'string' && (value.tags === undefined || value.tags === null || Array.isArray(value.tags));
}
export function mapRowToSong(row: unknown): Song {
  if (!isSongRow(row)) throw new Error('Invalid song data received from Supabase.');
  return {
    id: row.id, songTitle: row.song_title || row.title || 'Untitled', title: row.title || row.song_title || 'Untitled',
    artist: row.artist || 'Unknown Artist', composer: row.composer || '', album: row.album || '', genre: row.genre || 'Pop',
    imageURL: row.image_url || '', tutorialURL: row.tutorial_url || '', lyrics: row.lyrics || '',
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    searchAliases: Array.isArray(row.search_aliases) ? row.search_aliases.filter((alias): alias is string => typeof alias === 'string') : [],
    status: row.status || 'approved', isWatermarked: row.is_watermarked ?? true,
    artistSlug: row.artist_slug || slugifyText(row.artist || '') || undefined,
    songSlug: row.song_slug || slugifyText(row.song_title || row.title || '') || undefined,
    language: row.language || 'my', difficulty: row.difficulty || 'intermediate', playCount: row.play_count ?? 0,
    createdAt: row.created_at, updatedAt: row.updated_at, userId: row.user_id,
  };
}

const PUBLIC_SONGS_CACHE_KEY = 'guitarcord_public_songs_cache_v2';
const PUBLIC_SONGS_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
type PublicSongsCache = { savedAt: number; songs: Song[] };
function readPublicSongsCache(): Song[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PUBLIC_SONGS_CACHE_KEY);
    if (!raw) return null;
    const cached: unknown = JSON.parse(raw);
    if (!isRecord(cached) || !Array.isArray(cached.songs) || !Number.isFinite(cached.savedAt)) return null;
    if (Date.now() - Number(cached.savedAt) > PUBLIC_SONGS_CACHE_MAX_AGE_MS) return null;
    const songs = cached.songs.filter((song): song is Song => isRecord(song) && typeof song.id === 'string' && typeof song.songTitle === 'string' && typeof song.artist === 'string');
    return songs.length ? songs : null;
  } catch (error) { console.warn('Unable to read cached public songs:', error); return null; }
}
function writePublicSongsCache(songs: Song[]): void {
  if (typeof window === 'undefined' || !songs.length) return;
  try { window.localStorage.setItem(PUBLIC_SONGS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), songs } satisfies PublicSongsCache)); }
  catch (error) { console.warn('Unable to cache public songs:', error); }
}

async function fetchPublicSongsPage(offset = 0, limit = 50): Promise<Song[]> {
  const response = await fetch(`/api/songs?offset=${offset}&limit=${limit}`, { headers: { Accept: 'application/json' }, cache: 'default' });
  if (!response.ok) throw new Error(`Song API request failed (${response.status})`);
  const payload: unknown = await response.json();
  const rows = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.songs) ? payload.songs : [];
  return rows.filter(isSongRow).map(mapRowToSong);
}

export async function fetchApprovedSongs(limit = 50, offset = 0): Promise<Song[]> {
  const pageSize = Math.min(Math.max(limit, 1), 50);
  const pageOffset = Math.max(offset, 0);

  try {
    const page = await fetchPublicSongsPage(pageOffset, pageSize);
    if (page.length) {
      // Cache the first page as the lightweight offline catalogue.
      if (pageOffset === 0) writePublicSongsCache(page);
      return page;
    }

    return pageOffset === 0 ? readPublicSongsCache() || [] : [];
  } catch (error) {
    const cachedSongs = pageOffset === 0 ? readPublicSongsCache() : null;
    if (cachedSongs?.length) {
      console.warn('Song API unavailable; using cached first page.', error);
      return cachedSongs;
    }
    throw error;
  }
}

export async function fetchApprovedSongBySlug(artistSlug: string, songSlug: string): Promise<Song | null> {
  const cleanArtistSlug = artistSlug.trim();
  const cleanSongSlug = songSlug.trim();
  if (!cleanArtistSlug || !cleanSongSlug) return null;

  // Read the published song directly from Supabase first. The songs table has
  // a public SELECT policy for approved rows, so this avoids any stale/missing
  // lyrics caused by an edge proxy deployment or cache.
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('id,song_title,title,artist,composer,album,genre,image_url,tutorial_url,lyrics,tags,status,is_watermarked,created_at,updated_at,artist_slug,song_slug,language,difficulty,play_count,search_aliases,user_id')
        .eq('status', 'approved')
        .eq('artist_slug', cleanArtistSlug)
        .eq('song_slug', cleanSongSlug)
        .limit(1)
        .maybeSingle();

      let matchedSong: Song | null = null;

      if (!error && data) {
        matchedSong = mapRowToSong(data);

        if (matchedSong.lyrics.trim()) return matchedSong;

        // Retry by the stable row id if the slug query returned metadata
        // without lyrics. This stays entirely on Supabase.
        try {
          const { data: detailData, error: detailError } = await supabase
            .from('songs')
            .select('id,song_title,title,artist,composer,album,genre,image_url,tutorial_url,lyrics,tags,status,is_watermarked,created_at,updated_at,artist_slug,song_slug,language,difficulty,play_count,search_aliases,user_id')
            .eq('id', matchedSong.id)
            .eq('status', 'approved')
            .maybeSingle();

          if (!detailError && detailData) {
            const detailSong = mapRowToSong(detailData);
            if (detailSong.lyrics.trim()) return detailSong;
            matchedSong = detailSong;
          }
        } catch (detailError) {
          console.warn('Supabase song detail retry failed:', detailError);
        }
      } else if (error) {
        console.warn('Direct Supabase song lookup failed; using fallback lookup:', error);
      }

      // Final Supabase fallback: resolve the URL slugs against the actual
      // title/artist and return the full row including lyrics. This also runs
      // when the exact slug query returns no row.
      try {
        const decodedArtist = decodeURIComponent(cleanArtistSlug);
        const decodedTitle = decodeURIComponent(cleanSongSlug);
        const normalizedArtist = slugifyText(decodedArtist);
        const normalizedTitle = slugifyText(decodedTitle);
        // Resolve the URL against lightweight metadata only. Do not fetch
        // lyrics for the whole catalogue when a slug needs normalization.
        const { data: candidates, error: candidateError } = await supabase
          .from('songs')
          .select('id,song_title,title,artist,artist_slug,song_slug')
          .eq('status', 'approved')
          .limit(500);

        if (!candidateError && Array.isArray(candidates)) {
          const match = candidates
            .map(mapRowToSong)
            .find(candidate => {
              const artistMatch =
                (candidate.artistSlug && slugifyText(candidate.artistSlug) === normalizedArtist) ||
                slugifyText(candidate.artist) === normalizedArtist;
              const titleMatch =
                (candidate.songSlug && slugifyText(candidate.songSlug) === normalizedTitle) ||
                slugifyText(candidate.songTitle) === normalizedTitle;
              return artistMatch && titleMatch;
            });

          if (match) {
            // Only the selected song gets its full content.
            const { data: detailData, error: detailError } = await supabase
              .from('songs')
              .select('id,song_title,title,artist,composer,album,genre,image_url,tutorial_url,lyrics,tags,status,is_watermarked,created_at,updated_at,artist_slug,song_slug,language,difficulty,play_count,search_aliases,user_id')
              .eq('id', match.id)
              .eq('status', 'approved')
              .maybeSingle();

            if (!detailError && detailData) {
              matchedSong = mapRowToSong(detailData);
              if (matchedSong.lyrics.trim()) return matchedSong;
            } else {
              matchedSong = match;
            }
          }
        }
      } catch (fallbackError) {
        console.warn('Supabase slug fallback failed:', fallbackError);
      }

      if (matchedSong) return matchedSong;
    } catch (directError) {
      console.warn('Direct Supabase song lookup failed; using API fallback:', directError);
    }
  }

  const params = new URLSearchParams({
    artist_slug: cleanArtistSlug,
    song_slug: cleanSongSlug,
  });
  const response = await fetch(`/api/songs?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    // A song page must always get the latest lyrics/chord sheet, not a stale
    // edge/browser cache entry created before lyrics were added.
    cache: 'no-store',
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Song API request failed (${response.status})`);

  const payload: unknown = await response.json();
  const rows = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.songs)
      ? payload.songs
      : [];
  const row = rows.find(isSongRow);
  if (row) {
    const mappedSong = mapRowToSong(row);
    if (mappedSong.lyrics.trim()) return mappedSong;

    // Some cached/older edge responses can contain the song metadata but omit
    // lyrics. Re-fetch the song by id, where the proxy explicitly includes
    // the full lyrics field, before falling back to the public catalogue.
    try {
      const detailResponse = await fetch(`/api/songs?id=${encodeURIComponent(row.id)}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (detailResponse.ok) {
        const detailPayload: unknown = await detailResponse.json();
        const detailRows = Array.isArray(detailPayload)
          ? detailPayload
          : isRecord(detailPayload) && Array.isArray(detailPayload.songs)
            ? detailPayload.songs
            : [];
        const detailRow = detailRows.find(isSongRow);
        if (detailRow) {
          const detailSong = mapRowToSong(detailRow);
          if (detailSong.lyrics.trim()) return detailSong;
        }
      }
    } catch (detailError) {
      console.warn('Song lyrics detail lookup failed:', detailError);
    }

    // Keep the metadata result as the last fallback if lyrics genuinely are
    // empty in the database.
    return mappedSong;
  }

  // Fallback for deployments/proxies that cannot reliably match Myanmar Unicode
  // slugs in the edge URL query. The public catalogue is already approved-only.
  try {
    const songs = await fetchApprovedSongs();
    const normalizedArtist = slugifyText(decodeURIComponent(cleanArtistSlug));
    const normalizedTitle = slugifyText(decodeURIComponent(cleanSongSlug));
    return songs.find(song => {
      const artistMatch = (song.artistSlug && slugifyText(song.artistSlug) === normalizedArtist)
        || slugifyText(song.artist) === normalizedArtist;
      const titleMatch = (song.songSlug && slugifyText(song.songSlug) === normalizedTitle)
        || slugifyText(song.songTitle) === normalizedTitle;
      return artistMatch && titleMatch;
    }) || null;
  } catch (fallbackError) {
    console.warn('Song slug lookup fallback failed:', fallbackError);
    return null;
  }
}

export async function fetchHomeSongs(
  category: 'popular' | 'recent' | 'myanmar' | 'easy',
  limit = 8,
): Promise<Song[]> {
  const params = new URLSearchParams({ category, limit: String(Math.min(Math.max(limit, 1), 20)) });
  const response = await fetch(`/api/songs?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    cache: 'default',
  });
  if (!response.ok) throw new Error(`Home category request failed (${response.status})`);
  const payload: unknown = await response.json();
  const rows = isRecord(payload) && Array.isArray(payload.songs) ? payload.songs : Array.isArray(payload) ? payload : [];
  return rows.filter(isSongRow).map(mapRowToSong);
}

export async function fetchApprovedSong(id: string): Promise<Song | null> {
  const cleanId = id.trim();
  if (!cleanId) return null;
  const response = await fetch(`/api/songs?id=${encodeURIComponent(cleanId)}`, { headers: { Accept: 'application/json' }, cache: 'default' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Song API request failed (${response.status})`);
  const payload: unknown = await response.json();
  const rows = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.songs) ? payload.songs : [];
  const row = rows.find(isSongRow);
  return row ? mapRowToSong(row) : null;
}

export async function fetchUserSongs(userId: string): Promise<Song[]> {
  const client = getSupabase(); if (!client) return [];
  const { data, error } = await client
    .from('songs')
    .select('id,song_title,title,artist,composer,album,genre,image_url,tutorial_url,tags,status,is_watermarked,created_at,updated_at,artist_slug,song_slug,language,difficulty,play_count,search_aliases,user_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('Error fetching user songs from Supabase:', error); throw error; }
  return (Array.isArray(data) ? data : []).filter(isSongRow).map(mapRowToSong);
}

export async function fetchAdminSongs(status: string): Promise<Song[]> {
  const client = getSupabase(); if (!client) return [];
  let query = client
    .from('songs')
    .select('id,song_title,title,artist,composer,album,genre,image_url,tutorial_url,tags,status,is_watermarked,created_at,updated_at,artist_slug,song_slug,language,difficulty,play_count,search_aliases,user_id')
    .eq('status', status);
  query = status === 'deleted' ? query.order('deleted_at', { ascending: false }) : query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) { console.error('Error fetching admin songs from Supabase:', error); throw error; }
  return (Array.isArray(data) ? data : []).filter(isSongRow).map(mapRowToSong);
}

export async function insertSong(songData: Partial<Song> & { userId?: string; userEmail?: string }): Promise<Song> {
  const client = getSupabase(); const title = songData.songTitle || songData.title || 'Untitled';
  if (!client) {
    const newSong: Song = { id: 'local_' + Date.now(), songTitle: title, title, artist: songData.artist || '', composer: songData.composer || '', genre: songData.genre || '', imageURL: songData.imageURL || '', lyrics: songData.lyrics || '', status: songData.status || 'pending', isWatermarked: songData.isWatermarked ?? true, createdAt: new Date().toISOString() };
    try { const parsed: unknown = JSON.parse(localStorage.getItem('supabase_fallback_songs') || '[]'); const list = Array.isArray(parsed) ? parsed : []; list.unshift(newSong); localStorage.setItem('supabase_fallback_songs', JSON.stringify(list)); } catch (error) { console.warn('Unable to write local fallback songs:', error); }
    return newSong;
  }
  const artist = songData.artist || '';
  const artistSlug = songData.artistSlug || slugifyText(artist);
  const songSlug = songData.songSlug || slugifyText(title);
  const payload = { song_title: title, title, artist, composer: songData.composer || '', genre: songData.genre || '', image_url: songData.imageURL || '', lyrics: songData.lyrics || '', search_aliases: songData.searchAliases || [], artist_slug: artistSlug, song_slug: songSlug, language: songData.language || 'my', difficulty: songData.difficulty || 'intermediate', play_count: songData.playCount ?? 0, status: songData.status || 'pending', is_watermarked: songData.isWatermarked ?? true, user_id: songData.userId || null, user_email: songData.userEmail || null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  const { data, error } = await client.from('songs').insert([payload]).select().single();
  if (error) { console.error('Error inserting song to Supabase:', error); throw error; }
  return mapRowToSong(data);
}

export async function insertSongs(
  songs: Array<Partial<Song> & { userId?: string; userEmail?: string }>
): Promise<Song[]> {
  if (!songs.length) return [];

  const client = getSupabase();
  if (!client) {
    const inserted: Song[] = [];
    for (const song of songs) {
      inserted.push(await insertSong(song));
    }
    return inserted;
  }

  const now = new Date().toISOString();
  const payload = songs.map(song => {
    const title = song.songTitle || song.title || 'Untitled';
    const artist = song.artist || '';
    const artistSlug = song.artistSlug || slugifyText(artist);
    const songSlug = song.songSlug || slugifyText(title);
    return {
      song_title: title,
      title,
      artist,
      composer: song.composer || '',
      album: song.album || '',
      genre: song.genre || '',
      image_url: song.imageURL || '',
      tutorial_url: song.tutorialURL || '',
      lyrics: song.lyrics || '',
      tags: song.tags || [],
      search_aliases: song.searchAliases || [],
      artist_slug: artistSlug,
      song_slug: songSlug,
      language: song.language || 'my',
      difficulty: song.difficulty || 'intermediate',
      play_count: song.playCount ?? 0,
      status: song.status || 'pending',
      is_watermarked: song.isWatermarked ?? true,
      user_id: song.userId || null,
      user_email: song.userEmail || null,
      created_at: now,
      updated_at: now,
    };
  });

  const { data, error } = await client.from('songs').insert(payload).select();
  if (error) {
    console.error('Error inserting songs to Supabase:', error);
    throw error;
  }

  return (Array.isArray(data) ? data : []).filter(isSongRow).map(mapRowToSong);
}

export async function updateSong(id: string, updates: Partial<Song>): Promise<void> {
  const client = getSupabase();
  if (!client) {
    try { const parsed: unknown = JSON.parse(localStorage.getItem('supabase_fallback_songs') || '[]'); const list = Array.isArray(parsed) ? parsed : []; localStorage.setItem('supabase_fallback_songs', JSON.stringify(list.map(song => isRecord(song) && song.id === id ? { ...song, ...updates } : song))); } catch (error) { console.warn('Unable to update local fallback song:', error); }
    return;
  }
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.songTitle !== undefined || updates.title !== undefined) { const title = updates.songTitle || updates.title || 'Untitled'; payload.song_title = title; payload.title = title; }
  if (updates.artist !== undefined) payload.artist = updates.artist;
  if (updates.composer !== undefined) payload.composer = updates.composer;
  if (updates.genre !== undefined) payload.genre = updates.genre;
  if (updates.imageURL !== undefined) payload.image_url = updates.imageURL;
  if (updates.lyrics !== undefined) payload.lyrics = updates.lyrics;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.isWatermarked !== undefined) payload.is_watermarked = updates.isWatermarked;
  if (updates.searchAliases !== undefined) payload.search_aliases = updates.searchAliases;
  if (updates.artistSlug !== undefined) payload.artist_slug = updates.artistSlug;
  if (updates.songSlug !== undefined) payload.song_slug = updates.songSlug;
  if (updates.artist !== undefined || updates.songTitle !== undefined || updates.title !== undefined) {
    const nextArtist = updates.artist ?? '';
    const nextTitle = updates.songTitle || updates.title || 'Untitled';
    payload.artist_slug = updates.artistSlug ?? slugifyText(nextArtist);
    payload.song_slug = updates.songSlug ?? slugifyText(nextTitle);
  }
  if (updates.language !== undefined) payload.language = updates.language;
  if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
  if (updates.status === 'deleted') payload.deleted_at = new Date().toISOString();
  const { error } = await client.from('songs').update(payload).eq('id', id);
  if (error) { console.error('Error updating song in Supabase:', error); throw error; }
}

export async function deleteSongPermanent(id: string): Promise<void> {
  const client = getSupabase();
  if (!client) {
    try { const parsed: unknown = JSON.parse(localStorage.getItem('supabase_fallback_songs') || '[]'); const list = Array.isArray(parsed) ? parsed : []; localStorage.setItem('supabase_fallback_songs', JSON.stringify(list.filter(song => !isRecord(song) || song.id !== id))); } catch (error) { console.warn('Unable to delete local fallback song:', error); }
    return;
  }
  const { error } = await client.from('songs').delete().eq('id', id);
  if (error) { console.error('Error deleting song permanently from Supabase:', error); throw error; }
}

