import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Utensils, Star, ArrowRight } from 'lucide-react';
import { FOOD_ITEMS, RESTAURANTS, CATEGORIES } from '../../data/mockData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredFoods = query.trim()
    ? FOOD_ITEMS.filter(
        f =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          f.category.toLowerCase().includes(query.toLowerCase()) ||
          f.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredRestaurants = query.trim()
    ? RESTAURANTS.filter(
        r =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.cuisine.some(c => c.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSelectDish = (id: string) => {
    onClose();
    navigate(`/food/${id}`);
  };

  const handleSelectRestaurant = (id: string) => {
    onClose();
    navigate(`/restaurants/${id}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-soft-lg overflow-hidden z-10 border border-brand-border"
        >
          {/* Search Input Bar */}
          <div className="p-4 border-b border-brand-border flex items-center gap-3 bg-brand-surface-light">
            <Search size={22} className="text-brand-red shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What are you craving? (e.g. Pappardelle, Pizza, Casa Verde)"
              className="w-full text-base font-medium bg-transparent focus:outline-none text-brand-dark placeholder:text-brand-muted"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-brand-muted hover:text-brand-dark">
                <X size={18} />
              </button>
            )}
            <button onClick={onClose} className="px-3 py-1.5 rounded-full bg-brand-surface text-xs font-semibold text-brand-dark hover:bg-brand-border transition-colors">
              ESC
            </button>
          </div>

          {/* Results / Default Suggestions */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            {!query.trim() ? (
              <div className="space-y-6">
                {/* Popular Searches */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-brand-red" /> Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Truffle Pasta', 'Neapolitan Pizza', 'Wagyu Burger', 'Poke Bowl', 'Tiramisu'].map(term => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3.5 py-1.5 rounded-full bg-brand-surface text-xs font-semibold text-brand-dark hover:bg-brand-red hover:text-white transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Categories */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
                    Explore Categories
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CATEGORIES.slice(0, 4).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onClose();
                          navigate(`/menu?category=${cat.slug}`);
                        }}
                        className="p-3 rounded-2xl bg-brand-surface-light border border-brand-border/60 flex items-center gap-3 hover:border-brand-dark transition-all text-left group"
                      >
                        <img src={cat.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <span className="text-xs font-bold text-brand-dark block group-hover:text-brand-red">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-brand-muted">{cat.itemCount} items</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Restaurant Matches */}
                {filteredRestaurants.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
                      Restaurants ({filteredRestaurants.length})
                    </h4>
                    <div className="space-y-2">
                      {filteredRestaurants.map(rest => (
                        <div
                          key={rest.id}
                          onClick={() => handleSelectRestaurant(rest.id)}
                          className="p-3 rounded-2xl border border-brand-border hover:border-brand-dark cursor-pointer flex items-center justify-between transition-colors bg-white hover:bg-brand-surface-light"
                        >
                          <div className="flex items-center gap-3">
                            <img src={rest.heroImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <h5 className="text-sm font-bold text-brand-dark">{rest.name}</h5>
                              <p className="text-xs text-brand-muted">{rest.cuisine.join(', ')} · {rest.deliveryTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star size={14} className="fill-amber-400" /> {rest.rating}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dish Matches */}
                {filteredFoods.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
                      Dishes & Menu Items ({filteredFoods.length})
                    </h4>
                    <div className="space-y-2">
                      {filteredFoods.map(food => (
                        <div
                          key={food.id}
                          onClick={() => handleSelectDish(food.id)}
                          className="p-3 rounded-2xl border border-brand-border hover:border-brand-dark cursor-pointer flex items-center justify-between transition-colors bg-white hover:bg-brand-surface-light"
                        >
                          <div className="flex items-center gap-3">
                            <img src={food.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <h5 className="text-sm font-bold text-brand-dark">{food.name}</h5>
                              <p className="text-xs text-brand-muted">{food.restaurantName} · ${food.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-brand-surface flex items-center justify-center text-brand-dark">
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredRestaurants.length === 0 && filteredFoods.length === 0 && (
                  <div className="text-center py-10">
                    <Utensils className="w-10 h-10 text-brand-muted mx-auto mb-2" />
                    <p className="text-sm font-bold text-brand-dark">No culinary matches found for "{query}"</p>
                    <p className="text-xs text-brand-muted mt-1">Try searching for 'pasta', 'pizza', 'burger', or 'sushi'</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
