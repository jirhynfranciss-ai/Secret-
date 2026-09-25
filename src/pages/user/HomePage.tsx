import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, FileText, Bell, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { FloatingParticles } from '../../components/ui/FloatingParticles';

const LOVE_QUOTES = [
  '"In all the world, there is no heart for me like yours." — Maya Angelou',
  '"I have waited for this opportunity for more than half a lifetime." — D.H. Lawrence',
  '"Whatever our souls are made of, his and mine are the same." — Emily Brontë',
  '"You are my sun, my moon, and all my stars." — E.E. Cummings',
  '"I would rather spend one lifetime with you than face all the ages of this world alone."',
];

const today = new Date();
const quoteIndex = today.getDate() % LOVE_QUOTES.length;

const QUICK_LINKS = [
  {
    to: '/app/messages',
    icon: MessageCircle,
    label: 'Messages',
    desc: 'Continue the conversation',
    color: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/20',
    iconColor: 'text-rose-400',
  },
  {
    to: '/app/my-answers',
    icon: FileText,
    label: 'My Answers',
    desc: 'Revisit your questionnaire',
    color: 'from-purple-500/20 to-indigo-500/20',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    to: '/app/our-story',
    icon: Heart,
    label: 'Our Story',
    desc: 'Read the journey so far',
    color: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/20',
    iconColor: 'text-pink-400',
  },
  {
    to: '/app/notifications',
    icon: Bell,
    label: 'Notifications',
    desc: 'See what\'s new',
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
];

export default function HomePage() {
  const { profile } = useAuthStore();
  const name = profile?.display_name?.split(' ')[0] || 'there';

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen relative pb-24 md:pb-8">
      <FloatingParticles count={8} />

      <div className="max-w-3xl mx-auto px-6 pt-8 md:pt-12 space-y-10 relative z-10">
        {/* Greeting */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🌹
            </motion.span>
            <div>
              <p className="text-white/40 text-sm tracking-wider uppercase font-light">
                {greeting},
              </p>
              <h1 className="font-serif text-3xl md:text-4xl text-white">
                {name} 💕
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Quote of the day */}
        <motion.div
          className="glass-card p-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="absolute top-0 right-0 text-8xl opacity-5 font-serif leading-none">
            "
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-rose-400" />
              <span className="text-rose-400/70 text-xs tracking-widest uppercase">
                Daily Inspiration
              </span>
            </div>
            <p className="font-serif italic text-white/80 text-lg leading-relaxed">
              {LOVE_QUOTES[quoteIndex]}
            </p>
          </div>
        </motion.div>

        {/* A personal note */}
        <motion.div
          className="glass-rose rounded-2xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">💌</span>
            <h2 className="font-serif text-lg text-rose-200">A note from your admirer</h2>
          </div>
          <p className="text-white/65 leading-relaxed text-sm">
            Every day I wake up thinking about the quiet magic you bring to the world.
            This space is our little secret — a garden where I can share what my heart
            has been too shy to say out loud. I'm glad you're here.
          </p>
          <div className="flex justify-end">
            <span className="font-script text-rose-300 text-lg">— Your Secret Admirer 🌹</span>
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg text-white/70">Your space</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_LINKS.map(({ to, icon: Icon, label, desc, color, border, iconColor }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <Link
                  to={to}
                  className={`group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${color} border ${border} hover:border-opacity-40 transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className={`p-2.5 rounded-xl bg-white/5 ${iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Decorative footer */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="font-script text-rose-300/40 text-2xl">
            "Every love story is beautiful, but ours is my favourite."
          </p>
        </motion.div>
      </div>
    </div>
  );
}
