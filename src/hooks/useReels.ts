import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Reel, Tag } from '../types/database';

export type ReelWithTags = Reel & {
  tags: Tag[];
};

export function useReels(gameProfileId: string | undefined) {
  const [reels, setReels] = useState<ReelWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameProfileId) {
      setLoading(false);
      return;
    }

    fetchReels();
  }, [gameProfileId]);

  const fetchReels = async () => {
    if (!gameProfileId) return;

    try {
      setLoading(true);
      const { data: reelsData, error: reelsError } = await supabase
        .from('reels')
        .select('*')
        .eq('game_profile_id', gameProfileId)
        .order('order_index', { ascending: true });

      if (reelsError) throw reelsError;

      const reelsWithTags = await Promise.all(
        (reelsData || []).map(async (reel) => {
          const { data: tagsData } = await supabase
            .from('reel_tags')
            .select('tag_id, tags(*)')
            .eq('reel_id', reel.id);

          const tags = tagsData?.map((rt: any) => rt.tags) || [];
          return { ...reel, tags };
        })
      );

      setReels(reelsWithTags);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createReel = async (reelData: {
    video_url: string;
    caption?: string;
    tagIds: string[];
  }) => {
    if (!gameProfileId) throw new Error('No game profile ID');

    const { data: reel, error: reelError } = await supabase
      .from('reels')
      .insert({
        game_profile_id: gameProfileId,
        video_url: reelData.video_url,
        caption: reelData.caption,
        order_index: reels.length,
      })
      .select()
      .single();

    if (reelError) throw reelError;

    if (reelData.tagIds.length > 0) {
      const { error: tagsError } = await supabase
        .from('reel_tags')
        .insert(reelData.tagIds.map(tagId => ({
          reel_id: reel.id,
          tag_id: tagId,
        })));

      if (tagsError) throw tagsError;
    }

    await fetchReels();
    return reel;
  };

  const updateReel = async (id: string, updates: {
    video_url?: string;
    caption?: string;
    tagIds?: string[];
  }) => {
    const { video_url, caption, tagIds } = updates;

    if (video_url !== undefined || caption !== undefined) {
      const { error } = await supabase
        .from('reels')
        .update({
          ...(video_url !== undefined && { video_url }),
          ...(caption !== undefined && { caption }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    }

    if (tagIds !== undefined) {
      await supabase.from('reel_tags').delete().eq('reel_id', id);

      if (tagIds.length > 0) {
        const { error: tagsError } = await supabase
          .from('reel_tags')
          .insert(tagIds.map(tagId => ({
            reel_id: id,
            tag_id: tagId,
          })));

        if (tagsError) throw tagsError;
      }
    }

    await fetchReels();
  };

  const deleteReel = async (id: string) => {
    const { error } = await supabase
      .from('reels')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setReels(prev => prev.filter(r => r.id !== id));
  };

  return {
    reels,
    loading,
    error,
    createReel,
    updateReel,
    deleteReel,
    refetch: fetchReels,
  };
}
