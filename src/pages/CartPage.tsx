import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    tax,
    deliveryFee,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    total,
  } = useCart();

  const { showToast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      showToast(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-brand-surface text-brand-muted flex items-center justify-center mx-auto">
          <ShoppingBag size={48} />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark">
          Your Next Craving is Waiting.
        </h1>
        <p className="text-sm text-brand-muted max-w-md mx-auto">
          Your cart is currently empty. Explore our curated restaurant menus and discover exceptional dishes.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/menu')}>
          EXPLORE MENU NOW
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-red flex items-center gap-1.5">
          Review Order
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-dark">
          Your Shopping Cart
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map(item => (
            <div
              key={item.id}
              className="p-5 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.foodItem.image}
                  alt={item.foodItem.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-brand-dark">
                    {item.foodItem.name}
                  </h3>
                  <p className="text-xs text-brand-muted font-medium">
                    {item.foodItem.restaurantName}
                  </p>
                  {item.selectedSize && (
                    <span className="text-[11px] font-semibold text-brand-dark bg-brand-surface px-2 py-0.5 rounded-full inline-block">
                      Size: {item.selectedSize.name}
                    </span>
                  )}
                  {item.selectedExtras.length > 0 && (
                    <p className="text-xs text-brand-muted">
                      Extras: {item.selectedExtras.map(e => e.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-brand-border/40">
                {/* Stepper */}
                <div className="flex items-center gap-3 bg-brand-surface px-3 py-1.5 rounded-full border border-brand-border">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-brand-dark"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-extrabold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-brand-dark"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span className="text-lg font-extrabold text-brand-dark">
                  ${item.itemTotal.toFixed(2)}
                </span>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-brand-muted hover:text-brand-red transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Promo Coupon Form */}
          <div className="p-6 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
              <Tag size={16} className="text-brand-red" /> Have a Coupon or Promo Code?
            </h4>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-xs font-bold text-brand-green flex items-center gap-2">
                  <Check size={16} /> Coupon <strong>{appliedCoupon}</strong> Applied!
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-brand-red hover:underline font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-3">
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder="Enter code (e.g. FOODY10, PREMIUM20)"
                  className="flex-1 px-4 py-2.5 bg-brand-surface-light border border-brand-border rounded-2xl text-xs font-bold focus:outline-none uppercase"
                />
                <Button variant="dark" size="sm" type="submit">
                  APPLY
                </Button>
              </form>
            )}

            {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-soft-md space-y-6 sticky top-24">
            <h3 className="font-serif text-2xl font-bold text-brand-dark border-b border-brand-border pb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs font-medium text-brand-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-brand-dark font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Taxes (8%)</span>
                <span className="text-brand-dark font-bold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="text-brand-dark font-bold font-mono">
                  {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-extrabold text-brand-dark pt-4 border-t border-brand-border">
                <span>Total</span>
                <span className="text-brand-red">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/checkout')}
              icon={<ArrowRight size={18} />}
            >
              PROCEED TO CHECKOUT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
