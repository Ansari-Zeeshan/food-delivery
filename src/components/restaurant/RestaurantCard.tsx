import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Heart } from 'lucide-react';
import type { Restaurant } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../ui/Toast';
import { RatingStars } from '../ui/RatingStars';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isRestaurantFavorite, toggleFavoriteRestaurant } = useFavorites();
  const { showToast } = useToast();

  const isFav = isRestaurantFavorite(restaurant.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please sign in to save restaurants to your favorites!');
      navigate('/login');
      return;
    }
    toggleFavoriteRestaurant(restaurant.id);
    showToast(isFav ? 'Removed restaurant from favorites' : 'Saved restaurant to favorites');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -10 }}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
      className="group cursor-pointer bg-white rounded-3xl p-4 border border-brand-border/60 transition-shadow duration-300 hover:shadow-soft-lg flex flex-col justify-between select-none"
    >
      <div>
        {/* Cover image & logo */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-brand-surface mb-4">
          <img
            src={restaurant.heroImage}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Partner vs Discovered POI Badge */}
          {restaurant.isPartner ? (
            <span className="absolute top-3 left-3 bg-amber-400 text-brand-dark text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              ✨ Foody Partner
            </span>
          ) : (
            <span className="absolute top-3 left-3 bg-brand-dark/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              📍 Discovered POI
            </span>
          )}

          {/* Logo badge */}
          <div className="absolute bottom-3 left-3 w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-md bg-white">
            <img src={restaurant.logo} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Favorite button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-brand-dark shadow-sm transition-transform"
          >
            <Heart
              size={17}
              fill={isFav ? '#C93632' : 'none'}
              className={isFav ? 'text-brand-red' : 'text-brand-dark'}
            />
          </motion.button>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-surface text-brand-dark">
                {restaurant.priceLevel}
              </span>
              <span className="text-xs font-medium text-brand-muted line-clamp-1">
                {restaurant.cuisine.join(' • ')}
              </span>
            </div>
            <RatingStars rating={restaurant.rating} count={restaurant.ratingCount} size={13} />
          </div>

          <h3 className="font-serif text-xl font-bold text-brand-dark group-hover:text-brand-red transition-colors line-clamp-1">
            {restaurant.name}
          </h3>

          <p className="text-xs text-brand-muted line-clamp-1">
            {restaurant.tagline || restaurant.description}
          </p>

          {/* Serviceability indicator */}
          <div className="pt-1">
            {restaurant.isPartner ? (
              restaurant.isServiceable ? (
                <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  ✓ Orderable • Delivery Available
                </span>
              ) : (
                <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  ⚠️ Outside Delivery Area
                </span>
              )
            ) : (
              <span className="inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                🔍 POI Discovered • Menu Onboarding Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer details */}
      <div className="pt-4 mt-4 border-t border-brand-border/40 flex items-center justify-between text-xs text-brand-muted font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-brand-red" />
            {restaurant.deliveryTime}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={13} className="text-brand-red" />
            {restaurant.distance}
          </span>
        </div>

        <span className="font-bold text-brand-dark">
          {restaurant.deliveryFee === 0 ? (
            <span className="text-emerald-600 font-extrabold">Free Delivery</span>
          ) : (
            `$${restaurant.deliveryFee.toFixed(2)} delivery`
          )}
        </span>
      </div>
    </motion.div>
  );
};
