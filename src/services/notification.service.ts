/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';
import type { Notification } from '../types/database';

const db = supabase as any;

export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []) as Notification[];
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await db
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  },

  async markAsRead(notificationId: string) {
    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  async createNotification(notification: {
    user_id: string;
    title: string;
    body: string;
    type: 'message' | 'system' | 'love' | 'response';
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await db
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  async deleteNotification(id: string) {
    const { error } = await db.from('notifications').delete().eq('id', id);
    if (error) throw error;
  },

  subscribeToNotifications(userId: string, callback: (n: Notification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  },
};
