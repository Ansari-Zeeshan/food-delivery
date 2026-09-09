-- InsForge PostgreSQL Schema for Food Delivery Application

-- 1. EXTENSIONS & HELPER TRGS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  default_address_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  delivery_instructions TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  cuisine TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 4.5,
  rating_count INT DEFAULT 100,
  hero_image TEXT,
  logo TEXT,
  address TEXT,
  opening_hours TEXT DEFAULT '10:00 AM - 10:00 PM',
  delivery_time TEXT DEFAULT '25-35 min',
  delivery_fee NUMERIC(10,2) DEFAULT 2.99,
  min_order NUMERIC(10,2) DEFAULT 10.00,
  price_level TEXT DEFAULT '$$',
  distance TEXT DEFAULT '1.2 km',
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MENU CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FOOD ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  image TEXT,
  rating NUMERIC(3,2) DEFAULT 4.8,
  rating_count INT DEFAULT 50,
  prep_time TEXT DEFAULT '15-20 min',
  calories INT,
  is_popular BOOLEAN DEFAULT false,
  is_dietary TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FOOD OPTION GROUPS & OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.food_option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'single',
  is_required BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.food_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_group_id UUID NOT NULL REFERENCES public.food_option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier NUMERIC(10,2) DEFAULT 0.00
);

-- 8. CARTS & CART ITEMS TABLES
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  session_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  selected_size_id UUID REFERENCES public.food_options(id) ON DELETE SET NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_item_id UUID NOT NULL REFERENCES public.cart_items(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.food_options(id) ON DELETE CASCADE
);

-- 9. PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ORDERS & ORDER DETAILS TABLES
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
  restaurant_name TEXT NOT NULL,
  restaurant_logo TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0.00,
  coupon_code TEXT,
  total NUMERIC(10,2) NOT NULL,
  address_json JSONB NOT NULL,
  delivery_method_json JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  payment_last4 TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  estimated_arrival TEXT DEFAULT '30-40 min',
  courier_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE RESTRICT,
  food_name TEXT NOT NULL,
  food_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  selected_size_json JSONB,
  selected_extras_json JSONB,
  special_instructions TEXT,
  item_total NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. COURIERS TABLE
CREATE TABLE IF NOT EXISTS public.couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  rating NUMERIC(3,2) DEFAULT 4.9,
  vehicle TEXT DEFAULT 'Bicycle',
  avatar TEXT,
  deliveries_count INT DEFAULT 150
);

-- 12. FAVORITES TABLES
CREATE TABLE IF NOT EXISTS public.favorite_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

CREATE TABLE IF NOT EXISTS public.favorite_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_item_id)
);

-- 13. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public restaurants read" ON public.restaurants;
CREATE POLICY "Public restaurants read" ON public.restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public menu categories read" ON public.menu_categories;
CREATE POLICY "Public menu categories read" ON public.menu_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public food items read" ON public.food_items;
CREATE POLICY "Public food items read" ON public.food_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public food option groups read" ON public.food_option_groups;
CREATE POLICY "Public food option groups read" ON public.food_option_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public food options read" ON public.food_options;
CREATE POLICY "Public food options read" ON public.food_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public promotions read" ON public.promotions;
CREATE POLICY "Public promotions read" ON public.promotions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public couriers read" ON public.couriers;
CREATE POLICY "Public couriers read" ON public.couriers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public reviews read" ON public.reviews;
CREATE POLICY "Public reviews read" ON public.reviews FOR SELECT USING (true);

-- User-scoped policies
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users view own addresses" ON public.addresses;
CREATE POLICY "Users view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own address" ON public.addresses;
CREATE POLICY "Users insert own address" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own address" ON public.addresses;
CREATE POLICY "Users update own address" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own address" ON public.addresses;
CREATE POLICY "Users delete own address" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own cart" ON public.carts;
CREATE POLICY "Users view own cart" ON public.carts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own cart" ON public.carts;
CREATE POLICY "Users insert own cart" ON public.carts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own cart" ON public.carts;
CREATE POLICY "Users update own cart" ON public.carts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Cart items select" ON public.cart_items;
CREATE POLICY "Cart items select" ON public.cart_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cart items insert" ON public.cart_items;
CREATE POLICY "Cart items insert" ON public.cart_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Cart items update" ON public.cart_items;
CREATE POLICY "Cart items update" ON public.cart_items FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Cart items delete" ON public.cart_items;
CREATE POLICY "Cart items delete" ON public.cart_items FOR DELETE USING (true);

