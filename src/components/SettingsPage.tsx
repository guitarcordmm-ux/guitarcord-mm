import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ShieldCheck, Settings, CircleHelp } from 'lucide-react';
import type { User } from '../types';

export function SettingsPage({ user }: { user?: User | null }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-xl bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.05),transparent_35%)]">
        <header className="px-5 pt-safe pt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70"
            aria-label="Back to profile"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-xs text-white/35">GuitarCord account settings</p>
          </div>
        </header>

        <main className="px-5 pt-7">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              <Settings size={18} className="text-white/60" />
              <span className="text-xs uppercase tracking-wider text-white/35">General</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-3 px-4 py-4 text-sm border-b border-white/10"
            >
              <CircleHelp size={18} className="text-white/55" />
              <span className="flex-1 text-left">Help & Support</span>
              <ChevronRight size={17} className="text-white/25" />
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate('/admin-panel')}
                className="w-full flex items-center gap-3 px-4 py-4 text-sm bg-[#FFD600]/5 hover:bg-[#FFD600]/10 transition-colors"
              >
                <ShieldCheck size={19} className="text-[#FFD600]" />
                <span className="flex-1 text-left">
                  <span className="block font-semibold text-[#FFD600]">Admin Dashboard</span>
                  <span className="block mt-0.5 text-[10px] text-white/35">Manage songs, approvals and submissions</span>
                </span>
                <ChevronRight size={17} className="text-[#FFD600]/50" />
              </button>
            )}
          </div>

          {!isAdmin && (
            <p className="mt-4 px-1 text-[11px] text-white/25">
              Administrator tools are available only to authorized admin accounts.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
