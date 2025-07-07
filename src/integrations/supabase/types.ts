export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_connections: {
        Row: {
          api_key: string | null
          api_url: string
          created_at: string
          id: string
          is_test_mode: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key?: string | null
          api_url: string
          created_at?: string
          id?: string
          is_test_mode?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string | null
          api_url?: string
          created_at?: string
          id?: string
          is_test_mode?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exotic_will_pays: {
        Row: {
          carryover_amount: number | null
          combination: string
          id: string
          is_carryover: boolean | null
          payout: number | null
          race_date: string
          race_number: number
          scraped_at: string
          track_name: string
          wager_type: string
        }
        Insert: {
          carryover_amount?: number | null
          combination: string
          id?: string
          is_carryover?: boolean | null
          payout?: number | null
          race_date: string
          race_number: number
          scraped_at?: string
          track_name: string
          wager_type: string
        }
        Update: {
          carryover_amount?: number | null
          combination?: string
          id?: string
          is_carryover?: boolean | null
          payout?: number | null
          race_date?: string
          race_number?: number
          scraped_at?: string
          track_name?: string
          wager_type?: string
        }
        Relationships: []
      }
      odds_data: {
        Row: {
          horse_name: string
          horse_number: number
          id: string
          pool_data: Json | null
          race_date: string
          race_number: number
          scraped_at: string
          track_name: string
          win_odds: string | null
        }
        Insert: {
          horse_name: string
          horse_number: number
          id?: string
          pool_data?: Json | null
          race_date: string
          race_number: number
          scraped_at?: string
          track_name: string
          win_odds?: string | null
        }
        Update: {
          horse_name?: string
          horse_number?: number
          id?: string
          pool_data?: Json | null
          race_date?: string
          race_number?: number
          scraped_at?: string
          track_name?: string
          win_odds?: string | null
        }
        Relationships: []
      }
      OddsPulse: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      race_data: {
        Row: {
          created_at: string
          id: string
          race_conditions: string | null
          race_date: string
          race_number: number
          track_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          race_conditions?: string | null
          race_date?: string
          race_number: number
          track_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          race_conditions?: string | null
          race_date?: string
          race_number?: number
          track_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      race_horses: {
        Row: {
          created_at: string
          id: string
          jockey: string | null
          ml_odds: number | null
          name: string
          pp: number
          race_id: string
          trainer: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jockey?: string | null
          ml_odds?: number | null
          name: string
          pp: number
          race_id: string
          trainer?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jockey?: string | null
          ml_odds?: number | null
          name?: string
          pp?: number
          race_id?: string
          trainer?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_horses_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "race_data"
            referencedColumns: ["id"]
          },
        ]
      }
      race_results: {
        Row: {
          created_at: string
          id: string
          race_date: string
          race_number: number
          results_data: Json
          source_url: string | null
          track_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          race_date?: string
          race_number: number
          results_data: Json
          source_url?: string | null
          track_name: string
        }
        Update: {
          created_at?: string
          id?: string
          race_date?: string
          race_number?: number
          results_data?: Json
          source_url?: string | null
          track_name?: string
        }
        Relationships: []
      }
      scrape_jobs: {
        Row: {
          created_at: string
          created_by: string
          id: string
          interval_seconds: number
          is_active: boolean
          job_type: string
          last_run_at: string | null
          next_run_at: string
          status: string
          track_name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          interval_seconds?: number
          is_active?: boolean
          job_type: string
          last_run_at?: string | null
          next_run_at?: string
          status?: string
          track_name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          interval_seconds?: number
          is_active?: boolean
          job_type?: string
          last_run_at?: string | null
          next_run_at?: string
          status?: string
          track_name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
