import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './components/ui/Toast';

import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';

import { Home } from './pages/Home';
import { RestaurantDiscovery } from './pages/RestaurantDiscovery';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { GlobalMenu } from './pages/GlobalMenu';
import { FoodDetailPage } from './pages/FoodDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentGatewayPage } from './pages/PaymentGatewayPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { OffersPage } from './pages/OffersPage';
import { AboutPage } from './pages/AboutPage';
import { HelpPage } from './pages/HelpPage';
import { AuthPage } from './pages/AuthPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

// ScrollToTop component to reset viewport scroll position on page change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<RestaurantDiscovery />} />
          <Route path="/restaurants/:restaurantId" element={<RestaurantDetail />} />
          <Route path="/menu" element={<GlobalMenu />} />
          <Route path="/food/:foodId" element={<FoodDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/payment" element={<PaymentGatewayPage />} />
          <Route path="/order/:orderId/success" element={<OrderSuccessPage />} />
          <Route path="/orders/:orderId/track" element={<LiveTrackingPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:orderId" element={<LiveTrackingPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<HelpPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <OrderProvider>
                <ScrollToTop />
                <div className="flex flex-col min-h-screen bg-brand-bg text-brand-dark font-sans selection:bg-brand-red selection:text-white">
                  <Header />
                  <CartDrawer />

                  <main className="flex-1">
                    <AnimatedRoutes />
                  </main>

                  <Footer />
                  <MobileNav />
                </div>
              </OrderProvider>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
