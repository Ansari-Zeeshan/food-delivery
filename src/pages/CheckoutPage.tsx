import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, Plus, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { DELIVERY_OPTIONS } from '../data/mockData';
import { Button } from '../components/ui/Button';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, deliveryFee, total, selectedDeliveryOption, setSelectedDeliveryOption } = useCart();
  const { addresses, selectedAddress, setSelectedAddressId, addAddress } = useAuth();

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newApt, setNewApt] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPostal, setNewPostal] = useState('');
  const [newLabel, setNewLabel] = useState<'Home' | 'Work' | 'Other'>('Home');

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newPostal) return;
    addAddress({
      label: newLabel,
      name: 'Alex Morgan',
      phone: '+1 (555) 234-5678',
      street: newStreet,
      apartment: newApt,
      city: newCity,
      postalCode: newPostal,
    });
    setShowNewAddressForm(false);
  };

  const handleProceedToPayment = () => {
    navigate('/checkout/payment');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Steps Progress Header */}
      <div className="flex items-center justify-center gap-4 max-w-xl mx-auto border-b border-brand-border pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-red">
          <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs">1</span>
          <span>Delivery Details</span>
        </div>
        <div className="w-12 h-0.5 bg-brand-border" />
        <div className="flex items-center gap-2 text-xs font-bold text-brand-muted">
          <span className="w-6 h-6 rounded-full bg-brand-surface text-brand-dark flex items-center justify-center text-xs">2</span>
          <span>Payment Gateway</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Flow */}
        <div className="lg:col-span-8 space-y-8">
          {/* STEP 1: Delivery Address */}
          <div className="p-6 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
                <MapPin className="text-brand-red" size={22} /> Select Delivery Address
              </h2>
              <button
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add New Address
              </button>
            </div>

            {/* Saved Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map(addr => {
                const isSelected = addr.id === selectedAddress.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-red bg-brand-red/5 shadow-soft-sm'
                        : 'border-brand-border hover:border-brand-dark'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-brand-dark text-white uppercase">
                        {addr.label}
                      </span>
                      {isSelected && <Check size={16} className="text-brand-red" />}
                    </div>
                    <p className="text-xs font-bold text-brand-dark">{addr.street} {addr.apartment}</p>
                    <p className="text-xs text-brand-muted">{addr.city}, {addr.postalCode}</p>
                  </div>
                );
              })}
            </div>

            {/* Add New Address Form Modal / Inline */}
            {showNewAddressForm && (
              <form onSubmit={handleAddNewAddress} className="p-5 bg-brand-surface-light rounded-2xl border border-brand-border space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark">New Address Details</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['Home', 'Work', 'Other'] as const).map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setNewLabel(l)}
                      className={`py-1.5 rounded-full text-xs font-bold border ${
                        newLabel === l ? 'bg-brand-dark text-white border-brand-dark' : 'border-brand-border text-brand-muted'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Street Address"
                  required
                  value={newStreet}
                  onChange={e => setNewStreet(e.target.value)}
                  className="w-full p-3 bg-white border border-brand-border rounded-xl text-xs font-semibold"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Apt/Suite (Optional)"
                    value={newApt}
                    onChange={e => setNewApt(e.target.value)}
                    className="p-3 bg-white border border-brand-border rounded-xl text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="p-3 bg-white border border-brand-border rounded-xl text-xs font-semibold"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Postal Code"
                  required
                  value={newPostal}
                  onChange={e => setNewPostal(e.target.value)}
                  className="w-full p-3 bg-white border border-brand-border rounded-xl text-xs font-semibold"
                />
                <Button variant="dark" size="sm" type="submit">
                  SAVE ADDRESS
                </Button>
              </form>
            )}
          </div>

          {/* STEP 2: Delivery Method Options */}
          <div className="p-6 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
              <Truck className="text-brand-red" size={22} /> Select Delivery Speed
            </h2>

            <div className="space-y-3">
              {DELIVERY_OPTIONS.map(opt => {
                const isSelected = selectedDeliveryOption.type === opt.type;
                return (
                  <div
                    key={opt.type}
                    onClick={() => setSelectedDeliveryOption(opt)}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-brand-red bg-brand-red/5'
                        : 'border-brand-border hover:border-brand-dark'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-brand-red bg-brand-red' : 'border-brand-muted'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-dark">{opt.title}</h4>
                        <p className="text-xs text-brand-muted">{opt.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-brand-dark block">{opt.duration}</span>
                      <span className="text-xs font-extrabold text-brand-red font-mono">
                        {opt.price === 0 ? 'FREE' : `$${opt.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-soft-md space-y-6 sticky top-24">
            <h3 className="font-serif text-2xl font-bold text-brand-dark border-b border-brand-border pb-4">
              Checkout Summary
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="text-brand-dark font-medium">{item.quantity}x {item.foodItem.name}</span>
                  <span className="font-bold text-brand-dark">${item.itemTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs font-medium text-brand-muted pt-4 border-t border-brand-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-brand-dark font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery ({selectedDeliveryOption.title})</span>
                <span className="text-brand-dark font-bold font-mono">
                  {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-brand-dark pt-2 border-t border-brand-border">
                <span>Total Due</span>
                <span className="text-brand-red">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleProceedToPayment}
              icon={<ArrowRight size={18} />}
            >
              PROCEED TO PAYMENT →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
