import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm select-none';

  const variants = {
    primary:
      'bg-brand-red text-white hover:bg-brand-dark focus:ring-brand-red shadow-soft-sm hover:shadow-card-hover',
    secondary:
      'bg-white border border-brand-border/80 text-brand-dark hover:bg-brand-surface focus:ring-brand-dark shadow-soft-sm',
    dark:
      'bg-brand-dark text-white hover:bg-neutral-800 focus:ring-brand-dark shadow-soft-sm',
    outline:
      'border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white focus:ring-brand-dark',
    ghost:
      'text-brand-dark hover:bg-brand-surface focus:ring-brand-dark',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5 font-semibold',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02, y: -1 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
};
