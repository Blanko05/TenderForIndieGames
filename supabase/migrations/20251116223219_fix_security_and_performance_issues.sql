/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses multiple security and performance issues identified by Supabase:
  
  ## Changes Made
  
  ### 1. Missing Index
  - Add index on `reel_tags.tag_id` for foreign key performance
  
  ### 2. RLS Performance Optimization
  All RLS policies updated to use `(select auth.uid())` instead of `auth.uid()`
  to prevent re-evaluation for each row, significantly improving query performance at scale.
  
  ### 3. Unused Indexes
  - Remove `idx_swipes_created_at` (not used in queries)
  - Remove `idx_user_mood_tags_tag_id` (not used in queries)
  - Remove `idx_user_library_reel_id` (not used in queries)
  
  ### 4. Multiple Permissive Policies
  Combine overlapping SELECT policies into single policies with OR conditions for:
  - `game_profiles` (developers OR gamers)
  - `reels` (developers OR gamers)
  - `reel_tags` (developers OR gamers)
  - `swipes` (developers OR gamers)
  
  ## Security Notes
  - All changes maintain existing security boundaries
  - No data access permissions are expanded
  - Performance improvements do not compromise security
*/

-- ============================================================================
-- 1. ADD MISSING INDEX
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_reel_tags_tag_id ON reel_tags(tag_id);

-- ============================================================================
-- 2. DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_swipes_created_at;
DROP INDEX IF EXISTS idx_user_mood_tags_tag_id;
DROP INDEX IF EXISTS idx_user_library_reel_id;

-- ============================================================================
-- 3. OPTIMIZE RLS POLICIES - USERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- 4. OPTIMIZE RLS POLICIES - GAME_PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Developers can view their own game profiles" ON game_profiles;
DROP POLICY IF EXISTS "Gamers can view all game profiles" ON game_profiles;
DROP POLICY IF EXISTS "Developers can create game profiles" ON game_profiles;
DROP POLICY IF EXISTS "Developers can update their own game profiles" ON game_profiles;
DROP POLICY IF EXISTS "Developers can delete their own game profiles" ON game_profiles;

-- Combined SELECT policy for both developers and gamers
CREATE POLICY "Authenticated users can view game profiles"
  ON game_profiles FOR SELECT
  TO authenticated
  USING (
    developer_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.user_type = 'gamer'
    )
  );

CREATE POLICY "Developers can create game profiles"
  ON game_profiles FOR INSERT
  TO authenticated
  WITH CHECK (developer_id = (select auth.uid()));

CREATE POLICY "Developers can update their own game profiles"
  ON game_profiles FOR UPDATE
  TO authenticated
  USING (developer_id = (select auth.uid()))
  WITH CHECK (developer_id = (select auth.uid()));

CREATE POLICY "Developers can delete their own game profiles"
  ON game_profiles FOR DELETE
  TO authenticated
  USING (developer_id = (select auth.uid()));

-- ============================================================================
-- 5. OPTIMIZE RLS POLICIES - REELS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Developers can view reels for their games" ON reels;
DROP POLICY IF EXISTS "Gamers can view all reels" ON reels;
DROP POLICY IF EXISTS "Developers can create reels for their games" ON reels;
DROP POLICY IF EXISTS "Developers can update reels for their games" ON reels;
DROP POLICY IF EXISTS "Developers can delete reels for their games" ON reels;

-- Combined SELECT policy for both developers and gamers
CREATE POLICY "Authenticated users can view reels"
  ON reels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_profiles
      WHERE game_profiles.id = reels.game_profile_id
      AND game_profiles.developer_id = (select auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.user_type = 'gamer'
    )
  );

CREATE POLICY "Developers can create reels for their games"
  ON reels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_profiles
      WHERE game_profiles.id = game_profile_id
      AND game_profiles.developer_id = (select auth.uid())
    )
  );

CREATE POLICY "Developers can update reels for their games"
  ON reels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_profiles
      WHERE game_profiles.id = reels.game_profile_id
      AND game_profiles.developer_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_profiles
      WHERE game_profiles.id = game_profile_id
      AND game_profiles.developer_id = (select auth.uid())
    )
  );

CREATE POLICY "Developers can delete reels for their games"
  ON reels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_profiles
      WHERE game_profiles.id = reels.game_profile_id
      AND game_profiles.developer_id = (select auth.uid())
    )
  );

-- ============================================================================
-- 6. OPTIMIZE RLS POLICIES - REEL_TAGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Developers can view tags for their reels" ON reel_tags;
DROP POLICY IF EXISTS "Gamers can view reel tags" ON reel_tags;
DROP POLICY IF EXISTS "Developers can add tags to their reels" ON reel_tags;
DROP POLICY IF EXISTS "Developers can remove tags from their reels" ON reel_tags;

-- Combined SELECT policy for both developers and gamers
CREATE POLICY "Authenticated users can view reel tags"
  ON reel_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reels
      JOIN game_profiles ON game_profiles.id = reels.game_profile_id
      WHERE reels.id = reel_tags.reel_id
      AND game_profiles.developer_id = (select auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.user_type = 'gamer'
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
      AND game_profiles.developer_id = (select auth.uid())
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
      AND game_profiles.developer_id = (select auth.uid())
    )
  );

-- ============================================================================
-- 7. OPTIMIZE RLS POLICIES - SWIPES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Developers can view swipes on their reels" ON swipes;
DROP POLICY IF EXISTS "Gamers can view their own swipes" ON swipes;
DROP POLICY IF EXISTS "Gamers can create swipe records" ON swipes;

-- Combined SELECT policy for both developers and gamers
CREATE POLICY "Authenticated users can view swipes"
  ON swipes FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM reels
      JOIN game_profiles ON game_profiles.id = reels.game_profile_id
      WHERE reels.id = swipes.reel_id
      AND game_profiles.developer_id = (select auth.uid())
    )
  );

CREATE POLICY "Gamers can create swipe records"
  ON swipes FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.user_type = 'gamer'
    )
  );

-- ============================================================================
-- 8. OPTIMIZE RLS POLICIES - USER_MOOD_TAGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own mood tags" ON user_mood_tags;
DROP POLICY IF EXISTS "Users can insert their own mood tags" ON user_mood_tags;
DROP POLICY IF EXISTS "Users can delete their own mood tags" ON user_mood_tags;

CREATE POLICY "Users can view their own mood tags"
  ON user_mood_tags FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own mood tags"
  ON user_mood_tags FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own mood tags"
  ON user_mood_tags FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 9. OPTIMIZE RLS POLICIES - USER_LIBRARY TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own library" ON user_library;
DROP POLICY IF EXISTS "Users can add to their own library" ON user_library;
DROP POLICY IF EXISTS "Users can remove from their own library" ON user_library;

CREATE POLICY "Users can view their own library"
  ON user_library FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can add to their own library"
  ON user_library FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove from their own library"
  ON user_library FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);