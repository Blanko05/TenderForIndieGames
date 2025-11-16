import { useState, useEffect } from 'react';
import { User, Sparkles, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGamerMoodTags } from '../hooks/useGamerMoodTags';
import { useGamerLibrary } from '../hooks/useGamerLibrary';
import { supabase } from '../lib/supabase';
import type { Tag } from '../types/database';

export function GamerProfilePage() {
  const { profile } = useAuth();
  const { moodTags, updateMoodTags } = useGamerMoodTags();
  const { library } = useGamerLibrary();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAllTags();
  }, []);

  useEffect(() => {
    if (moodTags.length > 0) {
      setSelectedTags(moodTags.map((tag) => tag.id));
    } else if (allTags.length > 0 && moodTags.length === 0 && selectedTags.length === 0) {
      setSelectedTags(allTags.map(tag => tag.id));
    }
  }, [moodTags, allTags]);

  const fetchAllTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('type', 'vibe')
        .order('name');

      if (error) throw error;
      setAllTags(data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      return [...prev, tagId];
    });
  };

  const selectAll = () => {
    setSelectedTags(allTags.map(tag => tag.id));
  };

  const deselectAll = () => {
    setSelectedTags([]);
  };

  const handleSave = async () => {
    if (selectedTags.length < 3) {
      setMessage('Please select at least 3 mood tags');
      return;
    }

    setSaving(true);
    setMessage('');

    const { error } = await updateMoodTags(selectedTags);

    if (error) {
      setMessage('Failed to update mood tags');
      console.error(error);
    } else {
      setMessage('Mood tags updated successfully!');
    }

    setSaving(false);

    setTimeout(() => setMessage(''), 3000);
  };

  const hasChanges = JSON.stringify(selectedTags.sort()) !== JSON.stringify(moodTags.map((t) => t.id).sort());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <User className="w-6 h-6 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Profile</h1>
          </div>
          <p className="text-slate-400">{profile?.email}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Games Saved</h3>
            <p className="text-4xl font-bold text-emerald-400">{library.length}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Mood Tags</h3>
            <p className="text-4xl font-bold text-emerald-400">{moodTags.length}</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Your Mood Tags</h2>
          </div>

          <p className="text-slate-400 mb-4">
            Select at least 3 tags that match your gaming preferences. These help personalize your feed.
          </p>

          <div className="mb-4 flex items-center justify-between">
            <div className="text-emerald-400 font-semibold">
              {selectedTags.length} selected (min 3)
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-slate-400 text-center py-8">Loading tags...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`
                        px-4 py-3 rounded-lg font-semibold text-sm transition-all transform hover:scale-105
                        ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }
                      `}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>

              {message && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-center ${
                  message.includes('success')
                    ? 'bg-emerald-900/50 border border-emerald-500 text-emerald-200'
                    : 'bg-red-900/50 border border-red-500 text-red-200'
                }`}>
                  {message}
                </div>
              )}

              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={selectedTags.length < 3 || saving}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
