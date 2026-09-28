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

