import { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/apiUrl';
import { getSupabase } from '../services/supabase/client';
import type { UnifiedUser } from '../types';

export function DeleteAccountPage({ user }: { user: UnifiedUser | null }) {
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleted, setDeleted] = useState(false);

  async function deleteAccount() {
    const supabase = getSupabase();
    if (!supabase || !user || user.isAnonymous || confirmation !== 'DELETE') return;

    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your session expired. Please sign in again.');

      const response = await fetch(apiUrl('/api/delete-account'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation }),
      });
      const result: { message?: string; error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || 'Account deletion failed. Please try again.');

      try {
        localStorage.removeItem('guitarcord_public_songs_cache_v2');
        localStorage.removeItem('supabase_fallback_songs');
        localStorage.removeItem('supabase_fallback_user');
      } catch (storageError) {
        console.warn('Could not clear local GuitarCord data:', storageError);
      }
      await supabase.auth.signOut({ scope: 'local' }).catch(signOutError => {
        console.warn('Could not clear the deleted account session:', signOutError);
      });
      setDeleted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Account deletion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
            <h1 className="text-xl font-bold">Delete account</h1>
            <p className="text-xs text-white/35">GuitarCordMM account and data</p>
          </div>
        </header>

        {deleted ? (
          <main className="mt-8 rounded-2xl border border-green-400/20 bg-green-500/5 p-5">
            <h2 className="font-semibold text-green-200">Account deleted</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">Your account and submitted songs were deleted.</p>
            <button type="button" onClick={() => navigate('/', { replace: true })} className="mt-5 rounded-xl bg-[#FFD600] px-4 py-3 text-sm font-semibold text-black">Return to GuitarCord</button>
          </main>
        ) : !user || user.isAnonymous ? (
          <main className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm leading-6 text-white/65">Sign in to the account you want to delete. The deletion page is available publicly so you can also open it from a browser.</p>
            <Link to="/login?redirect=%2Fdelete-account" className="mt-5 inline-flex rounded-xl bg-[#FFD600] px-4 py-3 text-sm font-semibold text-black">Sign in</Link>
            <p className="mt-4 text-xs text-white/45">If you cannot sign in, request deletion by email instead:</p>
            <a href="mailto:support@guitarcordmm.com?subject=GuitarCord%20account%20deletion" className="mt-2 inline-block text-sm text-[#FFD600] underline">support@guitarcordmm.com</a>
          </main>
        ) : (
          <main className="mt-8 space-y-5">
            <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-5">
              <div className="flex items-center gap-2 font-semibold text-red-200"><Trash2 size={18} /> This cannot be undone</div>
              <p className="mt-3 text-sm leading-6 text-white/65">Deleting your account permanently removes your GuitarCord sign-in and the songs you submitted. You will be signed out, and you will not be able to recover the deleted account or submissions.</p>
              <p className="mt-3 text-sm leading-6 text-white/65">Songs submitted by your account—including approved songs—will be removed. Some provider backups or records that must be retained for legal or security reasons may take longer to disappear.</p>
            </div>

            <label className="block text-sm text-white/70" htmlFor="delete-confirmation">
              Type <span className="font-semibold text-white">DELETE</span> to confirm
            </label>
            <input
              id="delete-confirmation"
              autoComplete="off"
              value={confirmation}
              onChange={event => setConfirmation(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-red-400/50"
              placeholder="DELETE"
            />
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            <button
              type="button"
              onClick={deleteAccount}
              disabled={confirmation !== 'DELETE' || loading}
              className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Deleting account…' : 'Permanently delete account'}
            </button>
            <p className="text-xs leading-5 text-white/35">Need help? Email <a className="text-[#FFD600] underline" href="mailto:support@guitarcordmm.com">support@guitarcordmm.com</a>.</p>
          </main>
        )}
      </div>
    </div>
  );
}
