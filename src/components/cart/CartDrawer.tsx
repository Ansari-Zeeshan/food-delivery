import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    total,
    deliveryFee,
    tax,
    discount,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  const handleViewFullCart = () => {
    setIsCartDrawerOpen(false);
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartDrawerOpen(false)}
          className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-screen max-w-md bg-white shadow-soft-lg flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface-light">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-red" />
                <h3 className="font-serif text-xl font-bold text-brand-dark">Your Order</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-dark text-white ml-2">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
                </span>
              </div>

              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-dark hover:bg-brand-surface transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Cart Items List */}
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-brand-surface flex items-center justify-center text-brand-muted">
                  <ShoppingBag size={36} />
                </div>
                <h4 className="font-serif text-xl font-bold text-brand-dark">Your cart is empty</h4>
                <p className="text-xs text-brand-muted max-w-xs">
                  Discover exceptional food from top artisanal restaurants around you.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/restaurants');
                  }}
                >
                  Explore Restaurants
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cartItems.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-brand-border/60 bg-brand-surface-light flex gap-4 relative group"
                    >
                      <img
                        src={item.foodItem.image}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-sm font-bold text-brand-dark truncate">
                            {item.foodItem.name}
                          </h5>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-brand-muted hover:text-brand-red transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {item.selectedSize && (
                          <p className="text-[11px] text-brand-muted">Size: {item.selectedSize.name}</p>
                        )}
                        {item.selectedExtras.length > 0 && (
                          <p className="text-[11px] text-brand-muted truncate">
                            Extras: {item.selectedExtras.map(e => e.name).join(', ')}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-extrabold text-brand-dark">
                            ${item.itemTotal.toFixed(2)}
                          </span>

                          {/* Stepper */}
                          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-brand-border">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-brand-surface text-brand-dark"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-brand-surface text-brand-dark"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Summary & Checkout */}
                <div className="p-6 bg-white border-t border-brand-border space-y-4 shadow-lg">
                  <div className="space-y-2 text-xs font-medium text-brand-muted">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-brand-dark font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Est. Taxes & Fees</span>
                      <span className="text-brand-dark font-bold">${(tax + deliveryFee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-brand-dark pt-2 border-t border-brand-border">
                      <span>Total Amount</span>
                      <span className="text-brand-red">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button variant="secondary" size="md" onClick={handleViewFullCart}>
                      View Cart Page
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleCheckoutClick}
                      icon={<ArrowRight size={16} />}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
