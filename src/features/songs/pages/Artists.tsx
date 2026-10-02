import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Guitar, Search, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApprovedArtists, type ArtistSummary } from '../../../services/songs/songService';
import { getArtistPath } from '../../../lib/seo';

function initials(name: string) {
  return name.trim().slice(0, 2) || '🎸';
}

export function GuitarCordArtists() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<ArtistSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchApprovedArtists()
      .then(data => {
        if (active) setArtists(data);
      })
      .catch(err => {
        console.error('Could not load artists:', err);
        if (active) setError(err instanceof Error ? err.message : 'Could not load artists.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const visibleArtists = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('my-MM');
    if (!q) return artists;
    return artists.filter(artist => artist.name.toLocaleLowerCase('my-MM').includes(q));
  }, [artists, search]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-xl bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.05),transparent_35%)] pb-8">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/95 px-5 pt-safe pt-3 pb-3 backdrop-blur-xl">
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
              <div className="text-base font-bold">Artists / Singers</div>
              <div className="text-[11px] text-white/40">{artists.length} artists</div>
            </div>
            <UsersRound size={20} className="text-[#FFD600]" />
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-[#151517] px-3.5 py-3 flex items-center gap-2">
            <Search size={17} className="text-[#FFD600]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search artist / singer"
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
              autoComplete="off"
            />
          </div>
        </header>

        <main className="px-5 pt-4">
          {loading ? (
            <div className="py-16 text-center text-sm text-white/35">Loading artists…</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-950/20 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : visibleArtists.length ? (
            <div className="divide-y divide-white/10">
              {visibleArtists.map(artist => (
                <button
                  key={artist.slug}
                  type="button"
                  onClick={() => navigate(getArtistPath(artist.slug))}
                  className="flex w-full items-center gap-3 py-3 text-left active:scale-[0.99]"
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#171719] flex items-center justify-center">
                    {artist.imageURL ? (
                      <img src={artist.imageURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[#FFD600]">{initials(artist.name)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold">{artist.name}</div>
                    <div className="mt-0.5 text-[11px] text-white/40">
                      {artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'}
                      {artist.genre ? ' · ' + artist.genre : ''}
                    </div>
                  </div>
                  <span className="text-white/25">›</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-white/35">
              <Guitar className="mx-auto mb-3 text-[#FFD600]/70" size={28} />
              {search.trim() ? 'No matching artist found.' : 'No artists available yet.'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default GuitarCordArtists;
