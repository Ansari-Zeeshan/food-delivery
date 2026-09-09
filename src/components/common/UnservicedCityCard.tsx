import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const SERVICED_CITIES = [
  { name: 'Delhi', badge: '3 Kitchens Available' },
  { name: 'Hyderabad', badge: '2 Kitchens Available' },
  { name: 'Mumbai', badge: '1 Kitchen Available' },
];

export const UnservicedCityCard: React.FC = () => {
  const { selectedCity, setSelectedCity } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto my-12 p-8 sm:p-12 bg-white rounded-[2.5rem] border border-brand-border/80 shadow-soft-2xl text-center space-y-6 relative overflow-hidden"
    >
      {/* Background Accent Blur */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Icon Badge */}
      <div className="relative z-10 w-20 h-20 mx-auto rounded-3xl bg-brand-surface border border-brand-border flex items-center justify-center shadow-soft-sm">
        <MapPin size={36} className="text-brand-red animate-bounce" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
          !
        </span>
      </div>

      {/* Main Copy */}
      <div className="space-y-2 relative z-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 text-brand-red text-xs font-extrabold uppercase tracking-wider">
          <AlertCircle size={14} /> Service Area Expansion Pending
        </span>
        <h3 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark">
          Sorry, our service is not available in{' '}
          <span className="text-brand-red underline decoration-brand-red/30">{selectedCity}</span> yet.
        </h3>
        <p className="text-sm text-brand-muted max-w-lg mx-auto leading-relaxed">
          Foody is currently hand-curating top artisanal kitchens in select metropolitan zones. We haven’t launched in {selectedCity} yet, but we are expanding fast!
        </p>
      </div>

      {/* Quick City Selector Pills */}
      <div className="space-y-3 pt-2 relative z-10">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center justify-center gap-1.5">
          <Sparkles size={14} className="text-amber-500" /> Switch to an Active Gourmet Zone
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {SERVICED_CITIES.map(city => (
            <motion.button
              key={city.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCity(city.name)}
              className="px-5 py-3 rounded-2xl bg-brand-surface hover:bg-brand-dark hover:text-white border border-brand-border text-brand-dark transition-all text-left group shadow-soft-sm"
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-red group-hover:text-white transition-colors" />
                <span className="text-xs font-extrabold">{city.name}</span>
              </div>
              <p className="text-[10px] text-brand-muted group-hover:text-white/80 mt-0.5 font-medium">
                {city.badge}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Auto Reset CTA */}
      <div className="pt-4 border-t border-brand-border/60 flex justify-center relative z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSelectedCity('Delhi')}
          icon={<Navigation size={14} />}
        >
          Default to Native Hometown (Delhi)
        </Button>
      </div>
    </motion.div>
  );
};
