import { X, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomeNotificationProps {
  onClose: () => void;
}

export function WelcomeNotification({ onClose }: WelcomeNotificationProps) {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    onClose();
    navigate('/gamer/profile');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 border-2 border-emerald-500 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome!</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-slate-300 text-lg leading-relaxed">
            You can personalize your feed by choosing your mood tags for a better experience!
          </p>

          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">
              We've selected all mood tags for you to get started, but feel free to customize your preferences anytime.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleGoToProfile}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Customize Now
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-95"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
