import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { SwipeableReelCard } from '../components/SwipeableReelCard';
import { WelcomeNotification } from '../components/WelcomeNotification';
import { useGamerFeed } from '../hooks/useGamerFeed';
import { useSwipe } from '../hooks/useSwipe';

export function GamerFeedPage() {
  const { reels, loading, refetch } = useGamerFeed();
  const { swipe, loading: swiping } = useSwipe();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
  }, [reels]);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('gamer_welcome_seen');
    if (!hasSeenWelcome && !loading && reels.length > 0) {
      setShowWelcome(true);
      localStorage.setItem('gamer_welcome_seen', 'true');
    }
  }, [loading, reels]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (isAnimating || swiping || currentIndex >= reels.length) return;

    const currentReel = reels[currentIndex];
    setIsAnimating(true);

    const { error } = await swipe(currentReel.id, direction);

    if (error) {
      console.error('Swipe error:', error);
      setIsAnimating(false);
      return;
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading your feed...</div>
      </div>
    );
  }

  const visibleReels = reels.slice(currentIndex, currentIndex + 2);
  const hasMoreReels = currentIndex < reels.length;

  return (
    <>
      {showWelcome && <WelcomeNotification onClose={() => setShowWelcome(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
        <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Discover Games</h1>
          </div>
          <p className="text-slate-400">
            {hasMoreReels
              ? `${reels.length - currentIndex} game${reels.length - currentIndex === 1 ? '' : 's'} waiting for you`
              : 'No more games to discover'}
          </p>
        </div>

        {hasMoreReels ? (
          <div className="relative" style={{ minHeight: '600px' }}>
            {visibleReels.map((reel, index) => (
              <SwipeableReelCard
                key={reel.id}
                reel={reel}
                onSwipe={handleSwipe}
                isTop={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-700 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">All Caught Up!</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              You've seen all the games matching your mood tags. Check back later for new content or update your mood preferences.
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Feed
            </button>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
