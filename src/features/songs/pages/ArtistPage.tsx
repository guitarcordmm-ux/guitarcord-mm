import { useEffect, useState } from 'react';
import { ChevronLeft, Guitar, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Song } from '../../../types';
import { fetchApprovedArtistSongs } from '../../../services/songs/songService';
import { getArtistUrl, getSongPath } from '../../../lib/seo';
import { ArtistSeo } from '../components/ArtistSeo';

function SongItem({ song }: { song: Song }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(getSongPath(song) + '?id=' + encodeURIComponent(song.id))}
      className="flex w-full items-center gap-3 border-b border-white/10 py-3 text-left active:scale-[0.99]"
    >
      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-white/10 flex items-center justify-center">
        {song.imageURL ? (
          <img src={song.imageURL} alt="" className="h-full w-full object-cover" />
        ) : (
          <Guitar className="text-[#FFD600]" size={18} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium">{song.songTitle}</div>
        <div className="mt-0.5 truncate text-[11px] text-white/40">
          {song.genre || 'Myanmar Song'}{song.difficulty ? ' · ' + song.difficulty : ''}
        </div>
      </div>
      <Play size={16} className="flex-shrink-0 fill-[#FFD600] text-[#FFD600]" />
    </button>
  );
}

export function GuitarCordArtistPage() {
  const { artistSlug = '' } = useParams();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchApprovedArtistSongs(artistSlug)
      .then(data => {
        if (active) setSongs(data);
      })
      .catch(err => {
        console.error('Could not load artist songs:', err);
        if (active) setError(err instanceof Error ? err.message : 'Could not load artist songs.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [artistSlug]);

  const artistName = songs[0]?.artist || artistSlug || 'Artist';
  const artistImage = songs.find(song => song.imageURL)?.imageURL || '';
  const canonicalUrl = getArtistUrl({ slug: artistSlug, name: artistName });

  return (
    <div className="min-h-screen bg-black text-white">
      {songs.length > 0 && (
        <ArtistSeo artistName={artistName} artistSlug={artistSlug} artistImage={artistImage} songs={songs} />
      )}

      <div className="mx-auto min-h-screen w-full max-w-xl bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.06),transparent_35%)] pb-10">
        <header className="border-b border-white/10 bg-black/95 px-5 pt-safe pt-3 pb-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/5 active:scale-95"
            >
              <ChevronLeft size={21} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-white/40">Artist / Singer</div>
              <div className="truncate text-base font-bold">{artistName}</div>
            </div>
          </div>
        </header>

        <main className="px-5 pt-5">
          {loading ? (
            <div className="py-16 text-center text-sm text-white/35">Loading songs…</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-950/20 p-4 text-sm text-red-200">
              {error}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-3 block rounded-xl bg-white/10 px-3 py-2 text-xs text-white/70"
              >
                Go back
              </button>
            </div>
          ) : !songs.length ? (
            <div className="py-16 text-center text-sm text-white/35">
              <Guitar className="mx-auto mb-3 text-[#FFD600]/70" size={28} />
              This artist has no approved songs yet.
            </div>
          ) : (
            <>
              <section className="rounded-3xl border border-white/10 bg-[#111113] p-5">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-[#FFD600]/30 bg-[#171719] flex items-center justify-center">
                    {artistImage ? (
                      <img src={artistImage} alt={artistName} className="h-full w-full object-cover" />
                    ) : (
                      <Guitar className="text-[#FFD600]" size={27} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl font-black leading-tight">{artistName}</div>
                    <div className="mt-1 text-xs text-white/40">
                      {songs.length} {songs.length === 1 ? 'song' : 'songs'} on GuitarCord
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h1 className="font-semibold">Songs by {artistName}</h1>
                  <span className="text-[10px] text-white/35">{songs.length} total</span>
                </div>
                <div>
                  {songs.map(song => <SongItem key={song.id} song={song} />)}
                </div>
              </section>

              <p className="mt-6 text-center text-[10px] leading-5 text-white/25">
                {canonicalUrl}
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default GuitarCordArtistPage;
