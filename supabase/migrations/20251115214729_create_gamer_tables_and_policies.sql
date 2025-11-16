/*
  # Gamer Account Tables and Policies

  ## Overview
  This migration creates the tables and policies needed for the gamer experience:
  mood tag preferences, user library for saved reels, and updated RLS policies.

  ## New Tables

  ### 1. `user_mood_tags`
  Stores gamer mood tag preferences (exactly 3 per user).
  - `user_id` (uuid, foreign key) - References users.id
  - `tag_id` (uuid, foreign key) - References tags.id
  - `created_at` (timestamptz) - Timestamp when tag was selected
  - Primary key: (user_id, tag_id) composite

  ### 2. `user_library`
  Stores reels that gamers have swiped right on (saved to library).
  - `id` (uuid, primary key) - Auto-generated library entry ID
  - `user_id` (uuid, foreign key) - References users.id (gamer)
  - `reel_id` (uuid, foreign key) - References reels.id
  - `saved_at` (timestamptz) - Timestamp when reel was saved
  - Unique constraint on (user_id, reel_id) to prevent duplicates

  ## Security (Row Level Security)

  ### Gamer Policies:
  - Gamers can view all published reels and associated data
  - Gamers can create swipe records for themselves
  - Gamers can manage their own mood tag preferences
  - Gamers can manage their own library entries
  - Gamers can view game profiles and tags

  ## Important Notes

  1. Cascade Deletion: Deleting a user removes all their mood tags and library entries
  2. Cascade Deletion: Deleting a reel removes it from all user libraries
  3. Indexes: Created on foreign keys for performance
  4. Unique Constraint: Prevents duplicate library entries per user
*/

-- Create user_mood_tags table
CREATE TABLE IF NOT EXISTS user_mood_tags (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, tag_id)
);

-- Create user_library table
CREATE TABLE IF NOT EXISTS user_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reel_id uuid NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, reel_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_mood_tags_user_id ON user_mood_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mood_tags_tag_id ON user_mood_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_reel_id ON user_library(reel_id);
CREATE INDEX IF NOT EXISTS idx_user_library_saved_at ON user_library(saved_at);

-- Enable Row Level Security
ALTER TABLE user_mood_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

-- User mood tags policies
CREATE POLICY "Users can view their own mood tags"
  ON user_mood_tags FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood tags"
  ON user_mood_tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood tags"
  ON user_mood_tags FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User library policies
CREATE POLICY "Users can view their own library"
  ON user_library FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own library"
  ON user_library FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own library"
  ON user_library FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add gamer policies for viewing reels and game profiles
CREATE POLICY "Gamers can view all game profiles"
  ON game_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'gamer'
    )
  );

CREATE POLICY "Gamers can view all reels"
  ON reels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'gamer'
    )
  );

CREATE POLICY "Gamers can view reel tags"
  ON reel_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'gamer'
    )
  );

-- Add gamer policy for creating swipes
CREATE POLICY "Gamers can create swipe records"
  ON swipes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'gamer'
    )
  );

CREATE POLICY "Gamers can view their own swipes"
  ON swipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);