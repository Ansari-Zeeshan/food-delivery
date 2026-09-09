import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, MapPin, Heart, ShoppingCart, User, UtensilsCrossed, Clock, LogOut, ChevronDown, Sparkles, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { GlobalSearchModal } from './GlobalSearchModal';
import { AuthModal } from '../auth/AuthModal';
import { TIER_1_CITIES, TIER_2_CITIES } from '../../data/mockData';
import { getCurrentCoordinates, reverseGeocode } from '../../services/locationService';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { totalItemsCount, setIsCartDrawerOpen } = useCart();
  const { user, isAuthenticated, logout, selectedCity, setSelectedCity, setIsAuthModalOpen } = useAuth();
  const { favoriteFoodIds, favoriteRestaurantIds } = useFavorites();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const totalFavs = favoriteFoodIds.length + favoriteRestaurantIds.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDetectLocation = async () => {
    try {
      const coords = await getCurrentCoordinates();
      const loc = await reverseGeocode(coords.latitude, coords.longitude);
      if (loc.city) {
        setSelectedCity(loc.city);
      }
    } catch {
      setSelectedCity('Delhi');
    }
  };

  const filteredTier1 = TIER_1_CITIES.filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()));
  const filteredTier2 = TIER_2_CITIES.filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()));

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-brand-bg/90 backdrop-blur-md shadow-soft-sm py-3.5 border-b border-brand-border/60'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-bold shadow-soft-sm group-hover:scale-105 transition-transform">
              <UtensilsCrossed size={20} />
            </div>
            <span className="font-serif text-2xl font-black text-brand-dark tracking-tight">
              Foody<span className="text-brand-red">.</span>
            </span>
          </Link>

          {/* CENTER: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-brand-dark">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors hover:text-brand-red ${
                  isActive ? 'text-brand-red font-bold' : ''
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/restaurants"
              className={({ isActive }) =>
                `transition-colors hover:text-brand-red ${
                  isActive ? 'text-brand-red font-bold' : ''
                }`
              }
            >
              Restaurants
            </NavLink>
            <NavLink
              to="/menu"
              className={({ isActive }) =>
                `transition-colors hover:text-brand-red ${
                  isActive ? 'text-brand-red font-bold' : ''
                }`
              }
            >
              Menu
            </NavLink>
            <NavLink
              to="/offers"
              className={({ isActive }) =>
                `transition-colors hover:text-brand-red ${
                  isActive ? 'text-brand-red font-bold' : ''
                }`
              }
            >
              Offers
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `transition-colors hover:text-brand-red ${
                  isActive ? 'text-brand-red font-bold' : ''
                }`
              }
            >
              About
            </NavLink>
          </nav>

          {/* RIGHT: Search, Location, Favorites, Cart, Profile / Auth Trigger */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-full hover:bg-brand-surface text-brand-dark transition-colors flex items-center gap-2"
              aria-label="Search"
            >
              <Search size={19} />
              <span className="hidden lg:inline text-xs font-semibold text-brand-muted">
                Search food...
              </span>
            </button>

            {/* City Location Selector Dropdown */}
            <div className="relative hidden sm:block" ref={cityRef}>
              <button
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-surface text-brand-dark text-xs font-bold hover:bg-brand-border/60 transition-colors border border-brand-border/60"
              >
                <MapPin size={14} className="text-brand-red" />
                <span className="max-w-[110px] truncate">{selectedCity}</span>
                <ChevronDown size={12} className={`text-brand-muted transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCityDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-64 bg-white rounded-2xl border border-brand-border shadow-soft-xl overflow-hidden z-50 p-3 space-y-2 max-h-96 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-brand-border/60 text-[10px] font-extrabold uppercase tracking-wider text-brand-muted">
                      <span>Select Location</span>
                      <button onClick={handleDetectLocation} className="text-brand-red hover:underline flex items-center gap-1">
                        <Navigation size={10} /> Auto GPS
                      </button>
                    </div>

                    {/* City Search Bar */}
                    <input
                      type="text"
                      value={citySearchQuery}
                      onChange={e => setCitySearchQuery(e.target.value)}
                      placeholder="Search Indian city..."
                      className="w-full px-3 py-1.5 bg-brand-surface border border-brand-border rounded-xl text-xs font-medium focus:outline-none focus:border-brand-dark"
                    />

                    {/* Tier 1 Metros */}
                    {filteredTier1.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 px-2 pt-1">
                          ★ Tier 1 Metros
                        </p>
                        {filteredTier1.map(city => (
                          <button
                            key={city}
                            onClick={() => {
                              setSelectedCity(city);
                              setIsCityDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                              selectedCity === city
                                ? 'bg-brand-red/10 text-brand-red font-bold'
                                : 'text-brand-dark hover:bg-brand-surface'
                            }`}
                          >
                            <span>{city}</span>
                            {selectedCity === city && <span className="text-brand-red text-xs font-bold">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Tier 2 Cities */}
                    {filteredTier2.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted px-2 pt-1">
                          📍 Tier 2 Cities
                        </p>
                        {filteredTier2.map(city => (
                          <button
                            key={city}
                            onClick={() => {
                              setSelectedCity(city);
                              setIsCityDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                              selectedCity === city
                                ? 'bg-brand-red/10 text-brand-red font-bold'
                                : 'text-brand-dark hover:bg-brand-surface'
                            }`}
                          >
                            <span>{city}</span>
                            {selectedCity === city && <span className="text-brand-red text-xs font-bold">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Favorites link */}
            <Link
              to="/favorites"
              className="relative p-2.5 rounded-full hover:bg-brand-surface text-brand-dark transition-colors"
              aria-label="Favorites"
            >
              <Heart size={19} />
              {totalFavs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-red text-white text-[10px] font-bold flex items-center justify-center">
                  {totalFavs}
                </span>
              )}
            </Link>

            {/* Cart drawer button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative px-4 py-2 rounded-full bg-brand-dark text-white hover:bg-brand-red transition-all flex items-center gap-2 shadow-soft-sm group"
            >
              <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold hidden xs:inline">Add to Cart</span>
              {totalItemsCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-brand-red group-hover:bg-white group-hover:text-brand-dark text-white text-[11px] font-bold">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* AUTHENTICATION ACTION OR USER PROFILE DROPDOWN */}
            {!isAuthenticated ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-full bg-brand-red text-white text-xs font-bold hover:bg-brand-dark transition-all shadow-soft-sm hover:scale-105"
              >
                Sign In / Register
              </button>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="p-1 rounded-full hover:bg-brand-surface text-brand-dark transition-colors flex items-center gap-1 border border-brand-border/60"
                  aria-label="Profile Menu"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                  />
                  <ChevronDown size={14} className={`text-brand-muted transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Popover */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-72 bg-white rounded-3xl border border-brand-border/80 shadow-soft-xl overflow-hidden z-50 p-4 space-y-3"
                    >
                      {/* User Info Header */}
                      <div className="flex items-center gap-3 pb-3 border-b border-brand-border/60">
                        <img
                          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt=""
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-surface shadow-sm"
                        />
                        <div className="overflow-hidden">
                          <h4 className="font-serif text-sm font-bold text-brand-dark truncate">{user?.name || 'Alex Morgan'}</h4>
                          <p className="text-[11px] text-brand-muted truncate">{user?.email || 'alex.morgan@example.com'}</p>
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-brand-red mt-0.5">
                            <Sparkles size={10} /> VIP Epicure Member
                          </span>
                        </div>
                      </div>

                      {/* Navigation Items */}
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigate('/profile');
                          }}
                          className="w-full p-2.5 rounded-xl hover:bg-brand-surface text-left text-xs font-semibold text-brand-dark flex items-center gap-3 transition-colors"
                        >
                          <User size={16} className="text-brand-red" />
                          <span>View Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigate('/orders');
                          }}
                          className="w-full p-2.5 rounded-xl hover:bg-brand-surface text-left text-xs font-semibold text-brand-dark flex items-center gap-3 transition-colors"
                        >
                          <Clock size={16} className="text-brand-red" />
                          <span>Order History</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigate('/favorites');
                          }}
                          className="w-full p-2.5 rounded-xl hover:bg-brand-surface text-left text-xs font-semibold text-brand-dark flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Heart size={16} className="text-brand-red" />
                            <span>Saved Favorites</span>
                          </div>
                          {totalFavs > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-brand-red/10 text-brand-red text-[10px] font-bold">
                              {totalFavs}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* SIGN OUT BUTTON */}
                      <div className="pt-2 border-t border-brand-border/60">
                        <button
                          onClick={async () => {
                            setIsProfileDropdownOpen(false);
                            await logout();
                          }}
                          className="w-full p-2.5 rounded-xl hover:bg-red-50 text-left text-xs font-bold text-red-600 flex items-center gap-3 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {/* Auth Popup Modal */}
      <AuthModal />
    </>
  );
};