DROP POLICY IF EXISTS "Cart item options select" ON public.cart_item_options;
CREATE POLICY "Cart item options select" ON public.cart_item_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cart item options insert" ON public.cart_item_options;
CREATE POLICY "Cart item options insert" ON public.cart_item_options FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users insert own order" ON public.orders;
CREATE POLICY "Users insert own order" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Order items select" ON public.order_items;
CREATE POLICY "Order items select" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Order items insert" ON public.order_items;
CREATE POLICY "Order items insert" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Order status history select" ON public.order_status_history;
CREATE POLICY "Order status history select" ON public.order_status_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Order status history insert" ON public.order_status_history;
CREATE POLICY "Order status history insert" ON public.order_status_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users view favorite restaurants" ON public.favorite_restaurants;
CREATE POLICY "Users view favorite restaurants" ON public.favorite_restaurants FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert favorite restaurant" ON public.favorite_restaurants;
CREATE POLICY "Users insert favorite restaurant" ON public.favorite_restaurants FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete favorite restaurant" ON public.favorite_restaurants;
CREATE POLICY "Users delete favorite restaurant" ON public.favorite_restaurants FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view favorite foods" ON public.favorite_foods;
CREATE POLICY "Users view favorite foods" ON public.favorite_foods FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert favorite food" ON public.favorite_foods;
CREATE POLICY "Users insert favorite food" ON public.favorite_foods FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete favorite food" ON public.favorite_foods;
CREATE POLICY "Users delete favorite food" ON public.favorite_foods FOR DELETE USING (auth.uid() = user_id);

