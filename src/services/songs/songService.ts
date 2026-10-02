export {
  fetchApprovedSongs,
  fetchApprovedSong,
  fetchApprovedSongBySlug,
  fetchApprovedArtists,
  fetchApprovedArtistSongs,
  fetchHomeSongs,
  fetchUserSongs,
  fetchAdminSongs,
  insertSong,
  insertSongs,
  updateSong,
  deleteSongPermanent,
  mapRowToSong,
} from './songRepository';

export {
  getSupabase,
  isSupabaseConfigured,
  formatSupabaseUser,
} from '../supabase/client';

export type { User as UnifiedUser } from '../../types';

export { normalizeSearchText, searchSongs } from './songSearch';
export type { SongSearchResult } from './songSearch';
export type { ArtistSummary } from './songRepository';
