import { Song } from '../types';
import { transposeLyrics } from './transpose';

export async function exportSongAsJpg(song: Song, transpose: number = 0) {
  const scale = 3; // High resolution
  const padding = 50;
  const width = 800;
  
  const titleFont = 'bold 36px "Inter", sans-serif';
  const metadataFont = '24px "Inter", sans-serif';
  const introFont = 'italic 20px "Inter", sans-serif';
  const chordFont = 'bold 18px "Inter", sans-serif';
  const lyricsFont = '20px "Inter", sans-serif';

  // Estimate lines for height calculation
  const transposedLyrics = transposeLyrics(song.lyrics || '', transpose);
  const lines = transposedLyrics.split('\n') || [];
  const lineSpacing = 42;
  const headerHeight = 220;
  const estimatedHeight = padding + headerHeight + (lines.length * lineSpacing) + 150;
  
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = estimatedHeight * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // 1. Background - Solid White
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, estimatedHeight);

  // Wait for fonts (simple delay to ensure Inter is loaded)
  if ('fonts' in document) {
    await document.fonts.ready;
  }

  // 2. Title
  ctx.fillStyle = '#000000';
  ctx.font = titleFont;
  ctx.textAlign = 'left';
  ctx.fillText(song.songTitle, padding, padding + 40);

  // 3. Artist & Composer
  ctx.fillStyle = '#666666';
  ctx.font = metadataFont;
  let subText = song.artist;
  if (song.composer) {
    subText += `  •  တေးရေး: ${song.composer}`;
  }
  ctx.fillText(subText, padding, padding + 85);

  let y = padding + 140;

  // 4. Key
  if (song.genre) { // Using genre as a placeholder for Key if not explicitly in type yet, 
    // or just checking if Key info exists in lyrics
    ctx.fillStyle = '#333333';
    ctx.font = '20px "Inter", sans-serif';
    // If the first line of lyrics starts with "Key:", we'll handle it specially or just use context
  }

  // 5. Lyrics & Chords logic
  ctx.fillStyle = '#000000';
  
  lines.forEach(line => {
    // Check if line is a metadata line like "Key: ..." or "Intro: ..."
    if (line.trim().startsWith('Key:') || line.trim().startsWith('Intro:')) {
      ctx.font = introFont;
      ctx.fillStyle = '#333333';
      ctx.fillText(line.trim(), padding, y);
      y += lineSpacing;
      return;
    }

    if (line.trim() === '') {
      y += lineSpacing / 2;
      return;
    }

    const parts = line.split(/(\[[^\]]+\])/g);
    let x = padding;
    let lastChordEndX = 0;
    
    // Draw chords above lyrics
    const hasChords = line.includes('[');
    if (hasChords) {
      y += 18; // Extra space for chords
    }

    parts.forEach(part => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const chordName = part.slice(1, -1);
        ctx.font = chordFont;
        ctx.fillStyle = '#FFD600';
        
        // Ensure chords don't overlap by checking the last chord's end position
        const chordWidth = ctx.measureText(chordName).width;
        const drawX = Math.max(x, lastChordEndX + 6); // 6px minimum margin between chords
        
        ctx.fillText(chordName, drawX, y - 22);
        lastChordEndX = drawX + chordWidth;
        ctx.fillStyle = '#000000';
      } else if (part !== '') {
        ctx.font = lyricsFont;
        ctx.fillText(part, x, y);
        x += ctx.measureText(part).width;
      }
    });

    y += lineSpacing;
  });

  // 6. Watermark
  y += 40;
  ctx.fillStyle = '#8e8e93';
  ctx.font = 'bold 14px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GENERATED AT GUITARCORDMM.COM', width / 2, y);

  // 7. Crop the final image to the actual length used
  const finalHeight = y + 60;
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = width * scale;
  finalCanvas.height = finalHeight * scale;
  const finalCtx = finalCanvas.getContext('2d');
  
  if (finalCtx) {
    finalCtx.fillStyle = '#ffffff';
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    finalCtx.drawImage(canvas, 0, 0);
    
    const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = `${song.songTitle.replace(/\s+/g, '_')}_Chords.jpg`;
    link.href = dataUrl;
    link.click();
  }
}
