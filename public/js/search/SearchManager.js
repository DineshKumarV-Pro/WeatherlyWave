/**
 * Advanced Search Manager with Autocomplete, History, and Location Search
 */

export class SearchManager {
    constructor(app) {
        this.app = app;
        this.searchHistory = [];
        this.popularLocations = [
            { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, countryCode: 'US' },
            { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, countryCode: 'GB' },
            { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, countryCode: 'JP' },
            { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, countryCode: 'AU' },
            { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, countryCode: 'FR' },
            { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, countryCode: 'AE' },
            { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, countryCode: 'SG' },
            { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, countryCode: 'IN' },
            { name: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707, countryCode: 'IN' },
            { name: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090, countryCode: 'IN' }
        ];
        this.searchTimeout = null;
        this.cache = new Map();
        this.maxHistory = 20;
        this.loadHistory();
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('weatherpro_search_history');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load search history:', e);
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('weatherpro_search_history', 
                JSON.stringify(this.searchHistory.slice(0, this.maxHistory)));
        } catch (e) {
            console.warn('Failed to save search history:', e);
        }
    }

    async search(query, options = {}) {
        const {
            type = 'location',
            limit = 10,
            useCache = true
        } = options;

        if (!query || query.length < 2) return [];

        // Check cache
        const cacheKey = `${query}_${type}_${limit}`;
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
                return cached.data;
            }
        }

        try {
            let results = [];
            
            // Check if it's coordinates first
            if (query.includes(',')) {
                results = this.parseCoordinates(query);
                if (results.length > 0) {
                    type = 'coordinates';
                }
            }
            
            // If not coordinates or no results, search locations
            if (results.length === 0) {
                results = await this.searchLocations(query, limit);
            }

            // Cache results
            this.cache.set(cacheKey, {
                data: results,
                timestamp: Date.now()
            });

            return results;
        } catch (error) {
            console.error('Search failed:', error);
            return this.fallbackSearch(query, limit);
        }
    }

    async searchLocations(query, limit) {
        // Try OpenWeather Geocoding API
        try {
            const apiKey = this.app.config.openweatherKey || 'caf87105fd3f266bec4127269ded93b4';
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${apiKey}`
            );
            
            if (!response.ok) throw new Error('API error');
            
            const data = await response.json();
            
            return data.map(item => ({
                name: item.name,
                country: item.country,
                state: item.state,
                lat: item.lat,
                lon: item.lon,
                displayName: [item.name, item.state, item.country].filter(Boolean).join(', '),
                type: 'city',
                confidence: 100
            }));
        } catch (error) {
            console.warn('Geocoding API failed, using fallback:', error);
            return this.fallbackSearch(query, limit);
        }
    }

    fallbackSearch(query, limit) {
        const normalized = query.toLowerCase();
        const results = [];
        
        // Search in popular locations
        for (const loc of this.popularLocations) {
            if (loc.name.toLowerCase().includes(normalized) || 
                loc.country.toLowerCase().includes(normalized)) {
                results.push({
                    name: loc.name,
                    country: loc.country,
                    lat: loc.lat,
                    lon: loc.lon,
                    displayName: `${loc.name}, ${loc.country}`,
                    type: 'popular',
                    confidence: 80
                });
            }
        }

        // Add history matches
        for (const hist of this.searchHistory) {
            if (hist.displayName && hist.displayName.toLowerCase().includes(normalized) && 
                !results.some(r => r.displayName === hist.displayName)) {
                results.push({
                    ...hist,
                    type: 'history',
                    confidence: 90
                });
            }
        }

        return results.slice(0, limit);
    }

    parseCoordinates(query) {
        // Support lat,lon format
        const parts = query.split(',').map(p => p.trim());
        if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lon = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                return [{
                    name: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
                    lat,
                    lon,
                    displayName: `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
                    type: 'coordinates',
                    confidence: 100
                }];
            }
        }
        return [];
    }

    async reverseGeocode(lat, lon) {
        try {
            const apiKey = this.app.config.openweatherKey || 'caf87105fd3f266bec4127269ded93b4';
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
            );
            
            if (!response.ok) throw new Error('Reverse geocoding failed');
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    name: data[0].name,
                    country: data[0].country,
                    state: data[0].state,
                    displayName: [data[0].name, data[0].state, data[0].country].filter(Boolean).join(', ')
                };
            }
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
        }
        
        return {
            name: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
            displayName: `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
        };
    }

    addToHistory(location) {
        if (!location || !location.displayName) return;
        
        // Remove if exists
        this.searchHistory = this.searchHistory.filter(h => 
            h.displayName !== location.displayName
        );
        
        // Add to front
        this.searchHistory.unshift({
            ...location,
            timestamp: Date.now()
        });
        
        // Limit size
        if (this.searchHistory.length > this.maxHistory) {
            this.searchHistory.pop();
        }
        
        this.saveHistory();
    }

    getHistory() {
        return this.searchHistory;
    }

    clearHistory() {
        this.searchHistory = [];
        this.saveHistory();
        if (this.app?.ui?.loader) {
            this.app.ui.loader.showSuccess('Search history cleared');
        }
    }

    async getSuggestions(query) {
        if (query.length < 2) return [];

        const suggestions = [];
        const normalized = query.toLowerCase();

        // Add history matches
        for (const hist of this.searchHistory) {
            if (hist.displayName && hist.displayName.toLowerCase().includes(normalized)) {
                suggestions.push({
                    ...hist,
                    type: 'history',
                    icon: '🕒'
                });
            }
        }

        // Add popular locations
        for (const loc of this.popularLocations) {
            if (loc.name.toLowerCase().startsWith(normalized) && 
                !suggestions.some(s => s.displayName === `${loc.name}, ${loc.country}`)) {
                suggestions.push({
                    name: loc.name,
                    country: loc.country,
                    lat: loc.lat,
                    lon: loc.lon,
                    displayName: `${loc.name}, ${loc.country}`,
                    type: 'popular',
                    icon: '🔥'
                });
            }
        }

        // Add current location if available
        if (this.app?.state?.coords) {
            const { lat, lon } = this.app.state.coords;
            suggestions.push({
                name: 'Current Location',
                lat,
                lon,
                displayName: '📍 Current Location',
                type: 'current',
                icon: '📍'
            });
        }

        return suggestions.slice(0, 8);
    }

    clearCache() {
        this.cache.clear();
        if (this.app?.ui?.loader) {
            this.app.ui.loader.showSuccess('Search cache cleared');
        }
    }
}