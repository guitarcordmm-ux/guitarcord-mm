import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, Music2, Pause, Play } from 'lucide-react';
import type { Song } from '../../../types';
import { ChordLyricsLine } from './ChordLyricsLine';

type ParsedLine = {
  lyrics: string;
  chords: { chord: string; index: number }[];
};

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
  };
};

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
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const [playing, setPlaying] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [speed, setSpeed] = useState(1);

  const parsed = useMemo(
    () => (song.lyrics || '').split('\n').map(parseLyricsLine),
    [song.lyrics],
  );
  const baseKey = useMemo(() => detectBaseKey(parsed), [parsed]);
  const currentKey = useMemo(
    () => (baseKey ? transposeChord(baseKey, transpose) : '—'),
    [baseKey, transpose],
  );

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

  useEffect(() => {
    const releaseWakeLock = async () => {
      const sentinel = wakeLockRef.current;
      wakeLockRef.current = null;
      if (!sentinel) return;
      try {
        if (!sentinel.released) await sentinel.release();
      } catch {
        // Wake Lock can already be released by the browser/OS.
      }
    };

    if (!playing || !('wakeLock' in navigator)) {
      void releaseWakeLock();
      return;
    }

    let cancelled = false;

    const acquireWakeLock = async () => {
      try {
        const wakeLockNavigator = navigator as NavigatorWithWakeLock;
        const sentinel = await wakeLockNavigator.wakeLock?.request('screen');
        if (!sentinel || cancelled) {
          if (sentinel && !sentinel.released) await sentinel.release();
          return;
        }

        wakeLockRef.current = sentinel;
        sentinel.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch {
        // Unsupported or denied: auto-scroll still works normally.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && playing && !wakeLockRef.current) {
        void acquireWakeLock();
      }
    };

    void acquireWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void releaseWakeLock();
    };
  }, [playing]);

  useEffect(() => () => {
    const sentinel = wakeLockRef.current;
    wakeLockRef.current = null;
    if (sentinel && !sentinel.released) void sentinel.release();
  }, []);

  const resetTranspose = () => setTranspose(0);
  const decreaseKey = () => setTranspose(value => Math.max(-11, value - 1));
  const increaseKey = () => setTranspose(value => Math.min(11, value + 1));

  const toggleAutoScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    if (!playing && el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
      el.scrollTop = 0;
    }

    setPlaying(value => !value);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 px-5 pt-safe pt-3 pb-3 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto max-w-xl flex items-center gap-3">
          <button onClick={() => navigate('/app')} aria-label="Back" className="w-10 h-10 rounded-full bg-white/5 grid place-items-center active:scale-95">
            <ChevronLeft size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold truncate">{song.songTitle}</div>
            <div className="text-[11px] text-white/45 truncate">{song.artist}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 pt-5 pb-64">
        <section className="rounded-2xl border border-white/10 bg-[#111113] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">Original Key</div>
              <div className="mt-1 text-sm font-semibold">{baseKey || 'Not detected'}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">Current Key</div>
              <div className="mt-1 text-lg font-black text-[#FFD600]">{currentKey}</div>
            </div>
          </div>
        </section>

        <div
          ref={scrollRef}
          className="mt-3 max-h-[calc(100vh-255px)] min-h-[58vh] overflow-y-auto rounded-2xl bg-[#080809] border border-white/5 px-4 py-6 overscroll-contain"
        >
          {parsed.length ? (
            parsed.map((line, i) => (
              <ChordLyricsLine
                key={i}
                line={line.lyrics}
                transpose={chord => transposeChord(chord, transpose)}
                className="mb-5 last:mb-0"
              />
            ))
          ) : (
            <div className="py-10 text-center text-sm text-white/35">
              No lyrics have been published for this song yet.
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur-xl pb-safe">
        <div className="mx-auto max-w-xl px-4 pt-3 pb-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <button
              type="button"
              onClick={decreaseKey}
              aria-label="Lower key"
              className="min-h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-bold active:scale-95"
            >
              <Minus size={17} />
              Key
            </button>

            <button
              type="button"
              onClick={resetTranspose}
              className="min-w-16 min-h-12 rounded-2xl bg-[#FFD600] text-black px-3 active:scale-95"
              aria-label="Reset to original key"
            >
              <div className="text-[9px] uppercase font-black tracking-[0.12em]">Key</div>
              <div className="text-lg font-black leading-none mt-0.5">{currentKey}</div>
            </button>

            <button
              type="button"
              onClick={increaseKey}
              aria-label="Raise key"
              className="min-h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-bold active:scale-95"
            >
              <Plus size={17} />
              Key
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={toggleAutoScroll}
              className="w-14 h-14 flex-shrink-0 rounded-full bg-[#FFD600] text-black flex items-center justify-center active:scale-95 transition-transform shadow-[0_8px_30px_rgba(255,214,0,.14)]"
              aria-label={playing ? 'Pause auto scroll' : 'Start auto scroll'}
              title={playing ? 'Pause auto scroll' : 'Start auto scroll'}
            >
              {playing ? <Pause size={22} /> : <Play size={22} className="fill-black" />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[10px] text-white/45">
                <span>{playing ? 'Auto Scroll On' : 'Auto Scroll'}</span>
                <span>{speed.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="mt-1 w-full accent-yellow-400"
                aria-label="Scroll speed"
              />
            </div>

            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-white/35">
              <Music2 size={18} />
            </div>
          </div>

          <div className="mt-2 text-center text-[9px] text-white/25">
            {playing ? 'Screen stays awake while Auto Scroll is running when supported.' : 'Tap ▶ to start hands-free scrolling.'}
          </div>
        </div>
      </div>
    </div>
  );
}
