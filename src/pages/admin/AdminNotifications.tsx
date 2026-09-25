import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Users, User, Megaphone } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { notificationService } from '../../services/notification.service';
import { Button } from '../../components/ui/Button';
import { SkeletonList } from '../../components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import type { Profile } from '../../types/database';

export default function AdminNotifications() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Broadcast form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Individual form
  const [selectedUserId, setSelectedUserId] = useState('');
  const [indivTitle, setIndivTitle] = useState('');
  const [indivBody, setIndivBody] = useState('');
  const [notifType, setNotifType] = useState<'message' | 'system' | 'love' | 'response'>('love');
  const [isSendingIndiv, setIsSendingIndiv] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }
    setIsBroadcasting(true);
    try {
      await adminService.broadcastNotification(broadcastTitle.trim(), broadcastBody.trim());
      toast.success(`Broadcast sent to ${users.length} users 📢`);
      setBroadcastTitle('');
      setBroadcastBody('');
    } catch {
      toast.error('Failed to broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const sendIndividual = async () => {
    if (!selectedUserId || !indivTitle.trim() || !indivBody.trim()) {
      toast.error('Please select a user and fill in all fields');
      return;
    }
    setIsSendingIndiv(true);
    try {
      await notificationService.createNotification({
        user_id: selectedUserId,
        title: indivTitle.trim(),
        body: indivBody.trim(),
        type: notifType,
      });
      toast.success('Notification sent 💌');
      setSelectedUserId('');
      setIndivTitle('');
      setIndivBody('');
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setIsSendingIndiv(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Bell size={24} className="text-amber-400" />
        <div>
          <h1 className="text-white font-bold text-2xl">Notifications</h1>
          <p className="text-white/40 text-sm">Send notifications to users</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast */}
        <motion.div
          className="glass-card p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-amber-400" />
            <h2 className="text-white font-semibold">Broadcast to All</h2>
            <span className="text-white/30 text-xs ml-auto">{users.length} users</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-white/60">Title</label>
              <input
                className="w-full input-romantic px-4 py-3 text-sm"
                placeholder="Notification title..."
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-white/60">Message</label>
              <textarea
                className="w-full input-romantic px-4 py-3 text-sm resize-none"
                rows={4}
                placeholder="Write your message..."
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
              />
            </div>
            <Button
              variant="admin"
              leftIcon={<Send size={14} />}
              onClick={sendBroadcast}
              isLoading={isBroadcasting}
              disabled={!broadcastTitle.trim() || !broadcastBody.trim()}
              className="w-full"
            >
              Broadcast to All
            </Button>
          </div>
        </motion.div>

        {/* Individual */}
        <motion.div
          className="glass-card p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <User size={18} className="text-rose-400" />
            <h2 className="text-white font-semibold">Send to Individual</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-white/60">Select User</label>
              <select
                className="w-full input-romantic px-4 py-3 text-sm"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="" style={{ background: '#1a0a2e' }}>Choose a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} style={{ background: '#1a0a2e' }}>
                    {u.display_name || u.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-white/60">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['love', 'message', 'system', 'response'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNotifType(type)}
                    className={`py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                      notifType === type
                        ? 'gradient-rose text-white'
                        : 'glass text-white/40 hover:text-white'
                    }`}
                  >
                    {type === 'love' ? '💕 Love' : type === 'message' ? '💌 Message' : type === 'system' ? '🔔 System' : '✨ Response'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-white/60">Title</label>
              <input
                className="w-full input-romantic px-4 py-3 text-sm"
                placeholder="Notification title..."
                value={indivTitle}
                onChange={(e) => setIndivTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-white/60">Message</label>
              <textarea
                className="w-full input-romantic px-4 py-3 text-sm resize-none"
                rows={3}
                placeholder="Write your message..."
                value={indivBody}
                onChange={(e) => setIndivBody(e.target.value)}
              />
            </div>

            <Button
              variant="romantic"
              leftIcon={<Users size={14} />}
              onClick={sendIndividual}
              isLoading={isSendingIndiv}
              disabled={!selectedUserId || !indivTitle.trim() || !indivBody.trim()}
              className="w-full"
            >
              Send Notification
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
