import React from 'react';
import { motion } from 'motion/react';
import { ChordFingerings } from '../lib/chords';

interface ChordDiagramProps {
  name: string;
  data: ChordFingerings;
  isLight?: boolean;
}

export function ChordDiagram({ name, data, isLight = false }: ChordDiagramProps) {
  const colors = {
    bg: isLight ? 'transparent' : 'rgba(255,255,255,0.03)',
    border: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)',
    text: isLight ? '#000' : '#fff',
    subtext: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
    active: isLight ? '#000' : '#3b82f6',
    string: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
  };

  const displayFrets = 5;
  const baseFret = data.baseFret || 1;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group p-4 rounded-[20px] transition-all duration-500 border ${
        isLight ? 'bg-transparent border-black/10' : 'bg-white/5 border-white/5 shadow-xl'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-black tracking-tighter" style={{ color: colors.text }}>{name}</h4>
          {baseFret > 1 && (
            <p className="text-[7px] font-black uppercase tracking-widest" style={{ color: colors.subtext }}>
              Fret {baseFret}
            </p>
          )}
        </div>
      </div>

      <div className="relative flex justify-center py-2">
        <div className="relative w-24 h-32 border-l-2 border-r-2 border-b-2" style={{ borderColor: colors.string }}>
          {/* Nut or First Fret */}
          {baseFret === 1 && (
            <div className="absolute -top-1.5 left-[-2px] right-[-2px] h-1.5 bg-black/40" style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }} />
          )}

          {/* Frets */}
          {Array.from({ length: displayFrets - 1 }).map((_, i) => (
            <div key={i} className="absolute w-full h-[1px]" style={{ top: `${((i + 1) / (displayFrets - 1)) * 100}%`, backgroundColor: colors.string }} />
          ))}
          {/* Strings */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="absolute h-full w-[1px]" style={{ left: `${((i + 1) / 5) * 100}%`, backgroundColor: colors.string }} />
          ))}

          {/* Dots */}
          {data.frets.map((fret, stringIdx) => {
            if (fret <= 0) return null;
            const displayFret = fret - (baseFret > 1 ? baseFret - 1 : 0);
            if (displayFret < 1 || displayFret > displayFrets) return null;

            return (
              <div
                key={stringIdx}
                className="absolute w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                style={{
                  left: `${(stringIdx / 5) * 100}%`,
                  top: `${((displayFret - 0.5) / (displayFrets - 1)) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: colors.active,
                  color: (isLight && colors.active === '#000') ? '#fff' : '#000',
                  zIndex: 10
                }}
              >
                {data.fingers?.[stringIdx] || ''}
              </div>
            );
          })}

          {/* Barre chords */}
          {data.barres && data.barres.map((bfret, idx) => {
            const relativeFret = bfret - (baseFret > 1 ? baseFret - 1 : 0);
             return (
              <div 
                key={idx}
                className="absolute h-2.5 rounded-full z-0"
                style={{ 
                  top: `${((relativeFret - 0.5) / (displayFrets - 1)) * 100}%`, 
                  left: '5%', 
                  right: '5%',
                  backgroundColor: colors.active,
                  opacity: 0.3,
                  transform: 'translateY(-50%)'
                }}
              />
            );
          })}

          {/* Open/Mute indicators */}
          {data.frets.map((fret, stringIdx) => (
            <div
              key={`meta-${stringIdx}`}
              className="absolute -top-6 text-[10px] font-black"
              style={{
                left: `${(stringIdx / 5) * 100}%`,
                transform: 'translateX(-50%)',
                color: colors.subtext
              }}
            >
              {fret === 0 ? 'O' : fret === -1 ? 'X' : ''}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
