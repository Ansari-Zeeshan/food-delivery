import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { FoodItem, FoodExtra, FoodSize } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { RatingStars } from '../ui/RatingStars';

interface CustomizationModalProps {
  food?: FoodItem;
  foodItem?: FoodItem;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodCustomizationModal: React.FC<CustomizationModalProps> = ({
  food,
  foodItem,
  isOpen,
  onClose,
}) => {
  const targetFood = foodItem || food;
  if (!targetFood) return null;

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<FoodSize | undefined>(
    targetFood.options?.sizes?.[0]
  );
  const [selectedExtras, setSelectedExtras] = useState<FoodExtra[]>([]);
  const [instructions, setInstructions] = useState('');

  const basePrice = targetFood.price + (selectedSize ? selectedSize.priceModifier : 0);
  const extrasPrice = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const unitPrice = basePrice + extrasPrice;
  const totalPrice = unitPrice * quantity;

  const toggleExtra = (extra: FoodExtra) => {
    if (selectedExtras.some(e => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleAddToCart = () => {
    addToCart(targetFood, quantity, selectedSize, selectedExtras, instructions);
    showToast(`Added ${quantity}x ${targetFood.name} to cart`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-soft-2xl border border-brand-border overflow-hidden max-h-[90vh] flex flex-col z-10"
        >
          {/* Header Image Showcase */}
          <div className="relative h-48 sm:h-56 shrink-0">
            <img
              src={targetFood.image}
              alt={targetFood.name}
              className="w-full h-full object-cover"
              onError={e => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-brand-dark backdrop-blur-md flex items-center justify-center transition-colors shadow-md"
            >
              <X size={18} />
            </button>

            <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
                {targetFood.restaurantName}
              </span>
              <h3 className="font-serif text-2xl font-bold">{targetFood.name}</h3>
              <div className="flex items-center gap-3 text-xs font-semibold text-neutral-200">
                <RatingStars rating={targetFood.rating} size={12} />
                <span>• {targetFood.prepTime}</span>
              </div>
            </div>
          </div>

          {/* Scrollable Customization Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <p className="text-xs text-brand-muted leading-relaxed">
              {targetFood.description}
            </p>

            {/* Sizes option group */}
            {targetFood.options?.sizes && targetFood.options.sizes.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-brand-dark block">
                  Select Size
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {targetFood.options.sizes.map(size => {
                    const isSelected = selectedSize?.id === size.id;
                    return (
                      <div
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-brand-red bg-brand-red/5 font-bold text-brand-dark shadow-soft-sm'
                            : 'border-brand-border text-brand-muted hover:border-brand-dark'
                        }`}
                      >
                        <span className="text-xs">{size.name}</span>
                        <span className="text-xs font-mono font-semibold">
                          {size.priceModifier > 0 ? `+$${size.priceModifier.toFixed(2)}` : 'Standard'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extras option group */}
            {targetFood.options?.extras && targetFood.options.extras.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-brand-dark block">
                  Add Extras & Toppings
                </label>
                <div className="space-y-2">
                  {targetFood.options.extras.map(extra => {
                    const isSelected = selectedExtras.some(e => e.id === extra.id);
                    return (
                      <div
                        key={extra.id}
                        onClick={() => toggleExtra(extra)}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-brand-red bg-brand-red/5 text-brand-dark'
                            : 'border-brand-border text-brand-muted hover:border-brand-dark'
                        }`}
                      >
                        <span className="text-xs font-semibold">{extra.name}</span>
                        <span className="text-xs font-mono font-bold text-brand-dark">
                          +${extra.price.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-brand-dark block">
                Special Chef Instructions
              </label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="e.g. Extra sauce on side, less spicy, no cutlery..."
                rows={2}
                className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-2xl text-xs font-medium focus:outline-none focus:border-brand-dark"
              />
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-6 bg-white border-t border-brand-border flex items-center justify-between gap-4 shrink-0">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-brand-surface p-1.5 rounded-full border border-brand-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-white text-brand-dark flex items-center justify-center font-bold shadow-sm hover:bg-brand-surface-light"
              >
                <Minus size={14} />
              </button>
              <span className="font-mono text-sm font-extrabold w-4 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-white text-brand-dark flex items-center justify-center font-bold shadow-sm hover:bg-brand-surface-light"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              className="flex-1"
              icon={<ShoppingBag size={18} />}
            >
              ADD TO CART • ${totalPrice.toFixed(2)}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
