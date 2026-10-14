import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

// Bundle the actual repository with build-time config, without live credentials.
const bundle = await build({
  entryPoints: ['src/services/songs/songRepository.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
  define: { 'import.meta.env': JSON.stringify({ VITE_API_BASE_URL: 'https://songs.test' }) },
});
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64');
const row = id => ({ id, song_title: id, artist: 'Artist', artist_slug: 'artist', song_slug: id, lyrics: '[C]Lyrics', status: 'approved' });
const response = id => Response.json({ songs: [row(id)] });

test('API-first song details and prefetch', async t => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const storage = new Map();
  globalThis.window = { localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  } };
  t.after(() => { globalThis.fetch = originalFetch; globalThis.window = originalWindow; });
  const songs = await import(moduleUrl);

  await t.test('prefetch uses API, shares an in-flight open, then serves cache by ID and slug', async () => {
    let calls = 0;
    let release;
    globalThis.fetch = async (url, options) => {
      calls++;
      assert.equal(new URL(url).origin, 'https://songs.test');
      assert.ok(options.signal);
      await new Promise(resolve => { release = resolve; });
      return response('one');
    };
    const prefetch = songs.prefetchApprovedSongs(['one', 'one']);
    const open = songs.fetchApprovedSong('one');
    assert.equal(calls, 1);
    release();
    await prefetch;
    assert.equal((await open).lyrics, '[C]Lyrics');
    assert.equal((await songs.fetchApprovedSong('one')).id, 'one');
    assert.equal((await songs.fetchApprovedSongBySlug('artist', 'one')).id, 'one');
    assert.equal(calls, 1);
  });

  await t.test('saved lyrics survive a module reload without a network request', async () => {
    globalThis.fetch = async () => { throw new Error('Network must not be called'); };
    const reloaded = await import(moduleUrl + '#reload');
    assert.equal(reloaded.getCachedApprovedSong('one').lyrics, '[C]Lyrics');
    assert.equal((await reloaded.fetchApprovedSong('one')).id, 'one');
  });

  await t.test('background downloads are limited to three at once', async () => {
    let active = 0;
    let peak = 0;
    globalThis.fetch = async url => {
      active++;
      peak = Math.max(peak, active);
      await new Promise(resolve => setTimeout(resolve, 5));
      active--;
      return response(new URL(url).searchParams.get('id'));
    };
    await songs.prefetchApprovedSongs(['two', 'three', 'four', 'five', 'six']);
    assert.equal(peak, 3);
    assert.ok(songs.getCachedApprovedSong('six'));
  });

  await t.test('failed requests can be retried and invalid responses are not cached', async () => {
    globalThis.fetch = async () => Response.json({ error: 'Unavailable' }, { status: 500 });
    await assert.rejects(songs.fetchApprovedSong('retry'), /500/);
    globalThis.fetch = async () => Response.json({ unexpected: true });
    await assert.rejects(songs.fetchApprovedSong('retry'), /Invalid song API response/);
    globalThis.fetch = async () => response('retry');
    assert.equal((await songs.fetchApprovedSong('retry')).id, 'retry');
  });

  await t.test('missing songs remain missing', async () => {
    globalThis.fetch = async () => new Response(null, { status: 404 });
    assert.equal(await songs.fetchApprovedSong('missing'), null);
    assert.equal(songs.getCachedApprovedSong('missing'), null);
  });

  await t.test('stale lyrics remain available when the API is offline', async context => {
    const later = Date.now() + 6 * 60 * 1000;
    context.mock.method(Date, 'now', () => later);
    globalThis.fetch = async () => { throw new Error('Offline'); };
    assert.equal(songs.getCachedApprovedSong('one').lyrics, '[C]Lyrics');
    assert.equal((await songs.fetchApprovedSong('one')).lyrics, '[C]Lyrics');
  });

  await t.test('a stalled request is aborted and does not block a later retry', async context => {
    context.mock.timers.enable({ apis: ['setTimeout'] });
    globalThis.fetch = async (_url, { signal }) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(new Error('Request aborted')), { once: true });
    });
    const pending = songs.fetchApprovedSong('timeout');
    const rejected = assert.rejects(pending, /Request aborted/);
    context.mock.timers.tick(8000);
    await rejected;
    globalThis.fetch = async () => response('timeout');
    assert.equal((await songs.fetchApprovedSong('timeout')).id, 'timeout');
  });
});
