import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, User, Clock } from 'lucide-react';
import { SkeletonList } from '../../components/ui/LoadingScreen';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = supabase as any;

interface MessageRow {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  profiles?: { display_name: string | null; email: string; role: string };
  conversations?: { user_id: string };
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [filtered, setFiltered] = useState<MessageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      messages.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          (m.profiles?.display_name || '').toLowerCase().includes(q) ||
          (m.profiles?.email || '').toLowerCase().includes(q)
      )
    );
  }, [search, messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await db
        .from('messages')
        .select('*, profiles!messages_sender_id_fkey(display_name, email, role)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
      setFiltered(data || []);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <MessageCircle size={24} className="text-rose-400" />
          <div>
            <h1 className="text-white font-bold text-2xl">All Messages</h1>
            <p className="text-white/40 text-sm">{messages.length} messages total</p>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-md">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          className="w-full pl-11 pr-4 py-3 input-romantic text-sm"
        />
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center text-white/30">
          <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p>No messages found</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((msg, i) => (
          <motion.div
            key={msg.id}
            className="glass-card p-5 flex items-start gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
              msg.profiles?.role === 'admin'
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                : 'bg-gradient-to-br from-rose-500 to-pink-500'
            }`}>
              {msg.profiles?.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-white/40" />
                  <span className="text-white/80 text-sm font-medium">
                    {msg.profiles?.display_name || msg.profiles?.email || 'Unknown'}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  msg.profiles?.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {msg.profiles?.role || 'user'}
                </span>
                {!msg.is_read && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                    Unread
                  </span>
                )}
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{msg.content}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Clock size={10} className="text-white/25" />
                <span className="text-white/25 text-xs">
                  {format(new Date(msg.created_at), 'MMM d, yyyy')} ·{' '}
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
