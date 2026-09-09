import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Phone, MessageSquare, Star, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useOrders } from '../context/OrderContext';

export const LiveTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();

  const order = getOrderById(orderId || '') || getOrderById('ord-10284');

  const [progress, setProgress] = useState(0.45);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 0.85 ? 0.45 : prev + 0.005));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-dark hover:text-brand-red transition-colors"
      >
        <ArrowLeft size={16} /> Back to order history
      </button>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-red block mb-1">
            Live Delivery Tracking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark">
            ORDER #{order?.orderNumber || 'EL-10284'}
          </h1>
          <p className="text-xs text-brand-muted mt-1">{order?.restaurantName} → {order?.address.street}</p>
        </div>

        <div className="bg-brand-dark text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-soft-sm">
          <Clock className="text-brand-red animate-subtle-pulse" size={24} />
          <div>
            <span className="text-[10px] text-neutral-400 font-medium block uppercase tracking-wider">ESTIMATED ARRIVAL</span>
            <span className="text-xl font-extrabold font-mono text-white">24 MIN</span>
          </div>
        </div>
      </div>

      {/* STYLIZED MAP COMPONENT */}
      <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden bg-[#e5e3df] border border-brand-border shadow-soft-lg">
        {/* SVG Stylized Map Layer */}
        <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          <rect width="800" height="400" fill="#f4f1ea" />
          <path d="M-20,120 Q200,80 400,160 T820,100" stroke="#d5d0c5" strokeWidth="32" fill="none" />
          <path d="M100,0 Q180,200 250,400" stroke="#e8e4db" strokeWidth="24" fill="none" />
          <path d="M500,0 Q450,200 650,400" stroke="#e8e4db" strokeWidth="20" fill="none" />

          {/* Delivery Route Path */}
          <path
            id="deliveryRoute"
            d="M 150,280 C 280,260 380,140 650,120"
            stroke="#C93632"
            strokeWidth="5"
            strokeDasharray="8 6"
            fill="none"
          />

          {/* Restaurant Pin */}
          <g transform="translate(150, 280)">
            <circle r="18" fill="#111111" />
            <circle r="6" fill="#ffffff" />
            <text x="0" y="32" textAnchor="middle" fill="#111111" fontSize="12" fontWeight="bold">
              {order?.restaurantName || 'Casa Verde'}
            </text>
          </g>

          {/* Destination Pin */}
          <g transform="translate(650, 120)">
            <circle r="18" fill="#2E7D32" />
            <circle r="6" fill="#ffffff" />
            <text x="0" y="32" textAnchor="middle" fill="#111111" fontSize="12" fontWeight="bold">
              Your Location
            </text>
          </g>

          {/* Animated Courier Marker along route */}
          <g transform={`translate(${150 + (650 - 150) * progress}, ${280 + (120 - 280) * progress})`}>
            <circle r="16" fill="#C93632" className="animate-ping opacity-75" />
            <circle r="14" fill="#C93632" />
            <path d="M-5,-5 L5,0 L-5,5 Z" fill="#ffffff" transform="rotate(45)" />
          </g>
        </svg>

        {/* Floating Courier Card Overlay on Map */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-soft-lg border border-brand-border flex items-center justify-between gap-4 max-w-sm">
          <div className="flex items-center gap-3">
            <img
              src={order?.courier?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt=""
              className="w-12 h-12 rounded-full object-cover border-2 border-brand-red"
            />
            <div>
              <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">Courier Partner</span>
              <h4 className="text-sm font-extrabold text-brand-dark">{order?.courier?.name || 'Marcus Vance'}</h4>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                <Star size={12} className="fill-amber-400" /> {order?.courier?.rating || 4.98} · {order?.courier?.vehicle}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href={`tel:${order?.courier?.phone}`} className="w-9 h-9 rounded-full bg-brand-surface hover:bg-brand-red hover:text-white flex items-center justify-center transition-colors text-brand-dark">
              <Phone size={16} />
            </a>
            <button className="w-9 h-9 rounded-full bg-brand-surface hover:bg-brand-red hover:text-white flex items-center justify-center transition-colors text-brand-dark">
              <MessageSquare size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* TIMELINE PROGRESS SECTION */}
      <div className="p-8 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm space-y-8">
        <h3 className="font-serif text-2xl font-bold text-brand-dark">Order Status Timeline</h3>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="hidden md:block absolute top-6 left-12 right-12 h-1 bg-brand-border -z-0">
            <div className="h-full bg-brand-red w-3/4 transition-all duration-500" />
          </div>

          {[
            { title: 'Order Confirmed', desc: 'Received by kitchen', done: true, current: false },
            { title: 'Preparing Food', desc: 'Chef is crafting dishes', done: true, current: false },
            { title: 'Out for Delivery', desc: 'Courier en route', done: false, current: true },
            { title: 'Delivered', desc: 'Handed to you', done: false, current: false },
          ].map((step, idx) => (
            <div key={idx} className="relative z-10 flex md:flex-col items-center md:items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold transition-all ${
                  step.done
                    ? 'bg-brand-red'
                    : step.current
                    ? 'bg-brand-dark shadow-soft-lg ring-4 ring-brand-red/20 animate-subtle-pulse'
                    : 'bg-brand-surface text-brand-muted border border-brand-border'
                }`}
              >
                {step.done ? <CheckCircle2 size={20} /> : idx + 1}
              </div>

              <div>
                <h4 className={`text-sm font-bold ${step.current ? 'text-brand-red' : 'text-brand-dark'}`}>
                  {step.title}
                </h4>
                <p className="text-xs text-brand-muted mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
