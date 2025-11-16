import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Reel } from '../types/database';

interface LibraryReel extends Reel {
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
  saved_at?: string;
}

export function useGamerLibrary() {
  const [library, setLibrary] = useState<LibraryReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLibrary();
    }
  }, [user]);

  const fetchLibrary = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error: libraryError } = await supabase
        .from('user_library')
        .select(`
          saved_at,
          reel_id,
          reels!inner (
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
          )
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (libraryError) throw libraryError;

      const reels = data?.map((item: any) => ({
        ...item.reels,
        saved_at: item.saved_at,
      })) || [];

      setLibrary(reels);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromLibrary = async (reelId: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('user_id', user.id)
        .eq('reel_id', reelId);

      if (error) throw error;

      setLibrary((prev) => prev.filter((reel) => reel.id !== reelId));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return { library, loading, error, removeFromLibrary, refetch: fetchLibrary };
}
