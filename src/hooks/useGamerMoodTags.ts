import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Tag } from '../types/database';

export function useGamerMoodTags() {
  const [moodTags, setMoodTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMoodTags();
    }
  }, [user]);

  const fetchMoodTags = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_mood_tags')
        .select('tag_id, tags(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      const tags = data?.map((item: any) => item.tags).filter(Boolean) || [];
      setMoodTags(tags);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateMoodTags = async (tagIds: string[]) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      await supabase
        .from('user_mood_tags')
        .delete()
        .eq('user_id', user.id);

      const moodTagsToInsert = tagIds.map((tagId) => ({
        user_id: user.id,
        tag_id: tagId,
      }));

      const { error } = await supabase
        .from('user_mood_tags')
        .insert(moodTagsToInsert);

      if (error) throw error;

      await fetchMoodTags();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return { moodTags, loading, error, updateMoodTags, refetch: fetchMoodTags };
}
