import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { FloatingParticles, StarField } from '../components/ui/FloatingParticles';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

const INTRO_LINES = [
  "There's something I've been keeping close to my heart for far too long...",
  'A feeling so quiet, yet so profound — like a melody that plays only when you\'re near.',
  'I have admired you from a distance, in silence, in secret.',
  'Watching you laugh, watching you grow, watching you light up every room you walk into.',
  'And every single time, my heart whispered the same thing...',
  '"You are extraordinary."',
  "So today, I've decided to be a little brave.",
  'Because some feelings are too beautiful to keep secret forever.',
];

const QUESTIONS = [
  {
    id: 'q1',
    text: 'What brings the warmest smile to your face?',
    type: 'text' as const,
    placeholder: 'A moment, a memory, a feeling...',
    emoji: '😊',
  },
  {
    id: 'q2',
    text: 'If you could spend a perfect day anywhere in the world, where would it be?',
    type: 'text' as const,
    placeholder: 'Describe your dream day...',
    emoji: '🌍',
  },
  {
    id: 'q3',
    text: 'What does love mean to you in a word or two?',
    type: 'choice' as const,
    options: ['Warmth & Safety', 'Adventure & Growth', 'Deep Connection', 'Gentle Devotion', 'Endless Laughter'],
    emoji: '💕',
  },
  {
    id: 'q4',
    text: 'How do you feel about receiving heartfelt, handwritten letters?',
    type: 'choice' as const,
    options: ['I absolutely adore them', 'They\'re wonderfully old-fashioned', 'I find them touching', 'I prefer messages', 'It depends'],
    emoji: '💌',
  },
  {
    id: 'q5',
    text: 'What is something small that makes your day infinitely better?',
    type: 'text' as const,
    placeholder: 'A cup of coffee, a kind word, a sunset...',
    emoji: '✨',
  },
  {
    id: 'q6',
    text: 'On a scale of openness — how do you feel about unexpected romance?',
    type: 'scale' as const,
    emoji: '🌹',
  },
];

interface QuestionnaireData {
  [key: string]: string;
}

