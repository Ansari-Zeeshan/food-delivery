import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onClick={onClick}
      className="group cursor-pointer relative bg-white rounded-3xl p-4 border border-brand-border/60 transition-shadow duration-300 hover:shadow-soft-lg flex flex-col justify-between select-none"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-surface mb-3">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-brand-dark group-hover:text-brand-red transition-colors">
            {category.name}
          </h3>
          <p className="text-xs text-brand-muted font-medium">{category.itemCount} items</p>
        </div>

        <div className="w-8 h-8 rounded-full bg-brand-surface group-hover:bg-brand-red group-hover:text-white text-brand-dark flex items-center justify-center transition-all duration-300 transform group-hover:translate-x-1">
          <ArrowRight size={16} />
        </div>
      </div>
    </motion.div>
  );
};
