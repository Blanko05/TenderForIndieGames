export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          user_type: 'developer' | 'gamer';
          developer_name: string | null;
          studio_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          user_type: 'developer' | 'gamer';
          developer_name?: string | null;
          studio_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          user_type?: 'developer' | 'gamer';
          developer_name?: string | null;
          studio_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_profiles: {
        Row: {
          id: string;
          developer_id: string;
          game_title: string;
          description: string | null;
          itch_url: string;
          thumbnail_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          developer_id: string;
          game_title: string;
          description?: string | null;
          itch_url: string;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          developer_id?: string;
          game_title?: string;
          description?: string | null;
          itch_url?: string;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reels: {
        Row: {
          id: string;
          game_profile_id: string;
          video_url: string;
          caption: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_profile_id: string;
          video_url: string;
          caption?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          game_profile_id?: string;
          video_url?: string;
          caption?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          created_at?: string;
        };
      };
      reel_tags: {
        Row: {
          reel_id: string;
          tag_id: string;
        };
        Insert: {
          reel_id: string;
          tag_id: string;
        };
        Update: {
          reel_id?: string;
          tag_id?: string;
        };
      };
      swipes: {
        Row: {
          id: string;
          reel_id: string;
          user_id: string;
          direction: 'left' | 'right';
          created_at: string;
        };
        Insert: {
          id?: string;
          reel_id: string;
          user_id: string;
          direction: 'left' | 'right';
          created_at?: string;
        };
        Update: {
          id?: string;
          reel_id?: string;
          user_id?: string;
          direction?: 'left' | 'right';
          created_at?: string;
        };
      };
    };
  };
};

export type User = Database['public']['Tables']['users']['Row'];
export type GameProfile = Database['public']['Tables']['game_profiles']['Row'];
export type Reel = Database['public']['Tables']['reels']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Swipe = Database['public']['Tables']['swipes']['Row'];
