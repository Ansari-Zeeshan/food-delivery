import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, MapPin, Heart, Share2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { RESTAURANTS as MOCK_RESTAURANTS, FOOD_ITEMS as MOCK_FOODS } from '../data/mockData';
import { FoodCard } from '../components/food/FoodCard';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant, FoodItem } from '../types';

export const RestaurantDetail: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { total, totalItemsCount } = useCart();
  const { isRestaurantFavorite, toggleFavoriteRestaurant } = useFavorites();
  const { showToast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant>(() => {
    return MOCK_RESTAURANTS.find(r => r.id === restaurantId || (r as any).slug === restaurantId) || MOCK_RESTAURANTS[0];
  });
  const [restaurantFoods, setRestaurantFoods] = useState<FoodItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    async function loadData() {
      if (!restaurantId) return;
      try {
        let res = await restaurantService.getRestaurantById(restaurantId);
        if (!res) {
          res = await restaurantService.getRestaurantBySlug(restaurantId);
        }
        if (res) {
          setRestaurant(res);
          const foods = await restaurantService.getFoodItems(res.id);
          if (foods.length > 0) setRestaurantFoods(foods);
          else setRestaurantFoods(MOCK_FOODS.filter(f => f.restaurantId === res?.id || f.restaurantId === 'rest-1'));
        } else {
          setRestaurantFoods(MOCK_FOODS.filter(f => f.restaurantId === restaurant.id));
        }
      } catch (e) {
        console.warn('Backend fetch error:', e);
        setRestaurantFoods(MOCK_FOODS.filter(f => f.restaurantId === restaurant.id));
      }
    }
    loadData();
  }, [restaurantId]);

  const categories = ['All', ...Array.from(new Set(restaurantFoods.map(f => f.category)))];

  const displayedFoods = activeCategory === 'All'
    ? restaurantFoods
    : restaurantFoods.filter(f => f.category === activeCategory);

  const isFav = isRestaurantFavorite(restaurant.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Restaurant link copied to clipboard!');
  };

  return (
    <div className="pb-16 space-y-8">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <motion.button
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/restaurants')}
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-dark hover:text-brand-red transition-colors"
        >
          <ArrowLeft size={16} /> Back to Places
        </motion.button>
      </div>

      {/* Restaurant Hero Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-brand-dark text-white border border-neutral-800 shadow-soft-lg">
          <div className="h-64 sm:h-80 w-full relative">
            <img
              src={restaurant.heroImage}
              alt={restaurant.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
          </div>

          <div className="p-6 sm:p-10 relative -mt-20 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <img
                  src={restaurant.logo}
                  alt=""
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white object-cover bg-white shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-red text-white text-xs font-bold">
                      {restaurant.priceLevel}
                    </span>
                    {restaurant.tags.map(t => (
                      <Badge key={t} variant="dark" size="sm">{t}</Badge>
                    ))}
                  </div>
                  <h1 className="font-serif text-3xl sm:text-5xl font-bold mt-1 text-white">
                    {restaurant.name}
                  </h1>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl font-light">
                {restaurant.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-300 pt-2">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Star size={16} fill="currentColor" /> {restaurant.rating} ({restaurant.ratingCount} reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} className="text-brand-red" /> {restaurant.deliveryTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-brand-red" /> {restaurant.address}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFavoriteRestaurant(restaurant.id)}
                className={`p-3 rounded-full border transition-all ${
                  isFav ? 'bg-brand-red border-brand-red text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                <Share2 size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-brand-border pb-4">
          {categories.map(cat => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-brand-dark text-white shadow-soft'
                    : 'bg-white text-brand-dark border border-brand-border hover:bg-brand-surface'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedFoods.map(food => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      </div>

      {/* Sticky Bottom Floating Bar when items in cart */}
      <AnimatePresence>
        {totalItemsCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 max-w-xl mx-auto z-40"
          >
            <div className="bg-brand-dark text-white p-4 rounded-full shadow-soft-2xl border border-neutral-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center font-bold text-white text-sm">
                  {totalItemsCount}
                </div>
                <div>
                  <p className="text-xs font-bold">Your Cart Order</p>
                  <p className="text-sm font-extrabold text-amber-400">${total.toFixed(2)}</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/checkout')}
                icon={<ShoppingBag size={18} />}
              >
                CHECKOUT NOW
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
