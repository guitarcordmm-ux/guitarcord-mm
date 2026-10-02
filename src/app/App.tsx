import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SupabaseBanner } from '../components/SupabaseBanner';
import { OnboardingPage } from '../components/OnboardingPage';
import { AdminPanel, AdminLogin, AdminSongImport } from '../features/admin';
import { ChordEditor } from '../features/editor';
import { LoginPage, ResetPasswordPage, UserDashboard, type UnifiedUser } from '../features/auth';
import { GuitarCordHome, GuitarCordLibrary, GuitarCordArtists, GuitarCordArtistPage, GuitarCordPlayer, GuitarCordProfile } from '../features/songs';
import { ChordLibrary } from '../features/chords';
import type { Song } from '../types';
import { fetchApprovedSong, fetchApprovedSongBySlug, fetchApprovedSongs } from '../services/songs/songService';
import { getSongPath } from '../lib/seo';
import { SongSeo } from '../features/songs/components/SongSeo';
import { isUserAdmin, subscribeToAuthChanges } from '../services/auth/authService';

function Player() {
  const { artistSlug = '', songSlug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const songId = searchParams.get('id')?.trim() || '';
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const loadSong = songId
      ? fetchApprovedSong(songId)
      : fetchApprovedSongBySlug(artistSlug, songSlug);

    loadSong
      .then(data => {
        if (!active) return;
        if (!data) setError('Song not found.');
        setSong(data);
      })
      .catch(err => {
        console.error('Could not load song:', err);
        if (active) setError(err instanceof Error ? err.message : 'Could not load song.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [artistSlug, songSlug, songId]);

  if (loading) return <div className="min-h-screen bg-black text-white grid place-items-center">Loading song…</div>;

  if (error || !song) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center px-6 text-center">
        <div>
          <p className="text-white/70 mb-4">{error || 'Song not found.'}</p>
          <button onClick={() => window.history.back()} className="px-4 py-2 rounded-xl bg-white/10">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SongSeo song={song} />
      <GuitarCordPlayer song={song} />
    </>
  );
}

function LegacyChordRedirect() {
  const { chordId = '' } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchApprovedSong(chordId)
      .then(song => {
        if (!active) return;
        if (!song) {
          setError('Song not found.');
          return;
        }
        navigate(getSongPath(song), { replace: true });
      })
      .catch(err => {
        if (active) setError(err instanceof Error ? err.message : 'Could not open song.');
      });
    return () => { active = false; };
  }, [chordId, navigate]);

  return <div className="min-h-screen bg-black text-white grid place-items-center px-6 text-center"><div className="text-sm text-white/55">{error || 'Opening song…'}</div></div>;
}

function Screens({ user }: { user: UnifiedUser | null }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsError, setSongsError] = useState('');

  useEffect(() => {
    let active = true;
    fetchApprovedSongs()
      .then(data => { if (active) setSongs(data); })
      .catch(error => {
        console.error(error);
        if (active) setSongsError(error instanceof Error ? error.message : 'Could not load songs from Supabase.');
      });
    return () => { active = false; };
  }, []);

  const admin = isUserAdmin(user);

  return (
    <>
      <Helmet>
        <title>Myanmar Guitar Chords & Lyrics | GuitarCord</title>
        <meta name="description" content="Find Myanmar guitar chords, song lyrics, transpose tools and easy-to-read song sheets on GuitarCord." />
        <meta name="theme-color" content="#000000" />
      </Helmet>
      <SupabaseBanner />
      {songsError && <div className="fixed top-0 left-0 right-0 z-[60] bg-red-950/95 border-b border-red-400/20 px-4 py-2 text-center text-xs text-red-200">Supabase song data could not be loaded: {songsError}</div>}
      <Routes>
        <Route path="/" element={<GuitarCordHome songs={songs} user={user} />} />
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route path="/songs" element={<Navigate to="/" replace />} />
        <Route path="/library" element={<GuitarCordLibrary songs={songs} user={user} />} />
        <Route path="/artists" element={<GuitarCordArtists />} />
        <Route path="/artist/:artistSlug" element={<GuitarCordArtistPage />} />
        <Route path="/chords" element={<ChordLibrary />} />
        <Route path="/song/:artistSlug/:songSlug" element={<Player />} />
        <Route path="/chord/:chordId" element={<LegacyChordRedirect />} />
        <Route path="/profile" element={<GuitarCordProfile user={user} />} />
        <Route path="/learn" element={<OnboardingPage />} />
        <Route path="/create" element={user && !user.isAnonymous ? <ChordEditor onClose={() => window.history.back()} user={user} isAdmin={admin} /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={user && !user.isAnonymous ? <UserDashboard userId={user.uid} /> : <Navigate to="/" replace />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/admin-import" element={<AdminSongImport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => subscribeToAuthChanges(userState => { setUser(userState); setLoading(false); }), []);
  if (loading) return <div className="min-h-screen bg-black text-white grid place-items-center">Loading GuitarCord…</div>;
  return <BrowserRouter><Screens user={user} /></BrowserRouter>;
}
