import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGameProfiles } from '../hooks/useGameProfiles';
import { DashboardLayout } from '../components/DashboardLayout';
import { GameProfileCard } from '../components/GameProfileCard';
import { CreateGameModal } from '../components/CreateGameModal';
import { Plus } from 'lucide-react';

export function DashboardPage() {
  const { profile } = useAuth();
  const { gameProfiles, loading, createGameProfile, deleteGameProfile } = useGameProfiles(profile?.id);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateGame = async (gameData: {
    game_title: string;
    description?: string;
    itch_url: string;
    thumbnail_url?: string;
  }) => {
    try {
      await createGameProfile(gameData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this game? All reels will also be deleted.')) {
      try {
        await deleteGameProfile(id);
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Games</h1>
            <p className="text-slate-400">Manage your game profiles and reels</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Game</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : gameProfiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
              <Plus className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No games yet</h3>
            <p className="text-slate-400 mb-6">Create your first game profile to start showcasing your work</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Game</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameProfiles.map((game) => (
              <GameProfileCard
                key={game.id}
                game={game}
                onDelete={() => handleDeleteGame(game.id)}
              />
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateGameModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateGame}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
