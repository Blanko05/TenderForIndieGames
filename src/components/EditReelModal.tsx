import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useTags } from '../hooks/useTags';
import type { ReelWithTags } from '../hooks/useReels';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface EditReelModalProps {
  reel: ReelWithTags;
  onClose: () => void;
  onSubmit: (data: {
    video_url?: string;
    caption?: string;
    tagIds?: string[];
  }) => Promise<void>;
}

export function EditReelModal({ reel, onClose, onSubmit }: EditReelModalProps) {
  const [formData, setFormData] = useState({
    video_url: reel.video_url,
    caption: reel.caption || '',
  });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    reel.tags.map(tag => tag.id)
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>(
    reel.video_url.includes('supabase.co/storage') ? 'file' : 'url'
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { tags } = useTags();
  const { user } = useAuth();

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else if (selectedTagIds.length < 3) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('Video file must be less than 50MB');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const uploadVideoFile = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('reel-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('reel-videos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (uploadMethod === 'url' && !formData.video_url.trim()) {
      setError('Video URL is required');
      return;
    }

    if (uploadMethod === 'file' && !videoFile && uploadMethod !== reel.video_url.includes('supabase.co/storage') ? 'file' : 'url') {
      setError('Please select a video file or keep the existing video');
      return;
    }

    if (selectedTagIds.length === 0) {
      setError('Please select at least 1 tag');
      return;
    }

    setLoading(true);

    try {
      let videoUrl = formData.video_url.trim();

      if (uploadMethod === 'file' && videoFile) {
        setUploadProgress(50);
        videoUrl = await uploadVideoFile(videoFile);
        setUploadProgress(100);
      }

      await onSubmit({
        video_url: videoUrl,
        caption: formData.caption.trim() || undefined,
        tagIds: selectedTagIds,
      });
    } catch (err) {
      setError('Failed to update reel. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Edit Reel</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Video Source <span className="text-red-400">*</span>
            </label>
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  uploadMethod === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload New File
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  uploadMethod === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Use URL
              </button>
            </div>

            {uploadMethod === 'file' ? (
              <div>
                <input
                  id="video_file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
                <label
                  htmlFor="video_file"
                  className="block w-full cursor-pointer"
                >
                  <div className="w-full px-4 py-8 bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg text-center hover:border-blue-500 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-300 font-medium">
                      {videoFile ? videoFile.name : 'Click to select new video file'}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      MP4, WebM, or MOV (max 50MB)
                    </p>
                    {!videoFile && (
                      <p className="text-slate-400 text-xs mt-2">
                        Leave empty to keep existing video
                      </p>
                    )}
                  </div>
                </label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-slate-400 text-xs mt-1 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="YouTube, Vimeo, or direct video URL"
                  disabled={loading}
                />
                <p className="text-slate-500 text-xs mt-1">
                  Supports YouTube, Vimeo, and direct video links
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-slate-300 mb-2">
              Caption
            </label>
            <textarea
              id="caption"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Brief description of this reel"
              rows={3}
              maxLength={200}
              disabled={loading}
            />
            <p className="text-slate-500 text-xs mt-1">{formData.caption.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Vibe Tags <span className="text-red-400">*</span>
              <span className="text-slate-500 font-normal ml-2">
                (Select up to 3)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  } ${
                    !selectedTagIds.includes(tag.id) && selectedTagIds.length >= 3
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-2">
              Selected: {selectedTagIds.length}/3
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
