export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          bio?: string | null;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          question_text: string;
          question_type: 'text' | 'choice' | 'scale';
          options: string[] | null;
          order_index: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_text: string;
          question_type: 'text' | 'choice' | 'scale';
          options?: string[] | null;
          order_index: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          question_text?: string;
          question_type?: 'text' | 'choice' | 'scale';
          options?: string[] | null;
          order_index?: number;
          is_active?: boolean;
        };
      };
      questionnaire_responses: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          answer: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          answer: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          answer?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          admin_id: string | null;
          title: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          admin_id?: string | null;
          title?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          admin_id?: string | null;
          title?: string | null;
          last_message_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          type: 'message' | 'system' | 'love' | 'response';
          is_read: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          type: 'message' | 'system' | 'love' | 'response';
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type QuestionnaireResponse = Database['public']['Tables']['questionnaire_responses']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

export interface ConversationWithProfile extends Conversation {
  user_profile?: Profile;
  admin_profile?: Profile;
  unread_count?: number;
  last_message?: string;
}

export interface MessageWithSender extends Message {
  sender_profile?: Profile;
}
