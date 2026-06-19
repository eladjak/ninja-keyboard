/**
 * Hand-authored Supabase database types for Ninja Keyboard.
 *
 * Mirrors the schema defined in supabase/migrations/00001_initial_schema.sql
 * through 00004_phase1_player_state.sql. These are authored by hand (NOT via
 * `supabase gen types`) because Phase 1 has no live Supabase project yet.
 *
 * When a real project exists, regenerate with:
 *   supabase gen types typescript --project-id <id> > src/types/database.ts
 * and verify it stays compatible with the migrations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin'
export type AuthMethod = 'email' | 'google' | 'class_code' | 'pin'
export type AgeGroup = 'shatil' | 'nevet' | 'geza' | 'anaf' | 'tzameret'
export type ConsentType =
  | 'data_collection'
  | 'progress_sharing'
  | 'communication'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          role: UserRole
          display_name: string
          avatar_id: string | null
          age: number | null
          auth_method: AuthMethod
          parent_id: string | null
          pin_hash: string | null
          settings: Json
          // 00004 additive columns
          age_group: AgeGroup | null
          onboarding_completed: boolean
          placement_result: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          display_name: string
          avatar_id?: string | null
          age?: number | null
          auth_method?: AuthMethod
          parent_id?: string | null
          pin_hash?: string | null
          settings?: Json
          age_group?: AgeGroup | null
          onboarding_completed?: boolean
          placement_result?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          display_name?: string
          avatar_id?: string | null
          age?: number | null
          auth_method?: AuthMethod
          parent_id?: string | null
          pin_hash?: string | null
          settings?: Json
          age_group?: AgeGroup | null
          onboarding_completed?: boolean
          placement_result?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          id: string
          teacher_id: string
          name: string
          code: string
          grade: string | null
          max_students: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          code: string
          grade?: string | null
          max_students?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          name?: string
          code?: string
          grade?: string | null
          max_students?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      class_members: {
        Row: {
          class_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          class_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          class_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          wpm: number | null
          accuracy: number | null
          duration_seconds: number | null
          key_stats: Json
          emotional_flags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          wpm?: number | null
          accuracy?: number | null
          duration_seconds?: number | null
          key_stats?: Json
          emotional_flags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          wpm?: number | null
          accuracy?: number | null
          duration_seconds?: number | null
          key_stats?: Json
          emotional_flags?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          user_id: string
          lesson_id: string
          best_wpm: number | null
          best_accuracy: number | null
          stars: number | null
          attempts: number | null
          last_attempt_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          lesson_id: string
          best_wpm?: number | null
          best_accuracy?: number | null
          stars?: number | null
          attempts?: number | null
          last_attempt_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          lesson_id?: string
          best_wpm?: number | null
          best_accuracy?: number | null
          stars?: number | null
          attempts?: number | null
          last_attempt_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      gamification: {
        Row: {
          user_id: string
          xp: number | null
          level: number | null
          streak_days: number | null
          badges: Json
          last_active: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          xp?: number | null
          level?: number | null
          streak_days?: number | null
          badges?: Json
          last_active?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          xp?: number | null
          level?: number | null
          streak_days?: number | null
          badges?: Json
          last_active?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      consents: {
        Row: {
          id: string
          user_id: string
          parent_id: string
          consent_type: ConsentType
          granted: boolean | null
          granted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          parent_id: string
          consent_type: ConsentType
          granted?: boolean | null
          granted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          parent_id?: string
          consent_type?: ConsentType
          granted?: boolean | null
          granted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      // 00004 — Phase 1 cross-device single-player state blob
      player_state: {
        Row: {
          user_id: string
          story: Json
          daily: Json
          migrated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          story?: Json
          daily?: Json
          migrated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          story?: Json
          daily?: Json
          migrated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          id: string
          name: string
          avatar_id: string
          xp: number
          level: number
          streak: number
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
