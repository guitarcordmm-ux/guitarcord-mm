import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { Song } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('YOUR_') &&
  !supabaseAnonKey.includes('YOUR_')
);

let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return clientInstance;
}

export const supabase = getSupabase();

export interface UnifiedUser {
  uid: string;
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
  isAnonymous?: boolean;
}

export function formatSupabaseUser(user: SupabaseUser | null): UnifiedUser | null {
  if (!user) return null;
  return {
    uid: user.id,
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    role: typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : undefined,
    isAnonymous: false,
  };
}

export const SUPABASE_SQL_SETUP = `-- Run this in the Supabase SQL Editor.
-- The admin role is stored in app_metadata so normal users cannot grant it to themselves.

CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_title TEXT NOT NULL,
  title TEXT,
  artist TEXT NOT NULL,
  composer TEXT DEFAULT '',
  album TEXT DEFAULT '',
  genre TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  tutorial_url TEXT DEFAULT '',
  lyrics TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'pending',
  is_watermarked BOOLEAN DEFAULT true,
  user_id TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved songs" ON public.songs;
CREATE POLICY "Public can view approved songs"
  ON public.songs FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Users can manage own songs" ON public.songs;
CREATE POLICY "Users can manage own songs"
  ON public.songs FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Admins have full access" ON public.songs;
CREATE POLICY "Admins have full access"
  ON public.songs FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- After creating/finding the administrator's Supabase Auth user ID, run once:
-- UPDATE auth.users
-- SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- WHERE id = 'YOUR_ADMIN_USER_ID';
-- Sign out/in after changing app_metadata so the new JWT contains the role.
`;

type SongRow = {
  id: string;
  song_title?: string | null;
  title?: string | null;
  artist?: string | null;
  composer?: string | null;
  album?: string | null;
  genre?: string | null;
  image_url?: string | null;
  tutorial_url?: string | null;
  lyrics?: string | null;
  tags?: unknown;
  status?: Song['status'] | null;
  is_watermarked?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSongRow(value: unknown): value is SongRow {
  if (!isRecord(value) || typeof value.id !== 'string') return false;
  if (value.tags !== undefined && value.tags !== null && !Array.isArray(value.tags)) return false;
  return true;
}

export function mapRowToSong(row: unknown): Song {
  if (!isSongRow(row)) throw new Error('Invalid song data received from Supabase.');

  return {
    id: row.id,
    songTitle: row.song_title || row.title || 'Untitled',
    title: row.title || row.song_title || 'Untitled',
    artist: row.artist || 'Unknown Artist',
    composer: row.composer || '',
    album: row.album || '',
    genre: row.genre || 'Pop',
    imageURL: row.image_url || '',
    tutorialURL: row.tutorial_url || '',
    lyrics: row.lyrics || '',
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    status: row.status || 'approved',
    isWatermarked: row.is_watermarked ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

const PUBLIC_SONGS_CACHE_KEY = 'guitarcord_public_songs_cache_v2';
const PUBLIC_SONGS_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type PublicSongsCache = {
  savedAt: number;
  songs: Song[];
};

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
  } catch (error) {
    console.warn('Unable to read cached public songs:', error);
    return null;
  }
}

function writePublicSongsCache(songs: Song[]): void {
  if (typeof window === 'undefined' || !songs.length) return;

  try {
    const cache: PublicSongsCache = { savedAt: Date.now(), songs };
    window.localStorage.setItem(PUBLIC_SONGS_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Unable to cache public songs:', error);
  }
}

export async function fetchApprovedSongs(): Promise<Song[]> {
  try {
    const response = await fetch('/api/songs', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'default',
    });

    if (!response.ok) {
      let details = '';
      try {
        const body: unknown = await response.json();
        details = isRecord(body) && typeof body.error === 'string' ? `: ${body.error}` : '';
      } catch {
        // Ignore non-JSON error bodies.
      }
      throw new Error(`Song API request failed (${response.status})${details}`);
    }

    const payload: unknown = await response.json();
    const rows = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.songs) ? payload.songs : [];
    const songs = rows.filter(isSongRow).map(mapRowToSong);

    if (!songs.length) {
      const cachedSongs = readPublicSongsCache();
      if (cachedSongs?.length) return cachedSongs;
    } else {
      writePublicSongsCache(songs);
    }

    return songs;
  } catch (error) {
    const cachedSongs = readPublicSongsCache();
    if (cachedSongs?.length) {
      console.warn('Song API unavailable; using cached catalogue and lyrics.', error);
      return cachedSongs;
    }
    throw error;
  }
}

