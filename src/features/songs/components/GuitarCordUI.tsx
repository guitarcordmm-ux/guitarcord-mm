import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Library, UserCircle2, Heart, Play, ChevronLeft, MoreHorizontal, Settings, Download, CircleHelp, X, Guitar } from 'lucide-react';
import type { Song, User } from '../../../types';

type Props = { songs: Song[]; user?: User | null };

function AppLogo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-1.5 font-bold tracking-tight"><Guitar className="text-[#FFD600]" size={compact ? 17 : 20} /><span className={compact ? 'text-sm' : 'text-base'}>Guitar<span className="text-[#FFD600]">Cord</span></span></div>;
}

function BottomNav({ active }: { active: 'home' | 'library' | 'profile' }) {
  const navigate = useNavigate();
  const items = [
    ['home', Home, 'Home', '/app'],
    ['library', Library, 'Library', '/library'],
    ['profile', UserCircle2, 'Profile', '/profile'],
  ] as const;
  return <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur-xl pb-safe"><div className="mx-auto max-w-xl grid grid-cols-3 h-16">{items.map(([key, Icon, label, path]) => <button key={key} onClick={() => navigate(path)} className={`flex flex-col items-center justify-center gap-1 text-[10px] ${active === key ? 'text-[#FFD600]' : 'text-white/45'}`}><Icon size={19} /><span>{label}</span></button>)}</div></nav>;
}

function EmptySongs({ message = 'No songs available yet.' }: { message?: string }) {
  return <div className="py-16 text-center text-sm text-white/35"><Guitar className="mx-auto mb-3 text-[#FFD600]/70" size={28}/>{message}</div>;
}

function SongRow({ song, showHeart = false }: { song: Song; showHeart?: boolean }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(`/chord/${song.id}`)} className="w-full flex items-center gap-3 py-2.5 text-left active:scale-[0.99] transition-transform"><div className="w-11 h-11 rounded-xl bg-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">{song.imageURL ? <img src={song.imageURL} alt="" className="w-full h-full object-cover" /> : <Guitar className="text-[#FFD600]" size={18} />}</div><div className="min-w-0 flex-1"><div className="font-medium truncate text-[14px]">{song.songTitle}</div><div className="text-[11px] text-white/45 truncate">{song.artist}</div></div>{showHeart ? <Heart size={17} className="text-[#FFD600] fill-[#FFD600]" /> : <Play size={16} className="text-[#FFD600] fill-[#FFD600]" />}</button>;
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-black text-white selection:bg-[#FFD600]/30"><div className="mx-auto min-h-screen w-full max-w-xl bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.05),transparent_35%)] pb-20">{children}</div></div>; }

export function GuitarCordHome({ songs, user }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => songs.filter(s => `${s.songTitle} ${s.artist}`.toLowerCase().includes(search.toLowerCase())).slice(0, 8), [songs, search]);
  return <Shell><header className="px-5 pt-safe pt-5 flex items-center justify-between"><AppLogo /><button onClick={() => navigate('/profile')} className="text-white/70"><UserCircle2 size={22} /></button></header><main className="px-5 pt-5"><div className="rounded-3xl bg-[#FFD600] text-black p-5 relative overflow-hidden"><div className="relative z-10 max-w-[65%]"><div className="text-2xl font-black leading-[1.05]">Play<br/>Your Favorite<br/>Songs</div><div className="mt-2 text-[11px] font-medium">Chords · Lyrics · Guitar</div></div><Guitar className="absolute -right-1 bottom-0 text-black/80" size={132}/></div><div className="mt-4 rounded-2xl bg-[#151517] border border-white/10 px-3.5 py-3 flex items-center gap-2"><Search size={17} className="text-white/45"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search songs, artists, or chords..." className="bg-transparent outline-none w-full text-sm placeholder:text-white/35"/></div><div className="flex items-center justify-between mt-6 mb-2"><h2 className="font-semibold">Popular Songs</h2><button onClick={() => navigate('/library')} className="text-xs text-white/45">See All</button></div><div className="divide-y divide-white/10">{filtered.length ? filtered.map((s,i) => <SongRow key={s.id || i} song={s}/>) : <EmptySongs message={user ? 'No published songs are available yet.' : 'Sign in to see your song library.'}/>}</div></main><BottomNav active="home"/></Shell>;
}

export function GuitarCordLibrary({ songs }: Props) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'songs' | 'favorites' | 'downloads'>('songs');
  const filtered = useMemo(() => songs.filter(s => `${s.songTitle} ${s.artist}`.toLowerCase().includes(search.toLowerCase())), [songs, search]);
  return <Shell><header className="px-5 pt-safe pt-5"><div className="flex items-center justify-between"><AppLogo compact/><button className="text-white/45"><MoreHorizontal size={20}/></button></div><div className="mt-5 text-xl font-semibold">My Library</div><div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">{(['songs','favorites','downloads'] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-xs ${tab === t ? 'bg-[#FFD600] text-black font-semibold' : 'bg-[#1a1a1c] text-white/60'}`}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div><div className="mt-3 rounded-2xl bg-[#151517] px-3.5 py-3 flex items-center gap-2"><Search size={16} className="text-white/45"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent outline-none w-full text-sm"/><X size={15} className="text-white/30"/></div></header><main className="px-5 pt-3 divide-y divide-white/10">{filtered.length ? filtered.map((s,i)=><SongRow key={s.id||i} song={s} showHeart={tab === 'favorites'}/>) : <EmptySongs message="No songs match your search or library is empty."/>}</main><BottomNav active="library"/></Shell>;
}

export function GuitarCordProfile({ user }: { user?: User | null }) {
  const navigate = useNavigate();
  const items = [[Heart,'Favorites'],[Download,'Downloads'],[Settings,'Settings'],[CircleHelp,'Help & Support']] as const;
  const displayName = user?.displayName || 'Guitar Player';
  const email = user?.email || 'Not signed in';
  return <Shell><header className="px-5 pt-safe pt-8 text-center"><div className="mx-auto w-14 h-14 rounded-full border border-[#FFD600] bg-[#FFD600]/10 flex items-center justify-center"><Guitar className="text-[#FFD600]"/></div><h1 className="mt-3 font-semibold">{displayName}</h1><p className="text-xs text-white/40">{email}</p></header><main className="px-5 pt-6">{items.map(([Icon,label])=><button key={label} className="w-full flex items-center gap-3 py-4 border-b border-white/10 text-sm"><Icon size={18} className="text-white/60"/><span className="flex-1 text-left">{label}</span><span className="text-white/30">›</span></button>)}<button onClick={()=>navigate('/chords')} className="w-full flex items-center gap-3 py-4 text-sm"><Guitar size={18} className="text-[#FFD600]"/><span className="flex-1 text-left">Chord Library</span><span className="text-white/30">›</span></button></main><BottomNav active="profile"/></Shell>;
}
