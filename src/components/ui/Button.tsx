import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ButtonProps {
  variant?: 'romantic' | 'ghost' | 'outline' | 'danger' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  form?: string;
}

export function Button({
  variant = 'romantic',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  type = 'button',
  onClick,
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent select-none';

  const variants = {
    romantic:
      'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 focus:ring-rose-400 shadow-lg hover:shadow-rose-500/30',
    ghost:
      'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white focus:ring-white/20',
    outline:
      'bg-transparent border border-rose-400/50 text-rose-300 hover:bg-rose-400/10 focus:ring-rose-400',
    danger:
      'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 focus:ring-red-400',
    admin:
      'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 focus:ring-purple-400 shadow-lg',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={isDisabled}
      type={type}
      onClick={onClick}
    >
      {isLoading ? (
        <motion.div
          className="w-4 h-4 rounded-full border-2 border-current border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </motion.button>
  );
}
