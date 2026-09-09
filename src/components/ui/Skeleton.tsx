import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-brand-surface-light rounded-3xl p-4 border border-brand-border animate-pulse flex flex-col gap-3">
      <div className="w-full aspect-[4/3] bg-brand-surface rounded-2xl" />
      <div className="h-5 bg-brand-surface rounded-md w-3/4" />
      <div className="h-4 bg-brand-surface rounded-md w-1/2" />
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/40">
        <div className="h-6 bg-brand-surface rounded-md w-16" />
        <div className="h-9 w-20 bg-brand-surface rounded-full" />
      </div>
    </div>
  );
};

export const SkeletonRestaurantHero: React.FC = () => {
  return (
    <div className="w-full h-80 bg-brand-surface rounded-3xl animate-pulse p-8 flex flex-col justify-end gap-4">
      <div className="h-8 bg-brand-border/60 rounded-lg w-1/3" />
      <div className="h-4 bg-brand-border/60 rounded-lg w-1/2" />
      <div className="flex gap-4">
        <div className="h-6 w-20 bg-brand-border/60 rounded-full" />
        <div className="h-6 w-24 bg-brand-border/60 rounded-full" />
      </div>
    </div>
  );
};
