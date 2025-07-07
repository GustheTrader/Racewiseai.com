export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      statpal_horses: {
        Row: {
          age: string | null
          created_at: string | null
          gender: string | null
          horse_name: string
          id: number
          jockey_id: string | null
          jockey_name: string | null
          number: number | null
          rating: string | null
          recent_form: Json | null
          stall: string | null
          statpal_horse_id: string
          statpal_race_id: string | null
          trainer_id: string | null
          trainer_name: string | null
          updated_at: string | null
          user_id: string | null
          weight: string | null
          weight_lbs: number | null
        }
        Insert: {
          age?: string | null
          created_at?: string | null
          gender?: string | null
          horse_name: string
          id?: number
          jockey_id?: string | null
          jockey_name?: string | null
          number?: number | null
          rating?: string | null
          recent_form?: Json | null
          stall?: string | null
          statpal_horse_id: string
          statpal_race_id?: string | null
          trainer_id?: string | null
          trainer_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: string | null
          weight_lbs?: number | null
        }
        Update: {
          age?: string | null
          created_at?: string | null
          gender?: string | null
          horse_name?: string
          id?: number
          jockey_id?: string | null
          jockey_name?: string | null
          number?: number | null
          rating?: string | null
          recent_form?: Json | null
          stall?: string | null
          statpal_horse_id?: string
          statpal_race_id?: string | null
          trainer_id?: string | null
          trainer_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: string | null
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "statpal_horses_statpal_race_id_fkey"
            columns: ["statpal_race_id"]
            isOneToOne: false
            referencedRelation: "statpal_live_races"
            referencedColumns: ["statpal_race_id"]
          },
        ]
      }
      statpal_live_races: {
        Row: {
          class: string | null
          country: string
          created_at: string | null
          distance: string | null
          going: string | null
          id: number
          race_date: string
          race_name: string | null
          race_time: string | null
          raw_data: Json | null
          statpal_race_id: string
          status: string | null
          track_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          class?: string | null
          country: string
          created_at?: string | null
          distance?: string | null
          going?: string | null
          id?: number
          race_date: string
          race_name?: string | null
          race_time?: string | null
          raw_data?: Json | null
          statpal_race_id: string
          status?: string | null
          track_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          class?: string | null
          country?: string
          created_at?: string | null
          distance?: string | null
          going?: string | null
          id?: number
          race_date?: string
          race_name?: string | null
          race_time?: string | null
          raw_data?: Json | null
          statpal_race_id?: string
          status?: string | null
          track_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      statpal_results: {
        Row: {
          created_at: string | null
          distance_behind: string | null
          horse_id: string | null
          horse_name: string | null
          id: number
          jockey_name: string | null
          position: number | null
          starting_price: number | null
          statpal_race_id: string | null
          time_taken: string | null
          weight: string | null
        }
        Insert: {
          created_at?: string | null
          distance_behind?: string | null
          horse_id?: string | null
          horse_name?: string | null
          id?: number
          jockey_name?: string | null
          position?: number | null
          starting_price?: number | null
          statpal_race_id?: string | null
          time_taken?: string | null
          weight?: string | null
        }
        Update: {
          created_at?: string | null
          distance_behind?: string | null
          horse_id?: string | null
          horse_name?: string | null
          id?: number
          jockey_name?: string | null
          position?: number | null
          starting_price?: number | null
          statpal_race_id?: string | null
          time_taken?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "statpal_results_statpal_race_id_fkey"
            columns: ["statpal_race_id"]
            isOneToOne: false
            referencedRelation: "statpal_live_races"
            referencedColumns: ["statpal_race_id"]
          },
        ]
      }
      statpal_wagers: {
        Row: {
          created_at: string | null
          id: number
          numbers: string | null
          payoff: number | null
          pool: string | null
          statpal_race_id: string | null
          user_id: string | null
          wager_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          numbers?: string | null
          payoff?: number | null
          pool?: string | null
          statpal_race_id?: string | null
          user_id?: string | null
          wager_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          numbers?: string | null
          payoff?: number | null
          pool?: string | null
          statpal_race_id?: string | null
          user_id?: string | null
          wager_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "statpal_wagers_statpal_race_id_fkey"
            columns: ["statpal_race_id"]
            isOneToOne: false
            referencedRelation: "statpal_live_races"
            referencedColumns: ["statpal_race_id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
