import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, Utensils, Store } from 'lucide-react';
import { FOOD_ITEMS as MOCK_FOODS, RESTAURANTS as MOCK_RESTAURANTS } from '../data/mockData';
import { useFavorites } from '../context/FavoritesContext';
import { FoodCard } from '../components/food/FoodCard';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { Button } from '../components/ui/Button';
import { restaurantService } from '../services/restaurantService';
import type { FoodItem, Restaurant } from '../types';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favoriteFoodIds, favoriteRestaurantIds } = useFavorites();

  const [allFoods, setAllFoods] = useState<FoodItem[]>(MOCK_FOODS);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [activeTab, setActiveTab] = useState<'all' | 'dishes' | 'restaurants'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const dbRest = await restaurantService.getRestaurants();
        if (dbRest.length > 0) setAllRestaurants(dbRest);

        const dbFoods = await restaurantService.getFoodItems();
        if (dbFoods.length > 0) setAllFoods(dbFoods);
      } catch (e) {
        console.warn('Backend fetch notice:', e);
      }
    }
    loadData();
  }, []);

  const favFoods = allFoods.filter(f => favoriteFoodIds.includes(f.id));
  const favRestaurants = allRestaurants.filter(r => favoriteRestaurantIds.includes(r.id));

  const isEmpty = favFoods.length === 0 && favRestaurants.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-red flex items-center gap-1.5 mb-1">
            <Sparkles size={14} /> Saved Collections
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-dark">
            Your Favorites
          </h1>
        </div>

        {!isEmpty && (
          <div className="flex items-center gap-2 bg-brand-surface p-1.5 rounded-full border border-brand-border">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-brand-dark text-white shadow-sm' : 'text-brand-dark hover:text-brand-red'
              }`}
            >
              All ({favFoods.length + favRestaurants.length})
            </button>
            <button
              onClick={() => setActiveTab('dishes')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'dishes' ? 'bg-brand-dark text-white shadow-sm' : 'text-brand-dark hover:text-brand-red'
              }`}
            >
              <Utensils size={14} /> Dishes ({favFoods.length})
            </button>
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'restaurants' ? 'bg-brand-dark text-white shadow-sm' : 'text-brand-dark hover:text-brand-red'
              }`}
            >
              <Store size={14} /> Places ({favRestaurants.length})
            </button>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-brand-border p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center mx-auto">
            <Heart size={32} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-brand-dark">Save the places & dishes you love</h3>
          <p className="text-xs text-brand-muted max-w-sm mx-auto">
            Click the heart icon on any dish or restaurant to add it here for quick reordering.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/restaurants')}>
            DISCOVER RESTAURANTS
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Favorite Restaurants Section */}
          {(activeTab === 'all' || activeTab === 'restaurants') && favRestaurants.length > 0 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
                <Store size={22} className="text-brand-red" /> Favorite Places
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {favRestaurants.map(r => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </div>
          )}

          {/* Favorite Dishes Section */}
          {(activeTab === 'all' || activeTab === 'dishes') && favFoods.length > 0 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
                <Utensils size={22} className="text-brand-red" /> Favorite Dishes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favFoods.map(f => (
                  <FoodCard key={f.id} food={f} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
