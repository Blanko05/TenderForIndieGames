import { Link } from 'react-router-dom';
import { ExternalLink, Trash2, FileVideo } from 'lucide-react';
import type { GameProfile } from '../types/database';

interface GameProfileCardProps {
  game: GameProfile;
  onDelete: () => void;
}

export function GameProfileCard({ game, onDelete }: GameProfileCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors">
      <div className="aspect-video bg-slate-700 flex items-center justify-center">
        {game.thumbnail_url ? (
          <img
            src={game.thumbnail_url}
            alt={game.game_title}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileVideo className="w-12 h-12 text-slate-600" />
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
          {game.game_title}
        </h3>
        {game.description && (
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">{game.description}</p>
        )}

        <a
          href={game.itch_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm mb-4"
        >
          <span>View on itch.io</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <Link
            to={`/dashboard/games/${game.id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Manage Reels
          </Link>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete game"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
