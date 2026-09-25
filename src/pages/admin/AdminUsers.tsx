import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Calendar, MessageCircle, MoreVertical, Eye } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { notificationService } from '../../services/notification.service';
import { messagingService } from '../../services/messaging.service';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonList } from '../../components/ui/LoadingScreen';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Profile } from '../../types/database';

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [notifModal, setNotifModal] = useState(false);
  const [notifText, setNotifText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.display_name || '').toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
      setFiltered(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const openConversation = async (userId: string) => {
    try {
      await messagingService.getOrCreateConversation(userId);
      toast.success('Conversation opened');
    } catch {
      toast.error('Failed to open conversation');
    }
  };

  const sendNotification = async () => {
    if (!selectedUser || !notifText.trim()) return;
    setIsSending(true);
    try {
      await notificationService.createNotification({
        user_id: selectedUser.id,
        title: '💌 A message from your admirer',
        body: notifText.trim(),
        type: 'love',
      });
      toast.success('Notification sent 💕');
      setNotifModal(false);
      setNotifText('');
      setSelectedUser(null);
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <Users size={24} className="text-blue-400" />
          <div>
            <h1 className="text-white font-bold text-2xl">Users</h1>
            <p className="text-white/40 text-sm">{users.length} registered users</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadUsers}
        >
          Refresh
        </Button>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-11 pr-4 py-3 input-romantic text-sm max-w-md"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>{search ? 'No users match your search' : 'No users yet'}</p>
        </div>
      )}

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((user, i) => (
          <motion.div
            key={user.id}
            className="glass-card p-5 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-rose flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.display_name?.charAt(0).toUpperCase() ||
                    user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {user.display_name || 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail size={10} className="text-white/30" />
                    <p className="text-white/40 text-xs truncate max-w-[160px]">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
              <Badge variant="rose">User</Badge>
            </div>

            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Calendar size={12} />
              <span>
                Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
              </span>
            </div>

            {user.bio && (
              <p className="text-white/50 text-sm italic leading-relaxed truncate">
                "{user.bio}"
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-white/5">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<MessageCircle size={14} />}
                onClick={() => openConversation(user.id)}
                className="flex-1"
              >
                Message
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Eye size={14} />}
                onClick={() => {
                  setSelectedUser(user);
                  setNotifModal(true);
                }}
                className="flex-1"
              >
                Notify
              </Button>
              <button className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                <MoreVertical size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Send Notification Modal */}
      <Modal
        isOpen={notifModal}
        onClose={() => { setNotifModal(false); setNotifText(''); }}
        title="Send Notification"
      >
        <div className="space-y-5">
          <p className="text-white/60 text-sm">
            Send a personal notification to{' '}
            <strong className="text-rose-300">
              {selectedUser?.display_name || selectedUser?.email}
            </strong>
          </p>
          <textarea
            className="w-full input-romantic px-4 py-3 text-sm resize-none"
            rows={4}
            placeholder="Write your message..."
            value={notifText}
            onChange={(e) => setNotifText(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => { setNotifModal(false); setNotifText(''); }}
            >
              Cancel
            </Button>
            <Button
              onClick={sendNotification}
              isLoading={isSending}
              disabled={!notifText.trim()}
            >
              Send Notification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