-- 15. ATOMIC CHECKOUT RPC FUNCTION
CREATE OR REPLACE FUNCTION public.create_order_checkout(
  p_user_id UUID,
  p_restaurant_id UUID,
  p_items JSONB,
  p_address JSONB,
  p_delivery_method JSONB,
  p_payment_method TEXT,
  p_payment_last4 TEXT,
  p_coupon_code TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_rest RECORD;
  v_subtotal NUMERIC(10,2) := 0.00;
  v_item JSONB;
  v_food RECORD;
  v_size RECORD;
  v_extra_id TEXT;
  v_extra RECORD;
  v_item_price NUMERIC(10,2);
  v_item_total NUMERIC(10,2);
  v_delivery_fee NUMERIC(10,2);
  v_tax NUMERIC(10,2);
  v_discount NUMERIC(10,2) := 0.00;
  v_promo RECORD;
  v_total NUMERIC(10,2);
  v_size_json JSONB;
  v_extras_json JSONB;
  v_courier RECORD;
BEGIN
  -- Verify Restaurant
  SELECT * INTO v_rest FROM public.restaurants WHERE id = p_restaurant_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant not found';
  END IF;

  v_delivery_fee := COALESCE((p_delivery_method->>'price')::NUMERIC, v_rest.delivery_fee);

  -- Process and validate each item against DB prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_food FROM public.food_items WHERE id = (v_item->>'food_item_id')::UUID;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Food item not found: %', v_item->>'food_item_id';
    END IF;

    v_item_price := v_food.base_price;
    v_size_json := NULL;
    v_extras_json := '[]'::JSONB;

    -- Add Size Price Modifier
    IF v_item->>'selected_size_id' IS NOT NULL AND v_item->>'selected_size_id' != '' THEN
      SELECT * INTO v_size FROM public.food_options WHERE id = (v_item->>'selected_size_id')::UUID;
      IF FOUND THEN
        v_item_price := v_item_price + v_size.price_modifier;
        v_size_json := jsonb_build_object('id', v_size.id, 'name', v_size.name, 'priceModifier', v_size.price_modifier);
      END IF;
    END IF;

    -- Add Extras Price Modifiers
    IF v_item->'selected_extra_ids' IS NOT NULL AND jsonb_array_length(v_item->'selected_extra_ids') > 0 THEN
      FOR v_extra_id IN SELECT jsonb_array_elements_text(v_item->'selected_extra_ids') LOOP
        SELECT * INTO v_extra FROM public.food_options WHERE id = v_extra_id::UUID;
        IF FOUND THEN
          v_item_price := v_item_price + v_extra.price_modifier;
          v_extras_json := v_extras_json || jsonb_build_object('id', v_extra.id, 'name', v_extra.name, 'price', v_extra.price_modifier);
        END IF;
      END LOOP;
    END IF;

    v_item_total := v_item_price * (v_item->>'quantity')::INT;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  -- Validate Promo Code
  IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
    SELECT * INTO v_promo FROM public.promotions WHERE LOWER(code) = LOWER(p_coupon_code) AND is_active = true;
    IF FOUND THEN
      IF v_subtotal >= v_promo.min_order_amount THEN
        IF v_promo.discount_type = 'percentage' THEN
          v_discount := ROUND((v_subtotal * (v_promo.discount_value / 100.0)), 2);
        ELSIF v_promo.discount_type = 'fixed' THEN
          v_discount := LEAST(v_subtotal, v_promo.discount_value);
        ELSIF v_promo.discount_type = 'free_delivery' THEN
          v_discount := v_delivery_fee;
        END IF;
      END IF;
    END IF;
  END IF;

  -- Compute Tax (8%) & Total
  v_tax := ROUND((v_subtotal * 0.08), 2);
  v_total := GREATEST(0.00, v_subtotal + v_delivery_fee + v_tax - v_discount);

  -- Generate Order Number (e.g. FD-84920)
  v_order_number := 'FD-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

  -- Get Courier
  SELECT * INTO v_courier FROM public.couriers ORDER BY RANDOM() LIMIT 1;

  -- Insert Order Record
  INSERT INTO public.orders (
    order_number, user_id, restaurant_id, restaurant_name, restaurant_logo,
    subtotal, delivery_fee, tax, discount, coupon_code, total,
    address_json, delivery_method_json, payment_method, payment_last4,
    status, estimated_arrival, courier_json
  ) VALUES (
    v_order_number, p_user_id, p_restaurant_id, v_rest.name, v_rest.logo,
    v_subtotal, v_delivery_fee, v_tax, v_discount, p_coupon_code, v_total,
    p_address, p_delivery_method, p_payment_method, p_payment_last4,
    'confirmed', '25-35 min',
    jsonb_build_object('id', v_courier.id, 'name', v_courier.name, 'phone', v_courier.phone, 'rating', v_courier.rating, 'vehicle', v_courier.vehicle, 'avatar', v_courier.avatar)
  ) RETURNING id INTO v_order_id;

  -- Insert Order Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_food FROM public.food_items WHERE id = (v_item->>'food_item_id')::UUID;
    v_item_price := v_food.base_price;
    
    IF v_item->>'selected_size_id' IS NOT NULL AND v_item->>'selected_size_id' != '' THEN
      SELECT * INTO v_size FROM public.food_options WHERE id = (v_item->>'selected_size_id')::UUID;
      IF FOUND THEN
        v_item_price := v_item_price + v_size.price_modifier;
      END IF;
    END IF;

    IF v_item->'selected_extra_ids' IS NOT NULL AND jsonb_array_length(v_item->'selected_extra_ids') > 0 THEN
      FOR v_extra_id IN SELECT jsonb_array_elements_text(v_item->'selected_extra_ids') LOOP
        SELECT * INTO v_extra FROM public.food_options WHERE id = v_extra_id::UUID;
        IF FOUND THEN
          v_item_price := v_item_price + v_extra.price_modifier;
        END IF;
      END LOOP;
    END IF;

    v_item_total := v_item_price * (v_item->>'quantity')::INT;

    INSERT INTO public.order_items (
      order_id, food_item_id, food_name, food_price, quantity,
      selected_size_json, selected_extras_json, special_instructions, item_total
    ) VALUES (
      v_order_id, v_food.id, v_food.name, v_item_price, (v_item->>'quantity')::INT,
      v_size_json, v_extras_json, v_item->>'special_instructions', v_item_total
    );
  END LOOP;

  -- Insert Order Status History
  INSERT INTO public.order_status_history (order_id, status, title, description)
  VALUES (v_order_id, 'confirmed', 'Order Confirmed', 'The restaurant has received your order and is reviewing it.');

  RETURN jsonb_build_object(
    'success', true,
    'orderId', v_order_id,
    'orderNumber', v_order_number,
    'subtotal', v_subtotal,
    'deliveryFee', v_delivery_fee,
    'tax', v_tax,
    'discount', v_discount,
    'total', v_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
