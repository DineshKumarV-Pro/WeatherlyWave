/**
 * OpenWeather API Integration - Primary Weather Source
 * Optimized for free tier: Uses /weather, /forecast, and /air_pollution endpoints
 */

export class OpenWeatherAPI {
    constructor(config = {}) {
        this.apiKey = config.apiKey || 'caf87105fd3f266bec4127269ded93b4';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.geoUrl = 'https://api.openweathermap.org/geo/1.0';
        this.timeout = 10000;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.cache = new Map();
        this.rateLimit = {
            calls: 0,
            lastReset: Date.now(),
            limit: 60, // 60 calls per minute (free tier)
            interval: 60000
        };
    }

    async fetchWeather(location) {
        try {
            // Check rate limit
            if (!this.checkRateLimit()) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }

            // Check cache first (30 minutes for free tier)
            const cacheKey = `weather_${location}`;
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < 1800000) { // 30 minutes
                console.log('📦 OpenWeather cache hit for:', location);
                return cached.data;
            }

            console.log('🌤️ Fetching from OpenWeather for:', location);
            
            // Get coordinates for location
            const coords = await this.geocodeLocation(location);
            
            if (!coords || !coords.lat || !coords.lon) {
                throw new Error('Could not find coordinates for location');
            }

            // FREE TIER ENDPOINTS:
            // 1. Current weather
            const currentUrl = `${this.baseUrl}/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${this.apiKey}`;
            console.log('Fetching current weather...');
            const currentData = await this.fetchWithRetry(currentUrl);
            
            // 2. 5-day forecast (3-hour steps)
            const forecastUrl = `${this.baseUrl}/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${this.apiKey}`;
            console.log('Fetching forecast...');
            const forecastData = await this.fetchWithRetry(forecastUrl);
            
            // 3. Air pollution data
            const airUrl = `${this.baseUrl}/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}`;
            console.log('Fetching air quality...');
            const airData = await this.fetchWithRetry(airUrl).catch(() => null);

            // Combine all data
            const combinedData = {
                current: currentData,
                forecast: forecastData,
                air_pollution: airData,
                location_name: coords.name,
                location_country: coords.country,
                coords: coords,
                timestamp: Date.now()
            };

            // Cache the result
            this.cache.set(cacheKey, {
                data: combinedData,
                timestamp: Date.now()
            });

            console.log('✅ OpenWeather data fetched successfully');
            return combinedData;

        } catch (error) {
            console.error('❌ OpenWeather API error:', error);
            throw this.handleError(error);
        }
    }

    async fetchWithRetry(url, attempt = 1) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('OpenWeather error response:', errorData);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            if (attempt < this.retryAttempts) {
                console.log(`Retry attempt ${attempt} for OpenWeather API...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                return this.fetchWithRetry(url, attempt + 1);
            }
            throw error;
        }
    }

    async geocodeLocation(location) {
        try {
            // Check if location is coordinates (lat,lon format)
            if (location.includes(',')) {
                const parts = location.split(',').map(p => p.trim());
                if (parts.length === 2) {
                    const lat = parseFloat(parts[0]);
                    const lon = parseFloat(parts[1]);
                    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                        // Try reverse geocoding to get location name
                        try {
                            const reverseUrl = `${this.geoUrl}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`;
                            const response = await fetch(reverseUrl);
                            const data = await response.json();
                            if (data && data.length > 0) {
                                return {
                                    lat,
                                    lon,
                                    name: data[0].name,
                                    country: data[0].country,
                                    state: data[0].state
                                };
                            }
                        } catch (e) {
                            // Fallback to coordinates only
                        }
                        return { lat, lon, name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`, country: '' };
                    }
                }
            }

            // Geocode location name
            const url = `${this.geoUrl}/direct?q=${encodeURIComponent(location)}&limit=1&appid=${this.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!data || !data.length) {
                throw new Error('Location not found');
            }

            return {
                lat: data[0].lat,
                lon: data[0].lon,
                name: data[0].name,
                country: data[0].country,
                state: data[0].state
            };

        } catch (error) {
            console.error('Geocoding error:', error);
            throw new Error('Could not find location. Please check the name and try again.');
        }
    }

    async searchLocations(query, limit = 5) {
        try {
            const url = `${this.geoUrl}/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${this.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            return data.map(item => ({
                name: item.name,
                country: item.country,
                state: item.state,
                lat: item.lat,
                lon: item.lon,
                displayName: [item.name, item.state, item.country].filter(Boolean).join(', ')
            }));

        } catch (error) {
            console.error('Location search error:', error);
            return [];
        }
    }

    async getCurrentWeather(lat, lon) {
        try {
            const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw error;
        }
    }

    async getForecast(lat, lon) {
        try {
            const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    }

    checkRateLimit() {
        const now = Date.now();
        if (now - this.rateLimit.lastReset > this.rateLimit.interval) {
            this.rateLimit.calls = 0;
            this.rateLimit.lastReset = now;
        }

        if (this.rateLimit.calls >= this.rateLimit.limit) {
            console.warn(`⚠️ Rate limit reached: ${this.rateLimit.calls}/${this.rateLimit.limit}`);
            return false;
        }

        this.rateLimit.calls++;
        console.log(`📊 OpenWeather calls: ${this.rateLimit.calls}/${this.rateLimit.limit}`);
        return true;
    }

    handleError(error) {
        if (error.name === 'AbortError') {
            return new Error('Request timeout. Please check your connection.');
        }
        if (error.message.includes('404')) {
            return new Error('Weather data not found for this location.');
        }
        if (error.message.includes('401')) {
            return new Error('Invalid API key. Please check your configuration.');
        }
        if (error.message.includes('429')) {
            return new Error('Too many requests. Please try again later.');
        }
        return error;
    }

    clearCache() {
        this.cache.clear();
    }
}