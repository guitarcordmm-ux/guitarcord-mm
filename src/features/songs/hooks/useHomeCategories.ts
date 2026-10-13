import { useEffect, useState } from 'react';
import { fetchHomeSongs } from '../../../services/songs/songService';
import type { Song } from '../../../types';

export type HomeCategory = 'popular' | 'recent' | 'myanmar' | 'easy';

type HomeCategories = Record<HomeCategory, Song[]>;

const EMPTY: HomeCategories = {
  popular: [],
  recent: [],
  myanmar: [],
  easy: [],
};

export function useHomeCategories(selectedCategory: HomeCategory) {
  const [categories, setCategories] = useState<HomeCategories>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');
    fetchHomeSongs(selectedCategory, 8)
      .then(songs => {
        if (!active) return;
        setCategories(current => ({ ...current, [selectedCategory]: songs }));
      })
      .catch(err => {
        if (!active) return;
        console.error('Home category fetch failed:', err);
        setError(err instanceof Error ? err.message : 'Could not load home categories.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory]);

  return { categories, loading, error };
}
