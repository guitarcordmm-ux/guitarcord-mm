import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Library, UserCircle2, Heart, Play, ChevronLeft, MoreHorizontal, Pause, SkipBack, SkipForward, Repeat2, ListMusic, Settings, Download, CircleHelp, X, Guitar } from 'lucide-react';
import { Song } from '../types';
import { ChordDiagram } from './ChordDiagram';
import { CHORD_DATABASE } from '../lib/chords';

type Props = { songs: Song[]; user?: any };

export const FALLBACK_SONGS: Song[] = [
  { id: 'demo-perfect', songTitle: 'Perfect', artist: 'Ed Sheeran', genre: 'Pop', imageURL: '', lyrics: '[G]I found a love for me\n[Em]Darling, just dive right in\n[C]And follow my lead\n[G]Well, I found a girl\n[Em]Beautiful and sweet\n[C]I never knew you were the someone\n[G]waiting for me' },
  { id: 'demo-let-her-go', songTitle: 'Let Her Go', artist: 'Passenger', genre: 'Folk', imageURL: '' },
  { id: 'demo-someone', songTitle: 'Someone Like You', artist: 'Adele', genre: 'Pop', imageURL: '' },
  { id: 'demo-im-yours', songTitle: "I'm Yours", artist: 'Jason Mraz', genre: 'Pop', imageURL: '' },
  { id: 'demo-counting', songTitle: 'Counting Stars', artist: 'OneRepublic', genre: 'Pop', imageURL: '' },
];

const chordNames = ['C', 'D', 'Em', 'G', 'Am', 'F', 'Dm', 'E', 'A'];

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

function SongRow({ song, showHeart = false }: { song: Song; showHeart?: boolean }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(`/chord/${song.id}`)} className="w-full flex items-center gap-3 py-2.5 text-left active:scale-[0.99] transition-transform"><div className="w-11 h-11 rounded-xl bg-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">{song.imageURL ? <img src={song.imageURL} alt="" className="w-full h-full object-cover" /> : <Guitar className="text-[#FFD600]" size={18} />}</div><div className="min-w-0 flex-1"><div className="font-medium truncate text-[14px]">{song.songTitle}</div><div className="text-[11px] text-white/45 truncate">{song.artist}</div></div>{showHeart ? <Heart size={17} className="text-[#FFD600] fill-[#FFD600]" /> : <Play size={16} className="text-[#FFD600] fill-[#FFD600]" />}</button>;
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-black text-white selection:bg-[#FFD600]/30"><div className="mx-auto min-h-screen w-full max-w-xl bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.05),transparent_35%)] pb-20">{children}</div></div>; }

export function GuitarCordHome({ songs: inputSongs }: Props) {
  const songs = inputSongs.length ? inputSongs : FALLBACK_SONGS;
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => songs.filter(s => `${s.songTitle} ${s.artist}`.toLowerCase().includes(search.toLowerCase())).slice(0, 8), [songs, search]);
  return <Shell><header className="px-5 pt-safe pt-5 flex items-center justify-between"><AppLogo /><button onClick={() => navigate('/profile')} className="text-white/70"><UserCircle2 size={22} /></button></header><main className="px-5 pt-5"><div className="rounded-3xl bg-[#FFD600] text-black p-5 relative overflow-hidden"><div className="relative z-10 max-w-[65%]"><div className="text-2xl font-black leading-[1.05]">Play<br/>Your Favorite<br/>Songs</div><div className="mt-2 text-[11px] font-medium">Chords · Lyrics · Guitar</div></div><Guitar className="absolute -right-1 bottom-0 text-black/80" size={132}/></div><div className="mt-4 rounded-2xl bg-[#151517] border border-white/10 px-3.5 py-3 flex items-center gap-2"><Search size={17} className="text-white/45"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search songs, artists, or chords..." className="bg-transparent outline-none w-full text-sm placeholder:text-white/35"/></div><div className="flex items-center justify-between mt-6 mb-2"><h2 className="font-semibold">Popular Songs</h2><button className="text-xs text-white/45">See All</button></div><div className="divide-y divide-white/10">{filtered.map((s,i) => <SongRow key={s.id || i} song={s}/>)}</div></main><BottomNav active="home"/></Shell>;
}

