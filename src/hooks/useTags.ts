import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Tag } from '../types/database';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('type', 'vibe')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { tags, loading, error };
}
