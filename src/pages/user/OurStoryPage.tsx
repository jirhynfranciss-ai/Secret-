import { motion } from 'framer-motion';
import { Heart, Star, Sparkles } from 'lucide-react';

const TIMELINE = [
  {
    date: 'The Beginning',
    emoji: '👀',
    title: 'The First Glimpse',
    content:
      'I noticed you before you ever noticed me. There was something in the way you carried yourself — a quiet confidence, a warmth that radiated without effort. I remember thinking: "Who is that?"',
  },
  {
    date: 'Slowly',
    emoji: '🌱',
    title: 'Watching You Bloom',
    content:
      'Days turned into weeks. I found myself paying attention to little things — the way you laugh with your whole heart, the kindness you show to everyone around you, the way your eyes light up when you talk about something you love.',
  },
  {
    date: 'Quietly',
    emoji: '🤫',
    title: 'The Secret I Kept',
    content:
      "Admiring someone from afar is both beautiful and bittersweet. Beautiful because every little thing becomes precious. Bittersweet because you ache to say something, but the words always seem to dissolve before they reach your lips.",
  },
  {
    date: 'Bravely',
    emoji: '💌',
    title: 'This Letter',
    content:
      "And then I decided. Enough with silence. Enough with wondering. You deserve to know that you have been quietly admired, genuinely cherished, and sincerely thought about — more times than you could imagine.",
  },
  {
    date: 'Now',
    emoji: '🌹',
    title: 'Our Story Begins',
    content:
      'This is where it starts — not with grand gestures or overwhelming declarations, but with a simple, honest message: I see you. I admire you. And I would very much like to get to know you better.',
  },
];

const LITTLE_THINGS = [
  'The sound of your laughter',
  'The way you make people feel seen',
  'Your quiet thoughtfulness',
  'The light in your eyes when you speak',
  'Your gentle, genuine smile',
  'The warmth you carry everywhere',
];

export default function OurStoryPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-6 pt-8 md:pt-12 space-y-12">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-5xl"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            📖
          </motion.div>
          <h1 className="font-serif text-4xl text-white">Our Story</h1>
          <p className="text-white/50 italic font-serif">
            A love letter written in quiet glances and unspoken words
          </p>
        </motion.div>

        {/* Opening quote */}
        <motion.blockquote
          className="glass-card p-8 text-center space-y-3"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-5xl font-serif text-rose-300/20 leading-none">"</div>
          <p className="font-serif italic text-xl text-white/80 leading-relaxed">
            The most beautiful stories often begin with a whisper, not a shout.
            With a quiet noticing, not a grand announcement.
          </p>
          <p className="font-script text-rose-300/70">— A secret admirer</p>
        </motion.blockquote>

        {/* Timeline */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-white/80 flex items-center gap-3">
            <Star size={20} className="text-rose-400" />
            The Journey
          </h2>

          <div className="space-y-1">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={i}
                className="relative pl-10 pb-10 last:pb-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.12 }}
              >
                {/* Timeline line */}
                {i < TIMELINE.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-px bg-gradient-to-b from-rose-400/40 to-transparent" />
                )}

                {/* Dot */}
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full glass-rose flex items-center justify-center text-lg">
                  {item.emoji}
                </div>

                {/* Content */}
                <div className="glass-card p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-rose-400/60 text-xs tracking-widest uppercase">
                      {item.date}
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                  <h3 className="font-serif text-xl text-white">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Little things */}
        <motion.div
          className="glass-card p-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="font-serif text-2xl text-white flex items-center gap-3">
            <Sparkles size={20} className="text-amber-400" />
            The little things I noticed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LITTLE_THINGS.map((thing, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.08 }}
              >
                <Heart size={14} className="text-rose-400 flex-shrink-0" />
                <span className="text-white/70 text-sm">{thing}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Closing */}
        <motion.div
          className="text-center py-8 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p className="font-script text-3xl text-rose-300/80">
            And now, the next chapter is yours to write.
          </p>
          <p className="text-white/30 text-sm">
            Head over to Messages to continue the story 💌
          </p>
        </motion.div>
      </div>
    </div>
  );
}
