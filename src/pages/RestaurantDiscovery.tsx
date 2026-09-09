import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Sparkles, X, ChevronLeft, ChevronRight, Navigation, MapPin } from 'lucide-react';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { Button } from '../components/ui/Button';
import { restaurantDiscoveryService } from '../services/restaurantDiscoveryService';
import { CITY_COORDINATES, getCurrentCoordinates, reverseGeocode } from '../services/locationService';
import type { Restaurant } from '../types';
import { useAuth } from '../context/AuthContext';

export const RestaurantDiscovery: React.FC = () => {
  const { selectedCity, setSelectedCity } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [partnerOnly, setPartnerOnly] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // User coordinates state
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>(() => {
    return CITY_COORDINATES[selectedCity] || CITY_COORDINATES.Delhi;
  });
  const [resolvedAddress, setResolvedAddress] = useState<string>(selectedCity);

  const cuisines = ['All', 'Indian', 'Pizza', 'Burger', 'Asian', 'Fast Food', 'Cafe & Drinks', 'Desserts'];

  // Update coords when selected city changes
  useEffect(() => {
    if (CITY_COORDINATES[selectedCity]) {
      setUserCoords(CITY_COORDINATES[selectedCity]);
      setResolvedAddress(selectedCity);
      setPage(1);
    }
  }, [selectedCity]);

  // Main discovery effect
  useEffect(() => {
    async function loadRestaurants() {
      setLoading(true);
      try {
        const result = await restaurantDiscoveryService.discoverNearbyRestaurants({
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          radiusMeters: 12000,
          page,
          limit: 12,
          category: selectedCuisine === 'All' ? undefined : selectedCuisine,
          search: searchQuery,
          partnerOnly,
        });

        let list = result.restaurants;
        if (minRating > 0) {
          list = list.filter(r => r.rating >= minRating);
        }
        if (freeDeliveryOnly) {
          list = list.filter(r => r.deliveryFee === 0);
        }

        setRestaurants(list);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
      } catch (err) {
        console.error('Restaurant discovery error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, [userCoords, page, selectedCuisine, searchQuery, partnerOnly, minRating, freeDeliveryOnly]);

  const handleDetectLocation = async () => {
    try {
      setLoading(true);
      const coords = await getCurrentCoordinates();
      setUserCoords(coords);
      const loc = await reverseGeocode(coords.latitude, coords.longitude);
      setResolvedAddress(loc.address);
      if (loc.city && loc.city !== selectedCity) {
        setSelectedCity(loc.city);
      }
    } catch (e) {
      console.warn('Geolocation detection skipped:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Live Geolocation control */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-red flex items-center gap-1.5">
            <Sparkles size={14} /> Real-Time POI & Partner Engine
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-dark">
            Discover Restaurants Near You.
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted max-w-2xl">
            Sourced dynamically by geographic location across India. Discover local POIs & order from verified Foody partners.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-brand-surface p-2 rounded-2xl border border-brand-border shrink-0">
          <MapPin size={16} className="text-brand-red ml-1" />
          <span className="text-xs font-bold text-brand-dark line-clamp-1 max-w-[200px]">
            {resolvedAddress}
          </span>
          <button
            onClick={handleDetectLocation}
            className="px-3 py-1.5 rounded-xl bg-brand-dark text-white text-[11px] font-extrabold hover:bg-brand-red transition-all flex items-center gap-1 shadow-soft-sm"
          >
            <Navigation size={12} /> Detect Location
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search restaurants or cuisines..."
            className="w-full pl-10 pr-4 py-2.5 bg-brand-surface-light border border-brand-border rounded-full text-xs font-medium focus:outline-none focus:border-brand-dark"
          />
        </div>

        {/* Desktop Horizontal Cuisine Pills */}
        <div className="hidden lg:flex items-center gap-2 overflow-x-auto w-full max-w-xl py-1">
          {cuisines.map(c => {
            const isSelected = selectedCuisine === c;
            return (
              <button
                key={c}
                onClick={() => {
                  setSelectedCuisine(c);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-brand-dark text-white shadow-soft-sm'
                    : 'text-brand-dark hover:text-brand-red bg-brand-surface'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              setPartnerOnly(!partnerOnly);
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all ${
              partnerOnly
                ? 'bg-amber-400 border-amber-500 text-brand-dark shadow-sm'
                : 'border-brand-border text-brand-dark bg-white hover:bg-brand-surface'
            }`}
          >
            ✨ Partners Only
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFilterSheetOpen(true)}
            icon={<Filter size={16} />}
          >
            Filters {minRating > 0 && `(★ ${minRating}+)`}
          </Button>
        </div>
      </div>

      {/* Loading Skeleton or Restaurants Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-72 bg-white rounded-3xl border border-brand-border/60 p-4 space-y-4 animate-pulse">
              <div className="h-44 bg-brand-surface rounded-2xl" />
              <div className="h-4 bg-brand-surface rounded w-3/4" />
              <div className="h-3 bg-brand-surface rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : restaurants.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-brand-border/60 pt-6">
              <span className="text-xs font-bold text-brand-muted">
                Showing Page {page} of {totalPages} ({totalCount} nearby restaurants found)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  icon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  icon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-brand-border space-y-4">
          <p className="font-serif text-2xl font-bold text-brand-dark">No restaurants found in this area</p>
          <p className="text-xs text-brand-muted max-w-sm mx-auto">
            Try expanding your search query, turning off filters, or using Detect Location.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCuisine('All');
              setMinRating(0);
              setFreeDeliveryOnly(false);
              setPartnerOnly(false);
              setPage(1);
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Filter Sheet Modal */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSheetOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] p-6 space-y-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <h3 className="font-serif text-2xl font-bold text-brand-dark">Filter Restaurants</h3>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-brand-surface text-brand-dark flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[0, 4.0, 4.5, 4.8].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        minRating === rating
                          ? 'bg-brand-dark text-white border-brand-dark'
                          : 'bg-white text-brand-dark border-brand-border hover:bg-brand-surface'
                      }`}
                    >
                      {rating === 0 ? 'Any' : `★ ${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisines Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">Cuisine</label>
                <div className="flex flex-wrap gap-2">
                  {cuisines.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCuisine(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        selectedCuisine === c
                          ? 'bg-brand-red text-white border-brand-red'
                          : 'bg-brand-surface text-brand-dark border-brand-border'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setMinRating(0);
                    setSelectedCuisine('All');
                    setFreeDeliveryOnly(false);
                    setPartnerOnly(false);
                  }}
                >
                  Reset
                </Button>
                <Button variant="primary" fullWidth onClick={() => setIsFilterSheetOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
