const DEFAULT_SITE_URL = 'https://guitarcordmm.com';

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
  '်':'','္':'','ျ':'y','ြ':'w','ွ':'w','ှ':'h','င်':'in','င်း':'in','န်':'an','န်း':'an',
  'မ်':'m','မ်း':'am','က်':'et','တ်':'at','ပ်':'ap','တ်':'at','န်':'an','မ်':'m',
  '။':' ','၊':' ','၊':' ','‌':' ',
};

function romanizeMyanmar(value: string): string {
  const exact = COMMON_MYANMAR_WORDS[value.trim()];
  if (exact) return exact;

  let output = '';
  for (const char of value.normalize('NFKC')) {
    output += MYANMAR_CHAR_MAP[char] ?? char;
  }

  return output
    .normalize('NFKD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function slugifyText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('my-MM')
    .trim()
    .replace(/[^\\p{L}\\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function getSongNameSlug(songTitle: string, existingSlug?: string | null): string {
  const candidate = (existingSlug || '').trim();
  if (candidate && /^[A-Za-z0-9-]+$/.test(candidate)) {
    return candidate.toLowerCase();
  }

  const romanized = romanizeMyanmar(songTitle);
  return romanized || 'song';
}

export function getSongPath(song: { id: string; songTitle: string; songSlug?: string | null }): string {
  const nameSlug = getSongNameSlug(song.songTitle, song.songSlug);
  return `/song/${encodeURIComponent(song.id)}/${encodeURIComponent(nameSlug)}`;
}

export function getSongUrl(song: { id: string; songTitle: string; songSlug?: string | null }): string {
  const origin = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim() || DEFAULT_SITE_URL;
  return `${origin.replace(/\\/$/, '')}${getSongPath(song)}`;
}
