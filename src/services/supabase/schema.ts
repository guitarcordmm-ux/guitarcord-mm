export const SUPABASE_SQL_SETUP = String.raw`-- GuitarCord Supabase setup.
-- Admin authorization uses Supabase Auth app_metadata.

CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singer_id UUID,
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
  chords_used TEXT[] DEFAULT ARRAY[]::TEXT[],
  search_aliases TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  artist_slug TEXT,
  song_slug TEXT,
  language TEXT NOT NULL DEFAULT 'my',
  difficulty TEXT NOT NULL DEFAULT 'intermediate',
  play_count BIGINT NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  is_watermarked BOOLEAN DEFAULT true,
  user_id TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS search_aliases TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS artist_slug TEXT,
  ADD COLUMN IF NOT EXISTS song_slug TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'my',
  ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'intermediate',
  ADD COLUMN IF NOT EXISTS play_count BIGINT NOT NULL DEFAULT 0;

DROP POLICY IF EXISTS "Public can view approved songs" ON public.songs;
CREATE POLICY "Public can view approved songs"
  ON public.songs
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

DROP POLICY IF EXISTS "Users can manage own songs" ON public.songs;
CREATE POLICY "Users can manage own songs"
  ON public.songs
  FOR ALL
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Admins have full access" ON public.songs;
CREATE POLICY "Admins have full access"
  ON public.songs
  FOR ALL
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

CREATE INDEX IF NOT EXISTS songs_song_title_trgm_idx
  ON public.songs USING gin (song_title extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS songs_artist_trgm_idx
  ON public.songs USING gin (artist extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS songs_lyrics_trgm_idx
  ON public.songs USING gin (lyrics extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS songs_artist_song_slug_idx
  ON public.songs (artist_slug, song_slug);
CREATE INDEX IF NOT EXISTS songs_language_idx
  ON public.songs (language);
CREATE INDEX IF NOT EXISTS songs_difficulty_idx
  ON public.songs (difficulty);
CREATE INDEX IF NOT EXISTS songs_play_count_idx
  ON public.songs (play_count DESC);

CREATE OR REPLACE FUNCTION public.search_public_songs(
  search_query TEXT,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, song_title TEXT, title TEXT, artist TEXT, composer TEXT, album TEXT, genre TEXT,
  image_url TEXT, tutorial_url TEXT, lyrics TEXT, tags TEXT[], search_aliases TEXT[],
  status TEXT, is_watermarked BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  artist_slug TEXT, song_slug TEXT, language TEXT, difficulty TEXT, play_count BIGINT,
  lyric_match TEXT, score REAL
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  WITH input AS (
    SELECT
      lower(trim(regexp_replace(coalesce(search_query, ''), '[[:space:]၊။]+', ' ', 'g'))) AS q,
      regexp_replace(lower(trim(coalesce(search_query, ''))), '[[:space:]၊။]+', '', 'g') AS compact_q
  ),
  scored AS (
    SELECT
      s.*, input.q, input.compact_q,
      (
        CASE
          WHEN input.q = '' THEN 0
          WHEN lower(coalesce(s.song_title, '')) = input.q THEN 150
          WHEN lower(coalesce(s.song_title, '')) LIKE input.q || '%' THEN 120
          WHEN lower(coalesce(s.song_title, '')) LIKE '%' || input.q || '%' THEN 100
          ELSE 0
        END
        + CASE
          WHEN input.q = '' THEN 0
          WHEN lower(coalesce(s.artist, '')) LIKE input.q || '%' THEN 95
          WHEN lower(coalesce(s.artist, '')) LIKE '%' || input.q || '%' THEN 80
          ELSE 0
        END
        + CASE
          WHEN input.q = '' THEN 0
          WHEN lower(coalesce(array_to_string(s.search_aliases, ' '), '')) LIKE '%' || input.q || '%' THEN 85
          WHEN lower(coalesce(array_to_string(s.tags, ' '), '')) LIKE '%' || input.q || '%' THEN 60
          ELSE 0
        END
        + CASE
          WHEN input.q = '' THEN 0
          WHEN lower(coalesce(array_to_string(s.chords_used, ' '), '')) LIKE '%' || input.q || '%' THEN 75
          WHEN position('[' || input.q || ']' in lower(coalesce(s.lyrics, ''))) > 0 THEN 75
          WHEN lower(coalesce(s.lyrics, '')) LIKE '%' || input.q || '%' THEN 55
          ELSE 0
        END
        + CASE
          WHEN input.compact_q = '' THEN 0
          WHEN regexp_replace(lower(coalesce(s.song_title, '')), '[[:space:]၊။]+', '', 'g') LIKE '%' || input.compact_q || '%' THEN 45
          WHEN regexp_replace(lower(coalesce(s.artist, '')), '[[:space:]၊။]+', '', 'g') LIKE '%' || input.compact_q || '%' THEN 35
          WHEN regexp_replace(lower(coalesce(s.lyrics, '')), '[[:space:]၊။]+', '', 'g') LIKE '%' || input.compact_q || '%' THEN 35
          ELSE 0
        END
        + CASE
          WHEN input.q = '' THEN 0
          ELSE greatest(
            similarity(lower(coalesce(s.song_title, '')), input.q) * 45,
            similarity(lower(coalesce(s.artist, '')), input.q) * 35,
            similarity(lower(coalesce(array_to_string(s.search_aliases, ' '), '')), input.q) * 30
          )
        END
      )::REAL AS score
    FROM public.songs s
    CROSS JOIN input
    WHERE s.status = 'approved'
  )
  SELECT
    scored.id, scored.song_title, scored.title, scored.artist, scored.composer, scored.album, scored.genre,
    scored.image_url, scored.tutorial_url, NULL::TEXT AS lyrics, scored.tags, scored.search_aliases,
    scored.status, scored.is_watermarked, scored.created_at, scored.updated_at,
    scored.artist_slug, scored.song_slug, scored.language, scored.difficulty, scored.play_count,
    CASE
      WHEN scored.q <> '' AND position(scored.q in lower(coalesce(scored.lyrics, ''))) > 0
        THEN trim(substring(scored.lyrics FROM greatest(position(scored.q in lower(coalesce(scored.lyrics, ''))) - 40, 1) FOR 100))
      WHEN scored.compact_q <> '' AND position(scored.compact_q in regexp_replace(lower(coalesce(scored.lyrics, '')), '[[:space:]၊။]+', '', 'g')) > 0
        THEN trim(left(scored.lyrics, 100))
      ELSE ''
    END AS lyric_match,
    CASE WHEN scored.q = '' THEN 0::REAL ELSE scored.score END AS score
  FROM scored
  WHERE
    scored.q = ''
    OR scored.score > 0
    OR scored.song_title % scored.q
    OR scored.artist % scored.q
  ORDER BY
    CASE WHEN scored.q = '' THEN scored.created_at END DESC NULLS LAST,
    scored.score DESC,
    scored.created_at DESC NULLS LAST
  LIMIT greatest(1, least(coalesce(result_limit, 20), 50))
  OFFSET greatest(coalesce(result_offset, 0), 0);
$$;

GRANT EXECUTE ON FUNCTION public.search_public_songs(TEXT, INTEGER, INTEGER) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_home_songs(
  category TEXT,
  result_limit INTEGER DEFAULT 8,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, song_title TEXT, title TEXT, artist TEXT, composer TEXT, album TEXT, genre TEXT,
  image_url TEXT, tutorial_url TEXT, lyrics TEXT, tags TEXT[], search_aliases TEXT[],
  status TEXT, is_watermarked BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  artist_slug TEXT, song_slug TEXT, language TEXT, difficulty TEXT, play_count BIGINT,
  favorite_count BIGINT
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    s.id, s.song_title, s.title, s.artist, s.composer, s.album, s.genre,
    s.image_url, s.tutorial_url, NULL::TEXT AS lyrics, s.tags, s.search_aliases,
    s.status, s.is_watermarked, s.created_at, s.updated_at,
    s.artist_slug, s.song_slug, s.language, s.difficulty, s.play_count,
    count(f.song_id)::BIGINT AS favorite_count
  FROM public.songs s
  LEFT JOIN public.favorites f ON f.song_id = s.id
  WHERE
    s.status = 'approved'
    AND (
      lower(coalesce(category, 'popular')) = 'popular'
      OR lower(category) = 'recent'
      OR (lower(category) = 'myanmar' AND s.language = 'my')
      OR (lower(category) = 'easy' AND s.difficulty = 'easy')
    )
  GROUP BY s.id
  ORDER BY
    CASE
      WHEN lower(coalesce(category, 'popular')) = 'popular'
      THEN (s.play_count * 3) + (count(f.song_id) * 5)
      ELSE 0
    END DESC,
    CASE WHEN lower(category) = 'recent' THEN s.created_at END DESC NULLS LAST,
    CASE WHEN lower(category) IN ('myanmar', 'easy') THEN s.created_at END DESC NULLS LAST,
    s.created_at DESC
  LIMIT greatest(1, least(coalesce(result_limit, 8), 20))
  OFFSET greatest(coalesce(result_offset, 0), 0);
$$;

GRANT EXECUTE ON FUNCTION public.get_home_songs(TEXT, INTEGER, INTEGER) TO anon, authenticated;

-- Set the administrator once using the Supabase Auth user UUID:
-- UPDATE auth.users
-- SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- WHERE id = 'YOUR_ADMIN_USER_ID';
-- Sign out/in after changing app_metadata so the refreshed JWT contains the role.
`;