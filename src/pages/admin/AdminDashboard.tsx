import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, FileText, BarChart3, TrendingUp, Heart, Activity } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { SkeletonList } from '../../components/ui/LoadingScreen';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  totalResponses: number;
  totalConversations: number;
  totalMessages: number;
}

interface RecentActivity {
  id: string;
  content: string;
  created_at: string;
  profiles?: { display_name: string | null; role: string };
  conversations?: { user_id: string };
}

const STAT_CARDS = (stats: Stats) => [
  {
    label: 'Total Users',
    value: stats.totalUsers,
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    change: '+12%',
  },
  {
    label: 'Questionnaire Responses',
    value: stats.totalResponses,
    icon: FileText,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    change: '+8%',
  },
  {
    label: 'Conversations',
    value: stats.totalConversations,
    icon: MessageCircle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    change: '+23%',
  },
  {
    label: 'Total Messages',
    value: stats.totalMessages,
    icon: Heart,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    change: '+31%',
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalResponses: 0,
    totalConversations: 0,
    totalMessages: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();

    const channel = adminService.subscribeToNewUsers(() => {
      loadData();
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, activity] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivity(),
      ]);
      setStats(s);
      setRecentActivity(activity);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 h-28 shimmer" />
          ))}
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-3">
          <BarChart3 size={24} className="text-purple-400" />
          <h1 className="text-white font-bold text-2xl">Dashboard</h1>
        </div>
        <p className="text-white/40 text-sm">
          Overview of Secret Admirer activity
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS(stats).map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              className={`glass-card p-5 border ${card.border} space-y-3`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon size={18} className={card.color} />
                </div>
                <span className="text-emerald-400 text-xs font-medium flex items-center gap-0.5">
                  <TrendingUp size={10} />
                  {card.change}
                </span>
              </div>
              <div>
                <p className="text-white/40 text-xs">{card.label}</p>
                <p className="text-white text-2xl font-bold mt-0.5">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="glass-card p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-purple-400" />
            <h2 className="text-white font-semibold">Recent Messages</h2>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm">
              No activity yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                    {item.profiles?.display_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm truncate">{item.content}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-white/30 text-xs">
                        {item.profiles?.display_name || 'Unknown'}
                      </span>
                      <span className="text-white/20 text-xs">
                        {formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          className="glass-card p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-white font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'View all users', to: '/admin/users', icon: Users, color: 'text-blue-400' },
              { label: 'Manage questions', to: '/admin/questions', icon: FileText, color: 'text-amber-400' },
              { label: 'View conversations', to: '/admin/conversations', icon: MessageCircle, color: 'text-rose-400' },
              { label: 'Send notifications', to: '/admin/notifications', icon: Heart, color: 'text-pink-400' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.to}
                  href={action.to}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 transition-all group"
                >
                  <Icon size={18} className={action.color} />
                  <span className="text-white/70 text-sm group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                  <span className="ml-auto text-white/20 text-xs group-hover:text-white/40">
                    →
                  </span>
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
