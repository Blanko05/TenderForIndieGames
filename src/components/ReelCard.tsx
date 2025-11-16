import { Edit, Trash2, Video } from 'lucide-react';
import type { ReelWithTags } from '../hooks/useReels';

interface ReelCardProps {
  reel: ReelWithTags;
  onEdit: () => void;
  onDelete: () => void;
}

export function ReelCard({ reel, onEdit, onDelete }: ReelCardProps) {
  const getVideoEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';

        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0];
        } else if (url.includes('youtube.com/watch')) {
          const urlObj = new URL(url);
          videoId = urlObj.searchParams.get('v') || '';
        } else if (url.includes('youtube.com/shorts/')) {
          videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('/')[0];
        } else if (url.includes('youtube.com/embed/')) {
          videoId = url.split('youtube.com/embed/')[1]?.split('?')[0]?.split('/')[0];
        }

        if (videoId) {
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
          console.log('YouTube URL conversion:', url, '->', embedUrl);
          return embedUrl;
        }
      }

      if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0];
        if (videoId) {
          const embedUrl = `https://player.vimeo.com/video/${videoId}`;
          console.log('Vimeo URL conversion:', url, '->', embedUrl);
          return embedUrl;
        }
      }

      console.log('Using direct URL:', url);
    } catch (error) {
      console.error('Error parsing video URL:', error, 'Original URL:', url);
    }

    return url;
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors">
      <div className="aspect-video bg-slate-700 flex items-center justify-center">
        {reel.video_url ? (
          reel.video_url.includes('supabase.co/storage') ? (
            <video
              src={reel.video_url}
              className="w-full h-full object-contain"
              controls
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              src={getVideoEmbedUrl(reel.video_url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={reel.caption || 'Game reel video'}
              loading="lazy"
              frameBorder="0"
            />
          )
        ) : (
          <Video className="w-12 h-12 text-slate-600" />
        )}
      </div>

      <div className="p-4">
        {reel.caption && (
          <p className="text-slate-300 text-sm mb-3 line-clamp-2">{reel.caption}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {reel.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <button
            onClick={onEdit}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete reel"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
