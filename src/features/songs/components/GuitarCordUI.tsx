import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  Library,
  UserCircle2,
  Heart,
  Play,
  UsersRound,
  Settings,
  Download,
  CircleHelp,
  X,
  Guitar,
  Clock3,
  Sparkles,
} from 'lucide-react';
import type { Song, User } from '../../../types';
import { fetchApprovedSongs, type SongSearchResult } from '../../../services/songs/songService';
import { getArtistPath, getSongPath } from '../../../lib/seo';
import { useSongSearch } from '../hooks/useSongSearch';
import { isUserAdmin, signOutUser } from '../../../services/auth/authService';
import { useHomeCategories, type HomeCategory } from '../hooks/useHomeCategories';

type Props = { songs: Song[]; user?: User | null };

function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 font-bold tracking-tight">
      <Guitar className="text-[#FFD600]" size={compact ? 17 : 20} />
      <span className={compact ? 'text-sm' : 'text-base'}>
        Guitar<span className="text-[#FFD600]">Cord</span>
      </span>
    </div>
  );
}

function BottomNav({ active }: { active: 'home' | 'library' | 'profile' }) {
  const navigate = useNavigate();
  const items = [
    ['home', Home, 'Home', '/'],
    ['library', Library, 'Library', '/library'],
    ['profile', UserCircle2, 'Profile', '/profile'],
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur-xl pb-safe">
      <div className="mx-auto max-w-xl grid grid-cols-3 h-16">
        {items.map(([key, Icon, label, path]) => (
          <button
            key={key}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] ${active === key ? 'text-[#FFD600]' : 'text-white/45'}`}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function EmptySongs({ message = 'No songs available yet.' }: { message?: string }) {
  return (
    <div className="py-16 text-center text-sm text-white/35">
      <Guitar className="mx-auto mb-3 text-[#FFD600]/70" size={28} />
      {message}
    </div>
  );
}

function SongRow({
  song,
  showHeart = false,
  lyricMatch = '',
}: {
  song: Song;
  showHeart?: boolean;
  lyricMatch?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="w-full flex items-center gap-3 py-3">
      <button
        type="button"
        onClick={() => navigate(getSongPath(song) + '?id=' + encodeURIComponent(song.id))}
        className="flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.99] transition-transform"
      >
        <div className="w-11 h-11 rounded-xl bg-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {song.imageURL ? (
            <img src={song.imageURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <Guitar className="text-[#FFD600]" size={18} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate text-[14px]">{song.songTitle}</div>
          {lyricMatch && (
            <div className="mt-0.5 text-[10px] leading-4 text-white/30 truncate">
              “{lyricMatch}”
            </div>
          )}
        </div>
      </button>

      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(getArtistPath(song.artist, song.artistSlug))}
          className="max-w-[42vw] truncate text-left text-[11px] text-white/45 hover:text-[#FFD600] active:text-[#FFD600]"
          title={'View ' + song.artist + ' songs'}
        >
          {song.artist}
        </button>

        {showHeart ? (
          <Heart size={17} className="flex-shrink-0 text-[#FFD600] fill-[#FFD600]" />
        ) : (
          <Play size={16} className="flex-shrink-0 text-[#FFD600] fill-[#FFD600]" />
        )}
      </div>
    </div>
  );
}
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FFD600]/30">
      <div className="mx-auto min-h-screen w-full max-w-xl bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.05),transparent_35%)] pb-20">
        {children}
      </div>
    </div>
  );
}

export function GuitarCordHome({ songs }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<HomeCategory>('popular');
  const { categories, loading: categoryLoading, error: categoryError } = useHomeCategories();

  const { results, loading: searchLoading, error: searchError } = useSongSearch(search);

  const categoryItems: Array<{ key: HomeCategory; label: string; Icon: LucideIcon }> = [
    { key: 'popular', label: 'Popular', Icon: Sparkles },
    { key: 'recent', label: 'Recent', Icon: Clock3 },
    { key: 'myanmar', label: 'Myanmar Songs', Icon: Guitar },
    { key: 'easy', label: 'Easy Songs', Icon: Play },
  ];

  const visibleResults = useMemo<SongSearchResult[]>(() => {
    if (search.trim()) return results.slice(0, 10);

    const selected = categories[category];
    if (selected.length || !categoryError) {
      return selected.map(song => ({ song, lyricMatch: '', score: 0 }));
    }

    return songs.slice(0, 8).map(song => ({ song, lyricMatch: '', score: 0 }));
  }, [search, results, categories, category, categoryError, songs]);

  const displayedCategory = categoryItems.find(item => item.key === category)?.label || 'Songs';

  return (
    <Shell>
      <header className="px-5 pt-safe pt-5 flex items-center justify-between">
        <AppLogo />
        <button onClick={() => navigate('/profile')} className="text-white/70" aria-label="Profile">
          <UserCircle2 size={22} />
        </button>
      </header>

      <main className="px-5 pt-8">
        <section aria-label="Search Myanmar guitar chords">
          <div className="text-3xl font-black leading-tight">
            🎸 Myanmar Guitar Chords
          </div>
          <p className="mt-2 text-sm text-white/45">
            Find a song. See the chords. Start playing.
          </p>

          <div className="mt-5 rounded-2xl bg-[#151517] border border-white/10 px-4 py-4 flex items-center gap-3 focus-within:border-[#FFD600]/60 focus-within:ring-2 focus-within:ring-[#FFD600]/10">
            <Search size={20} className="text-[#FFD600] flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search song / artist / lyric / chord"
              className="bg-transparent outline-none w-full text-base placeholder:text-white/30"
              aria-label="Search song, artist, lyric or chord"
              autoComplete="off"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="text-white/40"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryItems.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setCategory(key);
                  setSearch('');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs whitespace-nowrap ${
                  category === key && !search ? 'bg-[#FFD600] text-black font-semibold' : 'bg-[#1a1a1c] text-white/60'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold">
                {search.trim()
                  ? searchLoading
                    ? 'Searching…'
                    : `Search Results · ${results.length}`
                  : displayedCategory}
              </h2>
              {search.trim() ? (
                <p className="mt-0.5 text-[10px] text-white/35">
                  {searchError || 'Song, artist, lyrics, chords, Burmese and English search aliases.'}
                </p>
              ) : categoryError ? (
                <p className="mt-0.5 text-[10px] text-white/35">Using cached song list.</p>
              ) : (
                <p className="mt-0.5 text-[10px] text-white/35">
                  Ranked from your song data.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/artists')} className="text-xs text-[#FFD600]/80">
                Artists
              </button>
              <button onClick={() => navigate('/library')} className="text-xs text-white/45">
                Browse all
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {searchLoading || (!search.trim() && categoryLoading) ? (
              <div className="py-10 text-center text-sm text-white/35">Loading songs…</div>
            ) : visibleResults.length ? (
              visibleResults.map(({ song, lyricMatch }, i) => (
                <SongRow
                  key={song.id || i}
                  song={song}
                  lyricMatch={search.trim() ? lyricMatch : ''}
                />
              ))
            ) : (
              <EmptySongs message={search.trim() ? 'No matching song, artist, lyric or chord found.' : `No ${displayedCategory.toLowerCase()} are available yet.`} />
            )}
          </div>
        </section>

        {!search.trim() && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-xs text-white/45">
            Search by Burmese spelling, English spelling, lyric line, artist, or chord to jump straight into the player.
          </div>
        )}
      </main>
    </Shell>
  );
}

export function GuitarCordLibrary({ songs }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'songs' | 'favorites' | 'downloads'>('songs');
  const [librarySongs, setLibrarySongs] = useState<Song[]>(songs);
  const [loadingMore, setLoadingMore] = useState(false);
  const { results, loading: searchLoading, error: searchError } = useSongSearch(search);

  useEffect(() => {
    setLibrarySongs(songs);
  }, [songs]);

  const loadMoreSongs = async () => {
    if (loadingMore || librarySongs.length < 50) return;
    setLoadingMore(true);
    try {
      const nextPage = await fetchApprovedSongs(50, librarySongs.length);
      if (nextPage.length) {
        setLibrarySongs(current => [...current, ...nextPage]);
      }
    } catch (error) {
      console.error('Could not load more songs:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const visibleSongs = search.trim()
    ? results
    : librarySongs.map(song => ({ song, lyricMatch: '', score: 0 }));

  return (
    <Shell>
      <header className="px-5 pt-safe pt-5">
        <div className="flex items-center justify-between">
          <AppLogo compact />
          <button
            type="button"
            onClick={() => navigate('/artists')}
            className="text-white/45"
            aria-label="Artists"
            title="Artists"
          >
            <UsersRound size={20} />
          </button>
        </div>

        <div className="mt-5 text-xl font-semibold">My Library</div>

        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {(['songs', 'favorites', 'downloads'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs ${tab === t ? 'bg-[#FFD600] text-black font-semibold' : 'bg-[#1a1a1c] text-white/60'}`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-2xl bg-[#151517] px-3.5 py-3 flex items-center gap-2">
          <Search size={16} className="text-white/45" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search song / artist / lyric / chord"
            className="bg-transparent outline-none w-full text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Clear search">
              <X size={15} className="text-white/30" />
            </button>
          )}
        </div>
      </header>

      <main className="px-5 pt-3 divide-y divide-white/10">
        {searchLoading ? (
          <div className="py-10 text-center text-sm text-white/35">Searching songs…</div>
        ) : visibleSongs.length ? (
          visibleSongs.map(({ song, lyricMatch }, i) => (
            <SongRow key={song.id || i} song={song} showHeart={tab === 'favorites'} lyricMatch={lyricMatch} />
          ))
        ) : (
          <>
            {visibleSongs.length ? (
              visibleSongs.map(({ song, lyricMatch }, i) => (
                <SongRow key={song.id || i} song={song} showHeart={tab === 'favorites'} lyricMatch={lyricMatch} />
              ))
            ) : (
              <EmptySongs message={searchError || "No songs match your search or library is empty."} />
            )}

            {!search.trim() && librarySongs.length >= 50 && (
              <button
                type="button"
                onClick={loadMoreSongs}
                disabled={loadingMore}
                className="w-full py-4 mt-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 disabled:opacity-40"
              >
                {loadingMore ? 'Loading more songs…' : 'Load more songs'}
              </button>
            )}
          </>
        )}
      </main>

      <BottomNav active="library" />
    </Shell>
  );
}

export function GuitarCordProfile({ user }: { user?: User | null }) {
  const navigate = useNavigate();
  const items = [
    [Heart, 'Favorites'],
    [Download, 'Downloads'],
    [Settings, 'Settings'],
    [CircleHelp, 'Help & Support'],
  ] as const;
  const displayName = user?.displayName || 'Guitar Player';
  const email = user?.email || 'Not signed in';

  return (
    <Shell>
      <header className="px-5 pt-safe pt-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full border border-[#FFD600] bg-[#FFD600]/10 flex items-center justify-center">
          <Guitar className="text-[#FFD600]" />
        </div>
        <h1 className="mt-3 font-semibold">{displayName}</h1>
        <p className="text-xs text-white/40">{email}</p>
      </header>

      <main className="px-5 pt-6">
        {user ? (
          <button
            type="button"
            onClick={async () => {
              try {
                await signOutUser();
                navigate('/');
              } catch (error) {
                console.error('Logout failed:', error);
              }
            }}
            className="w-full mb-4 flex items-center gap-3 rounded-2xl border border-red-400/10 bg-red-500/5 px-4 py-4 text-sm"
          >
            <UserCircle2 size={18} className="text-red-300" />
            <span className="flex-1 text-left text-red-200">Logout</span>
            <span className="text-red-200/40">→</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full mb-4 flex items-center gap-3 rounded-2xl border border-[#FFD600]/20 bg-[#FFD600]/5 px-4 py-4 text-sm"
          >
            <UserCircle2 size={18} className="text-[#FFD600]" />
            <span className="flex-1 text-left text-[#FFD600]">Login</span>
            <span className="text-[#FFD600]/50">→</span>
          </button>
        )}

        {items.map(([Icon, label]) => (
          <button key={label} className="w-full flex items-center gap-3 py-4 border-b border-white/10 text-sm">
            <Icon size={18} className="text-white/60" />
            <span className="flex-1 text-left">{label}</span>
            <span className="text-white/30">›</span>
          </button>
        ))}

        {user && !user.isAnonymous && isUserAdmin(user) && (
          <button
            type="button"
            onClick={() => navigate('/admin-panel')}
            className="w-full flex items-center gap-3 py-4 border-b border-white/10 text-sm"
          >
            <span className="text-[#FFD600] text-lg leading-none">🛡</span>
            <span className="flex-1 text-left">
              <span className="block font-semibold text-[#FFD600]">Admin Dashboard</span>
              <span className="block text-[10px] text-white/35 mt-0.5">
                Manage songs, approvals and submissions
              </span>
            </span>
            <span className="text-[#FFD600]/50">›</span>
          </button>
        )}
        {user && !user.isAnonymous && (
          <button
            onClick={() => navigate('/create')}
            className="w-full flex items-center gap-3 py-4 text-sm border-b border-white/10"
          >
            <Guitar size={18} className="text-[#FFD600]" />
            <span className="flex-1 text-left">
              <span className="block">သီချင်း / Lyrics တင်မယ်</span>
              <span className="block text-[10px] text-white/35 mt-0.5">Lyrics + Chords ကို တင်ပြီး Admin approval ပို့မယ်</span>
            </span>
            <span className="text-white/30">›</span>
          </button>
        )}

        <button
          onClick={() => navigate('/chords')}
          className="w-full flex items-center gap-3 py-4 text-sm"
        >
          <Guitar size={18} className="text-[#FFD600]" />
          <span className="flex-1 text-left">Chord Library</span>
          <span className="text-white/30">›</span>
        </button>
      </main>

      <BottomNav active="profile" />
    </Shell>
  );
}
