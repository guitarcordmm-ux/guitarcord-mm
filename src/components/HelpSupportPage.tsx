import { ArrowLeft, CircleHelp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tips = [
  ['Songs are missing', 'Check your internet connection, then refresh the page.'],
  ['A song will not open', 'Try opening it again when your connection is stable.'],
  ['Account issue', 'Open your Profile and sign in again.'],
];

export function HelpSupportPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-xl px-5 pt-safe pt-5">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70"
            aria-label="Go back"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Help &amp; Support</h1>
            <p className="text-xs text-white/35">Quick fixes for common problems</p>
          </div>
        </header>

        <main className="mt-7 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] px-4">
          {tips.map(([title, description]) => (
            <section key={title} className="flex gap-3 py-4">
              <CircleHelp size={18} className="mt-0.5 shrink-0 text-[#FFD600]" />
              <div>
                <h2 className="text-sm font-medium">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-white/50">{description}</p>
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
