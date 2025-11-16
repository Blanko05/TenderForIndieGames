import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateGameModalProps {
  onClose: () => void;
  onSubmit: (data: {
    game_title: string;
    description?: string;
    itch_url: string;
    thumbnail_url?: string;
  }) => Promise<void>;
}

export function CreateGameModal({ onClose, onSubmit }: CreateGameModalProps) {
  const [formData, setFormData] = useState({
    game_title: '',
    description: '',
    itch_url: '',
    thumbnail_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateItchUrl = (url: string) => {
    return url.includes('itch.io') && url.startsWith('http');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.game_title.trim()) {
      setError('Game title is required');
      return;
    }

    if (!formData.itch_url.trim()) {
      setError('Itch.io URL is required');
      return;
    }

    if (!validateItchUrl(formData.itch_url)) {
      setError('Please enter a valid itch.io URL (e.g., https://username.itch.io/game-name)');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        game_title: formData.game_title.trim(),
        description: formData.description.trim() || undefined,
        itch_url: formData.itch_url.trim(),
        thumbnail_url: formData.thumbnail_url.trim() || undefined,
      });
    } catch (err) {
      setError('Failed to create game. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Create Game Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="game_title" className="block text-sm font-medium text-slate-300 mb-2">
              Game Title <span className="text-red-400">*</span>
            </label>
            <input
              id="game_title"
              type="text"
              value={formData.game_title}
              onChange={(e) => setFormData({ ...formData, game_title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your game's title"
              maxLength={100}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="itch_url" className="block text-sm font-medium text-slate-300 mb-2">
              Itch.io URL <span className="text-red-400">*</span>
            </label>
            <input
              id="itch_url"
              type="url"
              value={formData.itch_url}
              onChange={(e) => setFormData({ ...formData, itch_url: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://username.itch.io/game-name"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Brief description of your game"
              rows={3}
              maxLength={500}
              disabled={loading}
            />
            <p className="text-slate-500 text-xs mt-1">{formData.description.length}/500</p>
          </div>

          <div>
            <label htmlFor="thumbnail_url" className="block text-sm font-medium text-slate-300 mb-2">
              Thumbnail URL
            </label>
            <input
              id="thumbnail_url"
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Game'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
