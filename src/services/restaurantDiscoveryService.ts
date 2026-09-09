import { insforge } from './insforgeClient';
import type { Restaurant } from '../types';
import { calculateHaversineDistance, CITY_COORDINATES } from './locationService';
import { RESTAURANTS as MOCK_PARTNERS } from '../data/mockData';

export interface DiscoveryOptions {
  latitude: number;
  longitude: number;
  radiusMeters?: number; // default 10000 (10km)
  page?: number;        // default 1
  limit?: number;       // default 20
  category?: string;
  search?: string;
  openNow?: boolean;
  partnerOnly?: boolean;
  sortBy?: 'distance' | 'rating' | 'popularity';
}

export interface PaginatedDiscoveryResult {
  restaurants: Restaurant[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  userLocation: { latitude: number; longitude: number };
}

// Unsplash high quality food & restaurant image fallbacks based on cuisine
const CUISINE_IMAGES: Record<string, string[]> = {
  Indian: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  ],
  Pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
  ],
  Burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  ],
  Asian: [
    'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  ],
  Default: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
  ]
};

function getRandomImage(cuisine: string = 'Default', index: number = 0): string {
  const images = CUISINE_IMAGES[cuisine] || CUISINE_IMAGES.Default;
  return images[index % images.length];
}

/**
 * Main discovery service connecting to OpenStreetMap Overpass API & InsForge Postgres Cache
 */
