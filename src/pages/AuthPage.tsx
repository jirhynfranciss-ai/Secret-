import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StarField } from '../components/ui/FloatingParticles';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'register';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  const { user, profile, isLoading } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>(
    (searchParams.get('mode') as AuthMode) || 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [form, setForm] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (user && profile && !isLoading) {
      if (profile.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/app', { replace: true });
    }
  }, [user, profile, isLoading, navigate]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!form.displayName.trim()) {
        newErrors.displayName = 'Name is required';
      }
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password);
        toast.success('Welcome back 💌');
      } else {
        await signUp(form.email, form.password, form.displayName);
        setEmailSent(true);
        toast.success('Check your email to confirm your account!');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      if (message.includes('Invalid login credentials')) {
        toast.error('Incorrect email or password');
        setErrors({ password: 'Incorrect credentials' });
      } else if (message.includes('Email already registered')) {
        toast.error('Email already in use');
        setErrors({ email: 'This email is already registered' });
      } else if (message.includes('Email not confirmed')) {
        toast.error('Please confirm your email first');
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (emailSent) {
    return (
      <div className="min-h-screen gradient-romantic flex items-center justify-center p-6">
        <StarField />
        <motion.div
          className="glass-card max-w-md w-full p-10 text-center space-y-6 relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-6xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💌
          </motion.div>
          <h2 className="font-serif text-2xl text-white">Check your inbox!</h2>
          <p className="text-white/60 leading-relaxed">
            We've sent a confirmation link to{' '}
            <strong className="text-rose-300">{form.email}</strong>. Click it to
            complete your registration and begin this journey.
          </p>
          <Button
            variant="ghost"
            onClick={() => { setEmailSent(false); setMode('login'); }}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-romantic flex items-center justify-center p-6 relative overflow-hidden">
      <StarField />

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: `${[70, 10, 50][i]}%`,
              top: `${[10, 60, 80][i]}%`,
              background: 'radial-gradient(circle, #f43f5e, transparent)',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.08, 0.03] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} />
          Back to letter
        </Link>

        <div className="glass-card p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <motion.div
              className="text-4xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {mode === 'login' ? '🔐' : '💌'}
            </motion.div>
            <h1 className="font-serif text-2xl text-white">
              {mode === 'login' ? 'Welcome back' : 'Begin the journey'}
            </h1>
            <p className="text-white/50 text-sm">
              {mode === 'login'
                ? 'Sign in to continue your story'
                : 'Create your account to receive this letter'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-white/5 rounded-xl p-1">
            {(['login', 'register'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  mode === m
                    ? 'gradient-rose text-white shadow-lg'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              className="space-y-5"
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {mode === 'register' && (
                <Input
                  label="Your Name"
                  type="text"
                  placeholder="What shall I call you?"
                  value={form.displayName}
                  onChange={updateField('displayName')}
                  error={errors.displayName}
                  leftIcon={<User size={16} />}
                  autoComplete="name"
                />
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={updateField('email')}
                error={errors.email}
                leftIcon={<Mail size={16} />}
                autoComplete="email"
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-rose-200/80 tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                    value={form.password}
                    onChange={updateField('password')}
                    className={`w-full pl-10 pr-12 py-3 input-romantic text-sm ${
                      errors.password ? 'border-red-400/50' : ''
                    }`}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">⚠️ {errors.password}</p>
                )}
              </div>

              {mode === 'register' && (
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  error={errors.confirmPassword}
                  leftIcon={<Lock size={16} />}
                  autoComplete="new-password"
                />
              )}

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full py-3"
                size="lg"
                rightIcon={<Heart size={16} />}
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>

              {mode === 'login' && (
                <p className="text-center text-white/30 text-xs">
                  <button
                    type="button"
                    className="hover:text-rose-300 transition-colors underline underline-offset-2"
                    onClick={() => toast('Password reset coming soon 🔮')}
                  >
                    Forgot password?
                  </button>
                </p>
              )}
            </motion.form>
          </AnimatePresence>

          {/* Footer note */}
          <p className="text-center text-white/20 text-xs border-t border-white/5 pt-4">
            Your data is private and protected 🔒
          </p>
        </div>
      </motion.div>
    </div>
  );
}
