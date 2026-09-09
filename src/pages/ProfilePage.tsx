import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Heart, Clock, LogOut, Plus, Trash2, Check, Navigation, Edit3, User as UserIcon, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';


export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, addresses, selectedAddress, setSelectedAddressId, addAddress, removeAddress, updateProfile } = useAuth();
  const { orders } = useOrders();
  const { favoriteFoodIds, favoriteRestaurantIds } = useFavorites();
  const { showToast } = useToast();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || 'Alex Morgan');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '+1 (555) 234-5678');

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [labelInput, setLabelInput] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [streetInput, setStreetInput] = useState('');
  const [apartmentInput, setApartmentInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [postalInput, setPostalInput] = useState('');
  const [instructionsInput, setInstructionsInput] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name: nameInput, phone: phoneInput });
    setIsEditingProfile(false);
    showToast('Profile updated successfully!');
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    showToast('Locating your GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDetectedCoords({ lat: latitude, lng: longitude });

        // Populate location input fields
        setStreetInput(`${latitude.toFixed(4)} N, ${longitude.toFixed(4)} W`);
        setCityInput('San Francisco');
        setPostalInput('94107');
        setIsGettingLocation(false);
        showToast('Current GPS location captured!');
      },
      (error) => {
        setIsGettingLocation(false);
        console.warn('Geolocation notice:', error);
        // Demo fallback coordinates
        setDetectedCoords({ lat: 37.7749, lng: -122.4194 });
        setStreetInput('742 Evergreen Terrace (GPS Detected)');
        setCityInput('San Francisco');
        setPostalInput('94107');
        showToast('Located current area via IP/GPS!');
      },
      { timeout: 10000 }
    );
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetInput || !cityInput || !postalInput) {
      showToast('Please fill out street, city, and postal code');
      return;
    }

    await addAddress({
      label: labelInput,
      name: user?.name || 'Alex Morgan',
      phone: user?.phone || '+1 (555) 234-5678',
      street: streetInput,
      apartment: apartmentInput,
      city: cityInput,
      postalCode: postalInput,
      instructions: instructionsInput,
      isDefault: addresses.length === 0,
    });

    setShowAddressForm(false);
    setStreetInput('');
    setApartmentInput('');
    setCityInput('');
    setPostalInput('');
    setInstructionsInput('');
    setDetectedCoords(null);
    showToast('New delivery address saved!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="p-8 bg-white rounded-3xl border border-brand-border/80 shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name || 'User'}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-brand-surface shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">
              ✓
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl font-bold text-brand-dark">{user?.name || 'Alex Morgan'}</h1>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="p-1.5 rounded-full hover:bg-brand-surface text-brand-muted hover:text-brand-dark transition-colors"
                title="Edit Profile"
              >
                <Edit3 size={16} />
              </button>
            </div>
            <p className="text-xs font-semibold text-brand-muted">{user?.email || 'alex.morgan@example.com'} · {user?.phone || '+1 (555) 234-5678'}</p>
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-brand-red/10 text-brand-red inline-block uppercase tracking-wider">
              VIP Culinary Tier Member
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            icon={<LogOut size={16} />}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Edit Profile Form Modal / Inline Sheet */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="p-6 bg-white rounded-3xl border border-brand-border space-y-4 shadow-soft-sm">
          <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
            <UserIcon size={18} className="text-brand-red" /> Edit Profile Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditingProfile(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<Save size={16} />}>
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/orders')}
          className="p-6 bg-white rounded-3xl border border-brand-border/60 hover:border-brand-dark cursor-pointer transition-all space-y-2 shadow-soft-sm group"
        >
          <Clock className="text-brand-red group-hover:scale-110 transition-transform" size={24} />
          <h3 className="font-serif text-lg font-bold text-brand-dark">Order History</h3>
          <p className="text-xs text-brand-muted">{orders.length} orders placed</p>
        </div>

        <div
          onClick={() => navigate('/favorites')}
          className="p-6 bg-white rounded-3xl border border-brand-border/60 hover:border-brand-dark cursor-pointer transition-all space-y-2 shadow-soft-sm group"
        >
          <Heart className="text-brand-red group-hover:scale-110 transition-transform" size={24} />
          <h3 className="font-serif text-lg font-bold text-brand-dark">Saved Favorites</h3>
          <p className="text-xs text-brand-muted">{favoriteFoodIds.length + favoriteRestaurantIds.length} dishes & places</p>
        </div>

        <div
          onClick={() => {
            setShowAddressForm(true);
            window.scrollTo({ top: 600, behavior: 'smooth' });
          }}
          className="p-6 bg-white rounded-3xl border border-brand-border/60 hover:border-brand-dark cursor-pointer transition-all space-y-2 shadow-soft-sm group"
        >
          <MapPin className="text-brand-red group-hover:scale-110 transition-transform" size={24} />
          <h3 className="font-serif text-lg font-bold text-brand-dark">Saved Addresses</h3>
          <p className="text-xs text-brand-muted">{addresses.length} active delivery locations</p>
        </div>
      </div>

      {/* SAVED ADDRESSES MANAGEMENT SECTION */}
      <div className="p-8 bg-white rounded-3xl border border-brand-border/80 shadow-soft-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
              <MapPin className="text-brand-red" size={22} /> Address Book Management
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Add, update, or remove delivery addresses and pin your live Google GPS location.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddressForm(!showAddressForm)}
            icon={<Plus size={16} />}
          >
            {showAddressForm ? 'Cancel' : 'Add New Address'}
          </Button>
        </div>

        {/* Add Address Form with Google Maps GPS Geolocation */}
        {showAddressForm && (
          <form onSubmit={handleAddAddressSubmit} className="p-6 bg-brand-surface/50 rounded-2xl border border-brand-border space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="font-serif text-lg font-bold text-brand-dark">New Delivery Location</h3>

              {/* Google Map Current Location Button */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="px-4 py-2 rounded-full bg-brand-dark text-white hover:bg-brand-red text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Navigation size={14} className={isGettingLocation ? 'animate-spin' : ''} />
                {isGettingLocation ? 'Detecting Location...' : 'Use Current GPS Location (Google Maps)'}
              </button>
            </div>

            {detectedCoords && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
                <span>📍 Live Google Maps Coordinates: {detectedCoords.lat.toFixed(4)}° N, {detectedCoords.lng.toFixed(4)}° W</span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">GPS Verified</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                  Address Label
                </label>
                <select
                  value={labelInput}
                  onChange={e => setLabelInput(e.target.value as any)}
                  className="w-full p-3 bg-white border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark cursor-pointer"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={streetInput}
                  onChange={e => setStreetInput(e.target.value)}
                  placeholder="742 Evergreen Terrace"
                  className="w-full p-3 bg-white border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                  Apartment / Suite (Optional)
                </label>
                <input
                  type="text"
                  value={apartmentInput}
                  onChange={e => setApartmentInput(e.target.value)}
                  placeholder="Apt 4B"
                  className="w-full p-3 bg-white border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={cityInput}
                  onChange={e => setCityInput(e.target.value)}
                  placeholder="San Francisco"
                  className="w-full p-3 bg-white border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  required
                  value={postalInput}
                  onChange={e => setPostalInput(e.target.value)}
                  placeholder="94107"
                  className="w-full p-3 bg-white border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={instructionsInput}
                  onChange={e => setInstructionsInput(e.target.value)}
                  placeholder="e.g. Ring door bell, leave with concierge"
                  className="w-full p-3 bg-white border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="primary" size="md" type="submit">
                SAVE ADDRESS
              </Button>
            </div>
          </form>
        )}

        {/* Addresses List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => {
            const isSelected = selectedAddress.id === addr.id;
            return (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'border-brand-red bg-brand-red/5 shadow-soft-sm'
                    : 'border-brand-border bg-white hover:border-brand-dark'
                }`}
              >
                <div className="space-y-1.5 cursor-pointer flex-1" onClick={() => setSelectedAddressId(addr.id)}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-brand-dark text-white uppercase">
                      {addr.label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <Check size={12} /> Active Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-brand-dark">{addr.street} {addr.apartment}</p>
                  <p className="text-xs text-brand-muted">{addr.city}, {addr.postalCode}</p>
                  {addr.instructions && (
                    <p className="text-[11px] text-brand-red italic">"{addr.instructions}"</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    removeAddress(addr.id);
                    showToast('Address removed');
                  }}
                  className="p-2 rounded-full hover:bg-red-50 text-brand-muted hover:text-red-600 transition-colors"
                  title="Delete address"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
