import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogleOAuth, signInWithEmail, isUserAdmin } from '../services/auth/authService';
import { ShieldCheck, UserRound, Lock } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogleOAuth();
      navigate('/');
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await signInWithEmail(username, password);
      if (isUserAdmin(user)) {
        navigate('/');
      } else {
        setError('This account is not authorized as an administrator.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center">Admin Login</h2>
        <p className="text-gray-400 mb-6 text-center text-sm">
          Sign in with your GuitarCord administrator username and password.
        </p>

        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-3 rounded-lg text-xs mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 mb-4">
          <div className="relative">
            <UserRound className="absolute left-3 top-3.5 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin Username"
              autoComplete="username"
              className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-white/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              autoComplete="current-password"
              className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#121214] px-3 text-xs text-white/40 uppercase tracking-wider absolute">or</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-2.5 bg-white text-black font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors"
        >
          Sign in with Google
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            &larr; Back to GuitarCordMM
          </button>
        </div>
      </div>
    </div>
  );
}
