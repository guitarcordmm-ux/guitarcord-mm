create or replace function public.get_public_song_by_slug(
  p_artist_slug text,
  p_song_slug text
)
returns table (
  id uuid,
  song_title text,
  title text,
  artist text,
  composer text,
  album text,
  genre text,
  image_url text,
  tutorial_url text,
  tags text[],
  status text,
  is_watermarked boolean,
  created_at timestamptz,
  updated_at timestamptz,
  artist_slug text,
  song_slug text,
  language text,
  difficulty text,
  play_count bigint,
  lyrics text
)
language sql
security definer
set search_path = public
as $$
  select
    s.id, s.song_title, s.title, s.artist, s.composer, s.album, s.genre,
    s.image_url, s.tutorial_url, s.tags, s.status, s.is_watermarked,
    s.created_at, s.updated_at, s.artist_slug, s.song_slug, s.language,
    s.difficulty, s.play_count, s.lyrics
  from public.songs s
  where s.status = 'approved'
    and s.artist_slug = btrim(p_artist_slug)
    and s.song_slug = btrim(p_song_slug)
  limit 1;
$$;

revoke all on function public.get_public_song_by_slug(text, text) from public;
grant execute on function public.get_public_song_by_slug(text, text) to anon, authenticated;


-- The songs table already exposes approved rows to anon/authenticated users,
-- so this public lookup does not need SECURITY DEFINER privileges.
create or replace function public.get_public_song_by_slug(
  p_artist_slug text,
  p_song_slug text
)
returns table (
  id uuid, song_title text, title text, artist text, composer text, album text, genre text,
  image_url text, tutorial_url text, tags text[], status text, is_watermarked boolean,
  created_at timestamptz, updated_at timestamptz, artist_slug text, song_slug text,
  language text, difficulty text, play_count bigint, lyrics text
)
language sql
security invoker
set search_path = public
as $$
  select s.id,s.song_title,s.title,s.artist,s.composer,s.album,s.genre,s.image_url,s.tutorial_url,
         s.tags,s.status,s.is_watermarked,s.created_at,s.updated_at,s.artist_slug,s.song_slug,
         s.language,s.difficulty,s.play_count,s.lyrics
  from public.songs s
  where s.status = 'approved'
    and s.artist_slug = btrim(p_artist_slug)
    and s.song_slug = btrim(p_song_slug)
  limit 1;
$$;
