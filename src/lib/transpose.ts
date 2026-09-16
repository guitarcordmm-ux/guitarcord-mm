
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function transposeChord(chord: string, semitones: number): string {
  // Regex to match the base note and the rest of the chord (e.g., C#m7 -> C#, m7)
  const chordRegex = /^([A-G][#b]?)(.*)$/;
  const match = chord.match(chordRegex);
  
  if (!match) return chord;
  
  const baseNote = match[1];
  const suffix = match[2];
  
  let index = notes.indexOf(baseNote);
  if (index === -1) index = flatNotes.indexOf(baseNote);
  
  if (index === -1) return chord;
  
  let newIndex = (index + semitones) % 12;
  while (newIndex < 0) newIndex += 12;
  
  // Use sharps by default, but we could make this configurable
  return notes[newIndex] + suffix;
}

export function transposeLyrics(lyrics: string, semitones: number): string {
  if (semitones === 0) return lyrics;
  
  // Matches chords inside square brackets: [C], [Am7], [F#]
  return lyrics.replace(/\[([^\]]+)\]/g, (match, chord) => {
    // Handle slashed chords like [C/E]
    if (chord.includes('/')) {
      const parts = chord.split('/');
      const transposedParts = parts.map((p: string) => transposeChord(p.trim(), semitones));
      return `[${transposedParts.join('/')}]`;
    }
    return `[${transposeChord(chord, semitones)}]`;
  });
}
