// Compatibility facade. Data access now lives under src/services.
export * from '../services/songs/songRepository';
export { getSupabase, isSupabaseConfigured, formatSupabaseUser } from '../services/supabase/client';
export { SUPABASE_SQL_SETUP } from '../services/supabase/schema';
export type { User as UnifiedUser } from '../types';
