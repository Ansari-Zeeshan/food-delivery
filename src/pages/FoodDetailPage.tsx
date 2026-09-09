import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Plus, Minus, ShoppingBag } from 'lucide-react';
import { FOOD_ITEMS } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { RatingStars } from '../components/ui/RatingStars';
import type { FoodExtra, FoodSize } from '../types';

export const FoodDetailPage: React.FC = () => {
  const { foodId } = useParams<{ foodId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFoodFavorite, toggleFavoriteFood } = useFavorites();
  const { showToast } = useToast();

  const food = FOOD_ITEMS.find(f => f.id === foodId) || FOOD_ITEMS[0];

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<FoodSize | undefined>(
    food.options?.sizes?.[0]
  );
  const [selectedExtras, setSelectedExtras] = useState<FoodExtra[]>([]);

  const isFav = isFoodFavorite(food.id);

  const basePrice = food.price + (selectedSize ? selectedSize.priceModifier : 0);
  const extrasPrice = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const unitPrice = basePrice + extrasPrice;
  const currentTotal = unitPrice * quantity;

  const toggleExtra = (extra: FoodExtra) => {
    setSelectedExtras(prev =>
      prev.some(e => e.id === extra.id)
        ? prev.filter(e => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const handleAddToCart = () => {
    addToCart(food, quantity, selectedSize, selectedExtras);
    showToast(`Added ${quantity}x ${food.name} to cart`);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-dark hover:text-brand-red transition-colors"
      >
        <ArrowLeft size={16} /> Back to menu
      </button>

      {/* Main E-Commerce Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Dish Photography */}
        <div className="lg:col-span-6 relative">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-brand-surface border border-brand-border shadow-soft-lg">
            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
          </div>

          <button
            onClick={() => toggleFavoriteFood(food.id)}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-brand-dark shadow-md hover:scale-110 transition-transform"
          >
            <Heart size={20} className={isFav ? 'fill-brand-red text-brand-red' : 'text-brand-dark'} />
          </button>
        </div>

        {/* Right Product Options & Details */}
        <div className="lg:col-span-6 space-y-6 bg-white p-8 rounded-3xl border border-brand-border shadow-soft-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-red block mb-1">
              {food.category} · {food.restaurantName}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark">
              {food.name}
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <RatingStars rating={food.rating} count={food.ratingCount} size={16} />
              {food.calories && (
                <span className="text-xs font-bold text-brand-muted bg-brand-surface px-2.5 py-1 rounded-full">
                  {food.calories} kcal
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-brand-muted leading-relaxed">{food.description}</p>

          <div className="text-3xl font-extrabold text-brand-dark border-y border-brand-border py-4 flex items-center justify-between">
            <span>Price:</span>
            <span className="text-brand-red">${unitPrice.toFixed(2)}</span>
          </div>

          {/* Size Choice */}
          {food.options?.sizes && food.options.sizes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-3">
                Portion Size
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {food.options.sizes.map(size => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedSize?.id === size.id
                        ? 'border-brand-red bg-brand-red/5 font-bold text-brand-dark'
                        : 'border-brand-border text-brand-muted hover:border-brand-dark'
                    }`}
                  >
                    <span className="text-xs">{size.name}</span>
                    <span className="text-xs font-bold">
                      {size.priceModifier > 0 ? `+$${size.priceModifier.toFixed(2)}` : 'Standard'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extras */}
          {food.options?.extras && food.options.extras.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-3">
                Extras & Add-ons
              </h4>
              <div className="space-y-2">
                {food.options.extras.map(extra => {
                  const isChecked = selectedExtras.some(e => e.id === extra.id);
                  return (
                    <label
                      key={extra.id}
                      onClick={() => toggleExtra(extra)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer ${
                        isChecked ? 'border-brand-dark bg-brand-surface' : 'border-brand-border'
                      }`}
                    >
                      <span className="text-xs font-semibold text-brand-dark">{extra.name}</span>
                      <span className="text-xs font-bold text-brand-dark">+${extra.price.toFixed(2)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="pt-4 flex items-center gap-4">
            <div className="flex items-center gap-3 bg-brand-surface px-4 py-3 rounded-full border border-brand-border">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-brand-red">
                <Minus size={16} />
              </button>
              <span className="text-sm font-extrabold w-4 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-brand-red">
                <Plus size={16} />
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              icon={<ShoppingBag size={18} />}
            >
              ADD TO CART · ${currentTotal.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
