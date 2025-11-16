import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RedirectByUserType() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.user_type === 'gamer') {
    return <Navigate to="/gamer/feed" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
