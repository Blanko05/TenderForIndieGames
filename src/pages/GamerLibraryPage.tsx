import { useState } from 'react';
import { Library, ExternalLink, Play, Trash2 } from 'lucide-react';
import { useGamerLibrary } from '../hooks/useGamerLibrary';

export function GamerLibraryPage() {
  const { library, loading, removeFromLibrary } = useGamerLibrary();
  const [selectedReel, setSelectedReel] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (reelId: string) => {
    setRemoving(reelId);
    const { error } = await removeFromLibrary(reelId);
    if (error) {
      console.error('Remove error:', error);
    }
    setRemoving(null);
  };

  const handleWatchReel = (reelId: string) => {
    setSelectedReel(reelId);
  };

  const closeModal = () => {
    setSelectedReel(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading your library...</div>
      </div>
    );
  }

  const selectedReelData = library.find((r) => r.id === selectedReel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Library className="w-6 h-6 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">My Library</h1>
          </div>
          <p className="text-slate-400">
            {library.length} saved game{library.length === 1 ? '' : 's'}
          </p>
        </div>

        {library.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-700 rounded-full mb-6">
              <Library className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Your Library is Empty</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start swiping right on games you love to build your personal collection
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {library.map((reel) => {
              const tags = reel.reel_tags?.map((rt) => rt.tags) || [];
              return (
                <div
                  key={reel.id}
                  className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="aspect-video bg-slate-900 relative group cursor-pointer" onClick={() => handleWatchReel(reel.id)}>
                    <video
                      src={reel.video_url}
                      className="w-full h-full object-cover"
                      poster={reel.game_profiles.thumbnail_url || undefined}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {reel.game_profiles.game_title}
                    </h3>

                    {reel.caption && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{reel.caption}</p>
                    )}

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={reel.game_profiles.itch_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Game
                      </a>
                      <button
                        onClick={() => handleRemove(reel.id)}
                        disabled={removing === reel.id}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedReelData && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-slate-800 rounded-2xl overflow-hidden max-w-4xl w-full border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-slate-900">
                <video
                  src={selectedReelData.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={selectedReelData.game_profiles.thumbnail_url || undefined}
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedReelData.game_profiles.game_title}
                </h3>
                {selectedReelData.caption && (
                  <p className="text-slate-400 mb-4">{selectedReelData.caption}</p>
                )}
                <div className="flex gap-3">
                  <a
                    href={selectedReelData.game_profiles.itch_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View on itch.io
                  </a>
                  <button
                    onClick={closeModal}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
