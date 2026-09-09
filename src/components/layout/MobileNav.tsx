import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, ShoppingBag, Clock, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const MobileNav: React.FC = () => {
  const { totalItemsCount, setIsCartDrawerOpen } = useCart();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border px-3 py-2 flex items-center justify-around shadow-lg">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 min-w-[56px] text-center transition-colors ${
            isActive ? 'text-brand-red font-bold' : 'text-brand-muted hover:text-brand-dark'
          }`
        }
      >
        <Home size={20} />
        <span className="text-[10px] font-medium">Home</span>
      </NavLink>

      <NavLink
        to="/restaurants"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 min-w-[56px] text-center transition-colors ${
            isActive ? 'text-brand-red font-bold' : 'text-brand-muted hover:text-brand-dark'
          }`
        }
      >
        <Compass size={20} />
        <span className="text-[10px] font-medium">Discover</span>
      </NavLink>

      <button
        onClick={() => setIsCartDrawerOpen(true)}
        className="relative flex flex-col items-center gap-1 p-2 min-w-[56px] text-center text-brand-muted hover:text-brand-dark"
      >
        <div className="relative">
          <ShoppingBag size={20} />
          {totalItemsCount > 0 && (
            <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-brand-red text-white text-[10px] font-extrabold">
              {totalItemsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">Cart</span>
      </button>

      <NavLink
        to="/orders"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 min-w-[56px] text-center transition-colors ${
            isActive ? 'text-brand-red font-bold' : 'text-brand-muted hover:text-brand-dark'
          }`
        }
      >
        <Clock size={20} />
        <span className="text-[10px] font-medium">Orders</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 min-w-[56px] text-center transition-colors ${
            isActive ? 'text-brand-red font-bold' : 'text-brand-muted hover:text-brand-dark'
          }`
        }
      >
        <User size={20} />
        <span className="text-[10px] font-medium">Profile</span>
      </NavLink>
    </div>
  );
};
