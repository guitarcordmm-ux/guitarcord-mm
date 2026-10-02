import { useMemo } from 'react';

type ChordToken = {
  chord: string | null;
  text: string;
};

type Props = {
  line: string;
  transpose: (chord: string) => string;
  className?: string;
};

function parseTokens(line: string): ChordToken[] {
  const tokens: ChordToken[] = [];
  const chordPattern = /\[([^\]]+)\]/g;
  let cursor = 0;
  let pendingChord: string | null = null;
  let match: RegExpExecArray | null;

  while ((match = chordPattern.exec(line)) !== null) {
    const before = line.slice(cursor, match.index);
    if (before) {
      tokens.push({ chord: pendingChord, text: before });
      pendingChord = null;
    }

    pendingChord = match[1].trim();
    cursor = match.index + match[0].length;
  }

  const trailing = line.slice(cursor);
  if (trailing) {
    tokens.push({ chord: pendingChord, text: trailing });
    pendingChord = null;
  }

  if (pendingChord) {
    tokens.push({ chord: pendingChord, text: '' });
  }

  if (!tokens.length) {
    tokens.push({ chord: null, text: line });
  }

  return tokens;
}

export function ChordLyricsLine({ line, transpose, className = '' }: Props) {
  const tokens = useMemo(() => parseTokens(line), [line]);
  const transposedTokens = useMemo(
    () => tokens.map(token => ({
      ...token,
      chord: token.chord ? transpose(token.chord) : null,
    })),
    [tokens, transpose],
  );

  return (
    <div
      className={`flex w-full max-w-full flex-wrap items-end gap-x-1.5 gap-y-0.5 font-mono ${className}`}
      role="text"
    >
      {transposedTokens.map((token, index) => {
        const lyricText = token.text || '\u00A0';
        const chordText = token.chord || '';

        return (
          <span
            key={`${index}-${token.chord ?? 'lyric'}`}
            className="inline-flex min-w-0 max-w-full flex-col items-start align-bottom"
          >
            <span
              className={`min-h-5 text-[13px] leading-5 font-black whitespace-nowrap ${token.chord ? 'text-[#FFD600] drop-shadow-[0_0_6px_rgba(255,214,0,.18)]' : 'text-transparent'}`}
              aria-hidden={!token.chord}
            >
              {chordText || '\u00A0'}
            </span>
            <span className="max-w-full whitespace-pre-wrap break-words text-[15px] leading-6 font-medium tracking-[0.01em] text-white">
              {lyricText}
            </span>
          </span>
        );
      })}
    </div>
  );
}
