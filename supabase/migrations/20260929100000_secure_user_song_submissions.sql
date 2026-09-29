drop policy if exists "Users can manage own songs" on public.songs;

create policy "Users can view own songs"
on public.songs
for select
to authenticated
using ((select auth.uid())::text = user_id);

create policy "Users can submit own songs"
on public.songs
for insert
to authenticated
with check (
  (select auth.uid())::text = user_id
  and status in ('pending', 'private')
);

create policy "Users can update own pending songs"
on public.songs
for update
to authenticated
using (
  (select auth.uid())::text = user_id
)
with check (
  (select auth.uid())::text = user_id
  and status in ('pending', 'private')
);

create policy "Users can delete own songs"
on public.songs
for delete
to authenticated
using ((select auth.uid())::text = user_id);