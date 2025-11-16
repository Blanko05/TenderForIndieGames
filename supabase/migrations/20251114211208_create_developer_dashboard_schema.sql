/*
  # Developer Dashboard Schema - Initial Setup
  
  ## Overview
  This migration creates the complete database schema for the indie game discovery platform's
  developer dashboard, including game profiles, reels, tags, and analytics tracking.
  
  ## New Tables
  
  ### 1. `users`
  Stores user account information for both developers and gamers.
  - `id` (uuid, primary key) - Auto-generated user ID, linked to auth.users
  - `email` (text, unique) - User's email address
  - `user_type` (text) - Account type: 'developer' or 'gamer'
  - `developer_name` (text, nullable) - Display name for developers
  - `studio_name` (text, nullable) - Optional studio name
  - `bio` (text, nullable) - Optional developer bio
  - `avatar_url` (text, nullable) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp
  
  ### 2. `game_profiles`
  Stores game information as parent entities. Each game has one itch.io link.
  - `id` (uuid, primary key) - Auto-generated game profile ID
  - `developer_id` (uuid, foreign key) - References users.id
  - `game_title` (text) - Name of the game
  - `description` (text, nullable) - Game description (max 500 chars enforced in app)
  - `itch_url` (text) - Link to game on itch.io
  - `thumbnail_url` (text, nullable) - Game thumbnail/cover image
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. `reels`
  Stores video reels/cards for games. Multiple reels can exist per game.
  - `id` (uuid, primary key) - Auto-generated reel ID
  - `game_profile_id` (uuid, foreign key) - References game_profiles.id
  - `video_url` (text) - URL to video (YouTube, Vimeo, or direct link)
  - `caption` (text, nullable) - Optional reel description (max 200 chars)
  - `order_index` (integer) - Display order within game profile
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. `tags`
  Predefined vibe tags for categorizing reels.
  - `id` (uuid, primary key) - Auto-generated tag ID
  - `name` (text, unique) - Tag name (e.g., "Action", "Cozy", "Strategic")
  - `type` (text) - Tag type: 'vibe' for developer tags
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 5. `reel_tags`
  Junction table linking reels to their tags (max 3 per reel).
  - `reel_id` (uuid, foreign key) - References reels.id
  - `tag_id` (uuid, foreign key) - References tags.id
  - Primary key: (reel_id, tag_id) composite
  
  ### 6. `swipes`
  Tracks all swipe actions for analytics.
  - `id` (uuid, primary key) - Auto-generated swipe ID
  - `reel_id` (uuid, foreign key) - References reels.id
  - `user_id` (uuid, foreign key) - References users.id (gamer who swiped)
  - `direction` (text) - Swipe direction: 'left' or 'right'
  - `created_at` (timestamptz) - Swipe timestamp
  
  ## Security (Row Level Security)
  
  All tables have RLS enabled with restrictive policies:
  - Users can read their own profile and update their own data
  - Developers can create, read, update, and delete their own game profiles and reels
  - Swipe data is readable by game owners for analytics
  - Tags are readable by all authenticated users
  
  ## Important Notes
  
  1. Cascade Deletion: Deleting a game profile automatically deletes all associated reels and their tags
  2. Cascade Deletion: Deleting a reel automatically deletes all associated tags and swipe records
  3. Default Values: Timestamps default to now(), order_index defaults to 0
  4. Indexes: Created on all foreign keys for query performance
  5. User Type: Enforced as check constraint to only allow 'developer' or 'gamer'
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('developer', 'gamer')),
  developer_name text,
  studio_name text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_profiles table
CREATE TABLE IF NOT EXISTS game_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_title text NOT NULL,
  description text,
  itch_url text NOT NULL,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reels table
CREATE TABLE IF NOT EXISTS reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_profile_id uuid NOT NULL REFERENCES game_profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  caption text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'vibe',
  created_at timestamptz DEFAULT now()
);

-- Create reel_tags junction table
CREATE TABLE IF NOT EXISTS reel_tags (
  reel_id uuid NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (reel_id, tag_id)
);

-- Create swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id uuid NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('left', 'right')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_profiles_developer_id ON game_profiles(developer_id);
CREATE INDEX IF NOT EXISTS idx_reels_game_profile_id ON reels(game_profile_id);
CREATE INDEX IF NOT EXISTS idx_swipes_reel_id ON swipes(reel_id);
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON swipes(created_at);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Game profiles policies
CREATE POLICY "Developers can view their own game profiles"
  ON game_profiles FOR SELECT
  TO authenticated
  USING (developer_id = auth.uid());

CREATE POLICY "Developers can create game profiles"
  ON game_profiles FOR INSERT
  TO authenticated
  WITH CHECK (developer_id = auth.uid());

CREATE POLICY "Developers can update their own game profiles"
  ON game_profiles FOR UPDATE
  TO authenticated
  USING (developer_id = auth.uid())
  WITH CHECK (developer_id = auth.uid());

CREATE POLICY "Developers can delete their own game profiles"
  ON game_profiles FOR DELETE
  TO authenticated
  USING (developer_id = auth.uid());

-- Reels policies
CREATE POLICY "Developers can view reels for their games"
  ON reels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_profiles
      WHERE game_profiles.id = reels.game_profile_id
      AND game_profiles.developer_id = auth.uid()
    )
  );

CREATE POLICY "Developers can create reels for their games"
  ON reels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_profiles
      WHERE game_profiles.id = game_profile_id
      AND game_profiles.developer_id = auth.uid()
    )
  );

CREATE POLICY "Developers can update reels for their games"
  ON reels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_profiles
      WHERE game_profiles.id = reels.game_profile_id
      AND game_profiles.developer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_profiles
      WHERE game_profiles.id = game_profile_id
      AND game_profiles.developer_id = auth.uid()
    )
  );

CREATE POLICY "Developers can delete reels for their games"
  ON reels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_profiles
      WHERE game_profiles.id = reels.game_profile_id
      AND game_profiles.developer_id = auth.uid()
    )
  );

-- Tags policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can view tags"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

-- Reel tags policies
CREATE POLICY "Developers can view tags for their reels"
  ON reel_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reels
      JOIN game_profiles ON game_profiles.id = reels.game_profile_id
      WHERE reels.id = reel_tags.reel_id
      AND game_profiles.developer_id = auth.uid()
    )
  );

CREATE POLICY "Developers can add tags to their reels"
  ON reel_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reels
      JOIN game_profiles ON game_profiles.id = reels.game_profile_id
      WHERE reels.id = reel_id
      AND game_profiles.developer_id = auth.uid()
    )
  );

CREATE POLICY "Developers can remove tags from their reels"
  ON reel_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reels
      JOIN game_profiles ON game_profiles.id = reels.game_profile_id
      WHERE reels.id = reel_tags.reel_id
      AND game_profiles.developer_id = auth.uid()
    )
  );

-- Swipes policies (developers can view swipes on their reels for analytics)
CREATE POLICY "Developers can view swipes on their reels"
  ON swipes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reels
      JOIN game_profiles ON game_profiles.id = reels.game_profile_id
      WHERE reels.id = swipes.reel_id
      AND game_profiles.developer_id = auth.uid()
    )
  );

-- Insert predefined vibe tags
INSERT INTO tags (name, type) VALUES
  ('Action', 'vibe'),
  ('Adventure', 'vibe'),
  ('Casual', 'vibe'),
  ('Cozy', 'vibe'),
  ('Creative', 'vibe'),
  ('Dark', 'vibe'),
  ('Fast-Paced', 'vibe'),
  ('Horror', 'vibe'),
  ('Indie', 'vibe'),
  ('Mystery', 'vibe'),
  ('Narrative', 'vibe'),
  ('Platformer', 'vibe'),
  ('Puzzle', 'vibe'),
  ('Relaxing', 'vibe'),
  ('Retro', 'vibe'),
  ('RPG', 'vibe'),
  ('Strategic', 'vibe'),
  ('Survival', 'vibe'),
  ('Atmospheric', 'vibe'),
  ('Experimental', 'vibe')
ON CONFLICT (name) DO NOTHING;