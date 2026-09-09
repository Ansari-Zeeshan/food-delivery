import { insforge } from './insforgeClient';
import type { Restaurant, FoodItem, Category } from '../types';

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await insforge.database
      .from('restaurants')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching restaurants:', error);
      return [];
    }

    return (data || []).map(r => ({
      id: r.id,
      name: r.name,
      tagline: r.tagline || '',
      description: r.description || '',
      cuisine: r.cuisine || [],
      rating: parseFloat(r.rating) || 4.5,
      ratingCount: r.rating_count || 0,
      deliveryTime: r.delivery_time || '25-35 min',
      deliveryFee: parseFloat(r.delivery_fee) || 0,
      distance: r.distance || '1.2 miles',
      priceLevel: r.price_level || '$$',
      heroImage: r.hero_image,
      logo: r.logo,
      address: r.address,
      city: r.city || 'Delhi',
      openingHours: r.opening_hours || '10:00 AM - 10:00 PM',
      minOrder: parseFloat(r.min_order) || 15,
      tags: r.tags || [],
      isFeatured: r.is_featured,
      isPopular: r.is_popular,
    }));
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    const { data, error } = await insforge.database
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      tagline: data.tagline || '',
      description: data.description || '',
      cuisine: data.cuisine || [],
      rating: parseFloat(data.rating) || 4.5,
      ratingCount: data.rating_count || 0,
      deliveryTime: data.delivery_time || '25-35 min',
      deliveryFee: parseFloat(data.delivery_fee) || 0,
      distance: data.distance || '1.2 miles',
      priceLevel: data.price_level || '$$',
      heroImage: data.hero_image,
      logo: data.logo,
      address: data.address,
      city: data.city || 'Delhi',
      openingHours: data.opening_hours || '10:00 AM - 10:00 PM',
      minOrder: parseFloat(data.min_order) || 15,
      tags: data.tags || [],
      isFeatured: data.is_featured,
      isPopular: data.is_popular,
    };
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const { data, error } = await insforge.database
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      tagline: data.tagline || '',
      description: data.description || '',
      cuisine: data.cuisine || [],
      rating: parseFloat(data.rating) || 4.5,
      ratingCount: data.rating_count || 0,
      deliveryTime: data.delivery_time || '25-35 min',
      deliveryFee: parseFloat(data.delivery_fee) || 0,
      distance: data.distance || '1.2 miles',
      priceLevel: data.price_level || '$$',
      heroImage: data.hero_image,
      logo: data.logo,
      address: data.address,
      city: data.city || 'Delhi',
      openingHours: data.opening_hours || '10:00 AM - 10:00 PM',
      minOrder: parseFloat(data.min_order) || 15,
      tags: data.tags || [],
      isFeatured: data.is_featured,
      isPopular: data.is_popular,
    };
  },

  async getCategories(): Promise<Category[]> {
    const { data, error } = await insforge.database
      .from('menu_categories')
      .select('*, food_items(count)');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return (data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      itemCount: cat.food_items ? (cat.food_items[0]?.count || 12) : 12,
    }));
  },

  async getFoodItems(restaurantId?: string): Promise<FoodItem[]> {
    let query = insforge.database.from('food_items').select('*');
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data: items, error } = await query;
    if (error || !items) return [];

    const itemIds = items.map(i => i.id);
    const { data: optionGroups } = await insforge.database
      .from('food_option_groups')
      .select('*, food_options(*)')
      .in('food_item_id', itemIds);

    const restIds = [...new Set(items.map(i => i.restaurant_id))];
    const { data: restList } = await insforge.database
      .from('restaurants')
      .select('id, name')
      .in('id', restIds);

    const restMap = new Map((restList || []).map(r => [r.id, r.name]));

    return items.map(item => {
      const groups = (optionGroups || []).filter(g => g.food_item_id === item.id);
      const sizeGroup = groups.find(g => g.name.toLowerCase() === 'size');
      const extraGroup = groups.find(g => g.name.toLowerCase() === 'extras');

      return {
        id: item.id,
        restaurantId: item.restaurant_id,
        restaurantName: restMap.get(item.restaurant_id) || 'Restaurant',
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.base_price),
        image: item.image,
        category: item.category_name as any,
        rating: parseFloat(item.rating) || 4.8,
        ratingCount: item.rating_count || 50,
        prepTime: item.prep_time || '15-20 min',
        isPopular: item.is_popular,
        isDietary: item.is_dietary || [],
        calories: item.calories,
        options: {
          sizes: (sizeGroup?.food_options || []).map((opt: any) => ({
            id: opt.id,
            name: opt.name,
            priceModifier: parseFloat(opt.price_modifier) || 0,
          })),
          extras: (extraGroup?.food_options || []).map((opt: any) => ({
            id: opt.id,
            name: opt.name,
            price: parseFloat(opt.price_modifier) || 0,
          })),
        },
      };
    });
  },

  async getFoodItemById(foodId: string): Promise<FoodItem | null> {
    const items = await this.getFoodItems();
    return items.find(i => i.id === foodId) || null;
  }
};
