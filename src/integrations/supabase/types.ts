export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agent_analyses: {
        Row: {
          agent_name: string
          analysis_id: string
          analysis_result: Json
          confidence: string | null
          created_at: string | null
          key_factors: Json | null
          query: string | null
          race_id: string | null
          recommended_bets: Json | null
          top_selection: string | null
        }
        Insert: {
          agent_name: string
          analysis_id: string
          analysis_result: Json
          confidence?: string | null
          created_at?: string | null
          key_factors?: Json | null
          query?: string | null
          race_id?: string | null
          recommended_bets?: Json | null
          top_selection?: string | null
        }
        Update: {
          agent_name?: string
          analysis_id?: string
          analysis_result?: Json
          confidence?: string | null
          created_at?: string | null
          key_factors?: Json | null
          query?: string | null
          race_id?: string | null
          recommended_bets?: Json | null
          top_selection?: string | null
        }
        Relationships: []
      }
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
      betting_pools: {
        Row: {
          carryover: number | null
          id: number
          pool_type: string | null
          race_id: string | null
          timestamp: string | null
          total_pool: number | null
        }
        Insert: {
          carryover?: number | null
          id?: number
          pool_type?: string | null
          race_id?: string | null
          timestamp?: string | null
          total_pool?: number | null
        }
        Update: {
          carryover?: number | null
          id?: number
          pool_type?: string | null
          race_id?: string | null
          timestamp?: string | null
          total_pool?: number | null
        }
        Relationships: []
      }
      cosmic_bombs: {
        Row: {
          bomb_id: string
          bomb_rating: number | null
          bomb_score: number | null
          confidence: string | null
          current_odds: number | null
          entry_id: string | null
          horse_name: string | null
          identified_at: string | null
          program_number: string | null
          race_id: string | null
          reasons: Json | null
          recommended_play: string | null
          red_flags: Json | null
        }
        Insert: {
          bomb_id: string
          bomb_rating?: number | null
          bomb_score?: number | null
          confidence?: string | null
          current_odds?: number | null
          entry_id?: string | null
          horse_name?: string | null
          identified_at?: string | null
          program_number?: string | null
          race_id?: string | null
          reasons?: Json | null
          recommended_play?: string | null
          red_flags?: Json | null
        }
        Update: {
          bomb_id?: string
          bomb_rating?: number | null
          bomb_score?: number | null
          confidence?: string | null
          current_odds?: number | null
          entry_id?: string | null
          horse_name?: string | null
          identified_at?: string | null
          program_number?: string | null
          race_id?: string | null
          reasons?: Json | null
          recommended_play?: string | null
          red_flags?: Json | null
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
      horse_ratings: {
        Row: {
          class_rating: number | null
          composite_rating: number | null
          confidence: number | null
          created_at: string | null
          entry_id: string | null
          form_rating: number | null
          horse_id: string | null
          jockey_trainer_rating: number | null
          pace_rating: number | null
          race_id: string | null
          rank_in_race: number | null
          rating_id: string
          rating_timestamp: string | null
          speed_rating: number | null
          track_bias_rating: number | null
        }
        Insert: {
          class_rating?: number | null
          composite_rating?: number | null
          confidence?: number | null
          created_at?: string | null
          entry_id?: string | null
          form_rating?: number | null
          horse_id?: string | null
          jockey_trainer_rating?: number | null
          pace_rating?: number | null
          race_id?: string | null
          rank_in_race?: number | null
          rating_id: string
          rating_timestamp?: string | null
          speed_rating?: number | null
          track_bias_rating?: number | null
        }
        Update: {
          class_rating?: number | null
          composite_rating?: number | null
          confidence?: number | null
          created_at?: string | null
          entry_id?: string | null
          form_rating?: number | null
          horse_id?: string | null
          jockey_trainer_rating?: number | null
          pace_rating?: number | null
          race_id?: string | null
          rank_in_race?: number | null
          rating_id?: string
          rating_timestamp?: string | null
          speed_rating?: number | null
          track_bias_rating?: number | null
        }
        Relationships: []
      }
      horses: {
        Row: {
          breeder: string | null
          career_earnings: number | null
          career_places: number | null
          career_shows: number | null
          career_starts: number | null
          career_wins: number | null
          color: string | null
          created_at: string | null
          current_trainer: string | null
          dam: string | null
          damsire: string | null
          foaling_date: string | null
          horse_id: string
          horse_name: string
          owner: string | null
          registration_number: string | null
          sex: string | null
          sire: string | null
          updated_at: string | null
        }
        Insert: {
          breeder?: string | null
          career_earnings?: number | null
          career_places?: number | null
          career_shows?: number | null
          career_starts?: number | null
          career_wins?: number | null
          color?: string | null
          created_at?: string | null
          current_trainer?: string | null
          dam?: string | null
          damsire?: string | null
          foaling_date?: string | null
          horse_id: string
          horse_name: string
          owner?: string | null
          registration_number?: string | null
          sex?: string | null
          sire?: string | null
          updated_at?: string | null
        }
        Update: {
          breeder?: string | null
          career_earnings?: number | null
          career_places?: number | null
          career_shows?: number | null
          career_starts?: number | null
          career_wins?: number | null
          color?: string | null
          created_at?: string | null
          current_trainer?: string | null
          dam?: string | null
          damsire?: string | null
          foaling_date?: string | null
          horse_id?: string
          horse_name?: string
          owner?: string | null
          registration_number?: string | null
          sex?: string | null
          sire?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jockeys: {
        Row: {
          agent: string | null
          career_places: number | null
          career_shows: number | null
          career_starts: number | null
          career_wins: number | null
          created_at: string | null
          current_year_starts: number | null
          current_year_wins: number | null
          jockey_id: string
          jockey_name: string
          license_number: string | null
          updated_at: string | null
          weight: number | null
          win_percentage: number | null
        }
        Insert: {
          agent?: string | null
          career_places?: number | null
          career_shows?: number | null
          career_starts?: number | null
          career_wins?: number | null
          created_at?: string | null
          current_year_starts?: number | null
          current_year_wins?: number | null
          jockey_id: string
          jockey_name: string
          license_number?: string | null
          updated_at?: string | null
          weight?: number | null
          win_percentage?: number | null
        }
        Update: {
          agent?: string | null
          career_places?: number | null
          career_shows?: number | null
          career_starts?: number | null
          career_wins?: number | null
          created_at?: string | null
          current_year_starts?: number | null
          current_year_wins?: number | null
          jockey_id?: string
          jockey_name?: string
          license_number?: string | null
          updated_at?: string | null
          weight?: number | null
          win_percentage?: number | null
        }
        Relationships: []
      }
      model_predictions: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          edge_percentage: number | null
          entry_id: string | null
          model_name: string
          model_version: string | null
          place_probability: number | null
          predicted_finish_position: number | null
          predicted_time: number | null
          prediction_id: string
          prediction_timestamp: string | null
          race_id: string | null
          show_probability: number | null
          value_rating: number | null
          win_probability: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          edge_percentage?: number | null
          entry_id?: string | null
          model_name: string
          model_version?: string | null
          place_probability?: number | null
          predicted_finish_position?: number | null
          predicted_time?: number | null
          prediction_id: string
          prediction_timestamp?: string | null
          race_id?: string | null
          show_probability?: number | null
          value_rating?: number | null
          win_probability?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          edge_percentage?: number | null
          entry_id?: string | null
          model_name?: string
          model_version?: string | null
          place_probability?: number | null
          predicted_finish_position?: number | null
          predicted_time?: number | null
          prediction_id?: string
          prediction_timestamp?: string | null
          race_id?: string | null
          show_probability?: number | null
          value_rating?: number | null
          win_probability?: number | null
        }
        Relationships: []
      }
      odds_changes: {
        Row: {
          change_direction: string | null
          change_percent: number | null
          entry_id: string | null
          horse_name: string | null
          id: number
          new_odds: number | null
          previous_odds: number | null
          program_number: string | null
          race_id: string | null
          timestamp: string | null
        }
        Insert: {
          change_direction?: string | null
          change_percent?: number | null
          entry_id?: string | null
          horse_name?: string | null
          id?: number
          new_odds?: number | null
          previous_odds?: number | null
          program_number?: string | null
          race_id?: string | null
          timestamp?: string | null
        }
        Update: {
          change_direction?: string | null
          change_percent?: number | null
          entry_id?: string | null
          horse_name?: string | null
          id?: number
          new_odds?: number | null
          previous_odds?: number | null
          program_number?: string | null
          race_id?: string | null
          timestamp?: string | null
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
      odds_history: {
        Row: {
          entry_id: string | null
          id: number
          minutes_to_post: number | null
          odds: number
          place_pool: number | null
          program_number: string | null
          race_id: string | null
          show_pool: number | null
          timestamp: string | null
          win_pool: number | null
        }
        Insert: {
          entry_id?: string | null
          id?: number
          minutes_to_post?: number | null
          odds: number
          place_pool?: number | null
          program_number?: string | null
          race_id?: string | null
          show_pool?: number | null
          timestamp?: string | null
          win_pool?: number | null
        }
        Update: {
          entry_id?: string | null
          id?: number
          minutes_to_post?: number | null
          odds?: number
          place_pool?: number | null
          program_number?: string | null
          race_id?: string | null
          show_pool?: number | null
          timestamp?: string | null
          win_pool?: number | null
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
      past_performances: {
        Row: {
          created_at: string | null
          distance: number | null
          final_time: number | null
          finish_position: number | null
          first_call_position: number | null
          horse_id: string | null
          jockey: string | null
          lengths_behind: number | null
          odds: number | null
          performance_id: string
          race_class: string | null
          race_comments: string | null
          race_date: string
          race_id: string | null
          race_number: number | null
          second_call_position: number | null
          speed_figure: number | null
          stretch_position: number | null
          surface: string | null
          track_condition: string | null
          track_id: string | null
          trainer: string | null
          weight_carried: number | null
          winner: string | null
        }
        Insert: {
          created_at?: string | null
          distance?: number | null
          final_time?: number | null
          finish_position?: number | null
          first_call_position?: number | null
          horse_id?: string | null
          jockey?: string | null
          lengths_behind?: number | null
          odds?: number | null
          performance_id: string
          race_class?: string | null
          race_comments?: string | null
          race_date: string
          race_id?: string | null
          race_number?: number | null
          second_call_position?: number | null
          speed_figure?: number | null
          stretch_position?: number | null
          surface?: string | null
          track_condition?: string | null
          track_id?: string | null
          trainer?: string | null
          weight_carried?: number | null
          winner?: string | null
        }
        Update: {
          created_at?: string | null
          distance?: number | null
          final_time?: number | null
          finish_position?: number | null
          first_call_position?: number | null
          horse_id?: string | null
          jockey?: string | null
          lengths_behind?: number | null
          odds?: number | null
          performance_id?: string
          race_class?: string | null
          race_comments?: string | null
          race_date?: string
          race_id?: string | null
          race_number?: number | null
          second_call_position?: number | null
          speed_figure?: number | null
          stretch_position?: number | null
          surface?: string | null
          track_condition?: string | null
          track_id?: string | null
          trainer?: string | null
          weight_carried?: number | null
          winner?: string | null
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
      race_entries: {
        Row: {
          claiming_price: number | null
          created_at: string | null
          current_odds: number | null
          entry_id: string
          equipment: string | null
          final_odds: number | null
          final_time: number | null
          finish_position: number | null
          horse_id: string | null
          jockey_id: string | null
          lengths_behind: number | null
          medication: string | null
          morning_line_odds: number | null
          owner: string | null
          post_position: number | null
          program_number: string
          race_comments: string | null
          race_id: string | null
          scratch_time: string | null
          scratched: boolean | null
          speed_figure: number | null
          trainer_id: string | null
          updated_at: string | null
          weight_carried: number | null
        }
        Insert: {
          claiming_price?: number | null
          created_at?: string | null
          current_odds?: number | null
          entry_id: string
          equipment?: string | null
          final_odds?: number | null
          final_time?: number | null
          finish_position?: number | null
          horse_id?: string | null
          jockey_id?: string | null
          lengths_behind?: number | null
          medication?: string | null
          morning_line_odds?: number | null
          owner?: string | null
          post_position?: number | null
          program_number: string
          race_comments?: string | null
          race_id?: string | null
          scratch_time?: string | null
          scratched?: boolean | null
          speed_figure?: number | null
          trainer_id?: string | null
          updated_at?: string | null
          weight_carried?: number | null
        }
        Update: {
          claiming_price?: number | null
          created_at?: string | null
          current_odds?: number | null
          entry_id?: string
          equipment?: string | null
          final_odds?: number | null
          final_time?: number | null
          finish_position?: number | null
          horse_id?: string | null
          jockey_id?: string | null
          lengths_behind?: number | null
          medication?: string | null
          morning_line_odds?: number | null
          owner?: string | null
          post_position?: number | null
          program_number?: string
          race_comments?: string | null
          race_id?: string | null
          scratch_time?: string | null
          scratched?: boolean | null
          speed_figure?: number | null
          trainer_id?: string | null
          updated_at?: string | null
          weight_carried?: number | null
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
      races: {
        Row: {
          created_at: string | null
          distance: number | null
          field_size: number | null
          post_time: string
          purse: number | null
          race_class: string | null
          race_date: string
          race_id: string
          race_name: string | null
          race_number: number
          race_status: string | null
          race_type: string | null
          results_official: boolean | null
          surface: string | null
          temperature: number | null
          track_condition: string | null
          track_id: string | null
          updated_at: string | null
          weather: string | null
        }
        Insert: {
          created_at?: string | null
          distance?: number | null
          field_size?: number | null
          post_time: string
          purse?: number | null
          race_class?: string | null
          race_date: string
          race_id: string
          race_name?: string | null
          race_number: number
          race_status?: string | null
          race_type?: string | null
          results_official?: boolean | null
          surface?: string | null
          temperature?: number | null
          track_condition?: string | null
          track_id?: string | null
          updated_at?: string | null
          weather?: string | null
        }
        Update: {
          created_at?: string | null
          distance?: number | null
          field_size?: number | null
          post_time?: string
          purse?: number | null
          race_class?: string | null
          race_date?: string
          race_id?: string
          race_name?: string | null
          race_number?: number
          race_status?: string | null
          race_type?: string | null
          results_official?: boolean | null
          surface?: string | null
          temperature?: number | null
          track_condition?: string | null
          track_id?: string | null
          updated_at?: string | null
          weather?: string | null
        }
        Relationships: []
      }
      rag_documents: {
        Row: {
          content: string
          created_at: string | null
          document_id: string
          document_type: string | null
          metadata: Json | null
          source: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id: string
          document_type?: string | null
          metadata?: Json | null
          source?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string
          document_type?: string | null
          metadata?: Json | null
          source?: string | null
          title?: string | null
          updated_at?: string | null
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
      speed_figures: {
        Row: {
          created_at: string | null
          figure_id: string
          figure_type: string | null
          final_time: number | null
          horse_id: string | null
          par_figure: number | null
          race_date: string
          race_id: string | null
          speed_figure: number
          track_variant: number | null
        }
        Insert: {
          created_at?: string | null
          figure_id: string
          figure_type?: string | null
          final_time?: number | null
          horse_id?: string | null
          par_figure?: number | null
          race_date: string
          race_id?: string | null
          speed_figure: number
          track_variant?: number | null
        }
        Update: {
          created_at?: string | null
          figure_id?: string
          figure_type?: string | null
          final_time?: number | null
          horse_id?: string | null
          par_figure?: number | null
          race_date?: string
          race_id?: string | null
          speed_figure?: number
          track_variant?: number | null
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
      system_logs: {
        Row: {
          component: string | null
          details: Json | null
          log_id: number
          log_level: string | null
          message: string
          timestamp: string | null
        }
        Insert: {
          component?: string | null
          details?: Json | null
          log_id?: number
          log_level?: string | null
          message: string
          timestamp?: string | null
        }
        Update: {
          component?: string | null
          details?: Json | null
          log_id?: number
          log_level?: string | null
          message?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      tracks: {
        Row: {
          country: string | null
          created_at: string | null
          location: string | null
          state: string | null
          timezone: string | null
          track_id: string
          track_name: string
          track_type: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          location?: string | null
          state?: string | null
          timezone?: string | null
          track_id: string
          track_name: string
          track_type?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          location?: string | null
          state?: string | null
          timezone?: string | null
          track_id?: string
          track_name?: string
          track_type?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      trainers: {
        Row: {
          barn_location: string | null
          career_places: number | null
          career_shows: number | null
          career_starts: number | null
          career_wins: number | null
          created_at: string | null
          current_year_starts: number | null
          current_year_wins: number | null
          license_number: string | null
          trainer_id: string
          trainer_name: string
          updated_at: string | null
          win_percentage: number | null
        }
        Insert: {
          barn_location?: string | null
          career_places?: number | null
          career_shows?: number | null
          career_starts?: number | null
          career_wins?: number | null
          created_at?: string | null
          current_year_starts?: number | null
          current_year_wins?: number | null
          license_number?: string | null
          trainer_id: string
          trainer_name: string
          updated_at?: string | null
          win_percentage?: number | null
        }
        Update: {
          barn_location?: string | null
          career_places?: number | null
          career_shows?: number | null
          career_starts?: number | null
          career_wins?: number | null
          created_at?: string | null
          current_year_starts?: number | null
          current_year_wins?: number | null
          license_number?: string | null
          trainer_id?: string
          trainer_name?: string
          updated_at?: string | null
          win_percentage?: number | null
        }
        Relationships: []
      }
      user_bets: {
        Row: {
          bet_id: string
          bet_type: string | null
          odds: number | null
          payout: number | null
          placed_at: string | null
          race_id: string | null
          roi: number | null
          selections: Json
          settled_at: string | null
          stake: number
          status: string | null
          user_id: string | null
        }
        Insert: {
          bet_id: string
          bet_type?: string | null
          odds?: number | null
          payout?: number | null
          placed_at?: string | null
          race_id?: string | null
          roi?: number | null
          selections: Json
          settled_at?: string | null
          stake: number
          status?: string | null
          user_id?: string | null
        }
        Update: {
          bet_id?: string
          bet_type?: string | null
          odds?: number | null
          payout?: number | null
          placed_at?: string | null
          race_id?: string | null
          roi?: number | null
          selections?: Json
          settled_at?: string | null
          stake?: number
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          bankroll: number | null
          created_at: string | null
          display_name: string | null
          favorite_tracks: Json | null
          notification_preferences: Json | null
          risk_tolerance: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          bankroll?: number | null
          created_at?: string | null
          display_name?: string | null
          favorite_tracks?: Json | null
          notification_preferences?: Json | null
          risk_tolerance?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          bankroll?: number | null
          created_at?: string | null
          display_name?: string | null
          favorite_tracks?: Json | null
          notification_preferences?: Json | null
          risk_tolerance?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_watchlists: {
        Row: {
          added_at: string | null
          notes: string | null
          race_id: string | null
          user_id: string | null
          watchlist_id: string
        }
        Insert: {
          added_at?: string | null
          notes?: string | null
          race_id?: string | null
          user_id?: string | null
          watchlist_id: string
        }
        Update: {
          added_at?: string | null
          notes?: string | null
          race_id?: string | null
          user_id?: string | null
          watchlist_id?: string
        }
        Relationships: []
      }
      value_bets: {
        Row: {
          confidence_tier: string | null
          current_odds: number | null
          edge: number | null
          edge_percent: number | null
          entry_id: string | null
          expected_value: number | null
          horse_name: string | null
          identified_at: string | null
          implied_probability: number | null
          kelly_fraction: number | null
          predicted_probability: number | null
          program_number: string | null
          race_id: string | null
          recommended_stake_percent: number | null
          value_bet_id: string
        }
        Insert: {
          confidence_tier?: string | null
          current_odds?: number | null
          edge?: number | null
          edge_percent?: number | null
          entry_id?: string | null
          expected_value?: number | null
          horse_name?: string | null
          identified_at?: string | null
          implied_probability?: number | null
          kelly_fraction?: number | null
          predicted_probability?: number | null
          program_number?: string | null
          race_id?: string | null
          recommended_stake_percent?: number | null
          value_bet_id: string
        }
        Update: {
          confidence_tier?: string | null
          current_odds?: number | null
          edge?: number | null
          edge_percent?: number | null
          entry_id?: string | null
          expected_value?: number | null
          horse_name?: string | null
          identified_at?: string | null
          implied_probability?: number | null
          kelly_fraction?: number | null
          predicted_probability?: number | null
          program_number?: string | null
          race_id?: string | null
          recommended_stake_percent?: number | null
          value_bet_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          error_message: string | null
          execution_id: string
          execution_time_ms: number | null
          input_data: Json | null
          output_data: Json | null
          started_at: string
          status: string | null
          workflow_name: string
          workflow_type: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          execution_id: string
          execution_time_ms?: number | null
          input_data?: Json | null
          output_data?: Json | null
          started_at: string
          status?: string | null
          workflow_name: string
          workflow_type?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          execution_id?: string
          execution_time_ms?: number | null
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string
          status?: string | null
          workflow_name?: string
          workflow_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
