import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, FoodItem, FoodExtra, FoodSize, DeliveryOption } from '../types';
import { DELIVERY_OPTIONS, PROMO_COUPONS } from '../data/mockData';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (foodItem: FoodItem, quantity?: number, selectedSize?: FoodSize, selectedExtras?: FoodExtra[], specialInstructions?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  selectedDeliveryOption: DeliveryOption;
  setSelectedDeliveryOption: (option: DeliveryOption) => void;
  total: number;
  totalItemsCount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  lastAddedItem: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('foody_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    return localStorage.getItem('foody_coupon') || null;
  });

  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOption>(DELIVERY_OPTIONS[0]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    localStorage.setItem('foody_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('foody_coupon', appliedCoupon);
    } else {
      localStorage.removeItem('foody_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (
    foodItem: FoodItem,
    quantity = 1,
    selectedSize?: FoodSize,
    selectedExtras: FoodExtra[] = [],
    specialInstructions = ''
  ) => {
    const basePrice = foodItem.price + (selectedSize ? selectedSize.priceModifier : 0);
    const extrasPrice = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = basePrice + extrasPrice;
    const itemTotal = unitPrice * quantity;

    const extrasKey = selectedExtras.map(e => e.id).sort().join(',');
    const sizeKey = selectedSize ? selectedSize.id : 'default';

    const existingIndex = cartItems.findIndex(
      item =>
        item.foodItem.id === foodItem.id &&
        (item.selectedSize?.id || 'default') === sizeKey &&
        item.selectedExtras.map(e => e.id).sort().join(',') === extrasKey &&
        (item.specialInstructions || '') === specialInstructions
    );

    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      updatedCart = [...cartItems];
      const existing = updatedCart[existingIndex];
      const newQty = existing.quantity + quantity;
      const newTotal = (existing.itemTotal / existing.quantity) * newQty;
      updatedCart[existingIndex] = {
        ...existing,
        quantity: newQty,
        itemTotal: newTotal,
      };
      setLastAddedItem(updatedCart[existingIndex]);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        foodItem,
        quantity,
        selectedSize,
        selectedExtras,
        specialInstructions,
        itemTotal,
      };
      updatedCart = [...cartItems, newItem];
      setLastAddedItem(newItem);
    }

    setCartItems(updatedCart);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === cartItemId) {
          const unitPrice = item.itemTotal / item.quantity;
          return {
            ...item,
            quantity: newQuantity,
            itemTotal: unitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const deliveryFee = selectedDeliveryOption.price;

  let discount = 0;
  if (appliedCoupon && PROMO_COUPONS[appliedCoupon]) {
    const rule = PROMO_COUPONS[appliedCoupon];
    if (subtotal >= rule.minSubtotal) {
      discount = Math.min((subtotal * rule.discountPercent) / 100, rule.maxDiscount);
      discount = Math.round(discount * 100) / 100;
    }
  }

  const total = Math.max(0, Math.round((subtotal + tax + deliveryFee - discount) * 100) / 100);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (!PROMO_COUPONS[formatted]) {
      return { success: false, message: 'Invalid coupon code. Try FOODY10 or PREMIUM20' };
    }
    const rule = PROMO_COUPONS[formatted];
    if (subtotal < rule.minSubtotal) {
      return { success: false, message: `Minimum subtotal of $${rule.minSubtotal} required for coupon ${formatted}` };
    }
    setAppliedCoupon(formatted);
    return { success: true, message: `Coupon ${formatted} applied! (${rule.discountPercent}% OFF)` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        deliveryFee,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        selectedDeliveryOption,
        setSelectedDeliveryOption,
        total,
        totalItemsCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
