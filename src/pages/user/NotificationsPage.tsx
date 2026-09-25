import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, MessageCircle, Heart, Sparkles, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { notificationService } from '../../services/notification.service';
import { Button } from '../../components/ui/Button';
import { SkeletonList } from '../../components/ui/LoadingScreen';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import type { Notification } from '../../types/database';

const TYPE_CONFIG = {
  message: { icon: MessageCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  love: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  response: { icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  system: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10' },
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadNotifications();

    const channel = notificationService.subscribeToNotifications(user.id, (n) => {
      setNotifications((prev) => [n, ...prev]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const ns = await notificationService.getUserNotifications(user.id);
      setNotifications(ns);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All marked as read ✓');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-6 pt-8 md:pt-12 space-y-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔔</span>
            <div>
              <h1 className="font-serif text-3xl text-white">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-rose-400 text-sm">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<CheckCheck size={14} />}
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}
        </motion.div>

        {/* Empty state */}
        {notifications.length === 0 && (
          <motion.div
            className="glass-card p-12 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Bell className="text-white/20 mx-auto" size={48} />
            <h3 className="font-serif text-xl text-white/50">All quiet here</h3>
            <p className="text-white/30 text-sm">
              When your admirer sends you a message or a note, it'll appear here 💌
            </p>
          </motion.div>
        )}

        {/* Notification list */}
        <AnimatePresence>
          <div className="space-y-3">
            {notifications.map((n, i) => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
              const Icon = config.icon;

              return (
                <motion.div
                  key={n.id}
                  className={`glass-card p-5 flex items-start gap-4 cursor-pointer hover:border-white/10 transition-all ${
                    !n.is_read ? 'border-rose-400/20' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl ${config.bg} flex-shrink-0`}>
                    <Icon size={18} className={config.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-medium ${n.is_read ? 'text-white/60' : 'text-white'}`}>
                        {n.title}
                      </h3>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-white/40 text-sm mt-1 leading-relaxed">{n.body}</p>
                    <p className="text-white/25 text-xs mt-2">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                        className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
