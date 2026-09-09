import React from 'react';
import { Sparkles, Award, ShieldCheck, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-red inline-flex items-center gap-1.5">
          <Sparkles size={14} /> Our Brand Philosophy
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-tight text-brand-dark">
          Where Culinary Artistry Meets Instant Delivery.
        </h1>
        <p className="text-base text-brand-muted leading-relaxed">
          Foody was founded on a simple principle: food delivery should never sacrifice visual beauty, ingredient integrity, or thermal perfection.
        </p>
      </div>

      {/* Grid Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm space-y-4">
          <Award size={28} className="text-brand-red" />
          <h3 className="font-serif text-xl font-bold text-brand-dark">Verified Master Kitchens</h3>
          <p className="text-xs text-brand-muted leading-relaxed">
            We partner strictly with top artisanal chefs, sourdough bakers, and heritage family kitchens.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm space-y-4">
          <ShieldCheck size={28} className="text-brand-red" />
          <h3 className="font-serif text-xl font-bold text-brand-dark">Precision Thermal Control</h3>
          <p className="text-xs text-brand-muted leading-relaxed">
            Every courier is equipped with custom insulated electric bags that maintain exact temperature from pass to plate.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-brand-border/60 shadow-soft-sm space-y-4">
          <Heart size={28} className="text-brand-red" />
          <h3 className="font-serif text-xl font-bold text-brand-dark">Unmatched Hospitality</h3>
          <p className="text-xs text-brand-muted leading-relaxed">
            From our editorial interface to our rapid customer care team, every step is designed with care.
          </p>
        </div>
      </div>
    </div>
  );
};