type LandingPhase = 'intro' | 'questionnaire' | 'finale';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [phase, setPhase] = useState<LandingPhase>('intro');
  const [currentLine, setCurrentLine] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireData>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [scaleValue, setScaleValue] = useState(5);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') navigate('/admin');
      else navigate('/app');
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (phase !== 'intro') return;
    if (currentLine >= INTRO_LINES.length) {
      setTimeout(() => setShowCTA(true), 500);
      return;
    }
    const timer = setTimeout(
      () => setCurrentLine((l) => l + 1),
      currentLine === 0 ? 800 : 2200
    );
    return () => clearTimeout(timer);
  }, [currentLine, phase]);

  const startQuestionnaire = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setPhase('questionnaire');
      setIsTransitioning(false);
    }, 600);
  };

  const handleNext = () => {
    const q = QUESTIONS[currentQuestion];
    const ans = q.type === 'scale' ? String(scaleValue) : currentAnswer.trim();
    if (!ans) return;

    const newAnswers = { ...answers, [q.id]: ans };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion((q) => q + 1);
        setCurrentAnswer('');
        setScaleValue(5);
        setIsTransitioning(false);
      }, 400);
    } else {
      // Save to sessionStorage for use after auth
      sessionStorage.setItem('questionnaire_answers', JSON.stringify(newAnswers));
      setPhase('finale');
    }
  };

  const handleSkip = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion((q) => q + 1);
        setCurrentAnswer('');
        setScaleValue(5);
        setIsTransitioning(false);
      }, 400);
    } else {
      setPhase('finale');
    }
  };

  const q = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen gradient-romantic relative overflow-hidden">
      <StarField />
      <FloatingParticles count={12} />

      {/* Intro Phase */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo/Header */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                💌
              </motion.div>
              <p className="font-script text-rose-300/60 text-lg tracking-widest">
                A letter, just for you
              </p>
            </motion.div>

            {/* Intro lines */}
            <div className="max-w-2xl w-full space-y-6 mb-16">
              {INTRO_LINES.slice(0, currentLine).map((line, i) => (
                <motion.p
                  key={i}
                  className={`text-center leading-relaxed ${
                    line.startsWith('"')
                      ? 'font-script text-3xl text-rose-300 gradient-text'
                      : 'font-serif text-white/80 text-lg md:text-xl italic'
                  }`}
                  initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* CTA */}
            <AnimatePresence>
              {showCTA && (
                <motion.div
                  className="text-center space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <p className="text-white/50 text-sm tracking-widest uppercase">
                    — Would you hear me out? —
                  </p>
                  <Button
                    size="lg"
                    onClick={startQuestionnaire}
                    rightIcon={<ArrowRight size={18} />}
                    className="px-10 py-4 text-base glow-rose"
                  >
                    I'm listening
                  </Button>
                  <p className="text-white/30 text-xs">
                    A little questionnaire awaits you ✨
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated hearts */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-rose-400/10 text-8xl select-none pointer-events-none"
                style={{
                  left: `${[10, 80, 45][i]}%`,
                  top: `${[20, 60, 85][i]}%`,
                }}
                animate={{
                  y: [-10, 10, -10],
                  rotate: [-5, 5, -5],
                  opacity: [0.05, 0.15, 0.05],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 1.2,
                }}
              >
                ♥
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Questionnaire Phase */}
        {phase === 'questionnaire' && (
          <motion.div
            key="questionnaire"
            className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="max-w-2xl w-full space-y-8">
              {/* Header */}
              <div className="text-center space-y-2">
                <motion.p
                  className="font-script text-rose-300 text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Getting to know you...
                </motion.p>
                <p className="text-white/30 text-xs tracking-widest uppercase">
                  Question {currentQuestion + 1} of {QUESTIONS.length}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full gradient-rose rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                {!isTransitioning && (
                  <motion.div
                    key={currentQuestion}
                    className="glass-card p-8 space-y-6"
                    initial={{ opacity: 0, x: 40, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -40, scale: 0.97 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{q.emoji}</span>
                      <h2 className="font-serif text-xl md:text-2xl text-white leading-relaxed">
                        {q.text}
                      </h2>
                    </div>

                    {q.type === 'text' && (
                      <textarea
                        className="w-full input-romantic px-4 py-3 text-sm resize-none min-h-[100px]"
                        placeholder={q.placeholder}
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.metaKey) handleNext();
                        }}
                        autoFocus
                      />
                    )}

                    {q.type === 'choice' && (
                      <div className="grid grid-cols-1 gap-3">
                        {q.options?.map((opt) => (
                          <motion.button
                            key={opt}
                            className={`text-left px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                              currentAnswer === opt
                                ? 'gradient-rose text-white shadow-lg shadow-rose-500/20'
                                : 'glass text-white/70 hover:text-white hover:border-rose-400/30'
                            }`}
                            onClick={() => setCurrentAnswer(opt)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            {opt}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {q.type === 'scale' && (
                      <div className="space-y-6">
                        <div className="flex justify-between text-xs text-white/40">
                          <span>Not really open</span>
                          <span>Completely open</span>
                        </div>
                        <div className="relative">
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={scaleValue}
                            onChange={(e) => setScaleValue(Number(e.target.value))}
                            className="w-full h-2 appearance-none rounded-full cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #f43f5e ${(scaleValue - 1) * 11.1}%, rgba(255,255,255,0.1) ${(scaleValue - 1) * 11.1}%)`,
                            }}
                          />
                          <div className="text-center mt-4">
                            <span className="text-4xl font-bold gradient-text">
                              {scaleValue}
                            </span>
                            <span className="text-white/40 text-sm">/10</span>
                          </div>
                        </div>
                        <div className="text-center text-sm text-white/50 italic">
                          {scaleValue <= 3
                            ? 'Totally understandable 🤍'
                            : scaleValue <= 6
                            ? 'Open to possibilities... ✨'
                            : scaleValue <= 8
                            ? 'Warm and welcoming 🌹'
                            : 'Ready to be swept away 💕'}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSkip}
                  className="text-white/30 text-sm hover:text-white/60 transition-colors"
                >
                  Skip for now
                </button>
                <div className="flex gap-3">
                  {currentQuestion > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setCurrentQuestion((q) => q - 1);
                          setCurrentAnswer(answers[QUESTIONS[currentQuestion - 1].id] || '');
                          setIsTransitioning(false);
                        }, 400);
                      }}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleNext}
                    rightIcon={<ChevronRight size={16} />}
                    disabled={
                      q.type === 'text' ? !currentAnswer.trim() :
                      q.type === 'choice' ? !currentAnswer : false
                    }
                  >
                    {currentQuestion === QUESTIONS.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Finale Phase */}
        {phase === 'finale' && (
          <motion.div
            key="finale"
            className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-xl space-y-10">
              {/* Animated heart */}
              <motion.div
                className="text-8xl"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.3 }}
              >
                🌹
              </motion.div>

              {/* Big question */}
              <div className="space-y-4">
                <motion.h1
                  className="font-serif text-4xl md:text-5xl text-white leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Would you let me{' '}
                  <span className="gradient-text italic">court you?</span>
                </motion.h1>
                <motion.p
                  className="text-white/60 text-lg leading-relaxed font-serif italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  No pressure, no rush. Just two people getting to know each other,
                  one heartfelt message at a time.
                </motion.p>
              </div>

              {/* CTA buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/auth?mode=register')}
                  rightIcon={<Heart size={18} />}
                  className="px-10 glow-rose"
                >
                  Yes, I'm curious
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => navigate('/auth?mode=login')}
                >
                  I already have an account
                </Button>
              </motion.div>

              <motion.p
                className="text-white/20 text-xs tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Your answers are safe with us ✨
              </motion.p>

              {/* Decorative hearts */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-rose-400 pointer-events-none select-none"
                  style={{
                    left: `${15 + i * 18}%`,
                    top: `${20 + (i % 2) * 60}%`,
                    fontSize: `${12 + i * 4}px`,
                    opacity: 0,
                  }}
                  animate={{
                    y: [-80, -160],
                    opacity: [0, 0.4, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: 1.5 + i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Sparkles size={16} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
