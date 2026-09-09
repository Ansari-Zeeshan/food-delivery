import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
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
  const { user } = useAuth();
  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>(['b1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444', 'b7777777-7777-7777-7777-777777777777']);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>(['11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333']);

  useEffect(() => {
    async function loadUserFavorites() {
      if (user && user.id !== 'guest') {
        const favs = await favoriteService.getFavorites(user.id);
        if (favs.favoriteRestaurantIds.length > 0 || favs.favoriteFoodIds.length > 0) {
          setFavoriteRestaurantIds(favs.favoriteRestaurantIds);
          setFavoriteFoodIds(favs.favoriteFoodIds);
        }
      }
    }

    loadUserFavorites();
  }, [user]);

  const toggleFavoriteFood = async (foodId: string) => {
    const isFav = favoriteFoodIds.includes(foodId);
    setFavoriteFoodIds(prev =>
      isFav ? prev.filter(id => id !== foodId) : [...prev, foodId]
    );

    if (user && user.id !== 'guest') {
      await favoriteService.toggleFavoriteFood(user.id, foodId, isFav);
    }
  };

  const toggleFavoriteRestaurant = async (restaurantId: string) => {
    const isFav = favoriteRestaurantIds.includes(restaurantId);
    setFavoriteRestaurantIds(prev =>
      isFav ? prev.filter(id => id !== restaurantId) : [...prev, restaurantId]
    );

    if (user && user.id !== 'guest') {
      await favoriteService.toggleFavoriteRestaurant(user.id, restaurantId, isFav);
    }
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
