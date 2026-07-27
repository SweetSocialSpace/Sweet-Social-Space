export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: { id: string; body: string; user_id: string; tag: string | null; zip_code: string | null; latitude: number | null; longitude: number | null; hidden: boolean | null; moderation_status: string | null; created_at: string; updated_at: string; source_url: string | null; media_url: string | null; media_type: string | null }
        Insert: { id?: string; body: string; user_id: string; tag?: string | null; zip_code?: string | null; latitude?: number | null; longitude?: number | null; hidden?: boolean | null; moderation_status?: string | null; created_at?: string; updated_at?: string; source_url?: string | null; media_url?: string | null; media_type?: string | null }
        Update: { id?: string; body?: string; user_id?: string; tag?: string | null; zip_code?: string | null; latitude?: number | null; longitude?: number | null; hidden?: boolean | null; moderation_status?: string | null; created_at?: string; updated_at?: string; source_url?: string | null; media_url?: string | null; media_type?: string | null }
        Relationships: []
      }
      user_roles: {
        Row: { user_id: string; role: string }
        Insert: { user_id: string; role: string }
        Update: { user_id?: string; role?: string }
        Relationships: []
      }
      profiles: {
        Row: { id: string; display_name: string | null; created_at: string }
        Insert: { id: string; display_name?: string | null; created_at?: string }
        Update: { id?: string; display_name?: string | null; created_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      has_role: { Args: { _user_id: string; _role: string }; Returns: boolean }
    }
    Enums: { report_category: 'spam' | 'abuse' | 'harassment' | 'other' }
    CompositeTypes: { [_ in never]: never }
  }
}

// Helper types (keep yours)
export type Tables<
  PublicTableNameOrOptions extends keyof (Database['public']['Tables'] & Database['public']['Views']) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] & Database[PublicTableNameOrOptions['schema']]['Views']) : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
 ? (Database[PublicTableNameOrOptions['schema']]['Tables'] & Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends { Row: infer R }? R : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] & Database['public']['Views'])
 ? (Database['public']['Tables'] & Database['public']['Views'])[PublicTableNameOrOptions] extends { Row: infer R }? R : never : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }? keyof Database[PublicTableNameOrOptions['schema']]['Tables'] : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
 ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends { Insert: infer I }? I : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
 ? Database['public']['Tables'][PublicTableNameOrOptions] extends { Insert: infer I }? I : never : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }? keyof Database[PublicTableNameOrOptions['schema']]['Tables'] : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
 ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends { Update: infer U }? U : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
 ? Database['public']['Tables'][PublicTableNameOrOptions] extends { Update: infer U }? U : never : never
