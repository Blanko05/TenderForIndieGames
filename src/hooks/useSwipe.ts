import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSwipe() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const swipe = async (reelId: string, direction: 'left' | 'right') => {
    if (!user) return { error: new Error('User not authenticated') };

    setLoading(true);

    try {
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          reel_id: reelId,
          direction,
        });

      if (swipeError) throw swipeError;

      if (direction === 'right') {
        const { error: libraryError } = await supabase
          .from('user_library')
          .insert({
            user_id: user.id,
            reel_id: reelId,
          });

        if (libraryError) throw libraryError;
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    } finally {
      setLoading(false);
    }
  };

  return { swipe, loading };
}
