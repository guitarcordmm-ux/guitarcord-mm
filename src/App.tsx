import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LandingPage } from './components/LandingPage';
import { SupabaseBanner } from './components/SupabaseBanner';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { ChordEditor } from './components/ChordEditor';
import { LoginPage } from './components/LoginPage';
import { UserDashboard } from './components/UserDashboard';
import { GuitarCordHome, GuitarCordLibrary, ChordLibrary, GuitarCordPlayer, GuitarCordProfile } from './components/GuitarCordUI';
import { Song } from './types';
import { fetchApprovedSongs, fetchUserSongs, UnifiedUser } from './lib/supabase';
import { isUserAdmin, subscribeToAuthChanges } from './lib/supabaseAuth';

function useSongs(user: UnifiedUser | null) {
  const [songs, setSongs] = useState<Song[]>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const approved = await fetchApprovedSongs();
        let merged = approved;
        if (user && !user.isAnonymous) {
          try {
            const mine = await fetchUserSongs(user.uid);
            merged = [...approved, ...mine.filter(s => !approved.some(a => a.id === s.id) && s.status !== 'deleted')];
          } catch (e) { console.error('Unable to load user songs', e); }
        }
        if (active) setSongs(merged);
      } catch (e) { console.error('Unable to load songs', e); }
    })();
    return () => { active = false; };
  }, [user]);
  return songs;
}

function PlayerRoute({ songs }: { songs: Song[] }) {
  const { chordId } = useParams();
  const song = useMemo(() => songs.find(s => s.id === chordId), [songs, chordId]);
  if (!song) return <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 text-center">Loading song…</div>;
  return <GuitarCordPlayer song={song} />;
}

function MainApp({ user }: { user: UnifiedUser | null }) {
  const songs = useSongs(user);
  const admin = isUserAdmin(user);
  return <>
    <Helmet><title>GuitarCord — Chords · Lyrics · Play</title><meta name="theme-color" content="#000000" /></Helmet>
    <SupabaseBanner />
    <Routes>
      <Route path="/" element={<LandingPage user={user} isAdmin={admin} />} />
      <Route path="/app" element={<GuitarCordHome songs={songs} user={user} />} />
      <Route path="/songs" element={<GuitarCordHome songs={songs} user={user} />} />
      <Route path="/library" element={<GuitarCordLibrary songs={songs} user={user} />} />
      <Route path="/chords" element={<ChordLibrary />} />
      <Route path="/chord/:chordId" element={<PlayerRoute songs={songs} />} />
      <Route path="/profile" element={<GuitarCordProfile />} />
      <Route path="/learn" element={<LandingPage user={user} isAdmin={admin} />} />
      <Route path="/create" element={<ChordEditor onClose={() => window.history.back()} user={user} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={user && !user.isAnonymous ? <UserDashboard userId={user.uid} /> : <Navigate to="/" replace />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin-panel" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>;
}

export default function App() {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => subscribeToAuthChanges(current => { setUser(current); setLoading(false); }), []);
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">Loading GuitarCord…</div>;
  return <BrowserRouter><MainApp user={user} /></BrowserRouter>;
}
