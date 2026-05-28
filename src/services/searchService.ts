import { getSearchHistory } from "@/services/historyStorage";
import type { LocationSuggestion } from "@/types/weather";

const popularLocations: LocationSuggestion[] = [
  { name: "New York", country: "USA", lat: 40.7128, lon: -74.006, displayName: "New York, USA", type: "popular", confidence: 80 },
  { name: "London", country: "UK", lat: 51.5074, lon: -0.1278, displayName: "London, UK", type: "popular", confidence: 80 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, displayName: "Tokyo, Japan", type: "popular", confidence: 80 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, displayName: "Sydney, Australia", type: "popular", confidence: 80 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, displayName: "Paris, France", type: "popular", confidence: 80 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708, displayName: "Dubai, UAE", type: "popular", confidence: 80 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, displayName: "Singapore", type: "popular", confidence: 80 },
  { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777, displayName: "Mumbai, India", type: "popular", confidence: 80 },
  { name: "Chennai", country: "India", lat: 13.0827, lon: 80.2707, displayName: "Chennai, India", type: "popular", confidence: 80 },
  { name: "Delhi", country: "India", lat: 28.6139, lon: 77.209, displayName: "Delhi, India", type: "popular", confidence: 80 }
];

const cache = new Map<string, { timestamp: number; results: LocationSuggestion[] }>();

export const searchService = {
  async searchLocations(query: string, limit = 8): Promise<LocationSuggestion[]> {
    const normalized = query.trim();
    if (normalized.length < 2) return [];

    const cached = cache.get(normalized.toLowerCase());
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.results;
    }

    const coordinate = parseCoordinates(normalized);
    if (coordinate) {
      return [
        {
          name: `${coordinate.lat.toFixed(4)}, ${coordinate.lon.toFixed(4)}`,
          displayName: `Coordinates: ${coordinate.lat.toFixed(4)}, ${coordinate.lon.toFixed(4)}`,
          lat: coordinate.lat,
          lon: coordinate.lon,
          type: "coordinates",
          confidence: 100
        }
      ];
    }

    const apiResults = await openWeatherSearch(normalized, limit).catch(() => []);
    const results = apiResults.length ? apiResults : fallbackSearch(normalized, limit);
    cache.set(normalized.toLowerCase(), { timestamp: Date.now(), results });
    return results;
  },

  async reverseGeocode(lat: number, lon: number): Promise<LocationSuggestion> {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) return coordinateSuggestion(lat, lon);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
      );
      if (!response.ok) throw new Error("Reverse geocoding failed");
      const data = (await response.json()) as Array<{ name?: string; country?: string; state?: string }>;
      const first = data[0];
      if (!first) return coordinateSuggestion(lat, lon);
      return {
        name: first.name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        country: first.country,
        state: first.state,
        lat,
        lon,
        displayName: [first.name, first.state, first.country].filter(Boolean).join(", "),
        type: "current",
        confidence: 100
      };
    } catch {
      return coordinateSuggestion(lat, lon);
    }
  },

  async getApproximateLocation(): Promise<LocationSuggestion | null> {
    const providers = [fetchIpApiLocation, fetchIpWhoIsLocation];

    for (const provider of providers) {
      try {
        const location = await provider();
        if (location) return location;
      } catch {
        // Try the next provider.
      }
    }

    return null;
  }
};

async function openWeatherSearch(query: string, limit: number): Promise<LocationSuggestion[]> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) return [];

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${apiKey}`
  );
  if (!response.ok) throw new Error("Location search failed");
  const data = (await response.json()) as Array<{ name?: string; country?: string; state?: string; lat?: number; lon?: number }>;

  return data
    .filter((item) => typeof item.lat === "number" && typeof item.lon === "number")
    .map((item) => ({
      name: item.name || "Unknown",
      country: item.country,
      state: item.state,
      lat: item.lat as number,
      lon: item.lon as number,
      displayName: [item.name, item.state, item.country].filter(Boolean).join(", "),
      type: "city",
      confidence: 100
    }));
}

function fallbackSearch(query: string, limit: number): LocationSuggestion[] {
  const needle = query.toLowerCase();
  const popular = popularLocations.filter(
    (location) => location.name.toLowerCase().includes(needle) || location.country?.toLowerCase().includes(needle)
  );
  const history = getSearchHistory().filter(
    (location) =>
      location.displayName.toLowerCase().includes(needle) &&
      !popular.some((item) => item.displayName === location.displayName)
  );
  return [...popular, ...history].slice(0, limit);
}

function parseCoordinates(query: string) {
  const parts = query.split(",").map((part) => part.trim());
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lon = Number(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

function coordinateSuggestion(lat: number, lon: number): LocationSuggestion {
  return {
    name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    displayName: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    lat,
    lon,
    type: "coordinates",
    confidence: 100
  };
}

async function fetchIpApiLocation(): Promise<LocationSuggestion | null> {
  const data = await fetchJsonWithTimeout<{
    city?: string;
    region?: string;
    country_name?: string;
    latitude?: number;
    longitude?: number;
  }>("https://ipapi.co/json/");

  if (typeof data.latitude !== "number" || typeof data.longitude !== "number") return null;

  return {
    name: data.city || "Current area",
    state: data.region,
    country: data.country_name,
    lat: data.latitude,
    lon: data.longitude,
    displayName: [data.city, data.region, data.country_name].filter(Boolean).join(", "),
    type: "current",
    confidence: 70
  };
}

async function fetchIpWhoIsLocation(): Promise<LocationSuggestion | null> {
  const data = await fetchJsonWithTimeout<{
    success?: boolean;
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }>("https://ipwho.is/");

  if (data.success === false || typeof data.latitude !== "number" || typeof data.longitude !== "number") return null;

  return {
    name: data.city || "Current area",
    state: data.region,
    country: data.country,
    lat: data.latitude,
    lon: data.longitude,
    displayName: [data.city, data.region, data.country].filter(Boolean).join(", "),
    type: "current",
    confidence: 65
  };
}

async function fetchJsonWithTimeout<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
