export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export interface ResolvedLocation {
  city: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  pincode?: string;
}

// Fallback coordinates for major Indian cities
export const CITY_COORDINATES: Record<string, UserCoordinates> = {
  Delhi: { latitude: 28.6139, longitude: 77.2090 },
  Mumbai: { latitude: 19.0760, longitude: 72.8777 },
  Bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  Hyderabad: { latitude: 17.3850, longitude: 78.4867 },
  Chennai: { latitude: 13.0827, longitude: 80.2707 },
  Kolkata: { latitude: 22.5726, longitude: 88.3639 },
  Pune: { latitude: 18.5204, longitude: 73.8567 },
  Ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  Jaipur: { latitude: 26.9124, longitude: 75.7873 },
  Surat: { latitude: 21.1702, longitude: 72.8311 },
  Lucknow: { latitude: 26.8467, longitude: 80.9462 },
  Chandigarh: { latitude: 30.7333, longitude: 76.7794 },
  Indore: { latitude: 22.7196, longitude: 75.8577 },
  Kochi: { latitude: 9.9312, longitude: 76.2673 },
};

/**
 * Calculates Haversine distance between two sets of coordinates in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Get current browser geographic location
 */
export function getCurrentCoordinates(): Promise<UserCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}

/**
 * Reverse geocode coordinates using OpenStreetMap Nominatim
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ResolvedLocation> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'FoodyDeliveryApp/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data = await response.json();
    const addr = data.address || {};

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.state_district ||
      addr.state ||
      'Delhi';

    const area =
      addr.neighbourhood ||
      addr.suburb ||
      addr.residential ||
      addr.road ||
      city;

    return {
      city,
      area,
      address: data.display_name || `${area}, ${city}`,
      latitude: lat,
      longitude: lng,
      pincode: addr.postcode,
    };
  } catch (err) {
    console.warn('Nominatim reverse geocode fallback:', err);
    return {
      city: 'Delhi',
      area: 'Connaught Place',
      address: 'Connaught Place, New Delhi',
      latitude: lat,
      longitude: lng,
    };
  }
}
