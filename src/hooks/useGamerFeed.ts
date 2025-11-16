import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Reel } from '../types/database';

interface ReelWithDetails extends Reel {
  game_profiles: {
    id: string;
    game_title: string;
    itch_url: string;
    thumbnail_url: string | null;
  };
  reel_tags: Array<{
    tags: {
      id: string;
      name: string;
    };
  }>;
}

export function useGamerFeed() {
  const [reels, setReels] = useState<ReelWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user]);

  const fetchFeed = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: userMoodTags, error: moodError } = await supabase
        .from('user_mood_tags')
        .select('tag_id')
        .eq('user_id', user.id);

      if (moodError) throw moodError;

      const tagIds = userMoodTags?.map((mt) => mt.tag_id) || [];

      if (tagIds.length === 0) {
        setReels([]);
        setLoading(false);
        return;
      }

      const { data: swipedReels, error: swipedError } = await supabase
        .from('swipes')
        .select('reel_id')
        .eq('user_id', user.id);

      if (swipedError) throw swipedError;

      const swipedReelIds = swipedReels?.map((s) => s.reel_id) || [];

      const { data: matchingReelTags, error: reelTagsError } = await supabase
        .from('reel_tags')
        .select('reel_id')
        .in('tag_id', tagIds);

      if (reelTagsError) throw reelTagsError;

      const matchingReelIds = [...new Set(matchingReelTags?.map((rt) => rt.reel_id) || [])];

      const availableReelIds = matchingReelIds.filter((id) => !swipedReelIds.includes(id));

      if (availableReelIds.length === 0) {
        setReels([]);
        setLoading(false);
        return;
      }

      const { data: reelsData, error: reelsError } = await supabase
        .from('reels')
        .select(`
          *,
          game_profiles!inner (
            id,
            game_title,
            itch_url,
            thumbnail_url
          ),
          reel_tags (
            tags (
              id,
              name
            )
          )
        `)
        .in('id', availableReelIds)
        .order('created_at', { ascending: false });

      if (reelsError) throw reelsError;

      setReels((reelsData as any) || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { reels, loading, error, refetch: fetchFeed };
}
