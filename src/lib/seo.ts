const DEFAULT_SITE_URL = 'https://guitarcordmm.com';

const COMMON_MYANMAR_WORDS: Record<string, string> = {
  'စိုးလွင်လွင်': 'soe-lwin-lwin',
  'ဆောင်းဦးလှိုင်': 'saung-oo-hlaing',
  'ဝန': 'wa-na',
  'လွှမ်းမိုး': 'hlwan-moe',
  'ညီမင်းခိုင် (Capo - 4)': 'nyi-min-khine-capo-4',
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

export function slugifyText(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('my-MM').trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
}

export function getEnglishSlug(value: string | null | undefined, existingSlug?: string | null): string {
  const cleanValue = typeof value === 'string' ? value : '';
  const candidate = typeof existingSlug === 'string' ? existingSlug.trim() : '';
  if (candidate) return candidate;

  const exact = COMMON_MYANMAR_WORDS[cleanValue.trim()];
  if (exact) return exact;

  let output = '';
  for (const char of cleanValue.normalize('NFKC')) output += MYANMAR_CHAR_MAP[char] ?? char;
  return output.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'song';
}

export function getArtistPath(artist: string, existingSlug?: string | null): string {
  const artistSlug = getEnglishSlug(artist, existingSlug) || 'artist';
  return '/artist/' + encodeURIComponent(artistSlug);
}

export function getArtistUrl(artist: {
  slug?: string | null;
  name?: string | null;
}): string {
  const origin = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim() || DEFAULT_SITE_URL;
  const artistSlug = getEnglishSlug(artist.name || '', artist.slug) || 'artist';
  return origin.replace(/\/$/, '') + '/artist/' + encodeURIComponent(artistSlug);
}

export function getSongPath(song: {
  artist?: string | null;
  songTitle?: string | null;
  songSlug?: string | null;
}): string {
  const artistSlug = getEnglishSlug(song.artist) || 'artist';
  const songSlug = getEnglishSlug(song.songTitle, song.songSlug) || 'song';
  return '/song/' + encodeURIComponent(artistSlug) + '/' + encodeURIComponent(songSlug);
}

export function getSongUrl(song: {
  artist?: string | null;
  songTitle?: string | null;
  songSlug?: string | null;
}): string {
  const origin = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim() || DEFAULT_SITE_URL;
  return origin.replace(/\/$/, '') + getSongPath(song);
}
