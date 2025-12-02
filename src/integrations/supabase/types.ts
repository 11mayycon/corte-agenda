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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          created_at: string
          data: string
          hora: string
          id: string
          loja_id: string
          observacoes: string | null
          origem: string
          profissional_id: string | null
          servico_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          hora: string
          id?: string
          loja_id: string
          observacoes?: string | null
          origem?: string
          profissional_id?: string | null
          servico_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          hora?: string
          id?: string
          loja_id?: string
          observacoes?: string | null
          origem?: string
          profissional_id?: string | null
          servico_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      contas: {
        Row: {
          created_at: string
          email: string | null
          id: string
          senha_hash: string
          telefone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          senha_hash: string
          telefone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          senha_hash?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      horarios_loja: {
        Row: {
          abre: string
          dia_semana: number
          fecha: string
          id: string
          intervalo_minutos: number
          loja_id: string
        }
        Insert: {
          abre: string
          dia_semana: number
          fecha: string
          id?: string
          intervalo_minutos?: number
          loja_id: string
        }
        Update: {
          abre?: string
          dia_semana?: number
          fecha?: string
          id?: string
          intervalo_minutos?: number
          loja_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horarios_loja_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      lojas: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          created_at: string | null
          endereco: string | null
          id: string
          logo_url: string | null
          nome: string
          onboarding_pendente: boolean
          politica_cancelamento_horas: number
          uf: string | null
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          onboarding_pendente?: boolean
          politica_cancelamento_horas?: number
          uf?: string | null
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          onboarding_pendente?: boolean
          politica_cancelamento_horas?: number
          uf?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      mensagens_whatsapp: {
        Row: {
          conteudo: Json
          correlacao: string | null
          created_at: string | null
          direcao: string
          id: string
          loja_id: string | null
          tipo: string
          user_id: string | null
          wa_from: string | null
          wa_to: string | null
        }
        Insert: {
          conteudo: Json
          correlacao?: string | null
          created_at?: string | null
          direcao: string
          id?: string
          loja_id?: string | null
          tipo?: string
          user_id?: string | null
          wa_from?: string | null
          wa_to?: string | null
        }
        Update: {
          conteudo?: Json
          correlacao?: string | null
          created_at?: string | null
          direcao?: string
          id?: string
          loja_id?: string | null
          tipo?: string
          user_id?: string | null
          wa_from?: string | null
          wa_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_whatsapp_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          conta_id: string
          created_at: string
          data_nascimento: string
          id: string
          nome: string
          regiao: string
          sobrenome: string
          telefone: string
          updated_at: string
        }
        Insert: {
          conta_id: string
          created_at?: string
          data_nascimento: string
          id: string
          nome: string
          regiao: string
          sobrenome: string
          telefone: string
          updated_at?: string
        }
        Update: {
          conta_id?: string
          created_at?: string
          data_nascimento?: string
          id?: string
          nome?: string
          regiao?: string
          sobrenome?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfis_conta_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
      profissionais: {
        Row: {
          ativo: boolean
          created_at: string | null
          id: string
          loja_id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          loja_id: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          loja_id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean
          duracao_minutos: number
          id: string
          loja_id: string
          nome: string
          preco_centavos: number | null
        }
        Insert: {
          ativo?: boolean
          duracao_minutos?: number
          id?: string
          loja_id: string
          nome: string
          preco_centavos?: number | null
        }
        Update: {
          ativo?: boolean
          duracao_minutos?: number
          id?: string
          loja_id?: string
          nome?: string
          preco_centavos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "servicos_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
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
      usuarios_lojas: {
        Row: {
          loja_id: string
          papel: string
          user_id: string
        }
        Insert: {
          loja_id: string
          papel: string
          user_id: string
        }
        Update: {
          loja_id?: string
          papel?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_lojas_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_eventos: {
        Row: {
          event_id: string
          id: string
          payload: Json
          provider: string
          recebido_em: string
        }
        Insert: {
          event_id: string
          id?: string
          payload: Json
          provider: string
          recebido_em?: string
        }
        Update: {
          event_id?: string
          id?: string
          payload?: Json
          provider?: string
          recebido_em?: string
        }
        Relationships: []
      }
      whatsapp_sessoes: {
        Row: {
          created_at: string | null
          dados: Json | null
          id: string
          loja_id: string
          provider: string
          qr_base64: string | null
          session_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dados?: Json | null
          id?: string
          loja_id: string
          provider?: string
          qr_base64?: string | null
          session_name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dados?: Json | null
          id?: string
          loja_id?: string
          provider?: string
          qr_base64?: string | null
          session_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_sessoes_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "cliente" | "atendente" | "loja_admin" | "super_admin"
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
      app_role: ["cliente", "atendente", "loja_admin", "super_admin"],
    },
  },
} as const
