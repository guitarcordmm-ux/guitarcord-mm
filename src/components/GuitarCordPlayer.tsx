import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, MoreHorizontal, Pause, Play, SkipBack, SkipForward, Repeat2, ListMusic, Minus, Plus, Music2 } from 'lucide-react';
import { Song } from '../types';

type ParsedLine = { lyrics: string; chords: { chord: string; index: number }[] };

const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const BASE_SCROLL_SPEED = 18;

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
  const [showKeyControls, setShowKeyControls] = useState(false);
  const parsed = useMemo(() => (song.lyrics || '').split('\n').map(parseLyricsLine), [song.lyrics]);
  const baseKey = useMemo(() => detectBaseKey(parsed), [parsed]);
  const currentKey = useMemo(() => (baseKey ? transposeChord(baseKey, transpose) : '—'), [baseKey, transpose]);

  useEffect(() => {
    if (!playing) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const el = scrollRef.current;
      if (!el) return;

      const deltaSeconds = Math.max(0, Math.min(now - last, 100)) / 1000;
      last = now;
      el.scrollTop += deltaSeconds * BASE_SCROLL_SPEED * speed;

      const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      if (reachedBottom) {
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

  const toggleAutoScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    if (!playing && el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
      el.scrollTop = 0;
    }

    setPlaying(v => !v);
  };

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

        <button
          type="button"
          onClick={() => setShowKeyControls(v => !v)}
          aria-label="Change key"
          aria-expanded={showKeyControls}
          className={`fixed right-4 bottom-28 z-50 w-11 h-11 rounded-full border grid place-items-center shadow-lg backdrop-blur-xl transition-all active:scale-95 ${showKeyControls ? 'bg-[#FFD600] text-black border-[#FFD600]' : 'bg-[#171719]/90 text-[#FFD600] border-white/15'}`}
        >
          <Music2 size={18} />
        </button>

        {showKeyControls && (
          <div className="fixed right-4 bottom-[10.25rem] z-50 w-[150px] rounded-2xl border border-white/10 bg-[#151517]/95 backdrop-blur-xl p-2 shadow-2xl">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-[9px] uppercase tracking-[0.12em] text-white/40">Key</span>
              <span className="text-sm font-black text-[#FFD600]">{currentKey}</span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <button onClick={decreaseKey} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center" aria-label="Lower key"><Minus size={14}/></button>
              <button onClick={resetTranspose} className="h-9 flex-1 rounded-xl bg-[#FFD600] text-black px-1 text-[9px] font-black">Original</button>
              <button onClick={increaseKey} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center" aria-label="Raise key"><Plus size={14}/></button>
            </div>
            <div className="mt-1.5 text-center text-[8px] text-white/35">
              {transpose === 0 ? 'Original key' : `${transpose > 0 ? '+' : ''}${transpose} semitone${Math.abs(transpose) === 1 ? '' : 's'}`}
            </div>
          </div>
        )}

        <div ref={scrollRef} className="mt-4 max-h-[calc(100vh-285px)] min-h-[52vh] overflow-y-auto rounded-2xl bg-[#0b0b0c] border border-white/5 px-4 py-5">
          {parsed.length ? parsed.map((line, i) => {
            const width = Math.max(line.lyrics.length, 1);
            return (
              <div key={i} className="relative w-full font-mono text-sm mb-3 overflow-hidden">
                <div className="relative min-h-5 leading-5 overflow-hidden">
                  {line.chords.map((item, j) => (
                    <span key={`${item.index}-${j}`} className="absolute top-0 text-[#FFD600] font-bold whitespace-nowrap max-w-full overflow-hidden" style={{ left: `${Math.min(item.index, Math.max(width - 1, 0))}ch` }}>
                      {transposeChord(item.chord, transpose)}
                    </span>
                  ))}
                </div>
                <div className="whitespace-pre-wrap break-words leading-6 min-h-6 text-white">{line.lyrics || '\u00A0'.repeat(width)}</div>
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
            <button
              onClick={toggleAutoScroll}
              className="w-12 h-12 rounded-full bg-[#FFD600] text-black flex items-center justify-center active:scale-95 transition-transform"
              aria-label={playing ? 'Pause auto scroll' : 'Start auto scroll'}
              title={playing ? 'Pause auto scroll' : 'Start auto scroll'}
            >
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
