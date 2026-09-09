export interface FoodExtra {
  id: string;
  name: string;
  price: number;
}

export interface FoodSize {
  id: string;
  name: string;
  priceModifier: number; // e.g. 0 for regular, +4.00 for large
}

export interface FoodOptions {
  sizes?: FoodSize[];
  extras?: FoodExtra[];
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Pizza' | 'Burger' | 'Pasta' | 'Asian' | 'Indian' | 'Desserts' | 'Healthy' | 'Drinks' | 'Chicken' | 'Sides';
  rating: number;
  ratingCount: number;
  prepTime: string;
  isPopular?: boolean;
  badge?: 'NEW' | 'BESTSELLER' | 'TRENDING';
  portionSize?: 'Regular' | 'Large' | 'Family';
  mealTime?: ('Breakfast' | 'Snacks' | 'Dinner' | 'Late Night')[];
  isSpicy?: boolean;
  isDietary?: ('Vegan' | 'Vegetarian' | 'Gluten-Free' | 'Halal')[];
  options?: FoodOptions;
  calories?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  cuisine: string[];
  rating: number;
  ratingCount: number;
  deliveryTime: string;
  deliveryFee: number;
  distance: string;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  heroImage: string;
  logo: string;
  address: string;
  city?: string;
  openingHours: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  isPartner?: boolean;
  externalPlaceId?: string;
  latitude?: number;
  longitude?: number;
  deliveryRadiusKm?: number;
  distanceKm?: number;
  isServiceable?: boolean;
  serviceabilityReason?: string;
  acceptsOrders?: boolean;
}

export interface CartItem {
  id: string; // unique cart entry id
  foodItem: FoodItem;
  quantity: number;
  selectedSize?: FoodSize;
  selectedExtras: FoodExtra[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface DeliveryAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  instructions?: string;
  isDefault?: boolean;
}

export type DeliveryMethodType = 'standard' | 'express' | 'scheduled';

export interface DeliveryOption {
  type: DeliveryMethodType;
  title: string;
  duration: string;
  price: number;
  description: string;
}

export type PaymentMethodType = 'card' | 'upi' | 'wallet' | 'cod' | 'apple_pay';

export interface PaymentCardDetails {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
  avatar: string;
  deliveriesCount: number;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderTimelineStep {
  stage: OrderStatus;
  title: string;
  description: string;
  time: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLogo: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  couponCode?: string;
  total: number;
  address: DeliveryAddress;
  deliveryMethod: DeliveryOption;
  paymentMethod: PaymentMethodType;
  paymentLast4?: string;
  status: OrderStatus;
  estimatedArrival: string;
  createdAt: string;
  courier?: Courier;
  timeline: OrderTimelineStep[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: DeliveryAddress[];
  favoriteFoodIds: string[];
  favoriteRestaurantIds: string[];
}
