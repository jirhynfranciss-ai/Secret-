import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  FileText,
  MessageCircle,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Heart,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAuthStore } from '../store/authStore';
import { NotificationDot } from '../components/ui/Badge';
import { useUnreadCounts } from '../hooks/useUnreadCounts';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/app', label: 'Home', icon: Home, exact: true },
  { to: '/app/our-story', label: 'Our Story', icon: BookOpen },
  { to: '/app/my-answers', label: 'My Answers', icon: FileText },
  { to: '/app/messages', label: 'Messages', icon: MessageCircle },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/profile', label: 'Profile', icon: User },
];

export default function UserLayout() {
  const { signOut } = useAuth();
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadMessages, unreadNotifications } = useUnreadCounts();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Goodbye 💌');
      navigate('/');
    } catch {
      toast.error('Error signing out');
    }
  };

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : profile?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="min-h-screen gradient-romantic flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-white/5 fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <motion.div
              className="text-2xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              💌
            </motion.div>
            <div>
              <h1 className="font-script text-rose-300 text-xl">Secret Admirer</h1>
              <p className="text-white/30 text-xs">Your private space</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-rose-400' : ''} />
                  {label}
                  {label === 'Messages' && unreadMessages > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadMessages}
                    </span>
                  )}
                  {label === 'Notifications' && unreadNotifications > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-amber-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadNotifications}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full gradient-rose flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || ''}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium truncate">
                {profile?.display_name || 'Anonymous'}
              </p>
              <p className="text-white/30 text-xs truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💌</span>
          <span className="font-script text-rose-300 text-lg">Secret Admirer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="text-white/60 p-2 rounded-lg hover:bg-white/10">
              <Bell size={20} />
            </button>
            <NotificationDot count={unreadNotifications} />
          </div>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="text-white/60 p-2 rounded-lg hover:bg-white/10"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="md:hidden fixed top-14 left-0 bottom-0 w-72 z-40 glass border-r border-white/5 flex flex-col"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
                {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={exact}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="md:hidden h-14" />
        <AnimatePresence mode="wait">
          <motion.div
            className="min-h-screen"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/5 px-2 py-2 flex justify-around">
        {NAV_ITEMS.slice(0, 5).map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'text-rose-400' : 'text-white/40'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-white/40 hover:text-red-400 transition-colors"
        >
          <Heart size={20} />
          <span className="text-[10px]">Exit</span>
        </button>
      </div>
    </div>
  );
}