export const restaurantDiscoveryService = {
  async discoverNearbyRestaurants(options: DiscoveryOptions): Promise<PaginatedDiscoveryResult> {
    const {
      latitude,
      longitude,
      radiusMeters = 10000,
      page = 1,
      limit = 20,
      category,
      search,
      openNow,
      partnerOnly = false,
      sortBy = 'distance',
    } = options;

    let allDiscovered: Restaurant[] = [];

    // Step 1: Fetch real POIs from OpenStreetMap Overpass API around user coordinates
    try {
      const overpassQuery = `[out:json][timeout:15];node(around:${radiusMeters},${latitude},${longitude})["amenity"~"restaurant|fast_food|cafe|bakery"];out 60;`;
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

      const response = await fetch(overpassUrl, {
        headers: { 'User-Agent': 'FoodyDeliveryApp/1.0' },
      });

      if (response.ok) {
        const data = await response.json();
        const elements = data.elements || [];

        const poiRestaurants: Restaurant[] = elements.map((el: any, idx: number) => {
          const tags = el.tags || {};
          const name = tags.name || tags['name:en'] || `Eatery #${el.id}`;
          const amenity = tags.amenity || 'restaurant';
          const tagCuisine = tags.cuisine
            ? tags.cuisine.split(';').map((c: string) => c.trim().replace(/_/g, ' '))
            : [amenity === 'cafe' ? 'Cafe & Drinks' : amenity === 'fast_food' ? 'Fast Food' : 'Multi-Cuisine'];

          const distKm = calculateHaversineDistance(latitude, longitude, el.lat, el.lon);
          const extId = `osm-${el.id}`;

          return {
            id: extId,
            externalPlaceId: extId,
            name,
            tagline: tags['description'] || `Authentic ${tagCuisine[0] || 'Gourmet'} experience`,
            description: tags['description'] || `Serving freshly prepared ${tagCuisine.join(', ')} near your location.`,
            cuisine: tagCuisine,
            rating: tags.rating ? parseFloat(tags.rating) : parseFloat((4.0 + (el.id % 10) * 0.09).toFixed(1)),
            ratingCount: 45 + (el.id % 350),
            deliveryTime: `${Math.max(15, Math.round(distKm * 6 + 15))} mins`,
            deliveryFee: 3.99,
            distance: `${distKm} km`,
            distanceKm: distKm,
            priceLevel: (el.id % 2 === 0 ? '$$' : '$$$') as any,
            heroImage: getRandomImage(tagCuisine[0], idx),
            logo: getRandomImage(tagCuisine[0], idx + 1),
            address: tags['addr:street']
              ? `${tags['addr:street']}, ${tags['addr:city'] || ''}`
              : `Near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
            openingHours: tags.opening_hours || '10:00 AM - 11:00 PM',
            minOrder: 15.0,
            tags: tagCuisine,
            isFeatured: idx < 3,
            isPopular: idx % 2 === 0,
            isPartner: false, // Discovered POI by default
            latitude: el.lat,
            longitude: el.lon,
            deliveryRadiusKm: 10.0,
            isServiceable: false,
            serviceabilityReason: 'Discovered Listing · Onboarding Pending',
            acceptsOrders: false,
          };
        });

        allDiscovered = poiRestaurants;

        // Cache newly discovered POIs asynchronously into InsForge Postgres
        this.cacheDiscoveredInInsForge(poiRestaurants).catch(() => {});
      }
    } catch (err) {
      console.warn('Overpass POI discovery notice:', err);
    }

    // Step 2: Include onboarded Foody Partner Restaurants from Database / Mock Partners
    const partnerRestaurants: Restaurant[] = MOCK_PARTNERS.map((p, idx) => {
      // Assign dynamic coordinates relative to requested user location if missing
      const pLat = latitude + (idx - 1) * 0.025;
      const pLng = longitude + (idx - 1) * 0.025;
      const distKm = calculateHaversineDistance(latitude, longitude, pLat, pLng);
      const deliveryRadiusKm = 15.0;
      const isServiceable = distKm <= deliveryRadiusKm;

      return {
        ...p,
        latitude: pLat,
        longitude: pLng,
        distanceKm: distKm,
        distance: `${distKm} km`,
        deliveryTime: `${Math.max(15, Math.round(distKm * 5 + 15))} mins`,
        isPartner: true,
        acceptsOrders: true,
        deliveryRadiusKm,
        isServiceable,
        serviceabilityReason: isServiceable
          ? 'Deliverable to your location'
          : `Outside delivery radius (${distKm}km > ${deliveryRadiusKm}km)`,
      };
    });

    // Merge Partner Restaurants first, followed by Discovered POIs (filter out duplicates by name)
    const combinedMap = new Map<string, Restaurant>();
    partnerRestaurants.forEach(p => combinedMap.set(p.name.toLowerCase(), p));
    allDiscovered.forEach(d => {
      if (!combinedMap.has(d.name.toLowerCase())) {
        combinedMap.set(d.name.toLowerCase(), d);
      }
    });

    let resultList = Array.from(combinedMap.values());

    // Step 3: Apply Filters
    if (partnerOnly) {
      resultList = resultList.filter(r => r.isPartner);
    }

    if (category && category !== 'All') {
      resultList = resultList.filter(r =>
        r.cuisine.some(c => c.toLowerCase().includes(category.toLowerCase())) ||
        r.tags.some(t => t.toLowerCase().includes(category.toLowerCase()))
      );
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      resultList = resultList.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.some(c => c.toLowerCase().includes(q)) ||
          r.address.toLowerCase().includes(q)
      );
    }

    if (openNow) {
      resultList = resultList.filter(r => r.openingHours !== 'Closed');
    }

    // Step 4: Sorting
    if (sortBy === 'distance') {
      resultList.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    } else if (sortBy === 'rating') {
      resultList.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popularity') {
      resultList.sort((a, b) => b.ratingCount - a.ratingCount);
    }

    // Step 5: Pagination Math
    const totalCount = resultList.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedRestaurants = resultList.slice(startIndex, startIndex + limit);

    return {
      restaurants: paginatedRestaurants,
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      userLocation: { latitude, longitude },
    };
  },

  /**
   * Persist discovered restaurants into InsForge PostgreSQL discovered_restaurants table
   */
  async cacheDiscoveredInInsForge(restaurants: Restaurant[]) {
    if (!restaurants || restaurants.length === 0) return;

    try {
      const records = restaurants.map(r => ({
        provider: 'openstreetmap',
        external_place_id: r.externalPlaceId || r.id,
        name: r.name,
        address: r.address,
        latitude: r.latitude || 28.6139,
        longitude: r.longitude || 77.2090,
        cuisine: r.cuisine,
        rating: r.rating,
        review_count: r.ratingCount,
        photo_url: r.heroImage,
        opening_hours: r.openingHours,
        last_synced_at: new Date().toISOString(),
      }));

      await insforge.database
        .from('discovered_restaurants')
        .upsert(records, { onConflict: 'external_place_id' });
    } catch (e) {
      console.warn('Cache upsert error:', e);
    }
  }
};
