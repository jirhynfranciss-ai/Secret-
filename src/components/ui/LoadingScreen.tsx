import { motion } from 'framer-motion';

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center gradient-romantic z-50">
      <div className="text-center space-y-6">
        <motion.div
          className="text-6xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          💌
        </motion.div>
        <div className="space-y-2">
          <motion.div
            className="flex gap-1.5 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-rose-400"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
          <p className="text-rose-300/70 text-sm font-light tracking-widest uppercase">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full shimmer bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded shimmer bg-white/10" />
          <div className="h-3 w-24 rounded shimmer bg-white/10" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded shimmer bg-white/10" />
        <div className="h-3 w-3/4 rounded shimmer bg-white/10" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center gap-2 text-rose-300/60">
      <motion.div
        className="w-4 h-4 rounded-full border-2 border-rose-400 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      <span className="text-sm">Loading...</span>
    </div>
  );
}
