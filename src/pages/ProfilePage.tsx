import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { User, Mail, Calendar } from 'lucide-react';

export function ProfilePage() {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    developer_name: profile?.developer_name || '',
    studio_name: profile?.studio_name || '',
    bio: profile?.bio || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.developer_name.trim()) {
      setError('Developer name is required');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          developer_name: formData.developer_name.trim(),
          studio_name: formData.studio_name.trim() || null,
          bio: formData.bio.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-white">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-slate-700">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {profile.developer_name?.charAt(0).toUpperCase() || 'D'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{profile.developer_name}</h2>
              <div className="flex items-center space-x-4 text-sm text-slate-400 mt-2">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="developer_name" className="block text-sm font-medium text-slate-300 mb-2">
                Developer Name <span className="text-red-400">*</span>
              </label>
              <input
                id="developer_name"
                type="text"
                value={formData.developer_name}
                onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="studio_name" className="block text-sm font-medium text-slate-300 mb-2">
                Studio Name
              </label>
              <input
                id="studio_name"
                type="text"
                value={formData.studio_name}
                onChange={(e) => setFormData({ ...formData, studio_name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your studio name (optional)"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Tell us about yourself and your games"
                rows={4}
                maxLength={500}
                disabled={loading}
              />
              <p className="text-slate-500 text-xs mt-1">{formData.bio.length}/500</p>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
                Profile updated successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
