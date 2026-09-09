import { insforge } from './insforgeClient';
import type { CartItem, DeliveryAddress, DeliveryOption, PaymentMethodType } from '../types';

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  subtotal?: number;
  deliveryFee?: number;
  tax?: number;
  discount?: number;
  total?: number;
  error?: string;
}

export const checkoutService = {
  async validateCoupon(code: string, subtotal: number) {
    if (!code) return { valid: false, discount: 0, message: '' };

    const { data: promo, error } = await insforge.database
      .from('promotions')
      .select('*')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !promo) {
      return { valid: false, discount: 0, message: 'Invalid promo code' };
    }

    const minAmount = parseFloat(promo.min_order_amount) || 0;
    if (subtotal < minAmount) {
      return { valid: false, discount: 0, message: `Minimum order amount of $${minAmount.toFixed(2)} required for code ${promo.code}` };
    }

    let discount = 0;
    const value = parseFloat(promo.discount_value) || 0;

    if (promo.discount_type === 'percentage') {
      discount = (subtotal * (value / 100));
    } else if (promo.discount_type === 'fixed') {
      discount = Math.min(subtotal, value);
    } else if (promo.discount_type === 'free_delivery') {
      discount = 2.99;
    }

    return {
      valid: true,
      discount: Math.round(discount * 100) / 100,
      code: promo.code,
      message: `${promo.code} applied! You saved $${discount.toFixed(2)}`,
    };
  },

  async createCheckoutOrder(params: {
    userId?: string;
    restaurantId: string;
    items: CartItem[];
    address: DeliveryAddress;
    deliveryMethod: DeliveryOption;
    paymentMethod: PaymentMethodType;
    paymentLast4?: string;
    couponCode?: string;
  }): Promise<CheckoutResult> {
    const formattedItems = params.items.map(item => ({
      food_item_id: item.foodItem.id,
      quantity: item.quantity,
      selected_size_id: item.selectedSize?.id || null,
      selected_extra_ids: item.selectedExtras.map(e => e.id),
      special_instructions: item.specialInstructions || null,
    }));

    const { data, error } = await insforge.database.rpc('create_order_checkout', {
      p_user_id: params.userId || null,
      p_restaurant_id: params.restaurantId,
      p_items: formattedItems,
      p_address: params.address,
      p_delivery_method: params.deliveryMethod,
      p_payment_method: params.paymentMethod,
      p_payment_last4: params.paymentLast4 || '4242',
      p_coupon_code: params.couponCode || null,
    });

    if (error) {
      console.error('RPC Checkout Error:', error);
      return { success: false, error: error.message || 'Checkout failed' };
    }

    return {
      success: true,
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      subtotal: parseFloat(data.subtotal),
      deliveryFee: parseFloat(data.deliveryFee),
      tax: parseFloat(data.tax),
      discount: parseFloat(data.discount),
      total: parseFloat(data.total),
    };
  }
};
