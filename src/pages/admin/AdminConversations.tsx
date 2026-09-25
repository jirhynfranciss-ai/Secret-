import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Users, Search, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { messagingService } from '../../services/messaging.service';
import { notificationService } from '../../services/notification.service';
import { InlineLoader, SkeletonList } from '../../components/ui/LoadingScreen';
import { formatDistanceToNow, format, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import type { ConversationWithProfile, Message } from '../../types/database';

export default function AdminConversations() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationWithProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof messagingService.subscribeToMessages> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    loadConversations();
    const ch = messagingService.subscribeToConversations(() => loadConversations());
    return () => { ch.unsubscribe(); };
  }, []);

  const loadConversations = async () => {
    try {
      const data = await messagingService.getAllConversations();
      setConversations(data);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = async (conv: ConversationWithProfile) => {
    setSelectedConv(conv);
    setMsgLoading(true);
    if (channelRef.current) channelRef.current.unsubscribe();

    try {
      const msgs = await messagingService.getMessages(conv.id);
      setMessages(msgs);
      if (user) await messagingService.markMessagesRead(conv.id, user.id);
      setTimeout(scrollToBottom, 100);

      channelRef.current = messagingService.subscribeToMessages(conv.id, (msg) => {
        setMessages((prev) => prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]);
        setTimeout(scrollToBottom, 100);
      });
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setMsgLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedConv || !user || isSending) return;
    const content = newMsg.trim();
    setNewMsg('');
    setIsSending(true);
    try {
      const sent = await messagingService.sendMessage(selectedConv.id, user.id, content);
      setMessages((prev) => prev.find((m) => m.id === sent.id) ? prev : [...prev, sent]);
      setTimeout(scrollToBottom, 100);

      // Notify the user
      await notificationService.createNotification({
        user_id: selectedConv.user_id,
        title: '💌 Your admirer sent you a message',
        body: content.length > 60 ? content.slice(0, 60) + '...' : content,
        type: 'message',
      });
    } catch {
      toast.error('Failed to send message');
      setNewMsg(content);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) => {
    const name = (c as ConversationWithProfile & { profiles?: { display_name: string | null; email: string } }).profiles?.display_name || '';
    const email = (c as ConversationWithProfile & { profiles?: { display_name: string | null; email: string } }).profiles?.email || '';
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  const getUserName = (conv: ConversationWithProfile) => {
    const p = (conv as ConversationWithProfile & { profiles?: { display_name: string | null; email: string } }).profiles;
    return p?.display_name || p?.email || 'Unknown User';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="flex h-screen lg:h-[calc(100vh-0px)] overflow-hidden">
      {/* Conversation List */}
      <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-white/5 flex-shrink-0`}
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={20} className="text-purple-400" />
            <h2 className="text-white font-semibold">Conversations</h2>
            <span className="ml-auto text-white/30 text-xs">{conversations.length}</span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 input-romantic text-xs"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredConvs.length === 0 ? (
            <div className="text-center py-12 px-4 text-white/30 text-sm">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              No conversations yet
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full text-left px-4 py-4 border-b border-white/3 hover:bg-white/4 transition-all ${
                  selectedConv?.id === conv.id ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-rose flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getUserName(conv).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/90 text-sm font-medium truncate">
                      {getUserName(conv)}
                    </p>
                    {conv.last_message_at && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-white/25" />
                        <p className="text-white/30 text-xs">
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConv ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare size={48} className="text-white/10 mb-4" />
            <h3 className="text-white/40 font-serif text-xl">Select a conversation</h3>
            <p className="text-white/20 text-sm mt-2">
              Choose a user from the list to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4">
              <button
                onClick={() => setSelectedConv(null)}
                className="md:hidden text-white/50 hover:text-white"
              >
                ←
              </button>
              <div className="w-9 h-9 rounded-full gradient-rose flex items-center justify-center text-white font-bold">
                {getUserName(selectedConv).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{getUserName(selectedConv)}</p>
                <p className="text-white/30 text-xs">Private conversation</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {msgLoading ? (
                <div className="flex justify-center py-8">
                  <InlineLoader />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30 text-center">
                  <MessageSquare size={36} className="mb-3 opacity-30" />
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isAdmin = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className={`max-w-[70%] ${isAdmin ? 'message-bubble-user' : 'message-bubble-other'} px-4 py-3`}>
                          <p className={`text-sm ${isAdmin ? 'text-white' : 'text-white/85'}`}>
                            {msg.content}
                          </p>
                          <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/50 text-right' : 'text-white/30'}`}>
                            {isToday(new Date(msg.created_at))
                              ? format(new Date(msg.created_at), 'h:mm a')
                              : format(new Date(msg.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/5 flex gap-3">
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Send a message..."
                className="flex-1 input-romantic px-4 py-3 text-sm"
              />
              <motion.button
                onClick={sendMessage}
                disabled={!newMsg.trim() || isSending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-xl disabled:opacity-40 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSending ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <Send size={20} />
                )}
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
