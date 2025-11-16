import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Library, User, LogOut, Gamepad2, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface GamerLayoutProps {
  children: React.ReactNode;
}

export function GamerLayout({ children }: GamerLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl">GameFeed</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/gamer/feed"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/gamer/feed')
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>Feed</span>
              </Link>

              <Link
                to="/gamer/library"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/gamer/library')
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Library className="w-5 h-5" />
                <span>Library</span>
              </Link>

              <Link
                to="/gamer/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/gamer/profile')
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>

              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-slate-700 transition-colors ml-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-700 space-y-1">
              <Link
                to="/gamer/feed"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/gamer/feed')
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>Feed</span>
              </Link>

              <Link
                to="/gamer/library"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/gamer/library')
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Library className="w-5 h-5" />
                <span>Library</span>
              </Link>

              <Link
                to="/gamer/profile"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/gamer/profile')
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>

              <button
                onClick={() => {
                  signOut();
                  handleLinkClick();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
