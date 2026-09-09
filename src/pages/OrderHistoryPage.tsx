import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, RotateCcw, ShoppingBag } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, reorderItems } = useOrders();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleReorder = (orderId: string) => {
    const items = reorderItems(orderId);
    items.forEach(item => {
      addToCart(item.foodItem, item.quantity, item.selectedSize, item.selectedExtras);
    });
    showToast(`Re-added items from order to cart`);
    navigate('/cart');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-red block mb-1">
          Account Activity
        </span>
        <h1 className="font-serif text-4xl font-bold text-brand-dark">
          Order History
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-brand-border p-8 space-y-4">
          <ShoppingBag size={40} className="mx-auto text-brand-muted" />
          <h3 className="font-serif text-2xl font-bold text-brand-dark">Nothing here yet</h3>
          <p className="text-xs text-brand-muted">You haven’t placed any food orders yet.</p>
          <Button variant="primary" size="md" onClick={() => navigate('/menu')}>
            START ORDERING NOW
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div
              key={order.id}
              className="p-6 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm space-y-4 hover:border-brand-dark transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-brand-border pb-4">
                <div>
                  <span className="text-xs font-extrabold text-brand-red">ORDER #{order.orderNumber}</span>
                  <h3 className="font-serif text-xl font-bold text-brand-dark">{order.restaurantName}</h3>
                  <p className="text-xs text-brand-muted">{order.createdAt} · {order.items.length} items</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-red text-white'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <span className="text-lg font-extrabold text-brand-dark">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Items summary preview */}
              <div className="space-y-1 text-xs text-brand-muted">
                {order.items.map(i => (
                  <p key={i.id}>• {i.quantity}x {i.foodItem.name}</p>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/orders/${order.id}/track`)}
                  icon={<Truck size={14} />}
                >
                  Track Order
                </Button>

                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => handleReorder(order.id)}
                  icon={<RotateCcw size={14} />}
                >
                  REORDER
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
