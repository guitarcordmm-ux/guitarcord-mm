import React, { useState, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Eye, Type, Music, List, ChevronLeft, Plus, Minus, Guitar, Lock, Globe, Save } from 'lucide-react';
import type { Song, User } from '../types';
import { ChordBuilderModal } from './ChordBuilderModal';
import { ChordFingerings } from '../lib/chords';
import { insertSong, updateSong } from '../services/songs/songService';
import { transposeLyrics } from '../lib/transpose';

interface ChordEditorProps {
  onClose: () => void;
  onSubmit?: (data: { title: string, artist: string, imageURL: string, lyrics: string }) => Promise<void>;
  initialContent?: string;
  initialSongData?: Partial<Song>;
  user?: User | null;
  isAdmin?: boolean;
}

export function ChordEditor({ onClose, onSubmit, initialContent = '', initialSongData, user, isAdmin }: ChordEditorProps) {
  const [title, setTitle] = useState(initialSongData?.songTitle || '');
  const [artist, setArtist] = useState(initialSongData?.artist || '');
  const [composer, setComposer] = useState(initialSongData?.composer || '');
  const [genre, setGenre] = useState(initialSongData?.genre || '');
  const [searchAliases, setSearchAliases] = useState((initialSongData?.searchAliases || []).join(', '));
  const [language, setLanguage] = useState(initialSongData?.language || 'my');
  const [difficulty, setDifficulty] = useState<'easy' | 'intermediate' | 'advanced'>(
    initialSongData?.difficulty === 'easy' || initialSongData?.difficulty === 'advanced'
      ? initialSongData.difficulty
      : 'intermediate'
  );
  const [imageURL, setImageURL] = useState(initialSongData?.imageURL || '');
  const [keyType, setKeyType] = useState<'Major' | 'Minor'>('Major');
  const [enforceWatermark, setEnforceWatermark] = useState(initialSongData?.isWatermarked ?? true);
  const [content, setContent] = useState(
    initialSongData?.lyrics || initialContent || '[C]ချစ်သူရေ [Am]ကိုယ်တို့ရဲ့\n[F]အနာဂတ်ကို [G]ဖန်တီကြမယ်'
  );
  
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [transpose, setTranspose] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showStatus = (message: string, type: 'success' | 'error' = 'success') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 3000);
  };
  
  const insertTextAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + text);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = content.substring(0, start) + text + content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const handleInsertQuickChord = (chord: string) => {
    insertTextAtCursor(`[${chord}]`);
  };

  const handleAdminUpdate = async () => {
    if (!initialSongData?.id) return;
    try {
      await updateSong(initialSongData.id, {
        songTitle: title.trim(),
        title: title.trim(),
        artist: artist.trim(),
        composer: composer.trim(),
        genre: genre.trim(),
        imageURL: imageURL.trim(),
        lyrics: content,
        isWatermarked: enforceWatermark,
        searchAliases: searchAliases.split(',').map(value => value.trim()).filter(Boolean),
        language,
        difficulty,
      });
      showStatus('Updated successfully!');
      setTimeout(onClose, 1000);
    } catch (error) {
      console.error('Admin update failed:', error);
      showStatus('Update failed', 'error');
    }
  };

  const handleSavePrivate = async () => {
    if (!title.trim()) {
      showStatus('Please enter a song title', 'error');
      return;
    }

    try {
      await insertSong({
        songTitle: title.trim(),
        title: title.trim(),
        artist: artist.trim(),
        composer: composer.trim(),
        imageURL: imageURL.trim(),
        lyrics: content,
        isWatermarked: enforceWatermark,
        searchAliases: searchAliases.split(',').map(value => value.trim()).filter(Boolean),
        language,
        difficulty,
        userId: user?.uid,
        userEmail: user?.email,
        status: 'private',
      });
      showStatus('Saved successfully to private library!');
    } catch (error) {
      console.error('Failed to save private song:', error);
      showStatus('Failed to save. Please try again.', 'error');
    }
  };

  const handleUploadPublic = async () => {
    if (!title.trim()) {
      showStatus('Please enter a song title', 'error');
      return;
    }

    try {
      await insertSong({
        songTitle: title.trim(),
        title: title.trim(),
        artist: artist.trim(),
        composer: composer.trim(),
        genre: genre.trim(),
        imageURL: imageURL.trim(),
        lyrics: content,
        isWatermarked: enforceWatermark,
        searchAliases: searchAliases.split(',').map(value => value.trim()).filter(Boolean),
        language,
        difficulty,
        userId: user?.uid,
        userEmail: user?.email,
        status: isAdmin ? 'approved' : 'pending',
      });
      showStatus(isAdmin ? 'Published to library!' : 'Sent for review successfully!');
      if (isAdmin) setTimeout(onClose, 1000);
    } catch (error) {
      console.error('Failed to submit song:', error);
      showStatus('Submission failed', 'error');
    }
  };

  const renderPreview = useMemo(() => {
    if (!content) return <div className="text-white/30 italic">Preview will appear here...</div>;
    const transposedContent = transposeLyrics(content, transpose);
    const lines = transposedContent.split('\n');
    return lines.map((line, idx) => {
      if (line.trim() === '') return <div key={idx} className="h-6"></div>;
      const parts = line.split(/(\[[^[\]]+\])/g);
      const chunks = [];
      let currentChord: string | null = null;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.startsWith('[') && part.endsWith(']')) {
          if (currentChord !== null) chunks.push({ chord: currentChord, text: "" });
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
      if (currentChord !== null) chunks.push({ chord: currentChord, text: "" });

      return (
        <div key={idx} className="flex flex-wrap items-end leading-[1.8] text-[14px] sm:text-[18px]" style={{ minHeight: '3.5rem', paddingBottom: '0.8rem', paddingTop: '1.2rem' }}>
          {chunks.map((c, i) => (
            <div key={i} className="flex flex-col justify-end min-w-0 mr-[0.3em] mb-2">
              {c.chord && (
                <span className="text-[#FFD600] font-bold h-[1.5rem] mb-[0.1em] text-[12px] sm:text-[15px] whitespace-nowrap bg-white/[0.04] px-1.5 rounded-md w-fit">
                  {c.chord}
                </span>
              )}
              {!c.chord && <span className="h-[1.5rem] mb-[0.1em]" />}
              <span className="whitespace-pre px-0.5">{c.text}</span>
            </div>
          ))}
        </div>
      );
    });
  }, [content, transpose]);

  const chordCategories: { [key: string]: string[] } = {
    Major: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    Minor: ['Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm'],
    '7th': ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7'],
    'm7': ['Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'Am7', 'Bm7'],
    'maj7': ['Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7'],
    Special: ['Cadd9', 'Gsus4', 'Asus4', 'Dsus4']
  };

  const [activeCategory, setActiveCategory] = useState<string>('Major');

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#050505] overflow-hidden font-sans w-full h-full text-white">
      <Helmet>
        <title>Editor | GuitarCordMM</title>
      </Helmet>
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-3 sm:px-6 pt-safe pb-2 sm:pb-3 border-b border-white/[0.05] bg-black/40 backdrop-blur-2xl z-50 shrink-0">
        <div className="flex items-center gap-3 pt-1">
          <button 
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-none">
              {title || 'New Song'}
            </h2>
            <div className="flex items-center gap-1.5 overflow-hidden">
               <span className="text-[10px] text-white/40 uppercase tracking-widest font-black shrink-0">Draft</span>
               {artist && <span className="text-[10px] text-[#FFD600] truncate">• {artist}</span>}
               {composer && <span className="text-[10px] text-white/40 truncate">• {composer}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {viewMode !== 'preview' && (
            <button onClick={() => setViewMode('preview')} className="p-2.5 rounded-full bg-white/5 text-white/60"><Eye className="w-5 h-5" /></button>
          )}
          {viewMode === 'preview' && (
            <button onClick={() => setViewMode('edit')} className="p-2.5 rounded-full bg-[#FFD600]/20 text-[#FFD600]"><Edit3 className="w-5 h-5" /></button>
          )}

          <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />
          <button
            onClick={isAdmin && initialSongData?.id ? handleAdminUpdate : handleUploadPublic}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
              isAdmin ? 'bg-[#FFD600] text-white shadow-[0_0_15px_rgba(255,214,0,0.3)]' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
            }`}
          >
            {isAdmin ? (
              initialSongData?.id ? <Save className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />
            ) : (
              <List className="w-3.5 h-3.5" />
            )}
            <span>
              {isAdmin 
                ? (initialSongData?.id ? 'Update Song' : 'Publish') 
                : 'Share Publicly'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden relative">
        {/* Editor Panel */}
        <div className={`flex-1 flex flex-col bg-[#050505] overflow-hidden ${viewMode === 'preview' ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar pb-32">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block ml-1">Song Title</label>
                  <input
                    type="text"
                    placeholder="e.g. ချစ်သူရေ"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 text-xl font-bold text-white placeholder-white/10 focus:outline-none focus:border-[#FFD600]/30 focus:bg-white/[0.07] transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block ml-1">Artist Name</label>
                    <input
                      type="text"
                      placeholder="e.g. ထူးအိမ်သင်"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-white/80 placeholder-white/10 focus:outline-none focus:border-[#FFD600]/30 focus:bg-white/[0.07] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block ml-1">တေးရေး (Composer)</label>
                    <input
                      type="text"
                      placeholder="e.g. ထူးအိမ်သင်"
                      value={composer}
                      onChange={(e) => setComposer(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-white/80 placeholder-white/10 focus:outline-none focus:border-[#FFD600]/30 focus:bg-white/[0.07] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block ml-1">Genre</label>
                    <input
                      type="text"
                      placeholder="e.g. Pop"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-white/80 placeholder-white/10 focus:outline-none focus:border-[#FFD600]/30 focus:bg-white/[0.07] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block ml-1">
                    Search Aliases
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ming ko chit tal, Ming Ko Chit Tal"
                    value={searchAliases}
                    onChange={(e) => setSearchAliases(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-white/80 placeholder-white/10 focus:outline-none focus:border-[#FFD600]/30 focus:bg-white/[0.07] transition-all"
                  />
                  <p className="mt-1.5 text-[10px] text-white/25">
                    Comma-separated Burmese/English spellings used by search.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block ml-1">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-white/80 focus:outline-none focus:border-[#FFD600]/30"
                    >
                      <option value="my">Myanmar</option>
                      <option value="en">English</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block ml-1">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as 'easy' | 'intermediate' | 'advanced')}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-white/80 focus:outline-none focus:border-[#FFD600]/30"
                    >
                      <option value="easy">Easy</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {isAdmin && (
                   <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block ml-1">Image URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={imageURL}
                      onChange={(e) => setImageURL(e.target.value)}
                      className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white/60 focus:outline-none focus:border-white/30 transition-all font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 pb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD600]">Lyrics & Chords</label>
                  <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/5">
                    <Type className="w-3 h-3 text-white/30 ml-1.5" />
                    <span className="text-[10px] font-bold text-white/40 mr-1.5 uppercase">Mono</span>
                  </div>
                </div>
                
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder="Insert lyrics here. Tag chords like [C] above relevant words..."
                  className="w-full min-h-[500px] bg-transparent resize-none border-none text-white/90 placeholder-white/5 focus:outline-none focus:ring-0 font-mono text-[16px] leading-[1.8] p-0"
                  spellCheck="false"
                />
              </div>
            </div>
          </div>

          {/* Sticky Mobile Chord Toolbar */}
          <div className={`fixed bottom-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-2xl border-t border-white/10 px-3 pt-3 pb-safe transform transition-transform duration-300 ${isFocused ? 'translate-y-0' : 'sm:translate-y-0 translate-y-[calc(100%+20px)]'}`}>
            <div className="max-w-4xl mx-auto flex flex-col gap-3 pb-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                  {Object.keys(chordCategories).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                        activeCategory === cat ? 'bg-[#FFD600] text-white' : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button onClick={() => setIsBuilderOpen(true)} className="shrink-0 w-9 h-9 rounded-full bg-[#FFD600]/10 flex items-center justify-center text-[#FFD600]"><Plus className="w-5 h-5" /></button>
              </div>
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {chordCategories[activeCategory].map(chord => (
                  <button
                    key={chord}
                    onClick={() => handleInsertQuickChord(chord)}
                    className="flex-shrink-0 min-w-[56px] h-11 flex items-center justify-center bg-white/10 active:bg-[#FFD600] active:text-white rounded-xl text-sm font-bold transition-all border border-white/5 shadow-lg shadow-black/20"
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`flex-1 flex flex-col bg-[#050505] overflow-hidden ${viewMode === 'edit' ? 'hidden sm:flex' : 'flex'}`}>
          <div className="h-10 border-b border-white/5 flex items-center px-6 shrink-0 hidden sm:flex">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Live Preview</span>
          </div>
          
          <div className="p-4 sm:p-12 overflow-y-auto flex-1 custom-scrollbar pb-24">
             <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title || 'Untitled'}</h1>
                    <div className="flex items-center gap-2">
                       <span className="text-white/40 text-lg">{artist || 'Artist Name'}</span>
                       {composer && <span className="text-white/30 text-sm">• တေးရေး: {composer}</span>}
                       {genre && <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest">{genre}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-white/5 rounded-2xl p-1.5 border border-white/5">
                    <button onClick={() => setTranspose(t => t - 1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors"><Minus className="w-4 h-4" /></button>
                    <div className="px-3 flex flex-col items-center min-w-[40px]">
                      <span className="text-[10px] font-black text-[#FFD600] uppercase leading-none mb-1">Key</span>
                      <span className="text-sm font-black tabular-nums">{transpose > 0 ? `+${transpose}` : transpose}</span>
                    </div>
                    <button onClick={() => setTranspose(t => t + 1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="relative font-mono text-[16px] sm:text-[18px] text-white border border-white/5 bg-white/[0.01] rounded-3xl p-6 sm:p-10 shadow-2xl">
                  {enforceWatermark && (
                    <div className="absolute bottom-6 right-8 pointer-events-none opacity-[0.08] select-none z-0">
                      <span className="text-[12px] font-black tracking-[0.4em] uppercase">GUITARCORDMM</span>
                    </div>
                  )}
                  <div className="relative z-10 space-y-1">
                    {renderPreview}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <ChordBuilderModal 
        isOpen={isBuilderOpen}
        onClose={() => { setIsBuilderOpen(false); setActiveChord(null); }}
        onSave={(name) => insertTextAtCursor(`[${name}]`)}
        initialName={activeChord || undefined}
      />

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${
              status.type === 'success' 
                ? 'bg-yellow-500/90 border-yellow-400/50 text-white' 
                : 'bg-yellow-500/90 border-yellow-400/50 text-white'
            }`}
          >
            <span className="font-semibold text-sm tracking-wide">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
