import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Search, ChevronLeft, LogOut, Plus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Song } from './types';
import { ChordModal } from './components/ChordModal';
import { 
  fetchApprovedSongs, 
  fetchUserSongs, 
  updateSong, 
  deleteSongPermanent, 
  UnifiedUser 
} from './lib/supabase';
import { 
  subscribeToAuthChanges, 
  isUserAdmin, 
  signOutUser 
} from './lib/supabaseAuth';

import { SupabaseBanner } from './components/SupabaseBanner';
import { LandingPage } from './components/LandingPage';
import { ChordEditor } from './components/ChordEditor';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { UserDashboard } from './components/UserDashboard';
import { LoginPage } from './components/LoginPage';

export default function App() {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsAdmin(isUserAdmin(currentUser));
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">Loading GuitarCordMM...</div>;
  }

  return (
    <BrowserRouter>
      <SupabaseBanner />
      <Routes>
        <Route path="/" element={<LandingPage user={user} isAdmin={isAdmin} />} />
        <Route path="/songs" element={<SimpleSongList user={user} isAdmin={isAdmin} />} />
        <Route path="/chord/:chordId" element={<SimpleSongList user={user} isAdmin={isAdmin} />} />
        <Route path="/create" element={<ChordEditor onClose={() => window.history.back()} user={user} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={user && !user.isAnonymous ? <UserDashboard userId={user.uid} /> : <LandingPage user={user} isAdmin={isAdmin} />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

type SortOption = 'Last update' | 'Name';

function SimpleSongList({ user, isAdmin }: { user: UnifiedUser | null, isAdmin?: boolean }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('Last update');
  
  const navigate = useNavigate();
  const { chordId } = useParams();

  const selectedSong = useMemo(() => {
    return [...songs, ...userSongs].find(s => s.id === chordId) || null;
  }, [chordId, songs, userSongs]);

  // SEO metadata
  const pageTitle = selectedSong 
    ? `ဘုရားရှိခိုး - ${selectedSong.songTitle} Chords & Lyrics by ${selectedSong.artist} | GuitarCordMM`
    : 'ဂီတာချော့နှင့် သီချင်းစာသားများ - Guitar Chord Library | GuitarCordMM';
  
  const pageDescription = selectedSong
    ? `${selectedSong.songTitle} (${selectedSong.artist}) ကို ဂီတာတီးခတ်နည်း၊ ချော့များနှင့် သီချင်းစာသားများကို GuitarCordMM မှာ အခမဲ့လေ့လာပါ။ accurate guitar chords, lyrics, and guide.`
    : 'မြန်မာသီချင်းများနှင့် နိုင်ငံတကာသီချင်းများ၏ ဂီတာချော့များကို ရှာဖွေပါ။ accurate chords, lyrics, and transposition tools.';

  const keywords = selectedSong
    ? `${selectedSong.songTitle} chords, ${selectedSong.songTitle} lyrics, ${selectedSong.artist} ဂီတာချော့, မြန်မာသီချင်းချော့, guitar tutorial burmese`
    : 'ဂီတာချော့, သီချင်းစာသား, guitar chords, lyrics, guitarcordmm, မြန်မာသီချင်းစာအုပ်, guitar chords library';

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) setLoading(true);
      try {
        if (!isMounted) return;

        // Fetch user songs if signed in
        if (user && !user.isAnonymous) {
          try {
            const mySongs = await fetchUserSongs(user.uid);
            if (isMounted) {
              setUserSongs(mySongs.filter(s => s.status !== 'deleted'));
            }
          } catch (e) {
            console.error('Failed to load user songs:', e);
          }
        }

        // Fetch approved public songs from Supabase
        const approvedSongs = await fetchApprovedSongs();
        if (isMounted) {
          setSongs(approvedSongs);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error loading songs from Supabase:', err);
          setError('Could not fetch songs from database.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [user]);

  const displayedSongs = useMemo(() => {
    let list = [...songs];
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      list = list.filter(s => 
        s.songTitle.toLowerCase().includes(lowerSearch) ||
        s.artist.toLowerCase().includes(lowerSearch) ||
        (s.lyrics && s.lyrics.toLowerCase().includes(lowerSearch))
      );
    }
    
    if (sortOption === 'Name') {
      list.sort((a, b) => a.songTitle.localeCompare(b.songTitle));
    }
    
    return list;
  }, [songs, searchTerm, sortOption]);

  const handleSongClick = (song: Song) => {
    navigate(`/chord/${song.id}`);
  };

  const handleModalClose = () => {
    navigate('/songs');
  };

  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!songToDelete) return;
    try {
      await updateSong(songToDelete.id, {
        status: 'deleted'
      });
      setSongs(prev => prev.filter(s => s.id !== songToDelete.id));
      setUserSongs(prev => prev.filter(s => s.id !== songToDelete.id));
      setSongToDelete(null);
    } catch (err: any) {
      console.error(err);
      setActionError('Failed to delete song: ' + (err.message || 'Error'));
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleDeleteSong = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setSongToDelete(song);
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 pb-32">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {selectedSong?.imageURL && <meta property="og:image" content={selectedSong.imageURL} />}
        {selectedSong && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MusicRecording",
              "name": selectedSong.songTitle,
              "description": `${selectedSong.artist} ၏ ${selectedSong.songTitle} သီချင်းအတွက် ဂီတာချော့နှင့် သီချင်းစာသားများ`,
              "byArtist": {
                "@type": "MusicGroup",
                "name": selectedSong.artist
              },
              "genre": selectedSong.genre,
              "iswcCode": selectedSong.id,
              "url": window.location.href,
              "image": selectedSong.imageURL,
              "lyrics": {
                "@type": "CreativeWork",
                "text": selectedSong.lyrics
              },
              "datePublished": "2026-04-28"
            })}
          </script>
        )}
      </Helmet>

      {/* Header */}
      <header className="px-4 pt-safe pb-4 sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-white/[0.08]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 mb-0">
            <ChevronLeft className="w-8 h-8 text-[#0a84ff] -ml-2 cursor-pointer" onClick={() => navigate('/')} />
            <h1 className="text-3xl font-bold">Songs</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user && !user.isAnonymous && (
              <button 
                onClick={async () => {
                  await signOutUser();
                  window.location.reload();
                }}
                className="p-2 sm:px-4 sm:py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors flex items-center gap-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5 sm:w-4 sm:h-4 text-white/60" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </button>
            )}
            <button 
              onClick={() => navigate('/create')}
              className="flex items-center justify-center bg-[#0a84ff]/20 text-[#0a84ff] p-2.5 rounded-full hover:bg-[#0a84ff]/30 transition-colors"
              title="Create new song"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sort Tabs */}
        <div className="flex gap-3 mb-2">
          {(['Last update', 'Name'] as SortOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortOption(opt)}
              className={`px-6 py-1.5 rounded-full text-[15px] transition-colors ${
                sortOption === opt 
                  ? 'border border-[#0a84ff] text-white' 
                  : 'bg-[#1c1c1e] text-white hover:bg-white/20 border border-transparent'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <main className="px-4 mt-2">
        {loading ? (
          <div className="py-10 text-center text-white/50">Loading songs from database...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-400">
            <p className="mb-2">{error}</p>
            <p className="text-xs text-white/50">Please verify your Supabase connection settings above.</p>
          </div>
        ) : displayedSongs.length === 0 ? (
          <div className="py-10 text-center text-white/50">
            <p>No songs found in the library yet.</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-4 px-4 py-2 bg-[#0a84ff] text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors"
            >
              Add the first song
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {displayedSongs.map((song, idx) => (
              <div 
                key={song.id || idx}
                onClick={() => handleSongClick(song)}
                className="flex items-center gap-4 py-3 border-b border-white/[0.08] cursor-pointer active:bg-[#1c1c1e] transition-colors"
              >
                <div className="text-[#0a84ff] flex-shrink-0">
                  <svg xmlns="http://www.w3.org/-2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M19.36 3.637a1.5 1.5 0 0 1 .536 1.884l-3 7.5a1.5 1.5 0 0 1-1.357.943H12V18a4 4 0 1 1-2-3.464V4.5A1.5 1.5 0 0 1 11.5 3h7a1.5 1.5 0 0 1 .86.637ZM10.5 18a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0ZM13 12.5h2.243l2.4-6H13v6Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-white text-[17px] font-normal truncate tracking-wide">{song.songTitle}</span>
                  <span className="text-[#8e8e93] text-[15px] truncate tracking-wide">{song.artist}</span>
                  {searchTerm && song.lyrics && song.lyrics.toLowerCase().includes(searchTerm.toLowerCase()) && !song.songTitle.toLowerCase().includes(searchTerm.toLowerCase()) && !song.artist.toLowerCase().includes(searchTerm.toLowerCase()) && (
                    <span className="text-[#0a84ff]/60 text-[12px] truncate mt-1 italic">
                      Matched in lyrics: ...{song.lyrics.split('\n').find(l => l.toLowerCase().includes(searchTerm.toLowerCase()))?.replace(/\[[^\]]+\]/g, '').trim()}...
                    </span>
                  )}
                </div>
                {isAdmin && song.status === 'approved' && (
                  <div className="flex gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingSong(song)}
                      className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-500 rounded-lg text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDeleteSong(song, e)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded-lg text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* List Watermark */}
        <div className="py-20 flex flex-col items-center select-none pointer-events-none">
          <p className="text-[#8e8e93] text-[9px] font-bold tracking-[0.3em] mb-1 uppercase opacity-20">Proudly hosted at</p>
          <p className="text-white/10 text-xl font-black tracking-tighter uppercase">guitarcordmm.com</p>
        </div>
      </main>

      {/* Search Input Box */}
      <div className="fixed bottom-0 pb-[max(1.5rem,calc(0.75rem+env(safe-area-inset-bottom)))] pt-3 bg-black/90 backdrop-blur-md left-0 right-0 z-10 border-t border-white/[0.08]">
        <div className="bg-[#1c1c1e] rounded-[12px] flex items-center px-3.5 py-2.5 mx-4 border drop-shadow-sm border-white/[0.08] focus-within:border-[#0a84ff]/50 transition-colors">
          <Search className="w-[18px] h-[18px] text-[#8e8e93] mr-2.5" />
          <input
            type="text"
            placeholder="Search songs, artists, or lyrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-[16px] w-full text-white placeholder-[#8e8e93]"
          />
        </div>
      </div>

      {actionError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c1e] border border-red-500/40 text-red-400 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl">
          {actionError}
        </div>
      )}

      {selectedSong && (
        <ChordModal 
          song={selectedSong} 
          onClose={handleModalClose} 
          isAdmin={isAdmin} 
          user={user}
        />
      )}

      {editingSong && (
        <ChordEditor 
          onClose={() => setEditingSong(null)} 
          initialSongData={editingSong} 
          isAdmin={true} 
          user={user} 
        />
      )}

      {songToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete "{songToDelete.songTitle}"? It will be moved to the recycle bin.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setSongToDelete(null)}
                className="px-4 py-2 hover:bg-white/10 rounded font-semibold transition-colors text-sm"
               >
                 Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-semibold transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { SimpleSongList };
