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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      domain_probes: {
        Row: {
          domain: Database["public"]["Enums"]["moodle_domain"]
          id: string
          probed_at: string
          reason: string
          site_id: string
          status: Database["public"]["Enums"]["domain_status"]
          ws_function_tested: string | null
        }
        Insert: {
          domain: Database["public"]["Enums"]["moodle_domain"]
          id?: string
          probed_at?: string
          reason: string
          site_id: string
          status?: Database["public"]["Enums"]["domain_status"]
          ws_function_tested?: string | null
        }
        Update: {
          domain?: Database["public"]["Enums"]["moodle_domain"]
          id?: string
          probed_at?: string
          reason?: string
          site_id?: string
          status?: Database["public"]["Enums"]["domain_status"]
          ws_function_tested?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_probes_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_probes_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          column_mapping: Json | null
          course_id: number
          created_at: string
          detection_confidence: number | null
          file_name: string | null
          file_size_bytes: number | null
          id: string
          imported_by_username: string | null
          report_type: string
          row_count: number
          session_id: string | null
          site_id: string
          source_kind: string
          status: string
          warnings: Json | null
        }
        Insert: {
          column_mapping?: Json | null
          course_id: number
          created_at?: string
          detection_confidence?: number | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          imported_by_username?: string | null
          report_type: string
          row_count?: number
          session_id?: string | null
          site_id: string
          source_kind?: string
          status?: string
          warnings?: Json | null
        }
        Update: {
          column_mapping?: Json | null
          course_id?: number
          created_at?: string
          detection_confidence?: number | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          imported_by_username?: string | null
          report_type?: string
          row_count?: number
          session_id?: string | null
          site_id?: string
          source_kind?: string
          status?: string
          warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teacher_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_chapters: {
        Row: {
          chapter_name: string
          course_id: number
          created_at: string
          first_seen_batch: string | null
          id: string
          last_seen_batch: string | null
          position: number | null
          site_id: string
          updated_at: string
        }
        Insert: {
          chapter_name: string
          course_id: number
          created_at?: string
          first_seen_batch?: string | null
          id?: string
          last_seen_batch?: string | null
          position?: number | null
          site_id: string
          updated_at?: string
        }
        Update: {
          chapter_name?: string
          course_id?: number
          created_at?: string
          first_seen_batch?: string | null
          id?: string
          last_seen_batch?: string | null
          position?: number | null
          site_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      imported_grade_items: {
        Row: {
          course_id: number
          created_at: string
          first_seen_batch: string | null
          id: string
          item_name: string
          item_type: string | null
          last_seen_batch: string | null
          max_grade: number | null
          site_id: string
          updated_at: string
        }
        Insert: {
          course_id: number
          created_at?: string
          first_seen_batch?: string | null
          id?: string
          item_name: string
          item_type?: string | null
          last_seen_batch?: string | null
          max_grade?: number | null
          site_id: string
          updated_at?: string
        }
        Update: {
          course_id?: number
          created_at?: string
          first_seen_batch?: string | null
          id?: string
          item_name?: string
          item_type?: string | null
          last_seen_batch?: string | null
          max_grade?: number | null
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_grade_items_first_seen_batch_fkey"
            columns: ["first_seen_batch"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_grade_items_last_seen_batch_fkey"
            columns: ["last_seen_batch"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_grade_items_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_grade_items_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_grades: {
        Row: {
          batch_id: string | null
          course_id: number
          created_at: string
          grade_item_id: string
          id: string
          is_missing: boolean
          numeric_value: number | null
          raw_value: string | null
          site_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          course_id: number
          created_at?: string
          grade_item_id: string
          id?: string
          is_missing?: boolean
          numeric_value?: number | null
          raw_value?: string | null
          site_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          course_id?: number
          created_at?: string
          grade_item_id?: string
          id?: string
          is_missing?: boolean
          numeric_value?: number | null
          raw_value?: string | null
          site_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_grades_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_grades_grade_item_id_fkey"
            columns: ["grade_item_id"]
            isOneToOne: false
            referencedRelation: "imported_grade_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_grades_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_grades_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "imported_students"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_log_events: {
        Row: {
          affected_user: string | null
          batch_id: string | null
          component: string | null
          course_id: number
          created_at: string
          description: string | null
          event_context: string | null
          event_name: string | null
          id: string
          ip_address: string | null
          occurred_at: string
          origin: string | null
          raw_user_full_name: string | null
          raw_user_username: string | null
          site_id: string
          student_id: string | null
        }
        Insert: {
          affected_user?: string | null
          batch_id?: string | null
          component?: string | null
          course_id: number
          created_at?: string
          description?: string | null
          event_context?: string | null
          event_name?: string | null
          id?: string
          ip_address?: string | null
          occurred_at: string
          origin?: string | null
          raw_user_full_name?: string | null
          raw_user_username?: string | null
          site_id: string
          student_id?: string | null
        }
        Update: {
          affected_user?: string | null
          batch_id?: string | null
          component?: string | null
          course_id?: number
          created_at?: string
          description?: string | null
          event_context?: string | null
          event_name?: string | null
          id?: string
          ip_address?: string | null
          occurred_at?: string
          origin?: string | null
          raw_user_full_name?: string | null
          raw_user_username?: string | null
          site_id?: string
          student_id?: string | null
        }
        Relationships: []
      }
      imported_students: {
        Row: {
          course_id: number
          created_at: string
          email: string | null
          external_id: string | null
          external_username: string | null
          first_seen_batch: string | null
          full_name: string
          id: string
          last_seen_batch: string | null
          site_id: string
          updated_at: string
        }
        Insert: {
          course_id: number
          created_at?: string
          email?: string | null
          external_id?: string | null
          external_username?: string | null
          first_seen_batch?: string | null
          full_name: string
          id?: string
          last_seen_batch?: string | null
          site_id: string
          updated_at?: string
        }
        Update: {
          course_id?: number
          created_at?: string
          email?: string | null
          external_id?: string | null
          external_username?: string | null
          first_seen_batch?: string | null
          full_name?: string
          id?: string
          last_seen_batch?: string | null
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_students_first_seen_batch_fkey"
            columns: ["first_seen_batch"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_students_last_seen_batch_fkey"
            columns: ["last_seen_batch"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_students_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_students_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_task_completion: {
        Row: {
          batch_id: string | null
          completed_at: string | null
          course_id: number
          created_at: string
          id: string
          is_complete: boolean | null
          raw_value: string | null
          site_id: string
          status: string | null
          student_id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          completed_at?: string | null
          course_id: number
          created_at?: string
          id?: string
          is_complete?: boolean | null
          raw_value?: string | null
          site_id: string
          status?: string | null
          student_id: string
          task_id: string
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          completed_at?: string | null
          course_id?: number
          created_at?: string
          id?: string
          is_complete?: boolean | null
          raw_value?: string | null
          site_id?: string
          status?: string | null
          student_id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_task_completion_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "imported_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_tasks: {
        Row: {
          chapter_id: string | null
          course_id: number
          created_at: string
          due_date: string | null
          first_seen_batch: string | null
          id: string
          last_seen_batch: string | null
          position: number | null
          site_id: string
          task_name: string
          task_type: string | null
          updated_at: string
        }
        Insert: {
          chapter_id?: string | null
          course_id: number
          created_at?: string
          due_date?: string | null
          first_seen_batch?: string | null
          id?: string
          last_seen_batch?: string | null
          position?: number | null
          site_id: string
          task_name: string
          task_type?: string | null
          updated_at?: string
        }
        Update: {
          chapter_id?: string | null
          course_id?: number
          created_at?: string
          due_date?: string | null
          first_seen_batch?: string | null
          id?: string
          last_seen_batch?: string | null
          position?: number | null
          site_id?: string
          task_name?: string
          task_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_tasks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "imported_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_attempts: {
        Row: {
          attempted_at: string
          consumer_guid: string | null
          consumer_key: string | null
          course_id: number | null
          debug_base_string: string | null
          debug_base_string_sha256: string | null
          debug_consumer_secret_len: number | null
          debug_consumer_secret_preview: string | null
          debug_consumer_secret_sha256: string | null
          debug_consumer_secret_source: string | null
          debug_expected_signature: string | null
          debug_launch_url: string | null
          debug_raw_body: string | null
          debug_received_signature: string | null
          id: string
          ip: string | null
          outcome: string
          reason: string | null
          role: string | null
          signature_valid: boolean | null
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          consumer_guid?: string | null
          consumer_key?: string | null
          course_id?: number | null
          debug_base_string?: string | null
          debug_base_string_sha256?: string | null
          debug_consumer_secret_len?: number | null
          debug_consumer_secret_preview?: string | null
          debug_consumer_secret_sha256?: string | null
          debug_consumer_secret_source?: string | null
          debug_expected_signature?: string | null
          debug_launch_url?: string | null
          debug_raw_body?: string | null
          debug_received_signature?: string | null
          id?: string
          ip?: string | null
          outcome: string
          reason?: string | null
          role?: string | null
          signature_valid?: boolean | null
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          consumer_guid?: string | null
          consumer_key?: string | null
          course_id?: number | null
          debug_base_string?: string | null
          debug_base_string_sha256?: string | null
          debug_consumer_secret_len?: number | null
          debug_consumer_secret_preview?: string | null
          debug_consumer_secret_sha256?: string | null
          debug_consumer_secret_source?: string | null
          debug_expected_signature?: string | null
          debug_launch_url?: string | null
          debug_raw_body?: string | null
          debug_received_signature?: string | null
          id?: string
          ip?: string | null
          outcome?: string
          reason?: string | null
          role?: string | null
          signature_valid?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      moodle_sites: {
        Row: {
          consumer_guid: string | null
          consumer_key: string | null
          consumer_secret: string | null
          created_at: string
          id: string
          last_probed_at: string | null
          lti_consumer_key: string | null
          lti_consumer_secret: string | null
          site_name: string | null
          site_url: string
          updated_at: string
          ws_token: string | null
          ws_token_status: string
        }
        Insert: {
          consumer_guid?: string | null
          consumer_key?: string | null
          consumer_secret?: string | null
          created_at?: string
          id?: string
          last_probed_at?: string | null
          lti_consumer_key?: string | null
          lti_consumer_secret?: string | null
          site_name?: string | null
          site_url: string
          updated_at?: string
          ws_token?: string | null
          ws_token_status?: string
        }
        Update: {
          consumer_guid?: string | null
          consumer_key?: string | null
          consumer_secret?: string | null
          created_at?: string
          id?: string
          last_probed_at?: string | null
          lti_consumer_key?: string | null
          lti_consumer_secret?: string | null
          site_name?: string | null
          site_url?: string
          updated_at?: string
          ws_token?: string | null
          ws_token_status?: string
        }
        Relationships: []
      }
      teacher_sessions: {
        Row: {
          course_id: number
          course_title: string | null
          expires_at: string
          id: string
          launched_at: string
          moodle_user_id: number | null
          moodle_username: string | null
          role: string | null
          session_token: string
          site_id: string
        }
        Insert: {
          course_id: number
          course_title?: string | null
          expires_at?: string
          id?: string
          launched_at?: string
          moodle_user_id?: number | null
          moodle_username?: string | null
          role?: string | null
          session_token: string
          site_id: string
        }
        Update: {
          course_id?: number
          course_title?: string | null
          expires_at?: string
          id?: string
          launched_at?: string
          moodle_user_id?: number | null
          moodle_username?: string | null
          role?: string | null
          session_token?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_sessions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_sessions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "moodle_sites_safe"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      launch_summary: {
        Row: {
          active_sessions: number | null
          attempts_24h: number | null
          failures_24h: number | null
          last_failure_at: string | null
          last_failure_reason: string | null
          last_launch_at: string | null
          sites_count: number | null
          total_sessions: number | null
        }
        Relationships: []
      }
      moodle_sites_safe: {
        Row: {
          consumer_guid: string | null
          created_at: string | null
          id: string | null
          last_probed_at: string | null
          lti_configured: boolean | null
          site_name: string | null
          site_url: string | null
          updated_at: string | null
          ws_configured: boolean | null
          ws_token_status: string | null
        }
        Insert: {
          consumer_guid?: string | null
          created_at?: string | null
          id?: string | null
          last_probed_at?: string | null
          lti_configured?: never
          site_name?: string | null
          site_url?: string | null
          updated_at?: string | null
          ws_configured?: never
          ws_token_status?: string | null
        }
        Update: {
          consumer_guid?: string | null
          created_at?: string | null
          id?: string | null
          last_probed_at?: string | null
          lti_configured?: never
          site_name?: string | null
          site_url?: string | null
          updated_at?: string | null
          ws_configured?: never
          ws_token_status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      lti_delete_batch: {
        Args: { _batch_id: string; _token: string }
        Returns: Json
      }
      lti_get_activity_overview: { Args: { _token: string }; Returns: Json }
      lti_get_context: { Args: { _token: string }; Returns: Json }
      lti_get_course_structure: { Args: { _token: string }; Returns: Json }
      lti_get_daily_activity: { Args: { _token: string }; Returns: Json }
      lti_get_grades_matrix: { Args: { _token: string }; Returns: Json }
      lti_get_imports_overview: { Args: { _token: string }; Returns: Json }
      lti_get_practice_time: {
        Args: {
          _from?: string
          _student_id?: string
          _to?: string
          _token: string
        }
        Returns: Json
      }
      lti_get_student_profile: {
        Args: { _student_id: string; _token: string }
        Returns: Json
      }
      lti_get_student_reports: { Args: { _token: string }; Returns: Json }
      lti_get_task_completion_detail: {
        Args: { _token: string }
        Returns: Json
      }
      lti_list_students: { Args: { _token: string }; Returns: Json }
    }
    Enums: {
      domain_status: "proven" | "missing" | "blocked"
      moodle_domain:
        | "students"
        | "tasks"
        | "chapters"
        | "grades"
        | "activity"
        | "time_accumulated"
        | "reports"
        | "export_data"
        | "settings_write"
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
      domain_status: ["proven", "missing", "blocked"],
      moodle_domain: [
        "students",
        "tasks",
        "chapters",
        "grades",
        "activity",
        "time_accumulated",
        "reports",
        "export_data",
        "settings_write",
      ],
    },
  },
} as const
