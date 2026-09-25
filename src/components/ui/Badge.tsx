import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'rose' | 'purple' | 'green' | 'yellow' | 'gray' | 'admin';
  className?: string;
}

export function Badge({ children, variant = 'rose', className }: BadgeProps) {
  const variants = {
    rose: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    green: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    yellow: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    gray: 'bg-white/10 text-white/60 border-white/10',
    admin: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface NotificationDotProps {
  count?: number;
  className?: string;
}

export function NotificationDot({ count, className }: NotificationDotProps) {
  if (!count || count === 0) return null;

  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
