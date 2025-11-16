import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { GameProfile } from '../types/database';

export function useGameProfiles(developerId: string | undefined) {
  const [gameProfiles, setGameProfiles] = useState<GameProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!developerId) {
      setLoading(false);
      return;
    }

    fetchGameProfiles();
  }, [developerId]);

  const fetchGameProfiles = async () => {
    if (!developerId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('developer_id', developerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGameProfiles(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createGameProfile = async (gameData: {
    game_title: string;
    description?: string;
    itch_url: string;
    thumbnail_url?: string;
  }) => {
    if (!developerId) throw new Error('No developer ID');

    const { data, error } = await supabase
      .from('game_profiles')
      .insert({
        developer_id: developerId,
        ...gameData,
      })
      .select()
      .single();

    if (error) throw error;

    setGameProfiles(prev => [data, ...prev]);
    return data;
  };

  const updateGameProfile = async (id: string, updates: Partial<GameProfile>) => {
    const { data, error } = await supabase
      .from('game_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setGameProfiles(prev => prev.map(g => g.id === id ? data : g));
    return data;
  };

  const deleteGameProfile = async (id: string) => {
    const { error } = await supabase
      .from('game_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setGameProfiles(prev => prev.filter(g => g.id !== id));
  };

  return {
    gameProfiles,
    loading,
    error,
    createGameProfile,
    updateGameProfile,
    deleteGameProfile,
    refetch: fetchGameProfiles,
  };
}
