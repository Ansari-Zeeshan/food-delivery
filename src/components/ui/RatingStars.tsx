import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  size = 14,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-neutral-300 fill-neutral-200'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-brand-dark">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-xs text-brand-muted">({count})</span>
      )}
    </div>
  );
};
