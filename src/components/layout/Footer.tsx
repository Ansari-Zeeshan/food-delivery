import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowUpRight, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark text-white pt-20 pb-28 md:pb-16 mt-24 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Large Editorial Headline */}
        <div className="border-b border-neutral-800 pb-16 mb-16">
          <span className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-4 inline-flex items-center gap-2">
            <Sparkles size={14} /> The Art of Dining Delivered
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.05] tracking-tight max-w-5xl">
            GOOD FOOD SHOULD ALWAYS FEEL CLOSE.
          </h2>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16 border-b border-neutral-800">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-brand-red text-white flex items-center justify-center font-bold">
                <UtensilsCrossed size={18} />
              </div>
              <span className="font-serif text-3xl font-bold tracking-tight text-white">
                Foody<span className="text-brand-red">.</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              Curated dining from top artisanal kitchens delivered with precision and heat control. Discovery meets effortless fast checkout.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-300">
              <li><Link to="/restaurants" className="hover:text-brand-red transition-colors">Featured Restaurants</Link></li>
              <li><Link to="/menu" className="hover:text-brand-red transition-colors">Full Food Menu</Link></li>
              <li><Link to="/offers" className="hover:text-brand-red transition-colors">Promotions & Offers</Link></li>
              <li><Link to="/favorites" className="hover:text-brand-red transition-colors">Saved Favorites</Link></li>
            </ul>
          </div>

          {/* Brand */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-300">
              <li><Link to="/about" className="hover:text-brand-red transition-colors">Our Story & Quality</Link></li>
              <li><Link to="/help" className="hover:text-brand-red transition-colors">Help Center & FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-brand-red transition-colors">Partner With Us</Link></li>
              <li><Link to="/orders" className="hover:text-brand-red transition-colors">Track Active Order</Link></li>
            </ul>
          </div>

          {/* Mobile App Download */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Mobile App</h4>
            <p className="text-xs text-neutral-400 mb-4">Get live push notifications & exclusive mobile deals.</p>
            <div className="space-y-2">
              <button className="w-full py-2.5 px-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs font-semibold text-white hover:border-neutral-700 transition-colors">
                <span>iOS App Store</span>
                <ArrowUpRight size={14} />
              </button>
              <button className="w-full py-2.5 px-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs font-semibold text-white hover:border-neutral-700 transition-colors">
                <span>Google Play</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-medium">
          <p>© {new Date().getFullYear()} Foody Inc. All rights reserved. Crafting culinary experiences.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
