export const SUPABASE_SQL_SETUP = `-- Run this in the Supabase SQL Editor.
-- Admin authorization is based on Supabase Auth app_metadata, not an email in the policy.

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
  search_aliases TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
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
CREATE POLICY "Public can view approved songs" ON public.songs FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Users can manage own songs" ON public.songs;
CREATE POLICY "Users can manage own songs" ON public.songs FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "Admins have full access" ON public.songs;
CREATE POLICY "Admins have full access" ON public.songs FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Set the administrator once, using the Supabase Auth user UUID (not an email):
-- UPDATE auth.users
-- SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- WHERE id = 'YOUR_ADMIN_USER_ID';
-- Sign out/in after changing app_metadata so the new JWT contains the role.
`;



-- Server-side public search.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS songs_song_title_trgm_idx ON public.songs USING gin (song_title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS songs_artist_trgm_idx ON public.songs USING gin (artist gin_trgm_ops);
CREATE INDEX IF NOT EXISTS songs_lyrics_trgm_idx ON public.songs USING gin (lyrics gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.search_public_songs(
  search_query TEXT,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, song_title TEXT, title TEXT, artist TEXT, composer TEXT, album TEXT, genre TEXT,
  image_url TEXT, tutorial_url TEXT, lyrics TEXT, tags TEXT[], search_aliases TEXT[],
  status TEXT, is_watermarked BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  lyric_match TEXT, score REAL
)
LANGUAGE SQL STABLE SECURITY INVOKER SET search_path = public
AS $$
  WITH input AS (
    SELECT
      lower(trim(regexp_replace(coalesce(search_query, ''), '[[:space:]\u104A\u104B]+', ' ', 'g'))) AS q,
      regexp_replace(lower(trim(coalesce(search_query, ''))), '[[:space:]\u104A\u104B]+', '', 'g') AS compact_q
  ),
  scored AS (
    SELECT s.*, input.q, input.compact_q,
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
          WHEN regexp_replace(lower(coalesce(s.song_title, '')), '[[:space:]\u104A\u104B]+', '', 'g') LIKE '%' || input.compact_q || '%' THEN 45
          WHEN regexp_replace(lower(coalesce(s.artist, '')), '[[:space:]\u104A\u104B]+', '', 'g') LIKE '%' || input.compact_q || '%' THEN 35
          WHEN regexp_replace(lower(coalesce(s.lyrics, '')), '[[:space:]\u104A\u104B]+', '', 'g') LIKE '%' || input.compact_q || '%' THEN 35
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
    scored.image_url, scored.tutorial_url, scored.lyrics, scored.tags, scored.search_aliases,
    scored.status, scored.is_watermarked, scored.created_at, scored.updated_at,
    CASE
      WHEN scored.q <> '' AND position(scored.q in lower(coalesce(scored.lyrics, ''))) > 0
        THEN trim(substring(scored.lyrics FROM greatest(position(scored.q in lower(coalesce(scored.lyrics, ''))) - 40, 1) FOR 100))
      WHEN scored.compact_q <> '' AND position(scored.compact_q in regexp_replace(lower(coalesce(scored.lyrics, '')), '[[:space:]\u104A\u104B]+', '', 'g')) > 0
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
