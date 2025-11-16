import { useState, useRef, useEffect } from 'react';
import { X, Heart, ExternalLink } from 'lucide-react';

interface ReelData {
  id: string;
  video_url: string;
  caption: string | null;
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
}

interface SwipeableReelCardProps {
  reel: ReelData;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

export function SwipeableReelCard({ reel, onSwipe, isTop }: SwipeableReelCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isTop && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log('Autoplay prevented:', err);
      });
    } else if (!isTop && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isTop]);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!isTop || isExiting) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isTop || isExiting) return;
    const x = clientX - startPos.x;
    const y = clientY - startPos.y;
    setDragOffset({ x, y });
  };

  const handleDragEnd = () => {
    if (!isDragging || !isTop || isExiting) return;
    setIsDragging(false);

    const threshold = 80;
    if (Math.abs(dragOffset.x) > threshold) {
      setIsExiting(true);
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      const exitX = direction === 'right' ? 1000 : -1000;
      setDragOffset({ x: exitX, y: dragOffset.y });

      setTimeout(() => {
        onSwipe(direction);
      }, 300);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const rotation = dragOffset.x * 0.15;
  const scale = isDragging ? 1.02 : 1;
  const swipeProgress = Math.min(Math.abs(dragOffset.x) / 150, 1);

  const tags = reel.reel_tags?.map((rt) => rt.tags) || [];

  return (
    <div
      className={`absolute w-full ${isExiting ? 'transition-all duration-300 ease-out' : isDragging ? '' : 'transition-all duration-200 ease-out'} ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${scale})`,
        zIndex: isTop ? 10 : 5,
        pointerEvents: isTop && !isExiting ? 'auto' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="aspect-video bg-slate-900 relative">
          <video
            ref={videoRef}
            src={reel.video_url}
            controls
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-contain"
            poster={reel.game_profiles.thumbnail_url || undefined}
          />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-1">
                {reel.game_profiles.game_title}
              </h3>
              {reel.caption && (
                <p className="text-slate-400 text-sm line-clamp-2">{reel.caption}</p>
              )}
            </div>
            <a
              href={reel.game_profiles.itch_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-5 h-5 text-slate-300" />
            </a>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {isTop && !isExiting && (
            <div className="flex gap-4 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setIsExiting(true);
                  setDragOffset({ x: -1000, y: 0 });
                  setTimeout(() => onSwipe('left'), 300);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
                Pass
              </button>
              <button
                onClick={() => {
                  setIsExiting(true);
                  setDragOffset({ x: 1000, y: 0 });
                  setTimeout(() => onSwipe('right'), 300);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                <Heart className="w-5 h-5" />
                Save
              </button>
            </div>
          )}
        </div>

        {(isDragging || isExiting) && dragOffset.x !== 0 && (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black ${
              dragOffset.x > 0 ? 'text-emerald-400' : 'text-red-400'
            } pointer-events-none transition-all duration-100`}
            style={{
              opacity: swipeProgress * 0.9,
              transform: `translate(-50%, -50%) scale(${0.5 + swipeProgress * 0.5}) rotate(${dragOffset.x > 0 ? 12 : -12}deg)`,
              textShadow: '0 0 30px rgba(0,0,0,0.8)',
            }}
          >
            {dragOffset.x > 0 ? '💚' : '❌'}
          </div>
        )}

        {(isDragging || isExiting) && Math.abs(dragOffset.x) > 40 && (
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-100`}
            style={{
              opacity: swipeProgress * 0.3,
              background: dragOffset.x > 0
                ? 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3))'
                : 'linear-gradient(90deg, rgba(239, 68, 68, 0.3), transparent)',
            }}
          />
        )}
      </div>
    </div>
  );
}