export async function fetchUserSongs(userId: string): Promise<Song[]> {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user songs from Supabase:', error);
    throw error;
  }

  return (Array.isArray(data) ? data : []).filter(isSongRow).map(mapRowToSong);
}

export async function fetchAdminSongs(status: string): Promise<Song[]> {
  const client = getSupabase();
  if (!client) return [];

  let query = client.from('songs').select('*').eq('status', status);
  query = status === 'deleted'
    ? query.order('deleted_at', { ascending: false })
    : query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching admin songs from Supabase:', error);
    throw error;
  }

  return (Array.isArray(data) ? data : []).filter(isSongRow).map(mapRowToSong);
}

export async function insertSong(songData: Partial<Song> & { userId?: string; userEmail?: string }): Promise<Song> {
  const client = getSupabase();
  const title = songData.songTitle || songData.title || 'Untitled';

  if (!client) {
    const newSong: Song = {
      id: 'local_' + Date.now(),
      songTitle: title,
      title,
      artist: songData.artist || '',
      composer: songData.composer || '',
      genre: songData.genre || '',
      imageURL: songData.imageURL || '',
      lyrics: songData.lyrics || '',
      status: songData.status || 'pending',
      isWatermarked: songData.isWatermarked ?? true,
      createdAt: new Date().toISOString(),
    };
    try {
      const raw = localStorage.getItem('supabase_fallback_songs');
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      list.unshift(newSong);
      localStorage.setItem('supabase_fallback_songs', JSON.stringify(list));
    } catch (error) {
      console.warn('Unable to write local fallback songs:', error);
    }
    return newSong;
  }

  const payload = {
    song_title: title,
    title,
    artist: songData.artist || '',
    composer: songData.composer || '',
    genre: songData.genre || '',
    image_url: songData.imageURL || '',
    lyrics: songData.lyrics || '',
    status: songData.status || 'pending',
    is_watermarked: songData.isWatermarked ?? true,
    user_id: songData.userId || null,
    user_email: songData.userEmail || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client.from('songs').insert([payload]).select().single();
  if (error) {
    console.error('Error inserting song to Supabase:', error);
    throw error;
  }

  return mapRowToSong(data);
}

export async function updateSong(id: string, updates: Partial<Song>): Promise<void> {
  const client = getSupabase();
  if (!client) {
    try {
      const raw = localStorage.getItem('supabase_fallback_songs');
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const updatedList = list.map(song => isRecord(song) && song.id === id ? { ...song, ...updates } : song);
      localStorage.setItem('supabase_fallback_songs', JSON.stringify(updatedList));
    } catch (error) {
      console.warn('Unable to update local fallback song:', error);
    }
    return;
  }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (updates.songTitle !== undefined || updates.title !== undefined) {
    const title = updates.songTitle || updates.title || 'Untitled';
    payload.song_title = title;
    payload.title = title;
  }
  if (updates.artist !== undefined) payload.artist = updates.artist;
  if (updates.composer !== undefined) payload.composer = updates.composer;
  if (updates.genre !== undefined) payload.genre = updates.genre;
  if (updates.imageURL !== undefined) payload.image_url = updates.imageURL;
  if (updates.lyrics !== undefined) payload.lyrics = updates.lyrics;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.isWatermarked !== undefined) payload.is_watermarked = updates.isWatermarked;
  if (updates.status === 'deleted') payload.deleted_at = new Date().toISOString();

  const { error } = await client.from('songs').update(payload).eq('id', id);
  if (error) {
    console.error('Error updating song in Supabase:', error);
    throw error;
  }
}

export async function deleteSongPermanent(id: string): Promise<void> {
  const client = getSupabase();
  if (!client) {
    try {
      const raw = localStorage.getItem('supabase_fallback_songs');
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      localStorage.setItem('supabase_fallback_songs', JSON.stringify(list.filter(song => !isRecord(song) || song.id !== id)));
    } catch (error) {
      console.warn('Unable to delete local fallback song:', error);
    }
    return;
  }

  const { error } = await client.from('songs').delete().eq('id', id);
  if (error) {
    console.error('Error deleting song permanently from Supabase:', error);
    throw error;
  }
}
