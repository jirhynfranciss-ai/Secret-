import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Smile } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { messagingService } from '../../services/messaging.service';
import { notificationService } from '../../services/notification.service';
import { InlineLoader } from '../../components/ui/LoadingScreen';
import { format, isToday, isYesterday } from 'date-fns';
import toast from 'react-hot-toast';
import type { Conversation, Message } from '../../types/database';

const QUICK_REPLIES = [
  '💕 That made me smile',
  '🌹 Tell me more...',
  '✨ I love that',
  '🤍 You\'re so sweet',
];

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export default function MessagesPage() {
  const { user, profile } = useAuthStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<ReturnType<typeof messagingService.subscribeToMessages> | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    initConversation();
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [user]);

  const initConversation = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const conv = await messagingService.getOrCreateConversation(user.id);
      setConversation(conv);
      const msgs = await messagingService.getMessages(conv.id);
      setMessages(msgs);
      await messagingService.markMessagesRead(conv.id, user.id);

      // Subscribe to realtime messages
      channelRef.current = messagingService.subscribeToMessages(conv.id, (msg) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (msg.sender_id !== user.id) {
          toast('💌 New message from your admirer!', { icon: '💕' });
        }
        setTimeout(() => scrollToBottom(), 100);
      });

      setTimeout(() => scrollToBottom(false), 200);
    } catch {
      toast.error('Could not load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content?: string) => {
    const msg = content || newMessage.trim();
    if (!msg || !conversation || !user || isSending) return;

    setIsSending(true);
    setNewMessage('');
    setShowQuickReplies(false);

    try {
      const sent = await messagingService.sendMessage(conversation.id, user.id, msg);
      setMessages((prev) => {
        if (prev.find((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setTimeout(() => scrollToBottom(), 100);

      // Create notification for admin if conversation has admin
      if (conversation.admin_id) {
        try {
          await notificationService.createNotification({
            user_id: conversation.admin_id,
            title: `💌 Message from ${profile?.display_name || 'User'}`,
            body: msg.length > 60 ? msg.slice(0, 60) + '...' : msg,
            type: 'message',
          });
        } catch {
          // Notification failure is non-critical
        }
      }
    } catch {
      toast.error('Failed to send message');
      setNewMessage(msg);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <InlineLoader />
      </div>
    );
  }

  const groupedMessages = messages.reduce<{ date: string; messages: Message[] }[]>(
    (groups, msg) => {
      const date = format(new Date(msg.created_at), 'yyyy-MM-dd');
      const last = groups[groups.length - 1];
      if (last && last.date === date) {
        last.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
      return groups;
    },
    []
  );

  return (
    <div className="flex flex-col h-screen md:h-screen">
      {/* Header */}
      <div className="glass border-b border-white/5 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <motion.div
          className="w-10 h-10 rounded-full gradient-rose flex items-center justify-center text-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🌹
        </motion.div>
        <div>
          <h2 className="font-serif text-white font-semibold">Your Secret Admirer</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-white/40 text-xs">Always near</p>
          </div>
        </div>
        <div className="ml-auto">
          <Heart className="text-rose-400/60 heart-float" size={20} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <motion.div
              className="text-6xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💌
            </motion.div>
            <h3 className="font-serif text-xl text-white/70">
              The conversation begins here
            </h3>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">
              Say hello, share a thought, or simply let your admirer know you're here.
              This is your private space to connect.
            </p>
          </div>
        ) : (
          <>
            {groupedMessages.map(({ date, messages: dayMessages }) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-white/25 text-xs">
                    {isToday(new Date(date))
                      ? 'Today'
                      : isYesterday(new Date(date))
                      ? 'Yesterday'
                      : format(new Date(date), 'MMMM d, yyyy')}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {dayMessages.map((msg, i) => {
                  const isMe = msg.sender_id === user?.id;
                  const isFirst =
                    i === 0 || dayMessages[i - 1].sender_id !== msg.sender_id;

                  return (
                    <motion.div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isFirst ? 'mt-4' : 'mt-1'}`}
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {!isMe && isFirst && (
                        <div className="w-7 h-7 rounded-full gradient-rose flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-auto mb-1">
                          🌹
                        </div>
                      )}
                      {!isMe && !isFirst && <div className="w-7 mr-2" />}

                      <div className={`max-w-[75%] md:max-w-[60%]`}>
                        <div
                          className={`px-4 py-3 text-sm leading-relaxed ${
                            isMe
                              ? 'message-bubble-user text-white'
                              : 'message-bubble-other text-white/85'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <p
                          className={`text-white/25 text-[10px] mt-1 ${
                            isMe ? 'text-right' : 'text-left'
                          }`}
                        >
                          {formatTime(msg.created_at)}
                          {isMe && (
                            <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div
            className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-thin flex-shrink-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {QUICK_REPLIES.map((r) => (
              <button
                key={r}
                onClick={() => sendMessage(r)}
                className="glass text-white/70 text-xs px-4 py-2 rounded-full whitespace-nowrap hover:text-white hover:border-rose-400/30 transition-all flex-shrink-0"
              >
                {r}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="glass border-t border-white/5 px-4 py-3 flex items-end gap-3 flex-shrink-0">
        <button
          onClick={() => setShowQuickReplies((v) => !v)}
          className={`p-2 rounded-xl transition-all flex-shrink-0 ${
            showQuickReplies
              ? 'text-rose-400 bg-rose-400/10'
              : 'text-white/30 hover:text-white/60 hover:bg-white/5'
          }`}
        >
          <Smile size={20} />
        </button>

        <textarea
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write something beautiful..."
          className="flex-1 input-romantic px-4 py-3 text-sm resize-none max-h-32 min-h-[48px]"
          rows={1}
          style={{ height: 'auto' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />

        <motion.button
          onClick={() => sendMessage()}
          disabled={!newMessage.trim() || isSending}
          className="gradient-rose text-white p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSending ? (
            <motion.div
              className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <Send size={20} />
          )}
        </motion.button>
      </div>

      <div className="md:hidden h-16 flex-shrink-0" />
    </div>
  );
}
