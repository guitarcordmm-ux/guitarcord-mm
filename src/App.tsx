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
import { GuitarCordHome, GuitarCordLibrary, ChordLibrary, GuitarCordPlayer, GuitarCordProfile, FALLBACK_SONGS } from './components/GuitarCordUI';
import { Song } from './types';
import { fetchApprovedSongs, UnifiedUser } from './lib/supabase';
import { isUserAdmin, subscribeToAuthChanges } from './lib/supabaseAuth';

function Player({ songs }: { songs: Song[] }) {
  const { chordId } = useParams();
  const song = songs.find(s => s.id === chordId) || FALLBACK_SONGS.find(s => s.id === chordId);
  return song ? <GuitarCordPlayer song={song}/> : <Navigate to="/app" replace/>;
}

function Screens({ user }: { user: UnifiedUser | null }) {
  const [songs, setSongs] = useState<Song[]>([]);
  useEffect(() => { fetchApprovedSongs().then(setSongs).catch(console.error); }, []);
  const admin = isUserAdmin(user);

  return <>
    <Helmet><title>GuitarCord — Chords · Lyrics · Play</title><meta name="theme-color" content="#000000"/></Helmet>
    <SupabaseBanner/>
    <Routes>
      <Route path="/" element={<OnboardingPage/>}/>
      <Route path="/app" element={<GuitarCordHome songs={songs} user={user}/>}/>
      <Route path="/songs" element={<GuitarCordHome songs={songs} user={user}/>}/>
      <Route path="/library" element={<GuitarCordLibrary songs={songs} user={user}/>}/>
      <Route path="/chords" element={<ChordLibrary/>}/>
      <Route path="/chord/:chordId" element={<Player songs={songs}/>}/>
      <Route path="/profile" element={<GuitarCordProfile/>}/>
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
