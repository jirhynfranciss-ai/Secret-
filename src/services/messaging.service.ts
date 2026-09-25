/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';
import type { Conversation, Message, ConversationWithProfile, MessageWithSender } from '../types/database';

const db = supabase as any;

export const messagingService = {
  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const { data: existing } = await db
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) return existing as Conversation;

    const { data, error } = await db
      .from('conversations')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data as Conversation;
  },

  async getUserConversation(userId: string): Promise<ConversationWithProfile | null> {
    const { data, error } = await db
      .from('conversations')
      .select('*, profiles!conversations_user_id_fkey(id, display_name, email, avatar_url, role)')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as ConversationWithProfile;
  },

  async getAllConversations(): Promise<ConversationWithProfile[]> {
    const { data, error } = await db
      .from('conversations')
      .select('*, profiles!conversations_user_id_fkey(id, display_name, email, avatar_url, role)')
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return (data || []) as ConversationWithProfile[];
  },

  async getMessages(conversationId: string): Promise<MessageWithSender[]> {
    const { data, error } = await db
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(id, display_name, email, avatar_url, role)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as MessageWithSender[];
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    const { data, error } = await db
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    await db
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data as Message;
  },

  async markMessagesRead(conversationId: string, userId: string) {
    const { error } = await db
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { data: conv } = await db
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!conv) return 0;

    const { count, error } = await db
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', conv.id)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  },

  subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  },

  subscribeToConversations(callback: () => void) {
    return supabase
      .channel('conversations:changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          callback();
        }
      )
      .subscribe();
  },
};
