import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StarField } from '../components/ui/FloatingParticles';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen gradient-romantic flex items-center justify-center p-6 relative">
      <StarField />
      <motion.div
        className="text-center space-y-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="text-8xl"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          💔
        </motion.div>
        <div className="space-y-3">
          <h1 className="font-serif text-5xl text-white">Lost in love?</h1>
          <p className="text-white/50 text-lg">
            This page seems to have wandered off...
          </p>
          <p className="text-white/30 text-sm font-mono">404 — Page not found</p>
        </div>
        <Link to="/">
          <Button size="lg" leftIcon={<Home size={18} />}>
            Go back home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
