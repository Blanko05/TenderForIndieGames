import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { TrendingUp, Video, ThumbsUp, Eye } from 'lucide-react';

interface GameStats {
  game_id: string;
  game_title: string;
  reel_count: number;
  total_swipes: number;
  right_swipes: number;
  right_swipe_rate: number;
}

export function AnalyticsPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    games: 0,
    reels: 0,
    totalSwipes: 0,
    rightSwipeRate: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      fetchAnalytics();
    }
  }, [profile?.id]);

  const fetchAnalytics = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      const { data: games, error: gamesError } = await supabase
        .from('game_profiles')
        .select('id, game_title')
        .eq('developer_id', profile.id);

      if (gamesError) throw gamesError;

      const gameStats: GameStats[] = await Promise.all(
        (games || []).map(async (game) => {
          const { data: reels } = await supabase
            .from('reels')
            .select('id')
            .eq('game_profile_id', game.id);

          const reelIds = reels?.map(r => r.id) || [];

          if (reelIds.length === 0) {
            return {
              game_id: game.id,
              game_title: game.game_title,
              reel_count: 0,
              total_swipes: 0,
              right_swipes: 0,
              right_swipe_rate: 0,
            };
          }

          const { data: allSwipes } = await supabase
            .from('swipes')
            .select('direction')
            .in('reel_id', reelIds);

          const totalSwipes = allSwipes?.length || 0;
          const rightSwipes = allSwipes?.filter(s => s.direction === 'right').length || 0;
          const rightSwipeRate = totalSwipes > 0 ? (rightSwipes / totalSwipes) * 100 : 0;

          return {
            game_id: game.id,
            game_title: game.game_title,
            reel_count: reelIds.length,
            total_swipes: totalSwipes,
            right_swipes: rightSwipes,
            right_swipe_rate: rightSwipeRate,
          };
        })
      );

      setStats(gameStats);

      const totalGames = gameStats.length;
      const totalReels = gameStats.reduce((sum, g) => sum + g.reel_count, 0);
      const totalSwipes = gameStats.reduce((sum, g) => sum + g.total_swipes, 0);
      const totalRightSwipes = gameStats.reduce((sum, g) => sum + g.right_swipes, 0);
      const overallRightSwipeRate = totalSwipes > 0 ? (totalRightSwipes / totalSwipes) * 100 : 0;

      setTotals({
        games: totalGames,
        reels: totalReels,
        totalSwipes,
        rightSwipeRate: overallRightSwipeRate,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Analytics</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-6 h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Total Games</p>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">{totals.games}</p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Total Reels</p>
                  <Video className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white">{totals.reels}</p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Total Swipes</p>
                  <Eye className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-white">{totals.totalSwipes}</p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Avg. Like Rate</p>
                  <ThumbsUp className="w-5 h-5 text-pink-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {totals.rightSwipeRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Game Performance</h2>
              {stats.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No games yet. Create your first game to see analytics.
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.map((game) => (
                    <div
                      key={game.game_id}
                      className="bg-slate-900 rounded-lg p-4 border border-slate-700"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3">{game.game_title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Reels</p>
                          <p className="text-white font-semibold">{game.reel_count}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Total Swipes</p>
                          <p className="text-white font-semibold">{game.total_swipes}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Likes</p>
                          <p className="text-white font-semibold">{game.right_swipes}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Like Rate</p>
                          <p className="text-white font-semibold">
                            {game.right_swipe_rate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      {game.total_swipes > 0 && (
                        <div className="mt-3">
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${game.right_swipe_rate}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
