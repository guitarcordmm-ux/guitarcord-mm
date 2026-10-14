import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

async function load(entry) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, platform: 'browser', format: 'esm',
    define: { 'import.meta.env': JSON.stringify({ VITE_API_BASE_URL: 'https://songs.test' }) } });
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
}

test('albums group trimmed names, omit empty albums, and retain every song', async () => {
  const { groupSongsByAlbum } = await load('src/features/songs/lib/albums.ts');
  const songs = [{ id: '1', album: ' First ' }, { id: '2', album: 'first' }, { id: '3', album: '' }, { id: '4' }, { id: '5', album: 'မြန်မာ' }];
  const albums = groupSongsByAlbum(songs);
  assert.equal(albums.length, 2);
  assert.deepEqual(albums.find(a => a.name === 'First').songs.map(s => s.id), ['1', '2']);
  assert.deepEqual(groupSongsByAlbum(songs.slice(2, 4)), []);
});

test('artist catalogue includes later pages and isolates songs for each artist', async t => {
  const repository = await load('src/services/songs/songRepository.ts');
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async url => {
    calls++;
    const offset = Number(new URL(url).searchParams.get('offset'));
    return Response.json(Array.from({ length: offset === 0 ? 100 : 2 }, (_, i) => ({
      id: String(offset + i), artist: offset === 0 ? 'Artist One' : 'Artist Two',
      artist_slug: offset === 0 ? 'one' : 'two', song_title: 'Song ' + i, album: 'Album',
    })));
  });
  const artists = await repository.fetchApprovedArtists();
  assert.equal(calls, 2);
  assert.equal(artists.length, 2);
  assert.equal(artists.find(a => a.slug === 'one').songCount, 100);
  const songs = await repository.fetchApprovedArtistSongs('two');
  assert.equal(songs.length, 2);
  assert.ok(songs.every(s => s.artistSlug === 'two' && s.album === 'Album'));
  assert.equal(calls, 2, 'opening an artist reuses the fetched catalogue');
});

test('both hosting APIs filter artist-only requests and retain pagination', async t => {
  const env = { SUPABASE_URL: 'https://database.test', SUPABASE_ANON_KEY: 'test-key' };
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_ANON_KEY;
  Object.assign(process.env, env);
  t.after(() => {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_ANON_KEY; else process.env.SUPABASE_ANON_KEY = originalKey;
  });
  t.mock.method(globalThis, 'fetch', async url => {
    const params = new URL(url).searchParams;
    assert.equal(params.get('artist_slug'), 'eq.artist-one');
    assert.equal(params.get('status'), 'eq.approved');
    assert.equal(params.get('offset'), '100');
    return Response.json([]);
  });
  const request = new Request('https://app.test/api/songs?artist_slug=artist-one&offset=100&limit=100');
  const vercel = await load('api/songs.ts');
  assert.equal((await vercel.default.fetch(request)).status, 200);
  const cloudflare = await load('functions/api/songs.ts');
  assert.equal((await cloudflare.onRequestGet({ request, env })).status, 200);
});
