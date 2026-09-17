import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, MoreHorizontal, Pause, Play, SkipBack, SkipForward, Repeat2, ListMusic, Minus, Plus } from 'lucide-react';
import { Song } from '../types';

type ParsedLine = { lyrics: string; chords: { chord: string; index: number }[] };

const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function parseChord(raw: string) {
  const match = raw.trim().match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return null;
  return { root: match[1], suffix: match[2] };
}

function transposeChord(raw: string, semitones: number) {
  const parsed = parseChord(raw);
  if (!parsed) return raw;
  const sharpIndex = CHROMATIC_SHARPS.indexOf(parsed.root);
  const flatIndex = CHROMATIC_FLATS.indexOf(parsed.root);
  const sourceIndex = sharpIndex >= 0 ? sharpIndex : flatIndex;
  if (sourceIndex < 0) return raw;
  const prefersFlat = parsed.root.includes('b');
  const scale = prefersFlat ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  const next = scale[(sourceIndex + semitones + 120) % 12];
  return `${next}${parsed.suffix}`;
}

function parseLyricsLine(line: string): ParsedLine {
  const matches = [...line.matchAll(/\[([^\]]+)\]/g)];
  const lyrics = line.replace(/\[([^\]]+)\]/g, '');
  let removed = 0;
  const chords = matches.map(match => {
    const rawIndex = match.index ?? 0;
    const index = rawIndex - removed;
    removed += match[0].length;
    return { chord: match[1], index };
  });
  return { lyrics, chords };
}

function detectBaseKey(lines: ParsedLine[]) {
  for (const line of lines) {
    const chord = line.chords[0]?.chord;
    if (chord) return parseChord(chord)?.root || '';
  }
  return '';
}

export function GuitarCordPlayer({ song }: { song: Song }) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [speed, setSpeed] = useState(1);
  const parsed = useMemo(() => (song.lyrics || '').split('\n').map(parseLyricsLine), [song.lyrics]);
  const baseKey = useMemo(() => detectBaseKey(parsed), [parsed]);
  const currentKey = useMemo(() => (baseKey ? transposeChord(baseKey, transpose) : '—'), [baseKey, transpose]);

  useEffect(() => {
    if (!playing || !scrollRef.current) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const delta = now - last;
      last = now;
      el.scrollTop += (delta / 1000) * (speed * 7.5);
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);

  const resetTranspose = () => setTranspose(0);
  const decreaseKey = () => setTranspose(v => Math.max(-11, v - 1));
  const increaseKey = () => setTranspose(v => Math.min(11, v + 1));

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 px-5 pt-safe pt-3 pb-3 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/app')} aria-label="Back"><ChevronLeft size={22}/></button>
          <div className="text-xs font-medium truncate max-w-[55%]">{song.songTitle}</div>
          <div className="flex gap-3 text-white/60"><Heart size={18}/><MoreHorizontal size={18}/></div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-5 pt-4 pb-40">
        <div className="text-lg font-semibold">{song.songTitle}</div>
        <div className="text-xs text-white/45">{song.artist}</div>

        <section className="mt-3 rounded-xl border border-white/10 bg-[#111113] px-2.5 py-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9px] uppercase tracking-[0.12em] text-white/40">Key</span>
              <span className="text-base font-black leading-none text-[#FFD600] min-w-7">{currentKey}</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={decreaseKey} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 grid place-items-center" aria-label="Lower key"><Minus size={14}/></button>
              <button onClick={resetTranspose} className="h-8 min-w-12 rounded-lg bg-[#FFD600] text-black px-2 text-[10px] font-black">Original</button>
              <button onClick={increaseKey} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 grid place-items-center" aria-label="Raise key"><Plus size={14}/></button>
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[9px] text-white/35">
            <span>{transpose === 0 ? 'Original key' : `${transpose > 0 ? '+' : ''}${transpose} semitone${Math.abs(transpose) === 1 ? '' : 's'}`}</span>
            <span>−11 / +11</span>
          </div>
          <div className="mt-1 h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-[#FFD600] rounded-full transition-all" style={{ width: `${((transpose + 11) / 22) * 100}%` }}/>
          </div>
        </section>

        <div ref={scrollRef} className="mt-3 max-h-[calc(100vh-300px)] min-h-[52vh] overflow-y-auto rounded-2xl bg-[#0b0b0c] border border-white/5 px-4 py-5">
          {parsed.length ? parsed.map((line, i) => {
            const width = Math.max(line.lyrics.length, 1);
            return (
              <div key={i} className="relative min-w-max font-mono text-sm mb-3">
                <div className="relative h-5 leading-5">
                  {line.chords.map((item, j) => (
                    <span key={`${item.index}-${j}`} className="absolute top-0 text-[#FFD600] font-bold whitespace-nowrap" style={{ left: `${item.index}ch` }}>
                      {transposeChord(item.chord, transpose)}
                    </span>
                  ))}
                </div>
                <div className="whitespace-pre leading-6 min-h-6 text-white">{line.lyrics || '\u00A0'.repeat(width)}</div>
              </div>
            );
          }) : <div className="py-10 text-center text-sm text-white/35">No lyrics have been published for this song yet.</div>}
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur-xl">
        <div className="mx-auto max-w-xl px-5 pt-3 pb-safe-nav">
          <div className="flex items-center gap-4 text-white/60">
            <ListMusic size={18}/>
            <SkipBack size={18}/>
            <button onClick={() => setPlaying(v => !v)} className="w-12 h-12 rounded-full bg-[#FFD600] text-black flex items-center justify-center" aria-label={playing ? 'Pause auto scroll' : 'Start auto scroll'}>
              {playing ? <Pause size={20}/> : <Play size={20} className="fill-black"/>}
            </button>
            <SkipForward size={18}/>
            <Repeat2 size={18}/>
            <div className="ml-auto min-w-24">
              <div className="flex items-center justify-between text-[10px] text-white/45"><span>Scroll</span><span>{speed.toFixed(1)}×</span></div>
              <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full accent-yellow-400" aria-label="Scroll speed"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
