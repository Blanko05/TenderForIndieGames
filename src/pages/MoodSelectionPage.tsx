import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Tag } from '../types/database';

export function MoodSelectionPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (tags.length > 0 && selectedTags.length === 0) {
      setSelectedTags(tags.map(tag => tag.id));
    }
  }, [tags]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('type', 'vibe')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      setError('Failed to load tags');
      console.error(err);
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
    setSelectedTags(tags.map(tag => tag.id));
  };

  const deselectAll = () => {
    setSelectedTags([]);
  };

  const handleSubmit = async () => {
    if (selectedTags.length < 3) {
      setError('Please select at least 3 mood tags');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const moodTagsToInsert = selectedTags.map((tagId) => ({
        user_id: user.id,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase
        .from('user_mood_tags')
        .insert(moodTagsToInsert);

      if (insertError) throw insertError;

      navigate('/gamer/feed');
    } catch (err) {
      setError('Failed to save mood tags');
      console.error(err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Choose Your Vibe</h1>
          <p className="text-slate-400 text-lg">
            Select at least 3 mood tags to personalize your game discovery feed
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="text-emerald-400 font-semibold text-xl">
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
                Deselect All
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`
                  px-6 py-4 rounded-xl font-semibold text-base transition-all transform hover:scale-105
                  ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-emerald-600'
                  }
                `}
              >
                {tag.name}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={selectedTags.length < 3 || saving}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-12 rounded-xl text-lg transition-colors shadow-lg"
          >
            {saving ? 'Saving...' : 'Start Discovering Games'}
          </button>
        </div>
      </div>
    </div>
  );
}
