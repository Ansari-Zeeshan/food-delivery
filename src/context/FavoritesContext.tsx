import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';
import { favoriteService } from '../services/favoriteService';

interface FavoritesContextType {
  favoriteFoodIds: string[];
  favoriteRestaurantIds: string[];
  toggleFavoriteFood: (foodId: string) => Promise<void>;
  toggleFavoriteRestaurant: (restaurantId: string) => Promise<void>;
  isFoodFavorite: (foodId: string) => boolean;
  isRestaurantFavorite: (restaurantId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setIsAuthModalOpen } = useAuth();
  const { showToast } = useToast();
  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>([]);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadUserFavorites() {
      if (user && user.id !== 'guest') {
        const favs = await favoriteService.getFavorites(user.id);
        setFavoriteRestaurantIds(favs.favoriteRestaurantIds);
        setFavoriteFoodIds(favs.favoriteFoodIds);
      } else {
        setFavoriteRestaurantIds([]);
        setFavoriteFoodIds([]);
      }
    }

    loadUserFavorites();
  }, [user]);

  const toggleFavoriteFood = async (foodId: string) => {
    if (!user || user.id === 'guest') {
      showToast('Please sign in to save your favorite dishes', 'info');
      setIsAuthModalOpen(true);
      return;
    }

    const isFav = favoriteFoodIds.includes(foodId);
    setFavoriteFoodIds(prev =>
      isFav ? prev.filter(id => id !== foodId) : [...prev, foodId]
    );

    await favoriteService.toggleFavoriteFood(user.id, foodId, isFav);
  };

  const toggleFavoriteRestaurant = async (restaurantId: string) => {
    if (!user || user.id === 'guest') {
      showToast('Please sign in to save your favorite restaurants', 'info');
      setIsAuthModalOpen(true);
      return;
    }

    const isFav = favoriteRestaurantIds.includes(restaurantId);
    setFavoriteRestaurantIds(prev =>
      isFav ? prev.filter(id => id !== restaurantId) : [...prev, restaurantId]
    );

    await favoriteService.toggleFavoriteRestaurant(user.id, restaurantId, isFav);
  };

  const isFoodFavorite = (foodId: string) => favoriteFoodIds.includes(foodId);
  const isRestaurantFavorite = (restaurantId: string) => favoriteRestaurantIds.includes(restaurantId);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteFoodIds,
        favoriteRestaurantIds,
        toggleFavoriteFood,
        toggleFavoriteRestaurant,
        isFoodFavorite,
        isRestaurantFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
};
