import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Order, CartItem, DeliveryAddress, DeliveryOption, PaymentMethodType, OrderTimelineStep } from '../types';
import { DEFAULT_COURIER } from '../data/mockData';
import { checkoutService } from '../services/checkoutService';
import { orderService } from '../services/orderService';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (
    items: CartItem[],
    subtotal: number,
    deliveryFee: number,
    tax: number,
    discount: number,
    total: number,
    address: DeliveryAddress,
    deliveryMethod: DeliveryOption,
    paymentMethod: PaymentMethodType,
    paymentLast4?: string,
    couponCode?: string
  ) => Promise<Order>;
  getOrderById: (orderId: string) => Order | undefined;
  reorderItems: (orderId: string) => CartItem[];
  loading: boolean;
}

const sampleTimeline: OrderTimelineStep[] = [
  { stage: 'confirmed', title: 'Order Confirmed', description: 'Restaurant received your order.', time: 'Just now', completed: true, current: false },
  { stage: 'preparing', title: 'Preparing Food', description: 'Chef is crafting your fresh dishes.', time: '10 min left', completed: true, current: false },
  { stage: 'out_for_delivery', title: 'Out for Delivery', description: 'Courier Marco is en route to your address.', time: '14 min left', completed: false, current: true },
  { stage: 'delivered', title: 'Delivered', description: 'Handed directly to you.', time: 'Est. 24 min', completed: false, current: false },
];

const mockInitialOrder: Order = {
  id: 'ord-10284',
  orderNumber: 'FD-10284',
  restaurantId: '11111111-1111-1111-1111-111111111111',
  restaurantName: 'Casa Verde Trattoria',
  restaurantLogo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
  items: [
    {
      id: 'item-1',
      foodItem: {
        id: 'b1111111-1111-1111-1111-111111111111',
        restaurantId: '11111111-1111-1111-1111-111111111111',
        restaurantName: 'Casa Verde Trattoria',
        name: 'Wild Truffle & Porcini Pappardelle',
        description: 'Hand-rolled wide ribbon pasta served with fresh black winter truffle shaved tableside.',
        price: 24.50,
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281358?auto=format&fit=crop&w=800&q=80',
        category: 'Pasta',
        rating: 4.9,
        ratingCount: 142,
        prepTime: '20 min',
      },
      quantity: 1,
      selectedExtras: [{ id: 'ex-truffle', name: 'Extra Shaved Winter Truffle', price: 8.00 }],
      itemTotal: 32.50,
    },
  ],
  subtotal: 32.50,
  deliveryFee: 0,
  tax: 2.60,
  discount: 0,
  total: 35.10,
  address: {
    id: 'addr-1',
    label: 'Home',
    name: 'Alex Morgan',
    phone: '+1 (555) 234-5678',
    street: '742 Evergreen Terrace',
    apartment: 'Apt 4B',
    city: 'San Francisco',
    postalCode: '94107',
  },
  deliveryMethod: {
    type: 'standard',
    title: 'Standard Delivery',
    duration: '30–40 min',
    price: 0,
    description: 'Free standard delivery',
  },
  paymentMethod: 'card',
  paymentLast4: '4821',
  status: 'out_for_delivery',
  estimatedArrival: '24 min',
  createdAt: '12:30 PM',
  courier: DEFAULT_COURIER,
  timeline: sampleTimeline,
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([mockInitialOrder]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadUserOrders() {
      if (user && user.id !== 'guest') {
        setLoading(true);
        const userOrders = await orderService.getUserOrders(user.id);
        if (userOrders.length > 0) {
          setOrders(userOrders);
        }
        setLoading(false);
      }
    }

    loadUserOrders();
  }, [user]);

  const activeOrder = orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled') || orders[0] || null;

  const placeOrder = async (
    items: CartItem[],
    subtotal: number,
    deliveryFee: number,
    tax: number,
    discount: number,
    total: number,
    address: DeliveryAddress,
    deliveryMethod: DeliveryOption,
    paymentMethod: PaymentMethodType,
    paymentLast4?: string,
    couponCode?: string
  ): Promise<Order> => {
    const restaurantId = items[0]?.foodItem.restaurantId || '11111111-1111-1111-1111-111111111111';
    const restaurantName = items[0]?.foodItem.restaurantName || 'Casa Verde Trattoria';

    let orderId = `ord-${Date.now()}`;
    let orderNum = `FD-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const result = await checkoutService.createCheckoutOrder({
        userId: user && user.id !== 'guest' ? user.id : undefined,
        restaurantId,
        items,
        address,
        deliveryMethod,
        paymentMethod,
        paymentLast4,
        couponCode,
      });

      if (result.success && result.orderId) {
        orderId = result.orderId;
        orderNum = result.orderNumber || orderNum;
        subtotal = result.subtotal ?? subtotal;
        deliveryFee = result.deliveryFee ?? deliveryFee;
        tax = result.tax ?? tax;
        discount = result.discount ?? discount;
        total = result.total ?? total;
      }
    } catch (err) {
      console.warn('Backend RPC checkout fallback to local order format:', err);
    }

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNum,
      restaurantId,
      restaurantName,
      restaurantLogo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
      items,
      subtotal,
      deliveryFee,
      tax,
      discount,
      couponCode,
      total,
      address,
      deliveryMethod,
      paymentMethod,
      paymentLast4: paymentLast4 || '4242',
      status: 'confirmed',
      estimatedArrival: '25-35 min',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      courier: DEFAULT_COURIER,
      timeline: [
        { stage: 'confirmed', title: 'Order Confirmed', description: 'Restaurant received your order.', time: 'Just now', completed: true, current: true },
        { stage: 'preparing', title: 'Preparing Food', description: 'Chef is crafting your fresh dishes.', time: 'In progress', completed: false, current: false },
        { stage: 'out_for_delivery', title: 'Out for Delivery', description: 'Courier Marco will be en route shortly.', time: 'Pending', completed: false, current: false },
        { stage: 'delivered', title: 'Delivered', description: 'Handed directly to you.', time: 'Pending', completed: false, current: false },
      ],
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrderById = (orderId: string) => {
    return orders.find(o => o.id === orderId || o.orderNumber === orderId);
  };

  const reorderItems = (orderId: string) => {
    const target = getOrderById(orderId);
    return target ? target.items : [];
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrder,
        placeOrder,
        getOrderById,
        reorderItems,
        loading,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};
