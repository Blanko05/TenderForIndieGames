import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useReels } from '../hooks/useReels';
import { DashboardLayout } from '../components/DashboardLayout';
import { ReelCard } from '../components/ReelCard';
import { CreateReelModal } from '../components/CreateReelModal';
import { EditReelModal } from '../components/EditReelModal';
import { EditGameModal } from '../components/EditGameModal';
import { Plus, ArrowLeft, ExternalLink, Settings } from 'lucide-react';
import type { GameProfile } from '../types/database';
import type { ReelWithTags } from '../hooks/useReels';

export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<GameProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { reels, createReel, updateReel, deleteReel } = useReels(gameId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelWithTags | null>(null);
  const [showEditGameModal, setShowEditGameModal] = useState(false);

  useEffect(() => {
    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  const fetchGame = async () => {
    if (!gameId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      setGame(data);
    } catch (error) {
      console.error('Error fetching game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReel = async (reelData: { video_url: string; caption?: string; tagIds: string[] }) => {
    try {
      await createReel(reelData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating reel:', error);
      throw error;
    }
  };

  const handleUpdateReel = async (id: string, updates: { video_url?: string; caption?: string; tagIds?: string[] }) => {
    try {
      await updateReel(id, updates);
      setEditingReel(null);
    } catch (error) {
      console.error('Error updating reel:', error);
      throw error;
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reel?')) {
      try {
        await deleteReel(id);
      } catch (error) {
        console.error('Error deleting reel:', error);
      }
    }
  };

  const handleUpdateGame = async (updates: Partial<GameProfile>) => {
    if (!gameId) return;

    try {
      const { data, error } = await supabase
        .from('game_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', gameId)
        .select()
        .single();

      if (error) throw error;
      setGame(data);
      setShowEditGameModal(false);
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-800 rounded-lg h-96" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!game) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-white mb-2">Game not found</h3>
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300">
            Back to dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Games</span>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{game.game_title}</h1>
              {game.description && <p className="text-slate-400 mb-3">{game.description}</p>}
              <a
                href={game.itch_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300"
              >
                <span>View on itch.io</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <button
              onClick={() => setShowEditGameModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Game Info</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Reels <span className="text-slate-500">({reels.length})</span>
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Reel</span>
          </button>
        </div>

        {reels.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 rounded-lg border border-slate-700">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 rounded-full mb-4">
              <Plus className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No reels yet</h3>
            <p className="text-slate-400 mb-6">Add your first reel to showcase this game</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Reel</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reels.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                onEdit={() => setEditingReel(reel)}
                onDelete={() => handleDeleteReel(reel.id)}
              />
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateReelModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateReel} />
        )}

        {editingReel && (
          <EditReelModal
            reel={editingReel}
            onClose={() => setEditingReel(null)}
            onSubmit={(updates) => handleUpdateReel(editingReel.id, updates)}
          />
        )}

        {showEditGameModal && game && (
          <EditGameModal
            game={game}
            onClose={() => setShowEditGameModal(false)}
            onSubmit={handleUpdateGame}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
