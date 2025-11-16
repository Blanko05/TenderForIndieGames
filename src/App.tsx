import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GamerProtectedRoute } from './components/GamerProtectedRoute';
import { RedirectByUserType } from './components/RedirectByUserType';
import { DashboardLayout } from './components/DashboardLayout';
import { GamerLayout } from './components/GamerLayout';
import { AccountTypePage } from './pages/AccountTypePage';
import { SignUpPage } from './pages/SignUpPage';
import { GamerSignUpPage } from './pages/GamerSignUpPage';
import { LoginPage } from './pages/LoginPage';
import { MoodSelectionPage } from './pages/MoodSelectionPage';
import { DashboardPage } from './pages/DashboardPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { GamerFeedPage } from './pages/GamerFeedPage';
import { GamerLibraryPage } from './pages/GamerLibraryPage';
import { GamerProfilePage } from './pages/GamerProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RedirectByUserType />} />
          <Route path="/get-started" element={<AccountTypePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/gamer/signup" element={<GamerSignUpPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/gamer/mood-selection"
            element={
              <GamerProtectedRoute>
                <MoodSelectionPage />
              </GamerProtectedRoute>
            }
          />

          <Route
            path="/gamer/feed"
            element={
              <GamerProtectedRoute>
                <GamerLayout>
                  <GamerFeedPage />
                </GamerLayout>
              </GamerProtectedRoute>
            }
          />

          <Route
            path="/gamer/library"
            element={
              <GamerProtectedRoute>
                <GamerLayout>
                  <GamerLibraryPage />
                </GamerLayout>
              </GamerProtectedRoute>
            }
          />

          <Route
            path="/gamer/profile"
            element={
              <GamerProtectedRoute>
                <GamerLayout>
                  <GamerProfilePage />
                </GamerLayout>
              </GamerProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/games/:gameId"
            element={
              <ProtectedRoute>
                <GameDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<RedirectByUserType />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
