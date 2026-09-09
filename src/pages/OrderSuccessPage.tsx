import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Truck, FileText } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { Button } from '../components/ui/Button';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();

  const order = getOrderById(orderId || '');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
      {/* Big Animated Success Checkmark */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-white shadow-soft-lg animate-subtle-pulse">
        <CheckCircle2 size={48} />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-brand-red">
          Payment Confirmed
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-dark">
          Order Confirmed!
        </h1>
        <p className="text-sm text-brand-muted max-w-md mx-auto">
          Your order has been received by <strong>{order?.restaurantName || 'Casa Verde Trattoria'}</strong> and is currently being prepared.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="p-6 bg-white rounded-3xl border border-brand-border shadow-soft-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div>
            <span className="text-xs text-brand-muted block font-medium">ORDER NUMBER</span>
            <span className="font-mono text-sm font-bold text-brand-dark">#{order?.orderNumber || 'EL-10284'}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-brand-muted block font-medium">ESTIMATED ARRIVAL</span>
            <span className="text-sm font-bold text-brand-red">{order?.estimatedArrival || '24 MIN'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-brand-muted font-bold block mb-1">DELIVERY ADDRESS</span>
            <p className="text-brand-dark font-medium">{order?.address.street} {order?.address.apartment}</p>
            <p className="text-brand-muted">{order?.address.city}, {order?.address.postalCode}</p>
          </div>
          <div>
            <span className="text-brand-muted font-bold block mb-1">PAYMENT & METHOD</span>
            <p className="text-brand-dark font-medium uppercase">{order?.paymentMethod} (Ending in {order?.paymentLast4})</p>
            <p className="text-brand-red font-bold">Total: ${order?.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(`/orders/${order?.id || 'ord-10284'}/track`)}
          icon={<Truck size={18} />}
        >
          LIVE ORDER TRACKING
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/orders')}
          icon={<FileText size={18} />}
        >
          VIEW ORDER HISTORY
        </Button>
      </div>
    </div>
  );
};
