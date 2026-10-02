import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { getSupabase } from '../../../lib/supabase';
import { updatePassword } from '../../../services/auth/authService';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      setError('Authentication service is not configured.');
      return;
    }

    const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setReady(true);
      }
    });

    client.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(newPassword);
      setMessage('Password updated successfully. You can now log in.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1c1c1e] p-8 rounded-2xl border border-white/5 shadow-2xl">
        <button
          onClick={() => navigate('/login')}
          className="text-white/50 hover:text-white mb-6 flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </button>

        <h1 className="text-2xl font-bold text-white mb-2">Set a new password</h1>
        <p className="text-white/50 mb-8">Choose a new password for your GuitarCord account.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-300 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {!ready ? (
          <p className="text-sm text-white/60">Open the password reset link from your email to continue.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none focus:border-[#FFD600]"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-white/30 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/30" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none focus:border-[#FFD600]"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3.5 text-white/30 hover:text-white"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#FFD600] hover:bg-yellow-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
