import React from 'react';
import { Sparkles, Copy } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export const OffersPage: React.FC = () => {
  const { showToast } = useToast();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Copied code ${code} to clipboard!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-red flex items-center gap-1.5">
          <Sparkles size={14} /> Exclusive Promotions
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-dark">
          Promotions & Special Vouchers
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-brand-dark text-white rounded-3xl space-y-4 border border-neutral-800 relative overflow-hidden">
          <span className="px-3 py-1 rounded-full bg-brand-red text-white text-[11px] font-bold uppercase">
            First Order Special
          </span>
          <h2 className="font-serif text-3xl font-bold">10% Off Your Culinary Order</h2>
          <p className="text-xs text-neutral-300">Valid on all menu items across any featured restaurant. Min order $20.</p>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <span className="font-mono text-sm font-extrabold text-brand-red">FOODY10</span>
            <button
              onClick={() => handleCopy('FOODY10')}
              className="text-xs font-bold text-white hover:text-brand-red flex items-center gap-1"
            >
              <Copy size={14} /> COPY CODE
            </button>
          </div>
        </div>

        <div className="p-8 bg-white rounded-3xl space-y-4 border border-brand-border shadow-soft-sm relative overflow-hidden">
          <span className="px-3 py-1 rounded-full bg-brand-dark text-white text-[11px] font-bold uppercase">
            VIP Gourmet Deal
          </span>
          <h2 className="font-serif text-3xl font-bold text-brand-dark">20% Off Orders Over $40</h2>
          <p className="text-xs text-brand-muted">Elevate your evening dining experience. Max discount $30.</p>

          <div className="flex items-center justify-between p-3.5 bg-brand-surface border border-brand-border rounded-2xl">
            <span className="font-mono text-sm font-extrabold text-brand-dark">PREMIUM20</span>
            <button
              onClick={() => handleCopy('PREMIUM20')}
              className="text-xs font-bold text-brand-dark hover:text-brand-red flex items-center gap-1"
            >
              <Copy size={14} /> COPY CODE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
