import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  MessageCircle,
  HelpCircle,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/responses', label: 'Responses', icon: FileText },
  { to: '/admin/conversations', label: 'Conversations', icon: MessageSquare },
  { to: '/admin/messages', label: 'Messages', icon: MessageCircle },
  { to: '/admin/questions', label: 'Questions', icon: HelpCircle },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/profile', label: 'Profile', icon: User },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out');
      navigate('/');
    } catch {
      toast.error('Error signing out');
    }
  };

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0f1a' }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30 border-r border-white/5"
        style={{ background: 'rgba(15, 10, 30, 0.95)' }}>
        {/* Brand */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">Admin Portal</h1>
              <p className="text-white/30 text-xs">Secret Admirer</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm font-medium truncate">
                {profile?.display_name || 'Admin'}
              </p>
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-purple-400" />
                <p className="text-purple-400/70 text-xs">Administrator</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/5 px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(15, 10, 30, 0.95)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-purple-400" />
          <span className="text-white font-semibold text-sm">Admin Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-white/60 p-2 rounded-lg hover:bg-white/10"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 z-30 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="lg:hidden fixed top-14 left-0 bottom-0 w-72 z-40 border-r border-white/5 flex flex-col"
              style={{ background: 'rgba(15, 10, 30, 0.98)' }}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-2">
                {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={exact}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-purple-500/15 text-purple-300'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon size={17} />
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="lg:hidden h-14" />
        <AnimatePresence mode="wait">
          <motion.div
            className="min-h-screen"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
