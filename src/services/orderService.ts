import { insforge } from './insforgeClient';
import type { Order, OrderStatus, OrderTimelineStep } from '../types';

export const orderService = {
  async getUserOrders(userId: string): Promise<Order[]> {
    if (!userId) return [];

    const { data: orders, error } = await insforge.database
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !orders) return [];

    return orders.map(o => this.mapOrderFromDB(o));
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const { data: o, error } = await insforge.database
      .from('orders')
      .select('*, order_items(*), order_status_history(*)')
      .eq('id', orderId)
      .single();

    if (error || !o) return null;

    return this.mapOrderFromDB(o);
  },

  mapOrderFromDB(o: any): Order {
    const status = o.status as OrderStatus;

    const timeline: OrderTimelineStep[] = [
      {
        stage: 'confirmed',
        title: 'Order Confirmed',
        description: 'Restaurant accepted your order',
        time: 'Just now',
        completed: true,
        current: status === 'confirmed',
      },
      {
        stage: 'preparing',
        title: 'Preparing Food',
        description: 'Chef is crafting your fresh dish',
        time: 'Estimated 15 min',
        completed: ['preparing', 'out_for_delivery', 'delivered'].includes(status),
        current: status === 'preparing',
      },
      {
        stage: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Courier picked up and is on the way',
        time: 'Estimated 10 min',
        completed: ['out_for_delivery', 'delivered'].includes(status),
        current: status === 'out_for_delivery',
      },
      {
        stage: 'delivered',
        title: 'Delivered',
        description: 'Enjoy your delicious meal!',
        time: 'Delivered',
        completed: status === 'delivered',
        current: status === 'delivered',
      },
    ];

    const items = (o.order_items || []).map((item: any) => ({
      id: item.id,
      foodItem: {
        id: item.food_item_id || item.id,
        restaurantId: o.restaurant_id,
        restaurantName: o.restaurant_name,
        name: item.food_name,
        description: '',
        price: parseFloat(item.food_price),
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        category: 'Pasta' as const,
        rating: 4.9,
        ratingCount: 100,
        prepTime: '20 min',
      },
      quantity: item.quantity,
      selectedSize: item.selected_size_json ? {
        id: item.selected_size_json.id,
        name: item.selected_size_json.name,
        priceModifier: parseFloat(item.selected_size_json.priceModifier || 0),
      } : undefined,
      selectedExtras: (item.selected_extras_json || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        price: parseFloat(e.price || 0),
      })),
      specialInstructions: item.special_instructions || '',
      itemTotal: parseFloat(item.item_total),
    }));

    return {
      id: o.id,
      orderNumber: o.order_number,
      restaurantId: o.restaurant_id,
      restaurantName: o.restaurant_name,
      restaurantLogo: o.restaurant_logo || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
      items,
      subtotal: parseFloat(o.subtotal),
      deliveryFee: parseFloat(o.delivery_fee),
      tax: parseFloat(o.tax),
      discount: parseFloat(o.discount || 0),
      couponCode: o.coupon_code,
      total: parseFloat(o.total),
      address: o.address_json,
      deliveryMethod: o.delivery_method_json,
      paymentMethod: o.payment_method,
      paymentLast4: o.payment_last4 || '4242',
      status,
      estimatedArrival: o.estimated_arrival || '30 min',
      createdAt: o.created_at,
      courier: o.courier_json,
      timeline,
    };
  }
};
