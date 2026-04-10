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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      document_templates: {
        Row: {
          created_at: string
          id: string
          image_filename: string | null
          image_path: string
          mime_type: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_filename?: string | null
          image_path: string
          mime_type?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_filename?: string | null
          image_path?: string
          mime_type?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generation_history: {
        Row: {
          created_at: string
          effort_level: number | null
          extension_mode: string | null
          id: string
          prompt_used: string | null
          result_text: string
          status: string
          template_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          effort_level?: number | null
          extension_mode?: string | null
          id?: string
          prompt_used?: string | null
          result_text: string
          status?: string
          template_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          effort_level?: number | null
          extension_mode?: string | null
          id?: string
          prompt_used?: string | null
          result_text?: string
          status?: string
          template_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_knowledge: {
        Row: {
          category: string
          content: string
          content_type: Database["public"]["Enums"]["legal_content_type"]
          created_at: string
          data_publicacao: string | null
          ementa: string | null
          id: string
          metadata: Json | null
          numero_processo: string | null
          source_type: Database["public"]["Enums"]["legal_source_type"]
          source_url: string | null
          tags: string[] | null
          title: string
          tribunal: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          content_type: Database["public"]["Enums"]["legal_content_type"]
          created_at?: string
          data_publicacao?: string | null
          ementa?: string | null
          id?: string
          metadata?: Json | null
          numero_processo?: string | null
          source_type?: Database["public"]["Enums"]["legal_source_type"]
          source_url?: string | null
          tags?: string[] | null
          title: string
          tribunal?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          content_type?: Database["public"]["Enums"]["legal_content_type"]
          created_at?: string
          data_publicacao?: string | null
          ementa?: string | null
          id?: string
          metadata?: Json | null
          numero_processo?: string | null
          source_type?: Database["public"]["Enums"]["legal_source_type"]
          source_url?: string | null
          tags?: string[] | null
          title?: string
          tribunal?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      legal_scraped_urls: {
        Row: {
          content_count: number | null
          created_at: string
          error_message: string | null
          id: string
          last_scraped_at: string | null
          status: string
          url: string
        }
        Insert: {
          content_count?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_scraped_at?: string | null
          status?: string
          url: string
        }
        Update: {
          content_count?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_scraped_at?: string | null
          status?: string
          url?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_blocked: boolean
          created_at: string
          credits: number
          email: string | null
          full_name: string | null
          id: string
          prompt_count: number
          prompt_limit: number
        }
        Insert: {
          access_blocked?: boolean
          created_at?: string
          credits?: number
          email?: string | null
          full_name?: string | null
          id: string
          prompt_count?: number
          prompt_limit?: number
        }
        Update: {
          access_blocked?: boolean
          created_at?: string
          credits?: number
          email?: string | null
          full_name?: string | null
          id?: string
          prompt_count?: number
          prompt_limit?: number
        }
        Relationships: []
      }
      saved_prompts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_favorite: boolean | null
          title: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          title: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          title?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      shared_prompts: {
        Row: {
          content: string
          created_at: string
          id: string
          org_id: string
          shared_by: string
          title: string
          usage_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          org_id: string
          shared_by: string
          title: string
          usage_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          org_id?: string
          shared_by?: string
          title?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_prompts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_templates: {
        Row: {
          category: string
          created_at: string
          font_family: string | null
          font_size: number | null
          id: string
          margins: Json | null
          name: string
          org_id: string
          shared_by: string
          structure: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          font_family?: string | null
          font_size?: number | null
          id?: string
          margins?: Json | null
          name: string
          org_id: string
          shared_by: string
          structure?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          font_family?: string | null
          font_size?: number | null
          id?: string
          margins?: Json | null
          name?: string
          org_id?: string
          shared_by?: string
          structure?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_templates: {
        Row: {
          category: string
          created_at: string
          font_family: string | null
          font_size: number | null
          id: string
          is_default: boolean | null
          margins: Json | null
          name: string
          structure: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          font_family?: string | null
          font_size?: number | null
          id?: string
          is_default?: boolean | null
          margins?: Json | null
          name: string
          structure?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          font_family?: string | null
          font_size?: number | null
          id?: string
          is_default?: boolean | null
          margins?: Json | null
          name?: string
          structure?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_prompt_quota: {
        Args: { _user_id: string }
        Returns: {
          access_blocked: boolean
          allowed: boolean
          prompt_count: number
          prompt_limit: number
          remaining: number
        }[]
      }
      is_business_org: { Args: { _org_id: string }; Returns: boolean }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      legal_content_type:
        | "peticao_inicial"
        | "replica"
        | "contestacao"
        | "recurso"
        | "jurisprudencia"
        | "legislacao"
        | "doutrina"
        | "modelo"
        | "parecer"
      legal_source_type: "manual" | "scraping" | "upload"
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
      legal_content_type: [
        "peticao_inicial",
        "replica",
        "contestacao",
        "recurso",
        "jurisprudencia",
        "legislacao",
        "doutrina",
        "modelo",
        "parecer",
      ],
      legal_source_type: ["manual", "scraping", "upload"],
    },
  },
} as const
