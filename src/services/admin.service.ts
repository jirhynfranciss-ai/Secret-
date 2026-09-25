/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

const db = supabase as any;

export const adminService = {
  async getAllUsers(): Promise<Profile[]> {
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Profile[];
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Profile[];
  },

  async getDashboardStats() {
    const [usersRes, responsesRes, conversationsRes, messagesRes] = await Promise.all([
      db.from('profiles').select('id', { count: 'exact' }).eq('role', 'user'),
      db.from('questionnaire_responses').select('id', { count: 'exact' }),
      db.from('conversations').select('id', { count: 'exact' }),
      db.from('messages').select('id', { count: 'exact' }),
    ]);

    return {
      totalUsers: usersRes.count || 0,
      totalResponses: responsesRes.count || 0,
      totalConversations: conversationsRes.count || 0,
      totalMessages: messagesRes.count || 0,
    };
  },

  async sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    type: 'message' | 'system' | 'love' | 'response' = 'system'
  ) {
    const { data, error } = await db
      .from('notifications')
      .insert({ user_id: userId, title, body, type })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async broadcastNotification(title: string, body: string) {
    const { data: users } = await db
      .from('profiles')
      .select('id')
      .eq('role', 'user');

    if (!users || users.length === 0) return;

    const notifications = users.map((u: { id: string }) => ({
      user_id: u.id,
      title,
      body,
      type: 'system',
    }));

    const { error } = await db.from('notifications').insert(notifications);
    if (error) throw error;
  },

  async getRecentActivity() {
    const { data, error } = await db
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(display_name, role), conversations(user_id)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  async updateUserProfile(userId: string, updates: Record<string, unknown>) {
    const { data, error } = await db
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  subscribeToNewUsers(callback: () => void) {
    return supabase
      .channel('admin:new-users')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        () => callback()
      )
      .subscribe();
  },
};
