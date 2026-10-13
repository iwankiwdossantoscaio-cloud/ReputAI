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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          evaluation_id: string | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          evaluation_id?: string | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Update: {
          created_at?: string
          evaluation_id?: string | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          average_rating: number
          cnpj: string | null
          created_at: string
          description: string
          email: string | null
          id: string
          lat: number
          lng: number
          location: string
          name: string
          phone: string | null
          review_count: number
          sector: string
          website: string | null
        }
        Insert: {
          average_rating?: number
          cnpj?: string | null
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          lat?: number
          lng?: number
          location?: string
          name: string
          phone?: string | null
          review_count?: number
          sector?: string
          website?: string | null
        }
        Update: {
          average_rating?: number
          cnpj?: string | null
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          lat?: number
          lng?: number
          location?: string
          name?: string
          phone?: string | null
          review_count?: number
          sector?: string
          website?: string | null
        }
        Relationships: []
      }
      evaluation_comments: {
        Row: {
          created_at: string
          evaluation_id: string
          id: string
          text: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          evaluation_id: string
          id?: string
          text?: string
          user_id: string
          user_name?: string
        }
        Update: {
          created_at?: string
          evaluation_id?: string
          id?: string
          text?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_comments_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_likes: {
        Row: {
          created_at: string
          evaluation_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evaluation_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evaluation_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_likes_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_reports: {
        Row: {
          created_at: string
          evaluation_id: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evaluation_id: string
          id?: string
          reason?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evaluation_id?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_reports_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          ambient: string | null
          anonymous: boolean
          aviso_aceito: boolean
          benefits: string[] | null
          company_id: string
          created_at: string
          date: string
          flagged_profanity: boolean
          id: string
          rating: number
          salary_amount: string | null
          salary_period: string | null
          status: string
          termos_aceitos_em: string
          text: string
          user_id: string
          user_name: string
        }
        Insert: {
          ambient?: string | null
          anonymous?: boolean
          aviso_aceito?: boolean
          benefits?: string[] | null
          company_id: string
          created_at?: string
          date?: string
          flagged_profanity?: boolean
          id?: string
          rating?: number
          salary_amount?: string | null
          salary_period?: string | null
          status?: string
          termos_aceitos_em?: string
          text?: string
          user_id: string
          user_name?: string
        }
        Update: {
          ambient?: string | null
          anonymous?: boolean
          aviso_aceito?: boolean
          benefits?: string[] | null
          company_id?: string
          created_at?: string
          date?: string
          flagged_profanity?: boolean
          id?: string
          rating?: number
          salary_amount?: string | null
          salary_period?: string | null
          status?: string
          termos_aceitos_em?: string
          text?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          birth_date: string
          cpf: string
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          birth_date: string
          cpf: string
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          birth_date?: string
          cpf?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_companies: {
        Row: {
          average_rating: number | null
          created_at: string | null
          description: string | null
          id: string | null
          lat: number | null
          lng: number | null
          location: string | null
          name: string | null
          review_count: number | null
          sector: string | null
          website: string | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          name?: string | null
          review_count?: number | null
          sector?: string | null
          website?: string | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          name?: string | null
          review_count?: number | null
          sector?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_evaluation_display_name: {
        Args: {
          ev_anonymous: boolean
          ev_user_id: string
          ev_user_name: string
        }
        Returns: string
      }
      get_evaluation_user_id: {
        Args: { ev_anonymous: boolean; ev_user_id: string }
        Returns: string
      }
      get_public_evaluations: {
        Args: never
        Returns: {
          ambient: string
          anonymous: boolean
          aviso_aceito: boolean
          benefits: string[]
          company_id: string
          created_at: string
          date: string
          flagged_profanity: boolean
          id: string
          rating: number
          salary_amount: string
          salary_period: string
          status: string
          termos_aceitos_em: string
          text: string
          user_id: string
          user_name: string
        }[]
      }
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
