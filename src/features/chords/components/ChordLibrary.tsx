import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, X } from 'lucide-react';
import { ChordDiagram } from '../../../components/ChordDiagram';
import { CHORD_DATABASE, CHORD_LABELS, CHORD_ROOTS, CHORD_SUFFIXES } from '../../../lib/chords';

function Shell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-black text-white selection:bg-[#FFD600]/30"><div className="mx-auto min-h-screen w-full max-w-xl bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.05),transparent_35%)] pb-20">{children}</div></div>;
}

export function ChordLibrary() {
    const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [rootFilter, setRootFilter] = useState('All');
  const [familyFilter, setFamilyFilter] = useState('All');

  const families = ['All', 'Major', 'Minor', '7th', 'Suspended', 'Added Tone', '6th', '9th', 'Diminished', 'Augmented'];
  const suffixesByFamily: Record<string, readonly string[]> = {
    All: CHORD_SUFFIXES,
    Major: ['Maj'],
    Minor: ['Min'],
    '7th': ['7', 'maj7', 'min7'],
    Suspended: ['sus2', 'sus4'],
    'Added Tone': ['add9'],
    '6th': ['6', 'min6'],
    '9th': ['9', 'min9'],
    Diminished: ['dim'],
    Augmented: ['aug'],
  };

  const cards = useMemo(() => {
    const selectedRoots = rootFilter === 'All' ? CHORD_ROOTS : [rootFilter];
    const selectedSuffixes = suffixesByFamily[familyFilter];
    const needle = query.trim().toLowerCase();
    return selectedRoots.flatMap(root => selectedSuffixes
      .map(suffix => ({ root, suffix, name: suffix === 'Maj' ? root : suffix === 'Min' ? `${root}m` : `${root}${suffix}` }))
      .filter(item => !needle || `${item.name} ${item.root} ${CHORD_LABELS[item.suffix]}`.toLowerCase().includes(needle)));
  }, [rootFilter, familyFilter, query]);

  return <Shell><header className="px-5 pt-safe pt-5"><div className="flex items-center gap-3"><button onClick={() => navigate('/app')}><ChevronLeft size={22}/></button><h1 className="font-semibold">Chord Library</h1></div><div className="mt-1 text-[11px] text-white/35">Standard tuning · E A D G B E</div><div className="mt-4 rounded-2xl bg-[#151517] border border-white/10 px-3 py-3 flex items-center gap-2"><Search size={16} className="text-white/45"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search chord (e.g. Cmaj7, F#m, Bb7)..." className="bg-transparent outline-none w-full text-sm placeholder:text-white/35"/><X size={15} className="text-white/30"/></div><div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">{['All', ...CHORD_ROOTS].map(t=><button key={t} onClick={()=>setRootFilter(t)} className={`px-3 py-2 rounded-full text-xs whitespace-nowrap ${rootFilter===t?'bg-[#FFD600] text-black font-semibold':'bg-[#1a1a1c] text-white/60'}`}>{t}</button>)}</div><div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar pb-1">{families.map(t=><button key={t} onClick={()=>setFamilyFilter(t)} className={`px-3 py-2 rounded-full text-xs whitespace-nowrap ${familyFilter===t?'bg-white text-black font-semibold':'bg-[#1a1a1c] text-white/60'}`}>{t}</button>)}</div></header><main className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">{cards.map(({root,suffix,name})=>{const data=CHORD_DATABASE[root]?.[suffix]; return <div key={`${root}-${suffix}`} className="rounded-2xl bg-[#111113] border border-white/5 p-3 flex flex-col items-center">{data && <ChordDiagram name={name} data={data} isLight={false}/>}<div className="mt-2 text-[11px] text-white/45 text-center">{CHORD_LABELS[suffix]}</div></div>})}</main></Shell>;
}
