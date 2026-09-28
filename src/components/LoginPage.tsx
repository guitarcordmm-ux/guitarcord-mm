import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertCircle, ArrowLeft, User } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogleOAuth, isUserAdmin } from '../services/auth/authService';

export function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let email = identifier.trim();
      if (!email.includes('@')) {
        // If the user entered a simple username, format as fallback or standard email
        email = `${email.toLowerCase()}@guitarcordmm.com`;
      }

      let user;
      if (isLogin) {
        user = await signInWithEmail(email, password);
      } else {
        user = await signUpWithEmail(email, password, username || identifier);
      }

      if (isUserAdmin(user)) {
        navigate('/admin-panel');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogleOAuth();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1c1c1e] p-8 rounded-2xl border border-white/5 shadow-2xl">
        <button 
          onClick={() => navigate('/')} 
          className="text-white/50 hover:text-white mb-6 flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome back' : 'Create an account'}</h1>
        <p className="text-white/50 mb-8">{isLogin ? 'Sign in to access your saved chords.' : 'Sign up to manage and submit chord sheets.'}</p>

        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 w-5 h-5 text-white/30" />
            <input 
              type="text" 
              placeholder={isLogin ? "Email or username" : "Email address"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#FFD600] transition-colors"
              required
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-white/30" />
              <input 
                type="text" 
                placeholder="Username (optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#FFD600] transition-colors"
              />
            </div>
          )}
          
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/30" />
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-[#FFD600] transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-white/30 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD600] hover:bg-yellow-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Connecting...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6">
          <button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Sign in with Google
          </button>
        </div>

        <p className="text-center text-sm text-white/50 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#FFD600] hover:underline"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
