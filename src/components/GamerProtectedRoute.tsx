import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function GamerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/get-started" />;
  }

  if (profile.user_type !== 'gamer') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Access denied. Gamer account required.</div>
      </div>
    );
  }

  return <>{children}</>;
}
