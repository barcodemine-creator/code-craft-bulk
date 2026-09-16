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
      barcode_packs: {
        Row: {
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          quantity: number
        }
        Insert: {
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          quantity: number
        }
        Update: {
          barcode_type?: Database["public"]["Enums"]["barcode_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          quantity?: number
        }
        Relationships: []
      }
      barcode_ranges: {
        Row: {
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          created_at: string
          end_number: string
          id: string
          is_locked: boolean | null
          is_sold: boolean | null
          locked_at: string | null
          start_number: string
        }
        Insert: {
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          created_at?: string
          end_number: string
          id?: string
          is_locked?: boolean | null
          is_sold?: boolean | null
          locked_at?: string | null
          start_number: string
        }
        Update: {
          barcode_type?: Database["public"]["Enums"]["barcode_type"]
          created_at?: string
          end_number?: string
          id?: string
          is_locked?: boolean | null
          is_sold?: boolean | null
          locked_at?: string | null
          start_number?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          barcodes: string[]
          certificate_number: string
          company_name: string
          created_at: string
          id: string
          issue_date: string
          order_id: string
          pdf_url: string | null
        }
        Insert: {
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          barcodes: string[]
          certificate_number: string
          company_name: string
          created_at?: string
          id?: string
          issue_date?: string
          order_id: string
          pdf_url?: string | null
        }
        Update: {
          barcode_type?: Database["public"]["Enums"]["barcode_type"]
          barcodes?: string[]
          certificate_number?: string
          company_name?: string
          created_at?: string
          id?: string
          issue_date?: string
          order_id?: string
          pdf_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gepir_registry: {
        Row: {
          barcode_number: string
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          company_contact: string | null
          company_name: string
          country: string | null
          id: string
          is_public: boolean | null
          order_id: string | null
          registration_date: string
          user_id: string | null
        }
        Insert: {
          barcode_number: string
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          company_contact?: string | null
          company_name: string
          country?: string | null
          id?: string
          is_public?: boolean | null
          order_id?: string | null
          registration_date?: string
          user_id?: string | null
        }
        Update: {
          barcode_number?: string
          barcode_type?: Database["public"]["Enums"]["barcode_type"]
          company_contact?: string | null
          company_name?: string
          country?: string | null
          id?: string
          is_public?: boolean | null
          order_id?: string | null
          registration_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gepir_registry_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_barcodes: {
        Row: {
          barcode_number: string
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          created_at: string
          id: string
          order_id: string
        }
        Insert: {
          barcode_number: string
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          created_at?: string
          id?: string
          order_id: string
        }
        Update: {
          barcode_number?: string
          barcode_type?: Database["public"]["Enums"]["barcode_type"]
          created_at?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_barcodes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          certificate_number: string | null
          completed_at: string | null
          created_at: string
          end_number: string
          id: string
          pack_id: string | null
          payment_reference: string | null
          quantity: number
          start_number: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          user_id: string
        }
        Insert: {
          barcode_type: Database["public"]["Enums"]["barcode_type"]
          certificate_number?: string | null
          completed_at?: string | null
          created_at?: string
          end_number: string
          id?: string
          pack_id?: string | null
          payment_reference?: string | null
          quantity: number
          start_number: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          user_id: string
        }
        Update: {
          barcode_type?: Database["public"]["Enums"]["barcode_type"]
          certificate_number?: string | null
          completed_at?: string | null
          created_at?: string
          end_number?: string
          id?: string
          pack_id?: string | null
          payment_reference?: string | null
          quantity?: number
          start_number?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "barcode_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          contact_name: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
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
    }
    Enums: {
      app_role: "admin" | "customer"
      barcode_type: "UPC-A" | "EAN-13"
      order_status: "pending" | "paid" | "completed" | "refunded"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "customer"],
      barcode_type: ["UPC-A", "EAN-13"],
      order_status: ["pending", "paid", "completed", "refunded"],
    },
  },
} as const
