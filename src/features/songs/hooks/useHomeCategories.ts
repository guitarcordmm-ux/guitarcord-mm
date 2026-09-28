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

export function useHomeCategories() {
  const [categories, setCategories] = useState<HomeCategories>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all(
      (Object.keys(EMPTY) as HomeCategory[]).map(async category => ({
        category,
        songs: await fetchHomeSongs(category, 8),
      })),
    )
      .then(items => {
        if (!active) return;
        setCategories(items.reduce<HomeCategories>((acc, item) => {
          acc[item.category] = item.songs;
          return acc;
        }, { ...EMPTY }));
        setError('');
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
  }, []);

  return { categories, loading, error };
}