export function GuitarCordLibrary({ songs: inputSongs }: Props) {
  const songs = inputSongs.length ? inputSongs : FALLBACK_SONGS;
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'songs' | 'favorites' | 'downloads'>('songs');
  const filtered = useMemo(() => songs.filter(s => `${s.songTitle} ${s.artist}`.toLowerCase().includes(search.toLowerCase())), [songs, search]);
  return <Shell><header className="px-5 pt-safe pt-5"><div className="flex items-center justify-between"><AppLogo compact/><button className="text-white/45"><MoreHorizontal size={20}/></button></div><div className="mt-5 text-xl font-semibold">My Library</div><div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">{(['songs','favorites','downloads'] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-xs ${tab === t ? 'bg-[#FFD600] text-black font-semibold' : 'bg-[#1a1a1c] text-white/60'}`}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div><div className="mt-3 rounded-2xl bg-[#151517] px-3.5 py-3 flex items-center gap-2"><Search size={16} className="text-white/45"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent outline-none w-full text-sm"/><X size={15} className="text-white/30"/></div></header><main className="px-5 pt-3 divide-y divide-white/10">{filtered.map((s,i)=><SongRow key={s.id||i} song={s} showHeart={tab === 'favorites'}/>)}</main><BottomNav active="library"/></Shell>;
}

export function ChordLibrary() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('All');
  const visible = chordNames.filter(name => { if (category === 'All') return true; if (category === 'Major') return !name.includes('m'); if (category === 'Minor') return name.includes('m'); return true; });
  return <Shell><header className="px-5 pt-safe pt-5"><div className="flex items-center gap-3"><button onClick={() => navigate('/app')}><ChevronLeft size={22}/></button><h1 className="font-semibold">Chord Library</h1></div><div className="mt-4 rounded-2xl bg-[#151517] px-3 py-3 flex items-center gap-2"><Search size={16} className="text-white/45"/><span className="text-sm text-white/35">Search chords...</span></div><div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">{['All','Major','Minor','Seventh'].map(t=><button key={t} onClick={()=>setCategory(t)} className={`px-4 py-2 rounded-full text-xs ${category===t?'bg-[#FFD600] text-black font-semibold':'bg-[#1a1a1c] text-white/60'}`}>{t}</button>)}</div></header><main className="px-5 py-4 grid grid-cols-3 gap-3">{visible.map(name=>{const root=name[0], suffix=name.slice(1); const data=CHORD_DATABASE[root]?.[suffix || 'Maj'] || CHORD_DATABASE[root]?.Maj; return <div key={name} className="rounded-2xl bg-[#111113] border border-white/5 p-2 flex flex-col items-center">{data && <ChordDiagram name={name} data={data} isLight={false}/>}<div className="text-xs mt-1">{name}</div></div>})}</main><BottomNav active="library"/></Shell>;
}

export function GuitarCordPlayer({ song }: { song: Song }) {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const parsed = useMemo(() => (song.lyrics || '').split('\n'), [song.lyrics]);
  const demo = parsed.length ? parsed : FALLBACK_SONGS[0].lyrics!.split('\n');
  return <Shell><header className="sticky top-0 z-30 px-5 pt-safe pt-3 pb-3 bg-black/92 backdrop-blur-xl border-b border-white/10"><div className="flex items-center justify-between"><button onClick={()=>navigate('/app')}><ChevronLeft size={22}/></button><div className="text-xs font-medium">{song.songTitle || 'Perfect'}</div><div className="flex gap-3 text-white/60"><Heart size={18}/><MoreHorizontal size={18}/></div></div></header><main className="px-5 pt-4"><div className="text-lg font-semibold">{song.songTitle}</div><div className="text-xs text-white/45">{song.artist}</div>{song.imageURL && !song.imageURL.includes('picsum') && <img src={song.imageURL} alt="" className="mt-4 w-full h-28 rounded-2xl object-cover"/>}<div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">{['G','D','Em','C'].map((c,i)=><button key={c} onClick={()=>setTranspose(i-2)} className={`px-4 py-2 rounded-full text-xs ${transpose===i-2?'bg-[#FFD600] text-black font-semibold':'bg-[#151517] text-white/60'}`}>{c}</button>)}</div><div className="mt-4 rounded-2xl bg-[#0b0b0c] border border-white/5 p-4 font-mono">{demo.map((line,i)=>{const parts=line.split(/(\[[^\]]+\])/g); return <div key={i} className="min-h-11 pt-2 leading-5 text-sm">{parts.map((part,j)=>part.startsWith('[')?<span key={j} className="text-[#FFD600] font-bold mr-1">{part.slice(1,-1)}</span>:<span key={j} className="text-white">{part}</span>)}</div>})}</div></main><div className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur-xl"><div className="mx-auto max-w-xl px-5 pt-3 pb-safe-nav"><div className="flex items-center gap-4 text-white/60"><ListMusic size={18}/><SkipBack size={18}/><button onClick={()=>setPlaying(v=>!v)} className="w-12 h-12 rounded-full bg-[#FFD600] text-black flex items-center justify-center">{playing?<Pause size={20}/>:<Play size={20} className="fill-black"/>}</button><SkipForward size={18}/><Repeat2 size={18}/><div className="ml-auto flex items-center gap-2 text-[10px]"><span>Auto Scroll</span><span className="w-9 h-5 rounded-full bg-[#FFD600] inline-block relative"><span className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full"/></span></div></div><div className="mt-2 h-1 bg-white/10 rounded-full"><div className="w-1/3 h-full bg-[#FFD600] rounded-full"/></div></div></div></Shell>;
}

export function GuitarCordProfile() {
  const navigate = useNavigate();
  const items = [[Heart,'Favorites'],[Download,'Downloads'],[Settings,'Settings'],[CircleHelp,'Help & Support']] as const;
  return <Shell><header className="px-5 pt-safe pt-8 text-center"><div className="mx-auto w-14 h-14 rounded-full border border-[#FFD600] bg-[#FFD600]/10 flex items-center justify-center"><Guitar className="text-[#FFD600]"/></div><h1 className="mt-3 font-semibold">Guitar Player</h1><p className="text-xs text-white/40">guitarcord@gmail.com</p></header><main className="px-5 pt-6">{items.map(([Icon,label])=><button key={label} className="w-full flex items-center gap-3 py-4 border-b border-white/10 text-sm"><Icon size={18} className="text-white/60"/><span className="flex-1 text-left">{label}</span><span className="text-white/30">›</span></button>)}<button onClick={()=>navigate('/chords')} className="w-full flex items-center gap-3 py-4 text-sm"><Guitar size={18} className="text-[#FFD600]"/><span className="flex-1 text-left">Chord Library</span><span className="text-white/30">›</span></button></main><BottomNav active="profile"/></Shell>;
}
