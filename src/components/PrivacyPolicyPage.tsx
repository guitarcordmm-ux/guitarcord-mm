import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sections = [
  {
    title: 'Information used by GuitarCord',
    body: 'If you create an account or sign in, our authentication provider (Supabase) processes your email address and account details. If you submit a song, the song information and the account identifier associated with that submission may be stored so it can be reviewed and managed.',
  },
  {
    title: 'App storage and song data',
    body: 'GuitarCord may store a small song-list cache and sign-in fallback data on your device to support app features. Public song data is loaded from GuitarCord services and Supabase. You can clear locally stored app data through your device or browser settings; doing so may sign you out or clear cached songs.',
  },
  {
    title: 'Advertising and payments',
    body: 'GuitarCord does not currently include an advertising SDK, paid subscription, or in-app purchase. If these features are added, this policy and the relevant store privacy disclosures will be updated before their release.',
  },
  {
    title: 'Third-party services',
    body: 'GuitarCord uses Supabase for account and database services and Vercel for hosting. These providers process information needed to deliver the app under their own service terms and privacy practices.',
  },
];

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-xl px-5 pt-safe pt-5 pb-10">
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
            <h1 className="text-xl font-bold">Privacy Policy</h1>
            <p className="text-xs text-white/35">GuitarCord · Last updated October 13, 2026</p>
          </div>
        </header>

        <main className="mt-6 space-y-5 text-sm leading-6 text-white/65">
          <p>
            This page explains the information GuitarCord uses to provide song browsing, accounts, and song submissions.
          </p>

          {sections.map(({ title, body }) => (
            <section key={title}>
              <h2 className="mb-1 font-semibold text-white">{title}</h2>
              <p>{body}</p>
            </section>
          ))}

          <section>
            <h2 className="mb-1 font-semibold text-white">Your choices</h2>
            <p>
              You can sign out from your Profile and clear locally stored app data in your device or browser settings. For questions, open Help &amp; Support in the app.
            </p>
          </section>

          <p className="border-t border-white/10 pt-4 text-xs text-white/40">
            This notice should be reviewed and completed with the developer’s privacy contact before app-store release.
          </p>
        </main>
      </div>
    </div>
  );
}
