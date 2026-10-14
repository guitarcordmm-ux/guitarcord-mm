import { useEffect, useState } from 'react';
import { fetchHomeSongs, getCachedHomeSongs, prefetchApprovedSongs } from '../../../services/songs/songService';
import type { Song } from '../../../types';

export type HomeCategory = 'popular' | 'recent' | 'myanmar' | 'easy';

export function useHomeCategories(selectedCategory: HomeCategory) {
  const [songs, setSongs] = useState<Song[]>(() => getCachedHomeSongs(selectedCategory, 8));
  const [loading, setLoading] = useState(() => getCachedHomeSongs(selectedCategory, 8).length === 0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const cachedSongs = getCachedHomeSongs(selectedCategory, 8);
    setSongs(cachedSongs);
    setLoading(cachedSongs.length === 0);
    setError('');

    fetchHomeSongs(selectedCategory, 8)
      .then(songs => {
        if (!cancelled) {
          setSongs(songs);
          setError('');
          void prefetchApprovedSongs(songs.map(song => song.id));
        }
      })
      .catch(error => {
        if (cancelled) return;
        console.error('Home category fetch failed:', error);
        setError(error instanceof Error ? error.message : 'Could not load songs.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  return { songs, loading, error };
}
