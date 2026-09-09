import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import type { FoodItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../ui/Toast';
import { RatingStars } from '../ui/RatingStars';
import { FoodCustomizationModal } from './FoodCustomizationModal';

interface FoodCardProps {
  food?: FoodItem;
  foodItem?: FoodItem;
  className?: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, foodItem, className = '' }) => {
  const targetFood = foodItem || food;
  if (!targetFood) return null;

  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFoodFavorite, toggleFavoriteFood } = useFavorites();
  const { showToast } = useToast();
  const [isCustomizing, setIsCustomizing] = useState(false);

  const isFav = isFoodFavorite(targetFood.id);
  const existingCartItem = cartItems.find(item => item.foodItem.id === targetFood.id);
  const inCart = !!existingCartItem;
  const isHighlighted = inCart;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (existingCartItem) {
      removeFromCart(existingCartItem.id);
      showToast(`Removed ${targetFood.name} from cart`);
    } else {
      if (targetFood.options?.sizes?.length || targetFood.options?.extras?.length) {
        setIsCustomizing(true);
      } else {
        addToCart(targetFood, 1);
        showToast(`Added ${targetFood.name} to cart`);
      }
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please sign in to save dishes to your favorites!');
      navigate('/login');
      return;
    }
    toggleFavoriteFood(targetFood.id);
    showToast(isFav ? `Removed from favorites` : `Saved to favorites`);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={() => setIsCustomizing(true)}
        className={`group bg-white rounded-3xl border border-brand-border/60 p-4 space-y-3 cursor-pointer hover:border-brand-dark/30 shadow-soft-sm hover:shadow-soft-xl transition-all relative ${className}`}
      >
        {/* Image Container */}
        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-brand-surface">
          <img
            src={targetFood.image}
            alt={targetFood.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Favorite Heart Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
              isFav ? 'bg-brand-red text-white' : 'bg-white/80 text-brand-dark hover:bg-white'
            }`}
          >
            <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
          </motion.button>

          {/* Badge Tag (NEW, BESTSELLER, TRENDING) or Popular */}
          {targetFood.badge ? (
            <span className="absolute top-3 left-3 bg-amber-400 text-brand-dark text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              {targetFood.badge}
            </span>
          ) : targetFood.isPopular ? (
            <span className="absolute top-3 left-3 bg-brand-dark text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Popular
            </span>
          ) : null}

          {/* Prep Time pill */}
          <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            ⏱ {targetFood.prepTime}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold text-brand-red uppercase tracking-wider">
              {targetFood.restaurantName}
            </span>
            <RatingStars rating={targetFood.rating} size={12} />
          </div>

          <h4 className="font-serif text-lg font-bold text-brand-dark group-hover:text-brand-red transition-colors line-clamp-1">
            {targetFood.name}
          </h4>

          <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
            {targetFood.description}
          </p>
        </div>

        {/* Price & Cart Icon Action */}
        <div className="pt-2 flex items-center justify-between border-t border-brand-border/40">
          <div>
            <span className="text-xs text-brand-muted block text-[10px] font-semibold">Price</span>
            <span className="text-base font-extrabold text-brand-dark">${targetFood.price.toFixed(2)}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddClick}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all shadow-soft-sm ${
              isHighlighted
                ? 'bg-brand-red text-white shadow-soft-md shadow-red-500/30 scale-105'
                : 'bg-brand-dark text-white hover:bg-brand-red shadow-soft-sm'
            }`}
            aria-label="Add to cart"
          >
            {inCart ? <Check size={16} /> : <ShoppingBag size={16} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Customization Modal */}
      {isCustomizing && (
        <FoodCustomizationModal
          foodItem={targetFood}
          isOpen={isCustomizing}
          onClose={() => setIsCustomizing(false)}
        />
      )}
    </>
  );
};
