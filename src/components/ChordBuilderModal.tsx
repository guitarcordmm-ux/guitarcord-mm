import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Eraser, Trash2, Eye } from 'lucide-react';
import { ChordFingerings } from '../lib/chords';
import { ChordDiagram } from './ChordDiagram';

interface ChordBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, data: ChordFingerings) => void;
  initialName?: string;
  initialData?: ChordFingerings;
}

export function ChordBuilderModal({ isOpen, onClose, onSave, initialName = '', initialData }: ChordBuilderModalProps) {
  const [name, setName] = useState(initialName);
  const [frets, setFrets] = useState<number[]>(initialData?.frets || [0, 0, 0, 0, 0, 0]);
  const [fingers, setFingers] = useState<number[]>(initialData?.fingers || [0, 0, 0, 0, 0, 0]);
  const [baseFret, setBaseFret] = useState(initialData?.baseFret || 1);
  const [selectedFinger, setSelectedFinger] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleFret = (stringIdx: number, fretIdx: number) => {
    const newFrets = [...frets];
    const newFingers = [...fingers];
    
    if (newFrets[stringIdx] === fretIdx) {
      // Toggle off
      newFrets[stringIdx] = 0;
      newFingers[stringIdx] = 0;
    } else {
      // Toggle on
      newFrets[stringIdx] = fretIdx;
      newFingers[stringIdx] = selectedFinger;
    }
    
    setFrets(newFrets);
    setFingers(newFingers);
  };

  const toggleStringState = (stringIdx: number) => {
    const newFrets = [...frets];
    const newFingers = [...fingers];
    
    if (newFrets[stringIdx] === 0) {
      newFrets[stringIdx] = -1; // Mute
    } else if (newFrets[stringIdx] === -1) {
      newFrets[stringIdx] = 0; // Open
    } else {
      newFrets[stringIdx] = 0;
      newFingers[stringIdx] = 0;
    }
    
    setFrets(newFrets);
    setFingers(newFingers);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage('Please enter a chord name (e.g. Amaj9)');
      return;
    }
    onSave(name.trim(), {
      frets,
      fingers: fingers.some(f => f > 0) ? fingers : undefined,
      baseFret: baseFret > 1 ? baseFret : undefined
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pt-safe pb-safe">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#111] border border-white/10 w-full max-w-xl max-h-full overflow-y-auto rounded-[32px] shadow-2xl flex flex-col md:flex-row no-scrollbar"
      >
        {/* Left Side: Controls */}
        <div className="p-8 flex-1 border-r border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
              Chord <span className="text-yellow-400">Builder</span>
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Chord Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-yellow-400/50"
                placeholder="e.g. Amaj9"
              />
              {errorMessage && (
                <p className="text-yellow-400 text-xs mt-1 ml-2 font-medium">{errorMessage}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Starting Fret</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="12" 
                  value={baseFret}
                  onChange={(e) => setBaseFret(parseInt(e.target.value))}
                  className="flex-1 accent-yellow-500"
                />
                <span className="text-white font-black text-xl w-8 text-center">{baseFret}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Finger Selection</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 'T'].map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFinger(typeof f === 'string' ? 5 : f)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all border ${
                      (typeof f === 'string' ? selectedFinger === 5 : selectedFinger === f)
                        ? 'bg-yellow-500 border-yellow-400 text-white shadow-lg' 
                        : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-yellow-400 hover:text-white transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Chord
            </button>
            <button
              onClick={() => {
                setFrets([0, 0, 0, 0, 0, 0]);
                setFingers([0, 0, 0, 0, 0, 0]);
              }}
              className="p-4 bg-white/5 text-white/40 hover:text-yellow-500 rounded-2xl border border-white/5 transition-all"
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side: Virtual Fretboard & Preview */}
        <div className="bg-black/40 p-8 flex flex-col items-center justify-center min-w-[280px] border-l border-white/5">
          <div className="mb-8 w-full">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Visual Preview</span>
            </div>
            <div className="bg-white/5 rounded-3xl p-4 flex justify-center">
              <ChordDiagram 
                name={name || 'Chord'} 
                data={{ 
                  frets, 
                  fingers: fingers.some(f => f > 0) ? fingers : undefined, 
                  baseFret: baseFret > 1 ? baseFret : undefined 
                }} 
              />
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Edit Fretboard</span>
            </div>
            {/* String Headers */}
            <div className="absolute -top-10 left-0 right-0 flex justify-between px-2">
                {frets.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => toggleStringState(i)}
                    className="w-6 text-[10px] font-black text-center transition-colors"
                    style={{ color: f === -1 ? '#ef4444' : f === 0 ? '#22c55e' : 'rgba(255,255,255,0.2)' }}
                  >
                    {f === -1 ? 'X' : f === 0 ? 'O' : ''}
                  </button>
                ))}
            </div>

            <div className="w-40 h-64 border-l-2 border-r-2 border-white/20 relative">
              {/* Nut */}
              <div className={`absolute -top-0.5 inset-x-0 h-1 bg-white/80 z-10 ${baseFret > 1 ? 'hidden' : ''}`} />
              
              {/* Horizontal Frets */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute inset-x-0 h-[1px] bg-white/10" style={{ top: `${(i + 1) * 20}%` }} />
              ))}

              {/* Vertical Strings */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="absolute h-full w-[1px] bg-white/10" style={{ left: `${(i + 1) * 20}%` }} />
              ))}

              {/* Interactive Cells */}
              <div className="absolute inset-0 grid grid-cols-6 items-stretch">
                {[...Array(6)].map((_, stringIdx) => (
                  <div key={stringIdx} className="flex flex-col">
                    {[...Array(5)].map((_, fretRowIdx) => (
                      <div 
                        key={fretRowIdx} 
                        className="flex-1 flex items-center justify-center cursor-pointer group"
                        onClick={() => toggleFret(stringIdx, fretRowIdx + 1)}
                      >
                        {frets[stringIdx] === (fretRowIdx + 1) ? (
                          <motion.div 
                            layoutId={`dot-${stringIdx}`}
                            className="w-6 h-6 rounded-full bg-yellow-400 shadow-xl border-2 border-yellow-400 flex items-center justify-center text-[10px] font-black text-white"
                          >
                            {fingers[stringIdx] === 5 ? 'T' : fingers[stringIdx]}
                          </motion.div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
