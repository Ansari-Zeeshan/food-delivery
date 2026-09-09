import { insforge } from './insforgeClient';
import type { CartItem } from '../types';
import { restaurantService } from './restaurantService';

export const cartService = {
  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) return null;

    let query = insforge.database.from('carts').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: existingCart } = await query.maybeSingle();

    if (existingCart) return existingCart;

    // Create new cart
    const { data: newCart, error } = await insforge.database
      .from('carts')
      .insert([{ user_id: userId || null, session_id: sessionId || null }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create cart:', error);
      return null;
    }

    return newCart;
  },

  async getCartItems(cartId: string): Promise<CartItem[]> {
    const { data: items, error } = await insforge.database
      .from('cart_items')
      .select('*, cart_item_options(option_id)')
      .eq('cart_id', cartId);

    if (error || !items || items.length === 0) return [];

    const allFoodItems = await restaurantService.getFoodItems();
    const foodMap = new Map(allFoodItems.map(f => [f.id, f]));

    const result: CartItem[] = [];

    for (const item of items) {
      const foodItem = foodMap.get(item.food_item_id);
      if (!foodItem) continue;

      const selectedSize = foodItem.options?.sizes?.find(s => s.id === item.selected_size_id);
      const optionIds = (item.cart_item_options || []).map((o: any) => o.option_id);
      const selectedExtras = (foodItem.options?.extras || []).filter(e => optionIds.includes(e.id));

      const sizeModifier = selectedSize ? selectedSize.priceModifier : 0;
      const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
      const unitPrice = foodItem.price + sizeModifier + extrasTotal;
      const itemTotal = unitPrice * item.quantity;

      result.push({
        id: item.id,
        foodItem,
        quantity: item.quantity,
        selectedSize,
        selectedExtras,
        specialInstructions: item.special_instructions || '',
        itemTotal,
      });
    }

    return result;
  },

  async addItemToCart(
    cartId: string,
    foodItemId: string,
    quantity: number,
    selectedSizeId?: string,
    selectedExtraIds: string[] = [],
    specialInstructions: string = ''
  ) {
    const { data: item, error } = await insforge.database
      .from('cart_items')
      .insert([{
        cart_id: cartId,
        food_item_id: foodItemId,
        quantity,
        selected_size_id: selectedSizeId || null,
        special_instructions: specialInstructions || null,
      }])
      .select()
      .single();

    if (error || !item) {
      console.error('Failed to add cart item:', error);
      return false;
    }

    if (selectedExtraIds.length > 0) {
      const optionsToInsert = selectedExtraIds.map(optionId => ({
        cart_item_id: item.id,
        option_id: optionId,
      }));
      await insforge.database.from('cart_item_options').insert(optionsToInsert);
    }

    return true;
  },

  async updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(cartItemId);
    }

    const { error } = await insforge.database
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    return !error;
  },

  async removeItem(cartItemId: string) {
    const { error } = await insforge.database
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    return !error;
  },

  async clearCart(cartId: string) {
    const { error } = await insforge.database
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    return !error;
  }
};
