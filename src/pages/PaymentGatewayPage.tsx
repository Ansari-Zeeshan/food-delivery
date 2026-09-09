import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Wallet, Banknote, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import type { PaymentMethodType } from '../types';
import { Button } from '../components/ui/Button';
import confetti from 'canvas-confetti';

export const PaymentGatewayPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, deliveryFee, tax, discount, total, selectedDeliveryOption, clearCart, appliedCoupon } = useCart();
  const { selectedAddress } = useAuth();
  const { placeOrder } = useOrders();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [cardNumber, setCardNumber] = useState('4821 9901 3341 4821');
  const [cardHolder, setCardHolder] = useState('ALEX MORGAN');
  const [expiry, setExpiry] = useState('09/29');
  const [cvv, setCvv] = useState('782');

  const [isProcessing, setIsProcessing] = useState(false);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleCardNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 4);
    if (cleaned.length >= 3) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const createdOrder = await placeOrder(
        cartItems,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        selectedAddress,
        selectedDeliveryOption,
        paymentMethod,
        cardNumber.slice(-4) || '4821',
        appliedCoupon || undefined
      );

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
      setIsProcessing(false);
      navigate(`/order/${createdOrder.id}/success`);
    } catch (err) {
      console.error('Order creation error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <motion.button
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/checkout')}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-dark hover:text-brand-red transition-colors"
      >
        <ArrowLeft size={16} /> Return to delivery options
      </motion.button>

      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-brand-red inline-flex items-center gap-1.5">
          <Lock size={14} /> 256-Bit Encrypted Payment
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark">
          Fintech Secure Checkout
        </h1>
        <p className="text-xs text-brand-muted">Amount to pay: <strong className="text-brand-dark text-sm">${total.toFixed(2)}</strong></p>
      </div>

      {/* Payment Processing Modal Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl border border-brand-border"
            >
              <div className="w-16 h-16 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center mx-auto animate-pulse">
                <Lock size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-brand-dark">Authorizing Payment</h3>
                <p className="text-xs text-brand-muted">Contacting payment gateway & placing order with server price authority...</p>
              </div>
              <div className="w-full bg-brand-surface rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  className="bg-brand-red h-full rounded-full"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <form onSubmit={handlePay} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Payment Methods selector */}
        <div className="md:col-span-5 space-y-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-brand-dark block">
            Payment Method
          </label>
          <div className="space-y-2.5">
            {[
              { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, subtitle: 'Visa, Mastercard, Amex' },
              { id: 'upi', name: 'Instant UPI / QR Code', icon: Smartphone, subtitle: 'Google Pay, Apple Pay' },
              { id: 'wallet', name: 'Digital Wallet', icon: Wallet, subtitle: 'PayPal, InsForge Pay' },
              { id: 'cod', name: 'Cash on Delivery', icon: Banknote, subtitle: 'Pay courier directly' },
            ].map(method => {
              const isSelected = paymentMethod === method.id;
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethodType)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                    isSelected
                      ? 'border-brand-red bg-brand-red/5 shadow-soft-sm'
                      : 'border-brand-border bg-white hover:border-brand-dark'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-brand-red text-white' : 'bg-brand-surface text-brand-dark'}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-dark">{method.name}</p>
                    <p className="text-[11px] text-brand-muted">{method.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Details form card */}
        <div className="md:col-span-7 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm space-y-6">
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                {/* Visual Glassmorphic Credit Card Preview */}
                <div className="relative h-44 rounded-2xl bg-gradient-to-tr from-brand-dark via-neutral-900 to-brand-red p-6 text-white shadow-soft-xl flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">Foody VIP Pass</span>
                    <CreditCard size={24} className="text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-lg tracking-widest font-bold">{cardNumber || '•••• •••• •••• ••••'}</p>
                    <div className="flex justify-between items-end text-[11px] text-neutral-300">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-400">Card Holder</p>
                        <p className="font-bold">{cardHolder || 'YOUR NAME'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-400">Expires</p>
                        <p className="font-bold">{expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={e => handleCardNumberChange(e.target.value)}
                      placeholder="4821 9901 3341 4821"
                      className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="ALEX MORGAN"
                      className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={e => handleExpiryChange(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                        CVV Code
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="782"
                        className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod !== 'card' && (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-brand-surface text-brand-dark flex items-center justify-center mx-auto">
                  <Lock size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-dark">Instant Gateway Ready</h3>
                <p className="text-xs text-brand-muted max-w-xs mx-auto">
                  Clicking pay below will process your payment through your selected {paymentMethod.toUpperCase()} provider securely.
                </p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              type="submit"
              icon={<Lock size={18} />}
            >
              PAY ${total.toFixed(2)} & PLACE ORDER
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
