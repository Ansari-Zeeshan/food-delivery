import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Sparkles, Clock, Flame } from 'lucide-react';
import { CATEGORIES, FOOD_ITEMS as MOCK_FOODS, RESTAURANTS as MOCK_RESTAURANTS } from '../data/mockData';
import { FoodCard } from '../components/food/FoodCard';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { CategoryCard } from '../components/food/CategoryCard';
import { Button } from '../components/ui/Button';
import { RevealUp } from '../components/motion/Motion';
import { Carousel } from '../components/ui/Carousel';
import { restaurantService } from '../services/restaurantService';
import { restaurantDiscoveryService } from '../services/restaurantDiscoveryService';
import { CITY_COORDINATES } from '../services/locationService';
import { useAuth } from '../context/AuthContext';
import { UnservicedCityCard } from '../components/common/UnservicedCityCard';
import type { Restaurant, FoodItem } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(MOCK_FOODS);

  useEffect(() => {
    async function loadData() {
      try {
        const coords = CITY_COORDINATES[selectedCity] || CITY_COORDINATES.Delhi;
        const discovery = await restaurantDiscoveryService.discoverNearbyRestaurants({
          latitude: coords.latitude,
          longitude: coords.longitude,
          radiusMeters: 15000,
          limit: 20,
        });

        if (discovery.restaurants.length > 0) {
          setRestaurants(discovery.restaurants);
        } else {
          const dbRest = await restaurantService.getRestaurants();
          if (dbRest.length > 0) setRestaurants(dbRest);
        }

        const dbFoods = await restaurantService.getFoodItems();
        if (dbFoods.length > 0) setFoodItems(dbFoods);
      } catch (e) {
        console.warn('Backend fetch notice:', e);
      }
    }
    loadData();
  }, [selectedCity]);

  const cityRestaurants = restaurants.filter(
    r => (r.city || 'Delhi').toLowerCase() === selectedCity.toLowerCase()
  );
  const cityRestaurantIds = new Set(cityRestaurants.map(r => r.id));

  const popularDishes = foodItems.filter(
    f => f.isPopular && cityRestaurantIds.has(f.restaurantId)
  );
  const featuredRestaurants = cityRestaurants.filter(r => r.isFeatured || r.isPopular);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="space-y-24 pb-12">
      {/* 01 HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-16 lg:py-24">
        {/* Floating Background Accents */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-brand-surface rounded-full blur-2xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left z-10">
              <RevealUp>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-surface text-brand-dark text-xs font-extrabold uppercase tracking-wider">
                  <Sparkles size={14} className="text-brand-red" />
                  Premium Food Delivery Platform
                </span>
              </RevealUp>

              {/* Large Editorial Headline */}
              <RevealUp delay={0.1}>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-brand-dark">
                  It’s not just <br className="hidden sm:inline" />
                  Food, It’s an <br className="hidden sm:inline" />
                  <span className="font-italic text-brand-red">Experience.</span>
                </h1>
              </RevealUp>

              {/* Supporting Copy */}
              <RevealUp delay={0.2}>
                <p className="text-base sm:text-lg text-brand-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Discover exceptional artisanal dishes from top Michelin-recommended and local master kitchens, delivered fresh to your door.
                </p>
              </RevealUp>

              {/* CTAs */}
              <RevealUp delay={0.3}>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/menu')}
                  >
                    View Menu
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate('/restaurants')}
                  >
                    Book A Table
                  </Button>
                </div>
              </RevealUp>

              {/* Reviews & Social Proof */}
              <RevealUp delay={0.4}>
                <div className="pt-6 border-t border-brand-border/60 flex items-center justify-center lg:justify-start gap-4">
                  <div className="flex -space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                      alt=""
                      onError={handleImgError}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                      alt=""
                      onError={handleImgError}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                      alt=""
                      onError={handleImgError}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <div className="w-10 h-10 rounded-full bg-brand-dark text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                      +4.9k
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-brand-dark mt-0.5">
                      4.9/5 from 12,000+ happy epicures
                    </p>
                  </div>
                </div>
              </RevealUp>
            </div>

            {/* Right Visual Image Showcase */}
            <div className="lg:col-span-6 relative">
              <RevealUp delay={0.2}>
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Outer Glowing Circle Accent */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/20 to-amber-500/20 rounded-full blur-2xl transform scale-95" />
                  
                  {/* Hero Dish Image Card */}
                  <div className="relative bg-white p-4 sm:p-6 rounded-[2.5rem] shadow-soft-2xl border border-brand-border/80">
                    <div className="relative h-[340px] sm:h-[420px] rounded-[2rem] overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1621996346565-e3d5d6281358?auto=format&fit=crop&w=1200&q=80"
                        alt="Signature Wild Truffle Pappardelle"
                        onError={handleImgError}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Floating Chef Badge */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-soft">
                        <Flame size={14} className="text-brand-red animate-pulse" />
                        <span className="text-[11px] font-extrabold text-brand-dark uppercase tracking-wider">
                          Chef's Special
                        </span>
                      </div>

                      {/* Bottom Overlay Info */}
                      <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                          Casa Verde Trattoria
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                          Wild Truffle Pappardelle
                        </h3>
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-sans text-xl font-bold text-white">$24.50</span>
                          <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock size={12} /> 20 min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Micro Feature Card 1 */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 bg-white p-4 rounded-2xl shadow-soft-xl border border-brand-border hidden sm:flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-surface flex items-center justify-center text-brand-red font-bold text-xl">
                      ⚡
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-brand-dark">30 Min Fast Express</p>
                      <p className="text-[11px] text-brand-muted">Hot & fresh insulated delivery</p>
                    </div>
                  </motion.div>

                  {/* Floating Micro Feature Card 2 */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-soft-xl border border-brand-border hidden sm:flex items-center gap-3"
                  >
                    <div className="flex text-amber-500">
                      <Star size={18} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-brand-dark">4.9 Star Rating</p>
                      <p className="text-[11px] text-brand-muted">Verified food lovers</p>
                    </div>
                  </motion.div>
                </div>
              </RevealUp>
            </div>
          </div>
        </div>
      </section>

      {/* 02 CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6">
          <div>
            <span className="text-xs font-bold text-brand-red uppercase tracking-widest block mb-1">
              Curated Collections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark">
              Explore Cuisines
            </h2>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="text-xs font-extrabold text-brand-dark hover:text-brand-red uppercase tracking-wider flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            View All Categories <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* 03 & 04 CAROUSEL SECTIONS OR UNSERVICED CITY CARD */}
      {cityRestaurants.length === 0 ? (
        <UnservicedCityCard />
      ) : (
        <>
          {/* 03 POPULAR DISHES OWL CAROUSEL SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6">
              <div>
                <span className="text-xs font-bold text-brand-red uppercase tracking-widest block mb-1">
                  Customer Favorites in {selectedCity}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark">
                  Most Ordered Dishes
                </h2>
              </div>
              <button
                onClick={() => navigate('/menu')}
                className="text-xs font-extrabold text-brand-dark hover:text-brand-red uppercase tracking-wider flex items-center gap-2 transition-colors self-start sm:self-auto"
              >
                Full Menu <ArrowRight size={16} />
              </button>
            </div>

            <Carousel
              items={popularDishes.map(foodItem => (
                <FoodCard key={foodItem.id} foodItem={foodItem} />
              ))}
              itemsPerViewDesktop={4}
              itemsPerViewTablet={2}
              itemsPerViewMobile={1}
              autoPlayInterval={3500}
            />
          </section>

          {/* 04 FEATURED RESTAURANTS OWL CAROUSEL SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6">
              <div>
                <span className="text-xs font-bold text-brand-red uppercase tracking-widest block mb-1">
                  Handpicked Kitchens in {selectedCity}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark">
                  Featured Restaurants
                </h2>
              </div>
              <button
                onClick={() => navigate('/restaurants')}
                className="text-xs font-extrabold text-brand-dark hover:text-brand-red uppercase tracking-wider flex items-center gap-2 transition-colors self-start sm:self-auto"
              >
                All Restaurants <ArrowRight size={16} />
              </button>
            </div>

            <Carousel
              items={featuredRestaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
              itemsPerViewDesktop={3}
              itemsPerViewTablet={2}
              itemsPerViewMobile={1}
              autoPlayInterval={4000}
            />
          </section>

          {/* 05 HOW IT WORKS PROCESS SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-6">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-brand-red uppercase tracking-widest block">
                Simple & Seamless Experience
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-brand-dark">
                How Foody Delivers Excellence.
              </h2>
              <p className="text-sm text-brand-muted">
                From handpicked Michelin-recommended kitchens to your dining table in 4 effortless steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Discover & Select',
                  desc: 'Explore artisanal dishes and top-rated restaurants near your home or work location.',
                  icon: '🍽️',
                },
                {
                  step: '02',
                  title: 'Custom Crafting',
                  desc: 'Tailor your order with portion sizes, extras, and specific dietary preferences.',
                  icon: '⚙️',
                },
                {
                  step: '03',
                  title: 'Express Courier',
                  desc: 'Track live temperature-controlled delivery driven by top-rated dedicated riders.',
                  icon: '⚡',
                },
                {
                  step: '04',
                  title: 'Savor & Enjoy',
                  desc: 'Unbox hot, fresh restaurant-grade culinary creations right at your dining table.',
                  icon: '✨',
                },
              ].map(item => (
                <RevealUp key={item.step}>
                  <div className="bg-white p-8 rounded-[2rem] border border-brand-border/80 shadow-soft-sm hover:shadow-soft-xl transition-all relative overflow-hidden group">
                    <span className="absolute top-4 right-4 font-serif text-4xl font-extrabold text-brand-surface group-hover:text-brand-red/20 transition-colors">
                      {item.step}
                    </span>
                    <div className="w-14 h-14 rounded-2xl bg-brand-surface text-2xl flex items-center justify-center mb-6 border border-brand-border/60 shadow-sm group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="font-serif text-xl font-bold text-brand-dark mb-2">{item.title}</h3>
                    <p className="text-xs text-brand-muted leading-relaxed">{item.desc}</p>
                  </div>
                </RevealUp>
              ))}
            </div>
          </section>

          {/* 06 TESTIMONIALS SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-6">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-brand-red uppercase tracking-widest block">
                Verified Epicure Reviews
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-brand-dark">
                Loved by Food Lovers.
              </h2>
              <p className="text-sm text-brand-muted">
                Hear what our epicure community has to say about our artisanal delivery quality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sophia Reynolds',
                  role: 'Food & Wine Critic',
                  city: 'Delhi NCR',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                  dish: 'Wild Truffle Pappardelle',
                  quote: 'The packaging kept the pasta piping hot and the truffle aroma intact. Unbelievable restaurant quality right in my home!',
                  rating: 5,
                },
                {
                  name: 'Rohan Sharma',
                  role: 'Tech Lead & Epicure',
                  city: 'Bengaluru',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                  dish: 'Cheesy Beef Burger',
                  quote: 'The 20-minute priority courier delivery was incredibly fast. Foody has completely replaced my regular dining out routines!',
                  rating: 5,
                },
                {
                  name: 'Ananya Verma',
                  role: 'Architect',
                  city: 'Mumbai',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
                  dish: 'Bluefin Tuna Poke Bowl',
                  quote: 'Extremely fresh sushi-grade seafood delivered with ice insulation. Foody sets a brand new benchmark in premium delivery.',
                  rating: 5,
                },
              ].map((review, i) => (
                <RevealUp key={i} delay={i * 0.1}>
                  <div className="bg-white p-8 rounded-[2rem] border border-brand-border/80 shadow-soft-sm hover:shadow-soft-xl transition-all space-y-4 relative">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(review.rating)].map((_, idx) => (
                        <Star key={idx} size={16} fill="currentColor" />
                      ))}
                    </div>

                    <p className="text-xs text-brand-dark font-medium leading-relaxed italic">
                      "{review.quote}"
                    </p>

                    <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-brand-surface"
                        />
                        <div>
                          <h4 className="font-serif text-sm font-bold text-brand-dark">{review.name}</h4>
                          <p className="text-[10px] text-brand-muted">{review.role} • {review.city}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-brand-surface text-brand-red font-bold text-[9px] uppercase tracking-wider">
                        {review.dish}
                      </span>
                    </div>
                  </div>
                </RevealUp>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
