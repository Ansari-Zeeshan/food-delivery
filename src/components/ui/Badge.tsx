import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'red' | 'dark' | 'surface' | 'green' | 'amber' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'surface',
  size = 'sm',
  className,
  icon,
}) => {
  const base = 'inline-flex items-center font-medium rounded-full shrink-0 tracking-wide';
  const variants = {
    red: 'bg-brand-red text-white',
    dark: 'bg-brand-dark text-white',
    surface: 'bg-brand-surface text-brand-dark',
    green: 'bg-brand-green-light text-brand-green border border-emerald-200',
    amber: 'bg-brand-amber-light text-brand-amber border border-amber-200',
    outline: 'border border-brand-border text-brand-muted bg-white/80',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5 font-semibold',
  };

  return (
    <span className={clsx(base, variants[variant], sizes[size], className)}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
