export interface ChordFingerings {
  frets: number[];
  fingers?: number[];
  barres?: number[];
  capo?: boolean;
  baseFret?: number;
}

/**
 * Guitar chord library for standard tuning: E-A-D-G-B-E.
 *
 * Supported families cover the most common international chord symbols used in
 * songbooks and guitar charts: major, minor, dominant 7, maj7, m7, sus2,
 * sus4, add9, 6, m6, 9, m9, diminished and augmented.
 *
 * Frets are absolute fret numbers. -1 = muted string, 0 = open string.
 */

export const CHORD_ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export const CHORD_SUFFIXES = [
  'Maj', 'Min', '7', 'maj7', 'min7', 'sus2', 'sus4', 'add9', '6', 'min6', '9', 'min9', 'dim', 'aug',
] as const;

export const CHORD_LABELS: Record<string, string> = {
  Maj: 'Major',
  Min: 'Minor',
  '7': 'Dominant 7th',
  maj7: 'Major 7th',
  min7: 'Minor 7th',
  sus2: 'Suspended 2nd',
  sus4: 'Suspended 4th',
  add9: 'Add 9',
  '6': 'Major 6th',
  min6: 'Minor 6th',
  '9': 'Dominant 9th',
  min9: 'Minor 9th',
  dim: 'Diminished',
  aug: 'Augmented',
};

const ROOT_FRET: Record<string, number> = {
  C: 3, 'C#': 4, D: 5, Eb: 6, E: 7, F: 8, 'F#': 9, G: 10, Ab: 11, A: 12, Bb: 13, B: 14,
};

const E_SHAPES: Record<string, ChordFingerings> = {
  Maj: { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  Min: { frets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1], barres: [1] },
  '7': { frets: [0, 2, 0, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1], barres: [1] },
  maj7: { frets: [0, 2, 1, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1], barres: [1] },
  min7: { frets: [0, 2, 0, 0, 0, 0], fingers: [1, 3, 1, 1, 1, 1], barres: [1] },
  sus2: { frets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1], barres: [1] },
  sus4: { frets: [0, 2, 2, 2, 0, 0], fingers: [1, 2, 3, 4, 1, 1], barres: [1] },
  add9: { frets: [0, 2, 4, 1, 0, 0], fingers: [1, 2, 4, 1, 1, 1], barres: [1] },
  '6': { frets: [0, 2, 2, 1, 2, 0], fingers: [1, 2, 3, 1, 4, 1], barres: [1] },
  min6: { frets: [0, 2, 2, 0, 2, 0], fingers: [1, 3, 4, 1, 2, 1], barres: [1] },
  '9': { frets: [0, 2, 0, 1, 0, 2], fingers: [1, 3, 1, 2, 1, 4], barres: [1] },
  min9: { frets: [0, 2, 0, 0, 0, 2], fingers: [1, 3, 1, 1, 1, 4], barres: [1] },
  dim: { frets: [0, 1, 2, 0, 2, 0], fingers: [1, 2, 3, 1, 4, 1], barres: [1] },
  aug: { frets: [0, 2, 2, 1, 1, 0], fingers: [1, 3, 4, 2, 2, 1], barres: [1] },
};

const A_SHAPES: Record<string, ChordFingerings> = {
  Maj: { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 1, 2, 3, 4, 0] },
  Min: { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 1, 3, 4, 2, 1] },
  '7': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 1, 2, 1, 3, 1] },
  maj7: { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 1, 3, 2, 4, 1] },
  min7: { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 1, 3, 1, 2, 1] },
  sus2: { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 1, 3, 4, 1, 1] },
  sus4: { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 1, 2, 2, 3, 0] },
  add9: { frets: [-1, 0, 2, 4, 2, 0], fingers: [0, 1, 2, 4, 3, 1] },
  '6': { frets: [-1, 0, 2, 2, 2, 2], fingers: [0, 1, 2, 3, 4, 4] },
  min6: { frets: [-1, 0, 2, 2, 1, 2], fingers: [0, 1, 3, 4, 2, 4] },
  '9': { frets: [-1, 0, 2, 0, 2, 2], fingers: [0, 1, 2, 1, 3, 4] },
  min9: { frets: [-1, 0, 2, 0, 1, 2], fingers: [0, 1, 3, 1, 2, 4] },
  dim: { frets: [-1, 0, 1, 2, 1, 2], fingers: [0, 1, 2, 3, 1, 4] },
  aug: { frets: [-1, 0, 3, 2, 2, 1], fingers: [0, 1, 4, 2, 3, 1] },
};

function shiftShape(shape: ChordFingerings, baseFret: number): ChordFingerings {
  return {
    frets: shape.frets.map(fret => fret < 0 ? -1 : fret === 0 ? baseFret : baseFret + fret - 1),
    fingers: shape.fingers,
    barres: shape.barres?.map(fret => baseFret + fret - 1),
    baseFret,
  };
}

const OPEN: Record<string, Record<string, ChordFingerings>> = {
  C: {
    Maj: { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    Min: { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barres: [3], baseFret: 3 },
    '7': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
    maj7: { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
    min7: { frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], barres: [3], baseFret: 3 },
    sus2: { frets: [-1, 3, 0, 0, 1, 3], fingers: [0, 3, 0, 0, 1, 4] },
    sus4: { frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },
    add9: { frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 3, 2, 0, 4, 0] },
    '6': { frets: [-1, 3, 2, 2, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
    min6: { frets: [-1, 3, 2, 2, 1, 3], fingers: [0, 2, 1, 3, 1, 4] },
    '9': { frets: [-1, 3, 2, 3, 3, 3], fingers: [0, 2, 1, 3, 4, 4], barres: [3], baseFret: 3 },
    dim: { frets: [-1, 2, 3, 1, 3, 1], fingers: [0, 2, 3, 1, 4, 1] },
    aug: { frets: [-1, 3, 2, 1, 1, 0], fingers: [0, 3, 2, 1, 1, 0] },
  },
  D: {
    Maj: { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    Min: { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
    '7': { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
    maj7: { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1], barres: [2] },
    min7: { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], barres: [1] },
    sus2: { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0] },
    sus4: { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 3, 4] },
    add9: { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0] },
    '6': { frets: [-1, -1, 0, 2, 0, 2], fingers: [0, 0, 0, 1, 0, 2] },
  },
  E: E_SHAPES,
  G: {
    Maj: { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    Min: { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barres: [3], baseFret: 3 },
    '7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
    sus4: { frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4] },
  },
  A: A_SHAPES,
};

function makeChord(root: string, suffix: string): ChordFingerings {
  const open = OPEN[root]?.[suffix];
  if (open) return open;

  // Use A-form for flatter/lower-position roots and E-form elsewhere.
  const semitone = CHORD_ROOTS.indexOf(root as typeof CHORD_ROOTS[number]);
  const useA = ['C', 'C#', 'D', 'Eb', 'F', 'F#'].includes(root);
  const shape = (useA ? A_SHAPES[suffix] : E_SHAPES[suffix]) || E_SHAPES.Maj;
  const base = useA ? ROOT_FRET[root] - 2 : ROOT_FRET[root] - 3;
  return shiftShape(shape, Math.max(1, base + (semitone > 11 ? 0 : 0)));
}

export const CHORD_DATABASE: Record<string, Record<string, ChordFingerings>> = Object.fromEntries(
  CHORD_ROOTS.map(root => [
    root,
    Object.fromEntries(CHORD_SUFFIXES.map(suffix => [suffix, makeChord(root, suffix)])),
  ]),
);
