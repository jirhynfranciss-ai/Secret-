import { motion } from 'framer-motion';
import { Settings, Shield, Database, Key, ExternalLink } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Settings size={24} className="text-purple-400" />
        <div>
          <h1 className="text-white font-bold text-2xl">Settings</h1>
          <p className="text-white/40 text-sm">Application configuration</p>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Security */}
        <motion.div
          className="glass-card p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            <h2 className="text-white font-semibold">Security</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Row Level Security', desc: 'Users can only access their own data', status: 'Enabled' },
              { label: 'Role-based Access Control', desc: 'Admin and user role separation', status: 'Enabled' },
              { label: 'Auth confirmation', desc: 'Email confirmation required for new accounts', status: 'Supabase' },
              { label: 'Realtime encryption', desc: 'All messages encrypted in transit', status: 'TLS 1.3' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 rounded-xl bg-white/3"
              >
                <div>
                  <p className="text-white/80 text-sm font-medium">{item.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                </div>
                <span className="text-emerald-400 text-xs font-medium bg-emerald-400/10 px-3 py-1 rounded-full">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Database */}
        <motion.div
          className="glass-card p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <Database size={18} className="text-blue-400" />
            <h2 className="text-white font-semibold">Infrastructure</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Database', value: 'Supabase PostgreSQL', icon: Database },
              { label: 'Authentication', value: 'Supabase Auth', icon: Key },
              { label: 'Realtime', value: 'Supabase Realtime Channels', icon: Shield },
              { label: 'Frontend', value: 'Vite + React + TypeScript', icon: ExternalLink },
              { label: 'Deployment', value: 'Vercel', icon: ExternalLink },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/3"
                >
                  <Icon size={16} className="text-white/30 flex-shrink-0" />
                  <span className="text-white/50 text-sm">{item.label}</span>
                  <span className="ml-auto text-white/80 text-sm font-medium">{item.value}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Env config */}
        <motion.div
          className="glass-card p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <Key size={18} className="text-amber-400" />
            <h2 className="text-white font-semibold">Environment</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: 'VITE_SUPABASE_URL', status: import.meta.env.VITE_SUPABASE_URL ? 'Set ✓' : 'Not set ⚠️' },
              { key: 'VITE_SUPABASE_ANON_KEY', status: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set ✓' : 'Not set ⚠️' },
            ].map((env) => (
              <div
                key={env.key}
                className="flex items-center justify-between p-4 rounded-xl bg-white/3 font-mono"
              >
                <span className="text-white/60 text-sm">{env.key}</span>
                <span className={`text-xs ${env.status.includes('✓') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {env.status}
                </span>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs">
            Configure these in your Vercel project settings or .env.local file
          </p>
        </motion.div>
      </div>
    </div>
  );
}
