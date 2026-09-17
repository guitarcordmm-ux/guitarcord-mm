import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { OnboardingPage } from './components/OnboardingPage';
import { SupabaseBanner } from './components/SupabaseBanner';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { AdminSongImport } from './components/AdminSongImport';
import { ChordEditor } from './components/ChordEditor';
import { LoginPage } from './components/LoginPage';
import { UserDashboard } from './components/UserDashboard';
import { GuitarCordHome, GuitarCordLibrary, ChordLibrary, GuitarCordProfile } from './components/GuitarCordUI';
import { GuitarCordPlayer } from './components/GuitarCordPlayer';
import { Song } from './types';
import { fetchApprovedSong, fetchApprovedSongs, UnifiedUser } from './lib/supabase';
import { isUserAdmin, subscribeToAuthChanges } from './lib/supabaseAuth';

function Player() {
  const { chordId = '' } = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchApprovedSong(chordId)
      .then(data => {
        if (!active) return;
        if (!data) setError('Song not found.');
        setSong(data);
      })
      .catch(err => {
        console.error('Could not load song:', err);
        if (active) setError(err instanceof Error ? err.message : 'Could not load song.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [chordId]);

  if (loading) return <div className="min-h-screen bg-black text-white grid place-items-center">Loading song…</div>;
  if (error || !song) return <div className="min-h-screen bg-black text-white grid place-items-center px-6 text-center"><div><p className="text-white/70 mb-4">{error || 'Song not found.'}</p><button onClick={() => window.history.back()} className="px-4 py-2 rounded-xl bg-white/10">Go back</button></div></div>;
  return <GuitarCordPlayer song={song}/>;
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

  return <>
    <Helmet><title>GuitarCord — Chords · Lyrics · Play</title><meta name="theme-color" content="#000000"/></Helmet>
    <SupabaseBanner/>
    {songsError && <div className="fixed top-0 left-0 right-0 z-[60] bg-red-950/95 border-b border-red-400/20 px-4 py-2 text-center text-xs text-red-200">Supabase song data could not be loaded: {songsError}</div>}
    <Routes>
      <Route path="/" element={<OnboardingPage/>}/>
      <Route path="/app" element={<GuitarCordHome songs={songs} user={user}/>}/>
      <Route path="/songs" element={<GuitarCordHome songs={songs} user={user}/>}/>
      <Route path="/library" element={<GuitarCordLibrary songs={songs} user={user}/>}/>
      <Route path="/chords" element={<ChordLibrary/>}/>
      <Route path="/chord/:chordId" element={<Player/>}/>
      <Route path="/profile" element={<GuitarCordProfile user={user}/>}/>
      <Route path="/learn" element={<OnboardingPage/>}/>
      <Route path="/create" element={<ChordEditor onClose={() => window.history.back()} user={user} isAdmin={admin}/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/dashboard" element={user && !user.isAnonymous ? <UserDashboard userId={user.uid}/> : <Navigate to="/" replace/>}/>
      <Route path="/admin" element={<AdminLogin/>}/>
      <Route path="/admin-panel" element={<AdminPanel/>}/>
      <Route path="/admin-import" element={<AdminSongImport/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </>;
}

export default function App() {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => subscribeToAuthChanges(u => { setUser(u); setLoading(false); }), []);
  if (loading) return <div className="min-h-screen bg-black text-white grid place-items-center">Loading GuitarCord…</div>;
  return <BrowserRouter><Screens user={user}/></BrowserRouter>;
}
