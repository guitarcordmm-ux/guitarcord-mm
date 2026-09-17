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
  isAnonymous?: boolean;
}

export function formatSupabaseUser(user: SupabaseUser | null): UnifiedUser | null {
  if (!user) return null;
  return {
    uid: user.id,
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    isAnonymous: false,
  };
}

export const SUPABASE_SQL_SETUP = `-- Copy and run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create songs table
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
  status TEXT DEFAULT 'pending', -- 'approved', 'pending', 'rejected', 'private', 'deleted'
  is_watermarked BOOLEAN DEFAULT true,
  user_id TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- 3. Public policy: Anyone can read approved songs
CREATE POLICY "Public can view approved songs" 
  ON public.songs 
  FOR SELECT 
  USING (status = 'approved');

-- 4. User policy: Users can manage their own songs
CREATE POLICY "Users can manage own songs" 
  ON public.songs 
  FOR ALL 
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 5. Admin policy: guitarcordmm@gmail.com can manage all songs
CREATE POLICY "Admins have full access" 
  ON public.songs 
  FOR ALL 
  USING (auth.jwt() ->> 'email' = 'guitarcordmm@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'guitarcordmm@gmail.com');
`;

// Helper: Convert row to Song
export function mapRowToSong(row: any): Song {
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
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status || 'approved',
    isWatermarked: row.is_watermarked ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

/**
 * Public song reads go through the same-origin Pages Function instead of
 * connecting the browser directly to Supabase. This keeps Myanmar users on
 * the Cloudflare edge path while the Function talks to Supabase server-side.
 */
export async function fetchApprovedSongs(): Promise<Song[]> {
  const response = await fetch('/api/songs', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    let details = '';
    try {
      const body = await response.json();
      details = typeof body?.error === 'string' ? `: ${body.error}` : '';
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new Error(`Song API request failed (${response.status})${details}`);
  }

  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.songs) ? payload.songs : [];
  return rows.map(mapRowToSong);
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

  return (data || []).map(mapRowToSong);
}

export async function fetchAdminSongs(status: string): Promise<Song[]> {
  const client = getSupabase();
  if (!client) return [];

  let query = client.from('songs').select('*').eq('status', status);

  if (status === 'deleted') {
    query = query.order('deleted_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching admin songs from Supabase:', error);
    throw error;
  }

  return (data || []).map(mapRowToSong);
}

export async function insertSong(songData: Partial<Song> & { userId?: string; userEmail?: string }): Promise<Song> {
  const client = getSupabase();
  const title = songData.songTitle || songData.title || 'Untitled';
  
  if (!client) {
    const newSong: Song = {
      id: 'local_' + Date.now(),
      songTitle: title,
      title: title,
      artist: songData.artist || '',
      composer: songData.composer || '',
      genre: songData.genre || '',
      imageURL: songData.imageURL || '',
      lyrics: songData.lyrics || '',
      status: songData.status || 'pending',
      isWatermarked: songData.isWatermarked ?? true,
      createdAt: new Date().toISOString(),
    };
    const local = localStorage.getItem('supabase_fallback_songs');
    const list = local ? JSON.parse(local) : [];
    list.unshift(newSong);
    localStorage.setItem('supabase_fallback_songs', JSON.stringify(list));
    return newSong;
  }

  const payload = {
    song_title: title,
    title: title,
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

  const { data, error } = await client
    .from('songs')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error inserting song to Supabase:', error);
    throw error;
  }

  return mapRowToSong(data);
}

export async function updateSong(id: string, updates: Partial<Song>): Promise<void> {
  const client = getSupabase();
  if (!client) {
    const local = localStorage.getItem('supabase_fallback_songs');
    if (local) {
      const list: Song[] = JSON.parse(local);
      const updatedList = list.map(s => s.id === id ? { ...s, ...updates } : s);
      localStorage.setItem('supabase_fallback_songs', JSON.stringify(updatedList));
    }
    return;
  }

  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.songTitle !== undefined || updates.title !== undefined) {
    payload.song_title = updates.songTitle || updates.title;
    payload.title = updates.songTitle || updates.title;
  }
  if (updates.artist !== undefined) payload.artist = updates.artist;
  if (updates.composer !== undefined) payload.composer = updates.composer;
  if (updates.genre !== undefined) payload.genre = updates.genre;
  if (updates.imageURL !== undefined) payload.image_url = updates.imageURL;
  if (updates.lyrics !== undefined) payload.lyrics = updates.lyrics;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.isWatermarked !== undefined) payload.is_watermarked = updates.isWatermarked;
  if (updates.status === 'deleted') payload.deleted_at = new Date().toISOString();

  const { error } = await client
    .from('songs')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Error updating song in Supabase:', error);
    throw error;
  }
}

export async function deleteSongPermanent(id: string): Promise<void> {
  const client = getSupabase();
  if (!client) {
    const local = localStorage.getItem('supabase_fallback_songs');
    if (local) {
      const list: Song[] = JSON.parse(local);
      localStorage.setItem('supabase_fallback_songs', JSON.stringify(list.filter(s => s.id !== id)));
    }
    return;
  }

  const { error } = await client
    .from('songs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting song permanently in Supabase:', error);
    throw error;
  }
}
