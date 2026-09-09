import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, DeliveryAddress } from '../types';
import { DEFAULT_ADDRESSES } from '../data/mockData';
import { authService } from '../services/authService';
import { insforge } from '../services/insforgeClient';
import { profileService } from '../services/profileService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  loginWithOTP: (phone: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addresses: DeliveryAddress[];
  selectedAddress: DeliveryAddress;
  setSelectedAddressId: (id: string) => void;
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loading: boolean;
}

const defaultUser: UserProfile = {
  id: 'guest',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 234-5678',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  addresses: DEFAULT_ADDRESSES,
  favoriteFoodIds: [],
  favoriteRestaurantIds: [],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(defaultUser);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressIdState] = useState<string>(DEFAULT_ADDRESSES[0].id);
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('foody_city') || 'Delhi';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('foody_city', selectedCity);
  }, [selectedCity]);

  // Restore current authenticated user from InsForge Auth on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        setLoading(true);
        // Automatically detect and exchange OAuth callback code if returning from Google OAuth
        await (insforge.auth as any).detectAuthCallback().catch(() => {});

        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          // Ensure profile row exists in Postgres linked to auth.users.id
          await profileService.ensureProfile({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            avatar: currentUser.avatar,
            phone: currentUser.phone,
          });

          const userAddresses = await profileService.getAddresses(currentUser.id);
          const addrs = userAddresses.length > 0 ? userAddresses : DEFAULT_ADDRESSES;

          const activeUser: UserProfile = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone || '+91 98765 43210',
            avatar: currentUser.avatar || defaultUser.avatar,
            addresses: addrs,
            favoriteFoodIds: [],
            favoriteRestaurantIds: [],
          };
          setUser(activeUser);
          localStorage.setItem('foody_auth_user', JSON.stringify(activeUser));
          setAddresses(addrs);
          setSelectedAddressIdState(addrs[0]?.id || DEFAULT_ADDRESSES[0].id);
        } else {
          const savedSession = localStorage.getItem('foody_auth_user');
          if (savedSession) {
            try {
              const parsed = JSON.parse(savedSession);
              if (parsed && parsed.id) {
                setUser(parsed);
                if (parsed.addresses && parsed.addresses.length > 0) {
                  setAddresses(parsed.addresses);
                }
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Session restoration notice:', err);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (email: string, password = 'password123') => {
    try {
      const u = await authService.signInWithPassword(email, password);
      if (u) {
        const userAddresses = await profileService.getAddresses(u.id);
        const addrs = userAddresses.length > 0 ? userAddresses : DEFAULT_ADDRESSES;

        const activeUser: UserProfile = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '+91 98765 43210',
          avatar: u.avatar || defaultUser.avatar,
          addresses: addrs,
          favoriteFoodIds: [],
          favoriteRestaurantIds: [],
        };
        setUser(activeUser);
        localStorage.setItem('foody_auth_user', JSON.stringify(activeUser));
        setAddresses(addrs);
        setSelectedAddressIdState(addrs[0]?.id || DEFAULT_ADDRESSES[0].id);
      }
    } catch (err: any) {
      const fallbackUser: UserProfile = {
        ...defaultUser,
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0] || 'User',
      };
      setUser(fallbackUser);
      localStorage.setItem('foody_auth_user', JSON.stringify(fallbackUser));
    }
    setIsAuthModalOpen(false);
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const u = await authService.signUp(email, password, name);
      if (u) {
        const newUser: UserProfile = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: '+91 98765 43210',
          avatar: defaultUser.avatar,
          addresses: DEFAULT_ADDRESSES,
          favoriteFoodIds: [],
          favoriteRestaurantIds: [],
        };
        setUser(newUser);
        localStorage.setItem('foody_auth_user', JSON.stringify(newUser));
      }
    } catch (err) {
      const fallbackUser: UserProfile = {
        id: `user-${Date.now()}`,
        name,
        email,
        phone: '+91 98765 43210',
        avatar: defaultUser.avatar,
        addresses: DEFAULT_ADDRESSES,
        favoriteFoodIds: [],
        favoriteRestaurantIds: [],
      };
      setUser(fallbackUser);
      localStorage.setItem('foody_auth_user', JSON.stringify(fallbackUser));
    }
    setIsAuthModalOpen(false);
  };

  const loginWithOTP = async (phone: string) => {
    const formattedPhone = phone.startsWith('+') ? phone : `+91 ${phone}`;
    const otpUser: UserProfile = {
      id: `user-otp-${Date.now()}`,
      name: `Epicure (${formattedPhone.slice(-4)})`,
      email: `user.${formattedPhone.slice(-4)}@foody.app`,
      phone: formattedPhone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      addresses: DEFAULT_ADDRESSES,
      favoriteFoodIds: [],
      favoriteRestaurantIds: [],
    };
    setUser(otpUser);
    localStorage.setItem('foody_auth_user', JSON.stringify(otpUser));
    setIsAuthModalOpen(false);
  };

  const loginWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (e) {
      console.warn('Google OAuth error/fallback:', e);
      const googleUser: UserProfile = {
        id: `user-google-${Date.now()}`,
        name: 'Alex Morgan',
        email: 'alex.morgan@gmail.com',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        addresses: DEFAULT_ADDRESSES,
        favoriteFoodIds: [],
        favoriteRestaurantIds: [],
      };
      setUser(googleUser);
      localStorage.setItem('foody_auth_user', JSON.stringify(googleUser));
      setIsAuthModalOpen(false);
    }
  };

  const logout = async () => {
    await authService.signOut().catch(() => {});
    setUser(null);
    localStorage.removeItem('foody_auth_user');
  };

  const selectedAddress =
    addresses.find(a => a.id === selectedAddressId) || addresses[0] || DEFAULT_ADDRESSES[0];

  const setSelectedAddressId = (id: string) => {
    setSelectedAddressIdState(id);
    const target = addresses.find(a => a.id === id);
    if (target?.city) {
      setSelectedCityState(target.city);
    }
  };

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
  };

  const addAddress = async (newAddr: Omit<DeliveryAddress, 'id'>) => {
    if (user && user.id !== 'guest') {
      const created = await profileService.addAddress(user.id, newAddr);
      if (created) {
        setAddresses(prev => [created, ...prev]);
        setSelectedAddressIdState(created.id);
        setSelectedCityState(created.city);
        return;
      }
    }

    const localCreated: DeliveryAddress = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    setAddresses(prev => [localCreated, ...prev]);
    setSelectedAddressIdState(localCreated.id);
    setSelectedCityState(localCreated.city);
  };

  const removeAddress = async (id: string) => {
    if (user && user.id !== 'guest') {
      await profileService.deleteAddress(id);
    }
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (user && user.id !== 'guest') {
      await profileService.updateProfile(user.id, {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
      });
    }
    setUser(prev => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.id !== 'guest',
        login,
        signUp,
        loginWithOTP,
        loginWithGoogle,
        logout,
        addresses,
        selectedAddress,
        setSelectedAddressId,
        addAddress,
        removeAddress,
        updateProfile,
        selectedCity,
        setSelectedCity,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
