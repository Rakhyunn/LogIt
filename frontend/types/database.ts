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
          created_at: string
        }
        Insert: {
          id?: string
          type: ContentType
          title: string
          description?: string | null
          cover_image_url?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          type?: ContentType
          title?: string
          description?: string | null
          cover_image_url?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
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
      }
    }
  }
}
