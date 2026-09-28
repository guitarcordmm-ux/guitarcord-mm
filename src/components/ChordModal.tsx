import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Minus, Plus, Music, Share2, Check, Guitar, Download, Image as ImageIcon, Sun, SunMedium } from 'lucide-react';
import type { Song, User } from '../types';
import { transposeLyrics } from '../lib/transpose';
import { ChordDiagram } from './ChordDiagram';
import { CHORD_DATABASE } from '../lib/chords';
import { exportSongAsJpg } from '../lib/songExport';
import { ChordEditor } from './ChordEditor';


interface Props {
  song: Song;
  onClose: () => void;
  isAdmin?: boolean;
  user?: User | null;
}

export function ChordModal({ song, onClose, isAdmin, user }: Props) {
  const [transpose, setTranspose] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isScreenAwake, setIsScreenAwake] = useState(false);

  // Extract unique chords for diagrams
  const uniqueChords = useMemo(() => {
    if (!song.lyrics) return [];
    const chords = new Set<string>();
    const matches = song.lyrics.match(/\[([^\]]+)\]/g);
    if (matches) {
      matches.forEach(m => {
        const chordName = m.slice(1, -1);
        chords.add(chordName);
      });
    }
    return Array.from(chords);
  }, [song.lyrics]);

  // Keep screen awake while reading chord sheets (vital for mobile guitarists)
  useEffect(() => {
    type ScreenWakeLockSentinel = { release: () => Promise<void>; addEventListener: (type: 'release', listener: () => void) => void };
    let sentinel: ScreenWakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          sentinel = await (navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<ScreenWakeLockSentinel> } }).wakeLock?.request('screen');
          setIsScreenAwake(true);
          sentinel.addEventListener('release', () => {
            setIsScreenAwake(false);
          });
        } catch {
          // Ignored if unsupported or restricted
        }
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !sentinel) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sentinel) {
        sentinel.release().catch(() => {});
      }
    };
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSongAsJpg(song, transpose);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${song.songTitle} - GuitarChordsMM`,
        text: `Check out the guitar chords for ${song.songTitle} by ${song.artist}`,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const renderedLyrics = useMemo(() => {
    if (!song.lyrics) return null;
    
    const transposedLyrics = transposeLyrics(song.lyrics, transpose);
    // Simple parser: strings like [C] or [Am] become highlighted chords
    const lines = transposedLyrics.split('\n');
    return lines.map((line, idx) => {
      if (line.trim() === '') {
        return <div key={idx} className="h-4"></div>;
      }
      
      const parts = line.split(/(\[[^[\]]+\])/g);
      const chunks = [];
      let currentChord = null;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.startsWith('[') && part.endsWith(']')) {
          if (currentChord !== null) {
            chunks.push({ chord: currentChord, text: "" });
          }
          currentChord = part.slice(1, -1);
        } else {
          // Split by spaces to allow individual words to wrap with their chords
          const segments = part.split(/(\s+)/g);
          segments.forEach((seg, sIdx) => {
            if (seg === "") return;
            chunks.push({ 
              chord: (sIdx === 0) ? currentChord : null, 
              text: seg 
            });
          });
          currentChord = null;
        }
      }
      if (currentChord !== null) {
        chunks.push({ chord: currentChord, text: "" });
      }

      return (
        <div key={idx} className="flex flex-wrap items-end leading-[1.4] text-[14px] sm:text-[18px]" style={{ minHeight: '2.8rem', paddingBottom: '0.3rem', paddingTop: '0.8rem' }}>
          {chunks.map((c, i) => (
            <div key={i} className="flex flex-col justify-end min-w-0 mr-[0.3em] mb-1">
              {c.chord ? (
                <span className="text-[#FFD600] font-bold h-[1.5rem] mb-[0.1em] text-[12px] sm:text-[15px] whitespace-nowrap bg-white/[0.04] px-1.5 rounded-md w-fit">
                  {c.chord}
                </span>
              ) : (
                <span className="h-[1.5rem] mb-[0.1em]" />
              )}
              <span className="whitespace-pre px-0.5">{c.text}</span>
            </div>
          ))}
        </div>
      );
    });
  }, [song.lyrics, transpose]);

  return (
    <>
      <div className="fixed inset-0 bg-black z-50 overflow-y-auto pb-safe">
        <div className="sticky top-0 bg-black/95 backdrop-blur-md z-10 px-4 pt-safe pb-3.5 flex items-center justify-between border-b border-white/10">
          <button onClick={onClose} className="flex items-center gap-1 text-[#FFD600] py-1 pr-2 active:opacity-70 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
            <span className="text-[16px] font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            {isScreenAwake && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10" title="Screen keep-awake active">
                <Sun className="w-3 h-3 text-[#FFD600]" />
                <span>Keep Awake</span>
              </span>
            )}

            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="text-white p-2 rounded-full bg-white/10 active:bg-white/20 transition-all flex items-center gap-1.5 px-3 hover:bg-white/15"
              title="Save as Image"
            >
              {isExporting ? <Check className="w-4 h-4 text-yellow-400" /> : <ImageIcon className="w-4 h-4" />}
              <span className="text-xs font-medium hidden md:inline">{isExporting ? 'Saved' : 'Save Image'}</span>
            </button>

            <button 
              onClick={handleShare}
              className="text-white p-2 rounded-full bg-white/10 active:bg-white/20 transition-all flex items-center gap-1.5 px-3"
              title="Share Song"
            >
              {copied ? <Check className="w-4 h-4 text-yellow-400" /> : <Share2 className="w-4 h-4" />}
              <span className="text-xs font-medium hidden md:inline">Share</span>
            </button>

            {isAdmin && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-white p-2 rounded-full bg-white/10 hover:bg-yellow-500/20 hover:text-yellow-400 active:bg-white/20 transition-all flex items-center gap-1.5 px-3 border border-white/5 hover:border-yellow-400/30"
                title="Edit Song"
              >
                <Music className="w-4 h-4" />
                <span className="text-xs font-medium hidden md:inline">Edit</span>
              </button>
            )}

            <div className="flex items-center bg-white/10 rounded-full px-1.5 py-0.5">
              <button 
                onClick={() => setTranspose(t => t - 1)} 
                className="text-white p-1 hover:bg-white/10 rounded-full transition-colors active:scale-95"
                title="Transpose Down"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1 px-1.5 min-w-[2.5rem] justify-center">
                <Music className="w-3 h-3 text-[#FFD600]" />
                <span className="text-[12px] font-bold tabular-nums">
                  {transpose > 0 ? `+${transpose}` : transpose}
                </span>
              </div>
              <button 
                onClick={() => setTranspose(t => t + 1)} 
                className="text-white p-1 hover:bg-white/10 rounded-full transition-colors active:scale-95"
                title="Transpose Up"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="px-3 sm:px-5 py-6">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">{song.songTitle}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <p className="text-white/60 text-lg">{song.artist}</p>
            {song.composer && (
              <p className="text-white/40 text-sm italic">
                • တေးရေး: {song.composer}
              </p>
            )}
          </div>
          
          {song.imageURL && !song.imageURL.includes('picsum.photos') && (
            <div className="mb-6">
              <img src={song.imageURL} alt="Chords" className="w-full rounded-xl object-contain bg-white/5" crossOrigin="anonymous" />
            </div>
          )}

          {song.tutorialURL && (
            <div className="mb-6">
              <a
                href={song.tutorialURL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-[#FFD600] hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Watch Tutorial
              </a>
            </div>
          )}

          <div className="relative font-mono mt-4 text-white overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
            {/* Discreet single watermark */}
            {song.isWatermarked !== false && (
              <div className="absolute bottom-4 right-4 pointer-events-none opacity-[0.1] select-none z-0">
                <span className="text-[10px] font-black tracking-widest uppercase">
                  GUITARCORDMM
                </span>
              </div>
            )}

            <div className="relative z-10 p-3 sm:p-6">
              {song.isWatermarked !== false && (
                <div className="mb-6 flex items-center gap-2 opacity-10 select-none">
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-white/40">Verified Library</span>
                  <div className="h-[1px] flex-1 bg-white/10" />
                </div>
              )}
              {song.lyrics && typeof song.lyrics === 'string' && song.lyrics.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) ? (
                <img src={song.lyrics} alt="Lyrics Sheet" className="w-full rounded-xl object-contain bg-white/5" crossOrigin="anonymous" />
              ) : (
                renderedLyrics || (!song.imageURL || song.imageURL.includes('picsum.photos') ? "No content available" : null)
              )}
            </div>
          </div>

          {uniqueChords.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#FFD600]/10 flex items-center justify-center">
                  <Guitar className="w-4 h-4 text-[#FFD600]" />
                </span>
                Chord Diagrams
              </h3>
              <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 no-scrollbar -mx-3 sm:-mx-5 px-3 sm:px-5">
                {uniqueChords.map(chord => {
                  let data = null;
                  const root = chord.charAt(0);
                  const suffix = chord.substring(1);
                  
                  if (CHORD_DATABASE[root]) {
                    data = CHORD_DATABASE[root][suffix || 'Maj'] || CHORD_DATABASE[root]['Maj'];
                  }

                  if (!data) return null;

                  return (
                    <div key={chord} className="flex-shrink-0 flex flex-col items-center">
                      <ChordDiagram name={chord} data={data} isLight={false} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-12 py-8 border-t border-white/5 flex flex-col items-center">
            <p className="text-white/20 text-xs font-mono tracking-widest uppercase">Watermark</p>
            <p className="text-[#FFD600]/30 text-lg font-bold tracking-tighter mt-1 hover:text-[#FFD600]/50 transition-colors">
              guitarcordmm.com
            </p>
          </div>
        </div>
      </div>
      {isEditing && (
        <ChordEditor 
          onClose={() => setIsEditing(false)}
          initialSongData={song}
          isAdmin={true}
          user={user}
        />
      )}
    </>
  );
}
