import { insforge } from './insforgeClient';

export const favoriteService = {
  async getFavorites(userId: string) {
    if (!userId) return { favoriteRestaurantIds: [], favoriteFoodIds: [] };

    const [restRes, foodRes] = await Promise.all([
      insforge.database.from('favorite_restaurants').select('restaurant_id').eq('user_id', userId),
      insforge.database.from('favorite_foods').select('food_item_id').eq('user_id', userId),
    ]);

    return {
      favoriteRestaurantIds: (restRes.data || []).map(r => r.restaurant_id),
      favoriteFoodIds: (foodRes.data || []).map(f => f.food_item_id),
    };
  },

  async toggleFavoriteRestaurant(userId: string, restaurantId: string, isFav: boolean) {
    if (!userId) return;

    if (isFav) {
      await insforge.database
        .from('favorite_restaurants')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId);
    } else {
      await insforge.database
        .from('favorite_restaurants')
        .insert([{ user_id: userId, restaurant_id: restaurantId }]);
    }
  },

  async toggleFavoriteFood(userId: string, foodItemId: string, isFav: boolean) {
    if (!userId) return;

    if (isFav) {
      await insforge.database
        .from('favorite_foods')
        .delete()
        .eq('user_id', userId)
        .eq('food_item_id', foodItemId);
    } else {
      await insforge.database
        .from('favorite_foods')
        .insert([{ user_id: userId, food_item_id: foodItemId }]);
    }
  }
};
