import { motion } from 'framer-motion';
import { Database, Key, ArrowRight, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const SQL_SNIPPET = `-- Run this in your Supabase SQL Editor
-- Full migration: supabase/migrations/001_initial_schema.sql`;

export function SetupGuide() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(SQL_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder');

  if (isConfigured) return null;

  return (
    <motion.div
      className="fixed bottom-6 right-6 max-w-sm z-50"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 2 }}
    >
      <div className="glass-card p-5 border border-amber-400/20 space-y-4">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Setup Required</h3>
        </div>
        <p className="text-white/60 text-xs leading-relaxed">
          Configure your Supabase credentials to enable the full experience:
        </p>
        <div className="space-y-2 text-xs">
          {[
            { step: '1', label: 'Create Supabase project', icon: Database },
            { step: '2', label: 'Run SQL migration', icon: Key },
            { step: '3', label: 'Add env variables', icon: ArrowRight },
          ].map(({ step, label, icon: Icon }) => (
            <div key={step} className="flex items-center gap-2 text-white/50">
              <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {step}
              </span>
              <Icon size={12} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="bg-black/30 rounded-lg p-3 flex items-start justify-between gap-2">
          <code className="text-amber-300/70 text-[10px] leading-relaxed break-all">
            VITE_SUPABASE_URL=...<br />
            VITE_SUPABASE_ANON_KEY=...
          </code>
          <button
            onClick={copy}
            className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
          >
            {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
        <p className="text-white/30 text-[10px]">
          See README.md for full setup instructions
        </p>
      </div>
    </motion.div>
  );
}
