import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { FOOD_ITEMS as MOCK_FOODS, RESTAURANTS as MOCK_RESTAURANTS } from '../data/mockData';
import { FoodCard } from '../components/food/FoodCard';
import { Button } from '../components/ui/Button';
import { restaurantService } from '../services/restaurantService';
import { useAuth } from '../context/AuthContext';
import { UnservicedCityCard } from '../components/common/UnservicedCityCard';
import type { FoodItem, Restaurant } from '../types';

const CATEGORY_LIST = [
  'ALL',
  'Pizza',
  'Chicken',
  'Burger',
  'Pasta',
  'Asian',
  'Drinks',
  'Desserts',
  'Sides',
  'Healthy',
  'Indian',
];

const PORTION_SIZES = ['Regular', 'Large', 'Family'] as const;
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Spicy', 'Gluten-Free'] as const;
const MEAL_TIMES = ['Breakfast', 'Snacks', 'Dinner', 'Late Night'] as const;

export const GlobalMenu: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';

  const { selectedCity } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(MOCK_FOODS);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory.toUpperCase());
  const [maxPrice, setMaxPrice] = useState<number>(35);
  const [selectedPortion, setSelectedPortion] = useState<string | null>('Regular');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedMealTimes, setSelectedMealTimes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [availability, setAvailability] = useState<'now' | 'later'>('now');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    async function loadData() {
      try {
        const dbRest = await restaurantService.getRestaurants();
        if (dbRest.length > 0) setRestaurants(dbRest);

        const dbFoods = await restaurantService.getFoodItems();
        if (dbFoods.length > 0) setFoodItems(dbFoods);
      } catch (e) {
        console.warn('Backend fetch notice:', e);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.get('category')) {
      setActiveCategory(searchParams.get('category')!.toUpperCase());
    }
  }, [searchParams]);

  const cityRestaurants = restaurants.filter(
    r => (r.city || 'Delhi').toLowerCase() === selectedCity.toLowerCase()
  );
  const cityRestaurantIds = new Set(cityRestaurants.map(r => r.id));

  // Filter items available for selectedCity (or fallback if empty)
  const availableFoodItems = foodItems.filter(
    f => cityRestaurantIds.size === 0 || cityRestaurantIds.has(f.restaurantId)
  );

  const filtered = availableFoodItems.filter(f => {
    // Search keyword
    const matchesSearch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Category
    const matchesCat =
      activeCategory === 'ALL' || f.category.toUpperCase() === activeCategory;

    // Price
    const matchesPrice = f.price <= maxPrice;

    // Portion Size
    const matchesPortion =
      !selectedPortion || !f.portionSize || f.portionSize === selectedPortion;

    // Dietary
    const matchesDietary =
      selectedDietary.length === 0 ||
      (selectedDietary.includes('Spicy') && f.isSpicy) ||
      (f.isDietary && selectedDietary.some(d => (f.isDietary as string[]).includes(d)));

    // Meal Time
    const matchesMealTime =
      selectedMealTimes.length === 0 ||
      !f.mealTime ||
      f.mealTime.some(m => selectedMealTimes.includes(m));

    // Rating
    const matchesRating = f.rating >= minRating;

    return (
      matchesSearch &&
      matchesCat &&
      matchesPrice &&
      matchesPortion &&
      matchesDietary &&
      matchesMealTime &&
      matchesRating
    );
  });

  // Sorting
  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // Pagination (8 items per page)
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('ALL');
    setMaxPrice(35);
    setSelectedPortion(null);
    setSelectedDietary([]);
    setSelectedMealTimes([]);
    setMinRating(0);
    setAvailability('now');
    setSortBy('popular');
    setCurrentPage(1);
  };

  const toggleDietary = (item: string) => {
    setSelectedDietary(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleMealTime = (item: string) => {
    setSelectedMealTimes(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 01 TOP DEDICATED HEADER & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/60 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-red flex items-center gap-1">
              <Sparkles size={14} /> Dribbble Inspired Collection
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-dark">Full Menu</h1>
          <p className="text-xs sm:text-sm text-brand-muted">
            {filtered.length} dishes made fresh to order, delivered to your door in {selectedCity}.
          </p>
        </div>

        {/* Search Bar Input with Yellow Button */}
        <div className="relative w-full md:w-96 flex items-center">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search burgers, pizza, drinks..."
              className="w-full pl-11 pr-24 py-3 bg-brand-surface-light border border-brand-border rounded-full text-xs font-semibold focus:outline-none focus:border-brand-dark"
            />
            <button
              onClick={() => setCurrentPage(1)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-500 text-brand-dark font-extrabold text-xs transition-all shadow-sm"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* UNSERVICED CITY STATE */}
      {cityRestaurants.length === 0 && availableFoodItems.length === 0 ? (
        <UnservicedCityCard />
      ) : (
        /* 02 MAIN TWO-COLUMN LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: FILTERS SIDEBAR */}
          <aside className="lg:col-span-4 xl:col-span-3 bg-white p-6 rounded-3xl border border-brand-border/80 shadow-soft-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
              <h3 className="font-serif text-xl font-bold text-brand-dark flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-brand-red" /> Filters
              </h3>
              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-brand-muted hover:text-brand-red transition-colors"
              >
                Clear all
              </button>
            </div>

            {/* 1. Category Checkboxes */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-brand-dark block">
                Category
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {CATEGORY_LIST.map(cat => {
                  const isChecked = activeCategory === cat;
                  return (
                    <label
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setCurrentPage(1);
                      }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-amber-400 border-amber-400 text-brand-dark font-bold'
                            : 'border-brand-border bg-white group-hover:border-brand-dark'
                        }`}
                      >
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          isChecked ? 'text-brand-dark font-bold' : 'text-brand-muted group-hover:text-brand-dark'
                        }`}
                      >
                        {cat}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Price Range Slider */}
            <div className="space-y-3 pt-4 border-t border-brand-border/60">
              <div className="flex items-center justify-between text-xs font-extrabold text-brand-dark uppercase tracking-wider">
                <span>Price Range</span>
                <span className="font-mono text-brand-red">${maxPrice}</span>
              </div>
              <input
                type="range"
                min={5}
                max={35}
                value={maxPrice}
                onChange={e => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-bold text-brand-muted">
                <span>$5</span>
                <span>$35</span>
              </div>
            </div>

            {/* 3. Portion Size Pills */}
            <div className="space-y-3 pt-4 border-t border-brand-border/60">
              <label className="text-xs font-extrabold uppercase tracking-wider text-brand-dark block">
                Portion Size
              </label>
              <div className="flex gap-2">
                {PORTION_SIZES.map(size => {
                  const isSelected = selectedPortion === size;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedPortion(isSelected ? null : size);
                        setCurrentPage(1);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-amber-400 border-amber-400 text-brand-dark shadow-sm'
                          : 'bg-white border-brand-border text-brand-dark hover:bg-brand-surface'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Dietary Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-brand-border/60">
              <label className="text-xs font-extrabold uppercase tracking-wider text-brand-dark block">
                Dietary
              </label>
              <div className="space-y-2">
                {DIETARY_OPTIONS.map(diet => {
                  const isChecked = selectedDietary.includes(diet);
                  return (
                    <label
                      key={diet}
                      onClick={() => {
                        toggleDietary(diet);
                        setCurrentPage(1);
                      }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-amber-400 border-amber-400 text-brand-dark'
                            : 'border-brand-border bg-white group-hover:border-brand-dark'
                        }`}
                      >
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="text-xs font-semibold text-brand-dark">{diet}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 5. Meal Time Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-brand-border/60">
              <label className="text-xs font-extrabold uppercase tracking-wider text-brand-dark block">
                Meal Time
              </label>
              <div className="space-y-2">
                {MEAL_TIMES.map(meal => {
                  const isChecked = selectedMealTimes.includes(meal);
                  return (
                    <label
                      key={meal}
                      onClick={() => {
                        toggleMealTime(meal);
                        setCurrentPage(1);
                      }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-amber-400 border-amber-400 text-brand-dark'
                            : 'border-brand-border bg-white group-hover:border-brand-dark'
                        }`}
                      >
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="text-xs font-semibold text-brand-dark">{meal}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 6. Rating Filter */}
            <div className="space-y-3 pt-4 border-t border-brand-border/60">
              <label className="text-xs font-extrabold uppercase tracking-wider text-brand-dark block">
                Rating
              </label>
              <div className="space-y-2">
                {[0, 4.0, 4.5, 4.8].map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setMinRating(r);
                      setCurrentPage(1);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-colors ${
                      minRating === r
                        ? 'bg-brand-dark text-white border-brand-dark'
                        : 'bg-white border-brand-border text-brand-dark hover:bg-brand-surface'
                    }`}
                  >
                    <span>{r === 0 ? 'All Ratings' : `★ ${r} & up`}</span>
                    {minRating === r && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Availability Radio */}
            <div className="space-y-3 pt-4 border-t border-brand-border/60">
              <label className="text-xs font-extrabold uppercase tracking-wider text-brand-dark block">
                Availability
              </label>
              <div className="space-y-2">
                <label
                  onClick={() => setAvailability('now')}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      availability === 'now' ? 'border-amber-400 bg-amber-400' : 'border-brand-border'
                    }`}
                  >
                    {availability === 'now' && <div className="w-1.5 h-1.5 rounded-full bg-brand-dark" />}
                  </div>
                  <span className="text-xs font-semibold text-brand-dark">Available Now</span>
                </label>
                <label
                  onClick={() => setAvailability('later')}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      availability === 'later' ? 'border-amber-400 bg-amber-400' : 'border-brand-border'
                    }`}
                  >
                    {availability === 'later' && <div className="w-1.5 h-1.5 rounded-full bg-brand-dark" />}
                  </div>
                  <span className="text-xs font-semibold text-brand-dark">Schedule for Later</span>
                </label>
              </div>
            </div>

            {/* Apply Filters Gold Button */}
            <div className="pt-4 border-t border-brand-border/60">
              <button
                onClick={() => setCurrentPage(1)}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-brand-dark font-extrabold text-xs shadow-md transition-all uppercase tracking-wider"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* RIGHT COLUMN: MAIN DISH GRID */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Control Bar: Items Count & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-brand-border/60 shadow-soft-sm">
              <span className="text-sm font-extrabold text-brand-dark">
                {filtered.length} Menu Items
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-muted">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-3.5 py-1.5 rounded-full bg-brand-surface border border-brand-border text-xs font-bold text-brand-dark focus:outline-none cursor-pointer"
                >
                  <option value="popular">Popular</option>
                  <option value="rating">Highest Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Grid of Dishes */}
            {paginatedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {paginatedItems.map(foodItem => (
                  <FoodCard key={foodItem.id} foodItem={foodItem} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-brand-border space-y-4">
                <p className="font-serif text-2xl font-bold text-brand-dark">No dishes match your filter</p>
                <p className="text-xs text-brand-muted max-w-sm mx-auto">
                  Try adjusting your search query, increasing price limit, or unchecking specific dietary options.
                </p>
                <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-9 h-9 rounded-xl border border-brand-border bg-white text-brand-dark font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-surface transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = currentPage === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all ${
                        isActive
                          ? 'bg-amber-400 text-brand-dark shadow-sm scale-105'
                          : 'bg-white border border-brand-border text-brand-dark hover:bg-brand-surface'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-9 h-9 rounded-xl border border-brand-border bg-white text-brand-dark font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-surface transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
