import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  ChevronRight,
  Guitar,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Music2,
  Play,
  Search,
  Sparkles,
  User,
} from 'lucide-react';
import { UnifiedUser } from '../lib/supabase';
import { signOutUser } from '../lib/supabaseAuth';

export function LandingPage({
  user,
  isAdmin,
}: {
  user?: UnifiedUser | null;
  isAdmin?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white selection:bg-[#FFD600] selection:text-black">
      <Helmet>
        <title>GuitarCordMM — Chords • Lyrics • Play</title>
        <meta
          name="description"
          content="Guitar chords and lyrics together in one clean, mobile-first songbook for guitar players."
        />
      </Helmet>

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-28 top-24 h-72 w-72 rounded-full bg-[#FFD600] opacity-[0.07] blur-3xl" />
        <div className="absolute -right-28 top-[52%] h-72 w-72 rounded-full bg-white opacity-[0.04] blur-3xl" />
      </div>

      <header className="relative z-20 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-3"
            aria-label="GuitarCord home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#FFD600]/40 bg-[#FFD600] text-black shadow-[0_0_30px_rgba(255,214,0,0.15)]">
              <Guitar className="h-5 w-5" />
            </div>
            <div className="text-left leading-none">
              <div className="text-[18px] font-black tracking-[-0.04em] sm:text-[20px]">
                Guitar<span className="text-[#FFD600]">Cord</span>
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-white/45">
                Chords · Lyrics · Play
              </div>
            </div>
          </button>

          <div className="hidden items-center gap-1 md:flex">
            <button onClick={() => navigate('/songs')} className="rounded-full px-4 py-2 text-sm font-semibold text-white/65 transition hover:bg-white/5 hover:text-white">
              Songs
            </button>
            <button onClick={() => navigate('/songs')} className="rounded-full px-4 py-2 text-sm font-semibold text-white/65 transition hover:bg-white/5 hover:text-white">
              Chord Library
            </button>
            {isAdmin && (
              <button onClick={() => navigate('/admin-panel')} className="rounded-full px-4 py-2 text-sm font-semibold text-[#FFD600] transition hover:bg-[#FFD600]/10">
                Admin
              </button>
            )}
            {user && !user.isAnonymous ? (
              <button onClick={() => navigate('/dashboard')} className="ml-1 flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">
                <User className="h-4 w-4 text-[#FFD600]" />
                Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="ml-1 flex items-center gap-2 rounded-full bg-[#FFD600] px-4 py-2 text-sm font-bold text-black transition hover:bg-white">
                <LogIn className="h-4 w-4" />
                Login
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => navigate('/songs')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
              aria-label="Search songs"
            >
              <Search className="h-4 w-4 text-[#FFD600]" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5" aria-label="Menu">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28 sm:pt-14">
        <section className="grid items-center gap-12 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#FFD600]/25 bg-[#FFD600]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD600] sm:text-[11px]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Your pocket songbook
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-6 max-w-2xl text-[46px] font-black leading-[0.94] tracking-[-0.06em] sm:text-6xl lg:text-[76px]"
            >
              Chords.
              <br />
              Lyrics.
              <br />
              <span className="text-[#FFD600]">Play.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mt-6 max-w-xl text-[16px] leading-7 text-white/62 sm:text-[18px] sm:leading-8"
            >
              သီချင်းစာသားနဲ့ guitar chords ကို တစ်နေရာတည်းမှာကြည့်ပြီး တီးနေတုန်း လွယ်လွယ်ကူကူလိုက်ဖတ်နိုင်အောင် ဖန်တီးထားတဲ့ GuitarCord.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <button
                onClick={() => navigate('/songs')}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#FFD600] px-7 text-[15px] font-black text-black shadow-[0_0_36px_rgba(255,214,0,0.18)] transition hover:translate-y-[-1px] hover:bg-white active:translate-y-0"
              >
                Start Playing
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/songs')}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-7 text-[15px] font-bold text-white transition hover:bg-white/10"
              >
                <Search className="h-5 w-5 text-[#FFD600]" />
                Search Songs
              </button>
            </motion.div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/42">
              <span className="rounded-full border border-white/10 px-3 py-1.5">Mobile first</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">Android</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">iOS</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">Web</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="relative mx-auto w-full max-w-[390px] lg:ml-auto"
          >
            <div className="absolute -inset-6 rounded-[44px] border border-[#FFD600]/10 bg-[#FFD600]/[0.03] blur-sm" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[#0B0B0B] shadow-2xl shadow-black">
              <div className="flex items-center justify-between px-5 pb-3 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                <span>GuitarCord</span>
                <span>9:41</span>
              </div>

              <div className="px-4 pb-5 sm:px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-white/42">Now Playing</p>
                    <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">Your Song</h2>
                    <p className="text-xs text-white/42">GuitarCord Session</p>
                  </div>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5" aria-label="Favorite">
                    <Heart className="h-4 w-4 text-[#FFD600]" />
                  </button>
                </div>

                <div className="mt-5 rounded-[26px] border border-[#FFD600]/20 bg-[#FFD600]/[0.06] p-4">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FFD600]">Key</p>
                      <p className="mt-1 text-3xl font-black">G</p>
                    </div>
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#FFD600]/35 bg-black">
                      <div className="grid grid-cols-3 gap-1.5">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((dot) => (
                          <span key={dot} className={`h-1.5 w-1.5 rounded-full border border-white/35 ${[0, 2, 4, 7].includes(dot) ? 'bg-[#FFD600]' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-black px-4 py-5">
                  <div className="space-y-4">
                    {[
                      ['G', 'I found a love for me'],
                      ['D', 'Darling, just dive right in'],
                      ['Em', 'And follow my lead'],
                      ['C', 'Well, I found a girl'],
                      ['G', 'Beautiful and sweet'],
                    ].map(([chord, lyric]) => (
                      <div key={lyric}>
                        <div className="mb-0.5 text-[12px] font-black text-[#FFD600]">{chord}</div>
                        <div className="text-[15px] font-medium leading-6 text-white/90">{lyric}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-white/40">
                    <span>0:45</span>
                    <span>4:23</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div className="h-1.5 w-[28%] rounded-full bg-[#FFD600]" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-white/45">
                      <Music2 className="h-4 w-4 text-[#FFD600]" />
                      Chord + Lyrics
                    </div>
                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD600] text-black shadow-[0_0_26px_rgba(255,214,0,0.2)]" aria-label="Play song">
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-20 border-t border-white/10 pt-8 sm:mt-24 sm:pt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD600]">Built for guitarists</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">Everything you need to play.</h2>
            </div>
            <button onClick={() => navigate('/songs')} className="hidden items-center gap-1 text-sm font-bold text-white/55 transition hover:text-white sm:flex">
              Open library <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Chord + Lyrics', body: 'သီချင်းစာသားနဲ့ chord ကို တစ်ချိန်တည်းမြင်နိုင်အောင် ဖတ်ရလွယ်တဲ့ layout.' },
              { title: 'Chord Library', body: 'Major, Minor, 7th နဲ့ အခြား fingerings တွေကို ရှာပြီး လေ့ကျင့်နိုင်ပါတယ်.' },
              { title: 'Your Library', body: 'ကြိုက်တဲ့သီချင်းတွေကို သိမ်း၊ search လုပ်ပြီး တီးမယ့် set ကို လွယ်လွယ်တည်ဆောက်ပါ.' },
            ].map((item) => (
              <article key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFD600] text-black">
                  {item.title === 'Chord Library' ? <Guitar className="h-5 w-5" /> : item.title === 'Your Library' ? <Heart className="h-5 w-5" /> : <Music2 className="h-5 w-5" />}
                </div>
                <h3 className="text-lg font-black tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[32px] border border-[#FFD600]/20 bg-[#FFD600] p-6 text-black sm:mt-20 sm:p-8">
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">Ready when you are</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.05em] sm:text-4xl">Pick a song. Read the chord. Start playing.</h2>
            </div>
            <button onClick={() => navigate('/songs')} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-black px-6 text-sm font-black text-white transition hover:bg-white hover:text-black">
              Browse Songs <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-black">Guitar<span className="text-[#FFD600]">Cord</span></div>
            <p className="mt-1 text-xs text-white/35">Chords · Lyrics · Play</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-white/40">
            <button onClick={() => navigate('/songs')} className="transition hover:text-white">Songs</button>
            <span className="text-white/15">•</span>
            <button onClick={() => navigate('/login')} className="transition hover:text-white">Login</button>
            {user && !user.isAnonymous && (
              <>
                <span className="text-white/15">•</span>
                <button onClick={() => signOutUser()} className="inline-flex items-center gap-1 transition hover:text-white"><LogOut className="h-3.5 w-3.5" /> Logout</button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
