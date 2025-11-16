/*
  # Create Storage Bucket for Video Files

  1. Storage Setup
    - Create public bucket named 'reel-videos' for storing game reel videos
    - Configure bucket to accept video file types
    - Set appropriate size limits for video uploads
  
  2. Security
    - Enable public access for viewing videos (read)
    - Restrict uploads to authenticated users only
    - Users can only upload to their own folders
    - Users can only delete their own videos
  
  3. Notes
    - Videos will be stored with path: {user_id}/{filename}
    - Public access allows videos to be viewed without authentication
    - Maximum file size handled by Supabase defaults (50MB for free tier)
*/

-- Create the storage bucket for reel videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reel-videos',
  'reel-videos',
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload videos to their own folder
CREATE POLICY "Users can upload videos to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reel-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own videos
CREATE POLICY "Users can update own videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'reel-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'reel-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own videos
CREATE POLICY "Users can delete own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'reel-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access to all videos
CREATE POLICY "Public can view videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'reel-videos');
