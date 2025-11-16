import { Link } from 'react-router-dom';
import { Gamepad2, Code2, Sparkles, Layout } from 'lucide-react';

export function AccountTypePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full mb-6">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Welcome to GameFeed</h1>
          <p className="text-slate-400 text-lg">Choose your account type to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800 rounded-2xl border-2 border-emerald-600 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/50 transition-all transform hover:scale-105">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Gamer Account</h2>
              <p className="text-emerald-100">Discover and enjoy indie games</p>
            </div>

            <div className="p-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>Swipe through personalized game reels based on your mood</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>Build your personal library of favorite games</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>Direct links to play games on itch.io</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>Customize your discovery feed with mood tags</span>
                </li>
              </ul>

              <Link
                to="/gamer/signup"
                className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Sign Up as Gamer
              </Link>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl border-2 border-blue-600 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/50 transition-all transform hover:scale-105">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Layout className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Developer Account</h2>
              <p className="text-blue-100">Showcase your indie games</p>
            </div>

            <div className="p-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>Create game profiles with links to your itch.io pages</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>Upload video reels to showcase your games</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>Tag your content with mood vibes for better discovery</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>Track analytics and engagement on your reels</span>
                </li>
              </ul>

              <Link
                to="/signup"
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Sign Up as Developer
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
