import { useEffect, useState } from 'react';
import {
  searchSongs,
  type SongSearchResult,
} from '../../../services/songs/songService';

export function useSongSearch(query: string) {
  const [results, setResults] = useState<SongSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setResults([]);
      setLoading(false);
      setError('');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const nextResults = await searchSongs(normalizedQuery, {
          limit: 20,
          signal: controller.signal,
        });

        if (!controller.signal.aborted) setResults(nextResults);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Song search failed:', err);
        setResults([]);
        setError(err instanceof Error ? err.message : 'Song search failed.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return { results, loading, error };
}
