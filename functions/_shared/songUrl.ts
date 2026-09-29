const COMMON_MYANMAR_WORDS: Record<string, string> = {
  'သတိရရ မရရ': 'tha-ti-ya-ya-ma-ya-ya',
  'ငါ့ရင်ခွင်ကို': 'nga-yin-khwin-ko',
  'ငယ်သူမို့': 'nge-thu-moh',
  'ခိုးစိတ်စိုးထိတ်လွမ်းချိန်': 'khoe-seik-soe-hteik-lwan-chain',
  'သူငယ်ချင်းအတွက်': 'thu-nge-chin-a-twet',
};

const MYANMAR_CHAR_MAP: Record<string, string> = {
  'က':'k','ခ':'kh','ဂ':'g','ဃ':'gh','င':'ng','စ':'c','ဆ':'hs','ဇ':'z','ဈ':'zh','ည':'ny',
  'ဋ':'t','ဌ':'ht','ဍ':'d','ဎ':'dh','ဏ':'n','တ':'t','ထ':'ht','ဒ':'d','ဓ':'dh','န':'n',
  'ပ':'p','ဖ':'ph','ဗ':'b','ဘ':'bh','မ':'m','ယ':'y','ရ':'r','လ':'l','ဝ':'w','သ':'th',
  'ဟ':'h','ဠ':'l','အ':'a','ဦ':'u','ဥ':'u','ဧ':'e','ဩ':'o','ဪ':'aw',
  'ာ':'a','ါ':'a','ိ':'i','ီ':'ee','ု':'u','ူ':'oo','ေ':'e','ဲ':'ae','ံ':'n','့':'','း':'',
  '်':'','္':'','ျ':'y','ြ':'w','ွ':'w','ှ':'h',
  '။':' ','၊':' ','‌':' ',
};

export function getSongNameSlug(songTitle: string, existingSlug?: string | null): string {
  const candidate = (existingSlug || '').trim();
  if (candidate && /^[A-Za-z0-9-]+$/.test(candidate)) return candidate.toLowerCase();
  const exact = COMMON_MYANMAR_WORDS[songTitle.trim()];
  if (exact) return exact;

  let output = '';
  for (const char of songTitle.normalize('NFKC')) output += MYANMAR_CHAR_MAP[char] ?? char;
  return output.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'song';
}

export function getSongPath(song: {
  artist?: string | null;
  artist_slug?: string | null;
  songTitle?: string | null;
  song_title?: string | null;
  title?: string | null;
  song_slug?: string | null;
}): string {
  const artist = song.artist || song.artist_slug || 'artist';
  const title = song.songTitle || song.song_title || song.title || 'song';
  const artistSlug = getSongNameSlug(artist, song.artist_slug);
  const songSlug = getSongNameSlug(title, song.song_slug);
  return `/song/${encodeURIComponent(artistSlug)}/${encodeURIComponent(songSlug)}`;
}
