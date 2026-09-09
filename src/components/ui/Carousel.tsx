import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  items: React.ReactNode[];
  itemsPerViewDesktop?: number;
  itemsPerViewTablet?: number;
  itemsPerViewMobile?: number;
  autoPlayInterval?: number;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  itemsPerViewDesktop = 4,
  itemsPerViewTablet = 2,
  itemsPerViewMobile = 1,
  autoPlayInterval = 3500,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerView =
    screenSize === 'mobile'
      ? itemsPerViewMobile
      : screenSize === 'tablet'
      ? itemsPerViewTablet
      : itemsPerViewDesktop;

  const maxIndex = Math.max(0, items.length - itemsPerView);

  useEffect(() => {
    if (isHovered || maxIndex <= 0) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isHovered, maxIndex, autoPlayInterval]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <div
      className={`relative group/carousel space-y-4 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ultra-Premium Glassmorphic Left Arrow Icon Button */}
      <div className="absolute top-1/2 -left-4 sm:-left-6 -translate-y-1/2 z-20">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={handlePrev}
          className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md text-brand-dark hover:bg-brand-red hover:text-white border border-brand-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_10px_30px_rgba(201,54,50,0.4)] flex items-center justify-center transition-all group/btn"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={22} strokeWidth={2.5} className="transform group-hover/btn:-translate-x-0.5 transition-transform" />
        </motion.button>
      </div>

      {/* Ultra-Premium Glassmorphic Right Arrow Icon Button */}
      <div className="absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 z-20">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={handleNext}
          className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md text-brand-dark hover:bg-brand-red hover:text-white border border-brand-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_10px_30px_rgba(201,54,50,0.4)] flex items-center justify-center transition-all group/btn"
          aria-label="Next Slide"
        >
          <ChevronRight size={22} strokeWidth={2.5} className="transform group-hover/btn:translate-x-0.5 transition-transform" />
        </motion.button>
      </div>

      {/* Slide Container */}
      <div className="overflow-hidden rounded-3xl p-1">
        <motion.div
          className="flex gap-6"
          animate={{ x: `-${currentIndex * (100 / itemsPerView)}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className="shrink-0 transition-all"
              style={{
                width: `calc(${100 / itemsPerView}% - ${(24 * (itemsPerView - 1)) / itemsPerView}px)`,
              }}
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination Indicator Dots */}
      {maxIndex > 0 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx
                  ? 'w-6 bg-brand-red shadow-sm'
                  : 'w-2 bg-brand-border hover:bg-brand-dark/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
