export type ContentType = 'movie' | 'drama' | 'book'

export interface Database {
  public: {
    Tables: {
      contents: {
        Row: {
          id: string
          type: ContentType
          title: string
          description: string | null
          cover_image_url: string | null
          metadata: Record<string, unknown>
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: ContentType
          title: string
          description?: string | null
          cover_image_url?: string | null
          metadata?: Record<string, unknown>
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: ContentType
          title?: string
          description?: string | null
          cover_image_url?: string | null
          metadata?: Record<string, unknown>
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          avatar_position: { x: number; y: number } | null
          bio: string | null
          is_profile_setup: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          avatar_position?: { x: number; y: number }
          bio?: string | null
          is_profile_setup?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          avatar_position?: { x: number; y: number }
          bio?: string | null
          is_profile_setup?: boolean
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          content_id: string
          rating: number
          body: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          rating: number
          body?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          rating?: number
          body?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_content_id_fkey",
            columns: ["content_id"],
            isOneToOne: false,
            referencedRelation: "contents",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "reviews_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"],
          },
        ]
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          user_id: string
          content_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          content_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          content_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_content_id_fkey",
            columns: ["content_id"],
            isOneToOne: false,
            referencedRelation: "contents",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"],
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      content_type: ContentType
    }
    CompositeTypes: Record<string, never>
  }
}
