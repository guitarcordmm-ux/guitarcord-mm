import React, { useState, useEffect, useMemo } from 'react';
import type { Song } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, Trash2, LogOut, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { ChordModal } from './ChordModal';
import { fetchUserSongs, deleteSongPermanent, updateSong } from '../services/songs/songService';
import { signOutUser } from '../services/auth/authService';

export function UserDashboard({ userId }: { userId: string }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'private' | 'pending' | 'approved' | 'rejected' | 'deleted'>('all');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadUserSongs = async () => {
      try {
        const userSongs = await fetchUserSongs(userId);
        setSongs(userSongs);
      } catch (error) {
        console.error("Error fetching user songs from Supabase:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserSongs();
  }, [userId]);

  const filteredSongs = useMemo(() => {
    if (filter === 'all') return songs.filter(s => s.status !== 'deleted');
    return songs.filter(s => (s.status || 'pending') === filter);
  }, [songs, filter]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'text-green-500';
      case 'rejected': return 'text-yellow-500';
      case 'private':  return 'text-yellow-400';
      default: return 'text-yellow-500';
    }
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const handleDelete = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setSongToDelete(song);
  };

  const confirmDelete = async () => {
    if (!songToDelete) return;
    try {
      await deleteSongPermanent(songToDelete.id);
      setSongs(prev => prev.filter(s => s.id !== songToDelete.id));
      showToast('Song deleted successfully');
      setSongToDelete(null);
    } catch (error) {
      console.error('Failed to delete song:', error);
      showToast('Failed to delete song.', 'error');
    }
  };

  const handleUploadToPublic = async (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    try {
      await updateSong(song.id, { status: 'pending' });
      setSongs(prev => prev.map(s => s.id === song.id ? { ...s, status: 'pending' } : s));
      showToast('Submitted to public review!');
    } catch (err) {
      console.error('Failed to submit song to public:', err);
      showToast('Failed to submit.', 'error');
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    navigate('/');
  };

  if (loading) return <div className="text-white p-6 bg-black min-h-screen pt-safe">Loading your library...</div>;

  return (
    <div className="p-6 bg-black min-h-screen text-white pb-12 pt-safe">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-yellow-400/80 hover:text-yellow-400 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Songs & Chords</h1>
          <p className="text-white/50 text-sm mt-1">Manage your private library and public submissions</p>
        </div>
      </div>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'private', 'pending', 'approved', 'rejected', 'deleted'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full capitalize text-sm whitespace-nowrap ${
              filter === f ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredSongs.length === 0 ? (
        <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-white/50">
          No {filter !== 'all' ? filter : ''} songs found in your library.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSongs.map(song => (
            <div key={song.id} className="p-4 bg-white/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between border border-white/10 gap-4">
              <div 
                className="cursor-pointer group flex-1"
                onClick={() => setSelectedSong(song)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg group-hover:text-[#FFD600] transition-colors">{song.songTitle}</h3>
                  <PlayCircle className="w-4 h-4 text-white/40 group-hover:text-[#FFD600] transition-colors" />
                </div>
                <p className="text-sm text-gray-400">{song.artist}</p>
                <p className="text-xs text-gray-500 mt-1">Uploaded: {formatDate(song.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                {song.status === 'private' && (
                  <button 
                    onClick={(e) => handleUploadToPublic(e, song)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD600] hover:bg-yellow-400 text-white text-xs font-semibold rounded-full transition-colors whitespace-nowrap"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload to Public
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(e, song)}
                  className="p-1.5 text-yellow-400 hover:text-white hover:bg-yellow-500/10 rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className={`font-bold capitalize px-3 py-1.5 bg-white/5 rounded-full text-xs whitespace-nowrap ${getStatusColor(song.status)}`}>
                  {song.status || 'pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSong && (
        <ChordModal song={selectedSong} onClose={() => setSelectedSong(null)} />
      )}

      {songToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c1c1e] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Song</h3>
            <p className="text-white/60 text-sm mb-6">
              Are you sure you want to permanently delete "{songToDelete.songTitle}"? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setSongToDelete(null)}
                className="px-4 py-2 hover:bg-white/10 rounded-xl text-sm font-medium text-white/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-xl text-sm font-semibold text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full border shadow-xl flex items-center gap-2 text-sm font-medium ${
          toast.type === 'success' 
            ? 'bg-[#1c1c1e] border-yellow-500/40 text-yellow-400' 
            : 'bg-[#1c1c1e] border-yellow-500/40 text-yellow-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
