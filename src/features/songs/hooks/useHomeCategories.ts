import { useEffect, useState } from 'react';
import { fetchHomeSongs } from '../../../services/songs/songService';
import type { Song } from '../../../types';

export type HomeCategory = 'popular' | 'recent' | 'myanmar' | 'easy';

export function useHomeCategories(selectedCategory: HomeCategory) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSongs([]);
    setLoading(true);
    setError('');

    fetchHomeSongs(selectedCategory, 8)
      .then(songs => {
        if (!cancelled) setSongs(songs);
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
