import { useMemo, useState } from 'react';
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
  MoreHorizontal,
  Settings,
  Download,
  CircleHelp,
  X,
  Guitar,
  Clock3,
  Sparkles,
} from 'lucide-react';
import type { Song, User } from '../../../types';
import { normalizeSearchText, searchSongs, type SongSearchResult } from '../../../services/songs/songService';

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
    ['home', Home, 'Home', '/app'],
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

type Category = 'popular' | 'recent' | 'myanmar' | 'easy';

function sortRecent(songs: Song[]) {
  return [...songs].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

function isMyanmarSong(song: Song) {
  const text = normalizeSearchText([
    song.songTitle,
    song.artist,
    song.genre,
    ...(song.tags ?? []),
  ].filter(Boolean).join(' '));

  return text.includes('မြန်မာ') || text.includes('myanmar') || text.includes('burmese');
}

function isEasySong(song: Song) {
  const text = normalizeSearchText(
    [song.genre, ...(song.tags ?? [])].filter(Boolean).join(' ')
  );

  return text.includes('easy') || text.includes('beginner') || text.includes('လွယ်');
}

function categorySongs(songs: Song[], category: Category) {
  if (category === 'popular') return songs.slice(0, 8);
  if (category === 'recent') return sortRecent(songs).slice(0, 8);

  const filtered = songs.filter(category === 'myanmar' ? isMyanmarSong : isEasySong);
  return filtered.length ? filtered.slice(0, 8) : songs.slice(0, 8);
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
    <button
      onClick={() => navigate(`/chord/${song.id}`)}
      className="w-full flex items-center gap-3 py-3 text-left active:scale-[0.99] transition-transform"
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
        <div className="text-[11px] text-white/45 truncate">{song.artist}</div>
        {lyricMatch && (
          <div className="mt-0.5 text-[10px] leading-4 text-white/30 truncate">
            “{lyricMatch}”
          </div>
        )}
      </div>
      {showHeart ? (
        <Heart size={17} className="text-[#FFD600] fill-[#FFD600]" />
      ) : (
        <Play size={16} className="text-[#FFD600] fill-[#FFD600]" />
      )}
    </button>
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
  const [category, setCategory] = useState<Category>('popular');

  const results = useMemo(() => searchSongs(songs, search), [songs, search]);
  const visibleResults = useMemo<SongSearchResult[]>(() => {
    if (search.trim()) return results.slice(0, 10);
    return categorySongs(songs, category).map(song => ({ song, lyricMatch: '', score: 0 }));
  }, [songs, search, results, category]);

  const categoryItems: Array<{ key: Category; label: string; Icon: LucideIcon }> = [
    { key: 'popular', label: 'Popular', Icon: Sparkles },
    { key: 'recent', label: 'Recent', Icon: Clock3 },
    { key: 'myanmar', label: 'Myanmar Songs', Icon: Guitar },
    { key: 'easy', label: 'Easy Songs', Icon: Play },
  ];

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
            Find the song, chords and lyrics you need to play.
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
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs whitespace-nowrap ${category === key && !search ? 'bg-[#FFD600] text-black font-semibold' : 'bg-[#1a1a1c] text-white/60'}`}
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
                {search.trim() ? `Search Results · ${results.length}` : categoryItems.find(item => item.key === category)?.label}
              </h2>
              {search.trim() && (
                <p className="mt-0.5 text-[10px] text-white/35">
                  Matches song name, artist, lyrics, chords and tags.
                </p>
              )}
            </div>
            {!search.trim() && (
              <button onClick={() => navigate('/library')} className="text-xs text-white/45">
                See All
              </button>
            )}
          </div>

          <div className="divide-y divide-white/10">
            {visibleResults.length ? (
              visibleResults.map(({ song, lyricMatch }, i) => (
                <SongRow
                  key={song.id || i}
                  song={song}
                  lyricMatch={search.trim() ? lyricMatch : ''}
                />
              ))
            ) : (
              <EmptySongs message={search.trim() ? 'No matching song, artist, lyric or chord found.' : 'No published songs are available yet.'} />
            )}
          </div>
        </section>

        {!search.trim() && (
          <div className="mt-6 rounded-2xl border border-[#FFD600]/10 bg-[#FFD600]/5 px-4 py-3 text-xs text-white/50">
            Search any Burmese or English song wording, artist name, lyric line or chord to jump straight into the player.
          </div>
        )}
      </main>

      <BottomNav active="home" />
    </Shell>
  );
}

export function GuitarCordLibrary({ songs }: Props) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'songs' | 'favorites' | 'downloads'>('songs');
  const results = useMemo(() => searchSongs(songs, search), [songs, search]);

  return (
    <Shell>
      <header className="px-5 pt-safe pt-5">
        <div className="flex items-center justify-between">
          <AppLogo compact />
          <button className="text-white/45" aria-label="More options">
            <MoreHorizontal size={20} />
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
        {results.length ? (
          results.map(({ song, lyricMatch }, i) => (
            <SongRow key={song.id || i} song={song} showHeart={tab === 'favorites'} lyricMatch={lyricMatch} />
          ))
        ) : (
          <EmptySongs message="No songs match your search or library is empty." />
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
        {items.map(([Icon, label]) => (
          <button key={label} className="w-full flex items-center gap-3 py-4 border-b border-white/10 text-sm">
            <Icon size={18} className="text-white/60" />
            <span className="flex-1 text-left">{label}</span>
            <span className="text-white/30">›</span>
          </button>
        ))}
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
