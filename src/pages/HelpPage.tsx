import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    { q: 'How does live order tracking work?', a: 'Once your order is confirmed by the kitchen, our live tracking map activates. You can view your driver’s location in real-time along with estimated arrival times.' },
    { q: 'What happens if my food arrives cold or damaged?', a: 'We guarantee thermal quality. If your meal does not arrive in pristine condition, click "Help" on your order page for instant replacement or refund.' },
    { q: 'How do promo codes & vouchers work?', a: 'Enter your voucher code during cart review or checkout. Discounts apply instantly to your subtotal.' },
    { q: 'Can I schedule a delivery in advance?', a: 'Yes! Select "Schedule Delivery" during checkout to choose your preferred date and 30-minute delivery window.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-red">Customer Care</span>
        <h1 className="font-serif text-4xl font-bold text-brand-dark">How Can We Help You?</h1>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = activeFaq === idx;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-brand-border/60 overflow-hidden">
              <button
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className="w-full p-5 text-left font-serif font-bold text-lg text-brand-dark flex items-center justify-between"
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180 text-brand-red' : 'text-brand-muted'}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-brand-muted leading-relaxed border-t border-brand-border/40 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
