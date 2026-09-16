import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Music, ArrowRight, Guitar, Star, Sparkles, Edit3, User, LogIn, LogOut } from 'lucide-react';
import { UnifiedUser } from '../lib/supabase';
import { signOutUser } from '../lib/supabaseAuth';

export function LandingPage({ user, isAdmin }: { user?: UnifiedUser | null, isAdmin?: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-[#0a84ff]/30">
      <Helmet>
        <title>GuitarCordMM - မြန်မာသီချင်းဂီတာချော့များနှင့် သီချင်းစာသားများ</title>
        <meta name="description" content="မြန်မာသီချင်းများနှင့် နိုင်ငံတကာသီချင်းများ၏ တိကျသောဂီတာချော့များကို ရှာဖွေပါ။ သင့်ကိုယ်ပိုင်ချော့စာရွက်များကို ဖန်တီးပြီး သူငယ်ချင်းများနှင့် မျှဝေပါ။" />
        <meta property="og:title" content="GuitarCordMM - Explore Accurrate Guitar Chords & Lyrics" />
        <meta property="og:description" content="Discover a massive library of guitar chords and lyrics. Create your own chord sheets, share with friends, and master every song with ChordStream." />
        <meta name="keywords" content="ဂီတာချော့, သီချင်းစာသား, မြန်မာသီချင်း, guitar chords, song lyrics, chord sheets, music library, guitar practice, songbook" />
      </Helmet>
      {/* Background glowing effects */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-[0.15] pointer-events-none">
        <div className="absolute inset-0 bg-[#0a84ff] rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#0a84ff] to-blue-700 rounded-[10px] sm:rounded-[12px] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-white/90">ChordStream</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {user && !user.isAnonymous ? (
            <div className="flex items-center gap-1">
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin-panel')}
                  className="text-amber-500/80 hover:text-amber-400 transition-colors text-[13px] sm:text-[15px] p-2 sm:px-4 sm:py-2 hover:bg-white/5 rounded-full flex items-center gap-2"
                  title="Admin Panel"
                >
                  <Star className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Admin</span>
                </button>
              )}
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-white/60 hover:text-white transition-colors p-2 sm:px-4 sm:py-2 hover:bg-white/5 rounded-full flex items-center gap-2"
                title="Dashboard"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline text-[13px] sm:text-[15px] font-medium">Dashboard</span>
              </button>
              <button 
                onClick={() => signOutUser()}
                className="text-white/60 hover:text-white transition-colors p-2 sm:px-4 sm:py-2 hover:bg-white/5 rounded-full flex items-center gap-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-[13px] sm:text-[15px] font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}                
              className="text-white/60 hover:text-white transition-colors p-2 sm:px-4 sm:py-2 hover:bg-white/5 rounded-full flex items-center gap-2"
              title="Login"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline text-[13px] sm:text-[15px] font-medium">Login</span>
            </button>
          )}

          <button 
            onClick={() => navigate('/songs')}
            className="text-white/60 hover:text-white transition-colors px-3 py-2 sm:px-4 sm:py-2 hover:bg-white/5 rounded-full text-[13px] sm:text-[15px] font-medium"
          >
            Library
          </button>
          <button 
            onClick={() => navigate('/create')}
            className="bg-white/10 hover:bg-white/20 text-white transition-colors p-2 sm:px-4 sm:py-2 rounded-full flex items-center gap-2 border border-white/10"
            title="Create Song"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline text-[13px] sm:text-[15px] font-medium">Create</span>
          </button>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 sm:pt-20 pb-20 sm:pb-32 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a84ff]/10 text-[#0a84ff] text-[11px] sm:text-[13px] font-bold tracking-wider uppercase mb-6 sm:mb-8 border border-[#0a84ff]/20"
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>The Ultimate Chords App</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-black tracking-tighter mb-6 sm:mb-8 leading-[0.95] sm:leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
        >
          Master every chord. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0a84ff] to-cyan-400">
            Play every song.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-[16px] sm:text-[18px] md:text-[21px] leading-relaxed text-[#8e8e93] mb-10 sm:mb-12 max-w-2xl font-normal px-2 sm:px-0"
        >
          Your personal digital songbook. Explore an ever-growing library of beautifully formatted lyrics and chords. Perfect for practice, performance, and jamming.
        </motion.p>


        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md mx-auto"
        >
          <button 
            onClick={() => navigate('/songs')}
            className="w-full sm:w-auto px-8 py-4 bg-[#0a84ff] hover:bg-blue-500 text-white rounded-full font-medium transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(10,132,255,0.5)]"
          >
            Start Playing
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => navigate('/songs')}
            className="w-full sm:w-auto px-8 py-4 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white rounded-full font-medium transition-all flex items-center justify-center gap-2 border border-white/[0.08]"
          >
            <Search className="w-5 h-5 text-white/50" />
            Search Library
          </button>
        </motion.div>
      </main>

      {/* Feature Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
        className="relative z-10 max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
      >
        <div className="bg-[#1c1c1e]/50 backdrop-blur-xl border border-white/[0.05] p-6 sm:p-8 rounded-3xl transition-transform hover:scale-[1.02] duration-300">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-5 sm:mb-6">
            <Guitar className="w-6 h-6 text-[#0a84ff]" />
          </div>
          <h3 className="text-xl font-bold mb-3">Accurate Chords</h3>
          <p className="text-[#8e8e93] text-[15px] leading-relaxed font-normal">
            Carefully transcribed chords by musicians. Clean, readable format optimized for mobile and desktop.
          </p>
        </div>

        <div className="bg-[#1c1c1e]/50 backdrop-blur-xl border border-white/[0.05] p-6 sm:p-8 rounded-3xl transition-transform hover:scale-[1.02] duration-300">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-5 sm:mb-6">
            <Music className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Vast Library</h3>
          <p className="text-[#8e8e93] text-[15px] leading-relaxed font-normal">
            Hundreds of songs across multiple genres. Always updated with new songs from our community.
          </p>
        </div>

        <div className="bg-[#1c1c1e]/50 backdrop-blur-xl border border-white/[0.05] p-6 sm:p-8 rounded-3xl transition-transform hover:scale-[1.02] duration-300">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-5 sm:mb-6">
            <Star className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Original Sheets</h3>
          <p className="text-[#8e8e93] text-[15px] leading-relaxed font-normal">
            View original chord sheets and images right alongside the lyrics. Never miss a single beat.
          </p>
        </div>
      </motion.div>

      {/* Footer / Watermark */}
      <footer className="relative z-10 pb-16 pt-10 text-center border-t border-white/[0.03] px-6 select-none pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#8e8e93] text-[10px] font-bold tracking-[0.3em] opacity-20 uppercase">CHORDSTREAM BY</p>
          <p className="text-white/10 text-2xl font-black tracking-tighter uppercase">
            guitarcordmm.com
          </p>
        </div>
      </footer>
    </div>
  );
}
