import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { useNavigate } from 'react-router-dom';
import { ChordModal } from './ChordModal';
import { ChordEditor } from './ChordEditor';
import { motion, AnimatePresence } from 'motion/react';
import { fetchAdminSongs, updateSong, deleteSongPermanent, UnifiedUser } from '../lib/supabase';
import { subscribeToAuthChanges, isUserAdmin, signOutUser } from '../lib/supabaseAuth';

export function AdminPanel() {
  const [submissions, setSubmissions] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UnifiedUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'rejected' | 'deleted'>('pending');
  const navigate = useNavigate();

  const showStatus = (message: string, type: 'success' | 'error' = 'success') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 3000);
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      const adminStatus = isUserAdmin(user);
      setIsAdmin(adminStatus);
      if (!user) {
        navigate('/admin');
      } else if (adminStatus) {
        loadSubmissions(statusTab);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadSubmissions(statusTab);
    }
  }, [statusTab, isAdmin]);

  const loadSubmissions = async (tab: string) => {
    try {
      setLoading(true);
      const data = await fetchAdminSongs(tab);
      setSubmissions(data);
    } catch (err: any) {
      console.error('Error fetching admin submissions:', err);
      showStatus('Failed to load songs: ' + (err.message || 'Error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected' | 'delete' | 'deleted' | 'restore') => {
    try {
      if (action === 'delete') {
        setSongToDelete(id);
      } else if (action === 'deleted') {
        await updateSong(id, { status: 'deleted' });
        setSubmissions(prev => prev.filter(s => s.id !== id));
        showStatus('Song moved to deleted');
      } else if (action === 'restore') {
        await updateSong(id, { status: 'approved' });
        setSubmissions(prev => prev.filter(s => s.id !== id));
        showStatus('Song restored to approved');
      } else {
        await updateSong(id, { 
          status: action,
          isWatermarked: true,
          approvedAt: new Date(),
          approvedBy: currentUser?.email,
        });
        setSubmissions(prev => prev.filter(s => s.id !== id));
        showStatus(`Song marked as ${action}`);
      }
    } catch (err: any) {
      console.error('Error updating song:', err);
      showStatus('Action failed: ' + err.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!songToDelete) return;
    try {
      await deleteSongPermanent(songToDelete);
      setSubmissions(prev => prev.filter(s => s.id !== songToDelete));
      setSongToDelete(null);
      showStatus('Song permanently deleted');
    } catch (err: any) {
      console.error('Error deleting song:', err);
      showStatus('Delete failed: ' + err.message, 'error');
    }
  };

  if (loading && !isAdmin) return <div className="text-white p-6 bg-black min-h-screen flex items-center justify-center">Checking credentials...</div>;

  if (!isAdmin) {
    return (
      <div className="p-6 bg-black min-h-screen text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4 text-yellow-500">Access Denied</h1>
        <p className="mb-6 text-white/70">Your account ({currentUser?.email || 'Guest'}) is not authorized as an administrator.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-white/10 px-6 py-2 rounded-lg font-bold hover:bg-white/20 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white flex flex-col h-screen overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">&larr; Back to App</button>
          <h1 className="text-2xl font-bold">Admin Management Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
            Admin: {currentUser?.email}
          </span>
          <button
            onClick={async () => {
              await signOutUser();
              navigate('/');
            }}
            className="text-xs text-yellow-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
        {(['pending', 'approved', 'rejected', 'deleted'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-2 font-semibold capitalize transition-colors ${statusTab === tab ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading {statusTab} songs from Supabase...</p>
      ) : submissions.length === 0 ? (
        <p className="text-gray-400">No {statusTab} submissions found.</p>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {submissions.map(song => (
            <div key={song.id} className="p-4 bg-white/5 rounded-lg flex items-center justify-between border border-white/5 hover:bg-white/10 transition-colors">
              <div>
                <h3 className="font-bold text-lg">{song.songTitle || song.title}</h3>
                <p className="text-sm text-gray-400">{song.artist} {song.genre ? `• ${song.genre}` : ''}</p>
              </div>
              <div className="space-x-2 flex items-center">
                <button onClick={() => setSelectedSong(song)} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-xs font-semibold transition-colors">View</button>
                <button onClick={() => setEditingSong(song)} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-xs font-semibold transition-colors">Edit</button>
                {statusTab === 'pending' && (
                  <>
                    <button onClick={() => handleAction(song.id, 'approved')} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-1.5 rounded text-xs font-semibold transition-colors">Approve</button>
                    <button onClick={() => handleAction(song.id, 'rejected')} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-1.5 rounded text-xs font-semibold transition-colors">Reject</button>
                  </>
                )}
                {statusTab === 'approved' && (
                   <button onClick={() => handleAction(song.id, 'rejected')} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-1.5 rounded text-xs font-semibold transition-colors">Reject</button>
                )}
                {statusTab === 'rejected' && (
                   <button onClick={() => handleAction(song.id, 'approved')} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-1.5 rounded text-xs font-semibold transition-colors">Approve</button>
                )}
                {statusTab === 'deleted' ? (
                  <>
                    <button onClick={() => handleAction(song.id, 'restore')} className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1.5 rounded text-xs font-semibold transition-colors">Restore</button>
                    <button onClick={() => handleAction(song.id, 'delete')} className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1.5 rounded text-xs font-semibold transition-colors">Delete Permanently</button>
                  </>
                ) : (
                  <button onClick={() => handleAction(song.id, 'deleted')} className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1.5 rounded text-xs font-semibold transition-colors">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedSong && (
        <ChordModal 
          song={selectedSong} 
          onClose={() => setSelectedSong(null)} 
          user={currentUser}
          isAdmin={true}
        />
      )}

      {editingSong && (
        <ChordEditor 
          onClose={() => {
            setEditingSong(null);
            loadSubmissions(statusTab);
          }} 
          initialSongData={editingSong}
          isAdmin={true}
          user={currentUser}
        />
      )}

      {songToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Permanent Deletion</h3>
            <p className="text-gray-300 mb-6 text-sm">Are you sure you want to permanently delete this song from Supabase? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setSongToDelete(null)}
                className="px-4 py-2 hover:bg-white/10 rounded font-semibold transition-colors text-sm"
               >
                 Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-semibold transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${
              status.type === 'success' 
                ? 'bg-yellow-500/90 border-yellow-400/50 text-white' 
                : 'bg-yellow-500/90 border-yellow-400/50 text-white'
            }`}
          >
            <span className="font-semibold text-sm tracking-wide">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
