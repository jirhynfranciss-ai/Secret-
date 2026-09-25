import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { messagingService } from '../services/messaging.service';
import { notificationService } from '../services/notification.service';

export function useUnreadCounts() {
  const { user } = useAuthStore();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const [msgs, notifs] = await Promise.all([
        messagingService.getUnreadCount(user.id),
        notificationService.getUnreadCount(user.id),
      ]);
      setUnreadMessages(msgs);
      setUnreadNotifications(notifs);
    } catch {
      // Silent fail
    }
  }, [user]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { unreadMessages, unreadNotifications, refresh };
}
