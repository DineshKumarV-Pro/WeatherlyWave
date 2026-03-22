/**
 * Tomorrow.io API Integration - Secondary Weather Source
 * Used as fallback when OpenWeather fails
 */

export class TomorrowioAPI {
    constructor(config = {}) {
        this.apiKey = config.apiKey || 'q2VhuCvqIFaBWhtOhliEUwHtCbiwDVKg';
        this.baseUrl = 'https://api.tomorrow.io/v4';
        this.timeout = 10000;
        this.retryAttempts = 2;
        this.retryDelay = 1000;
        this.cache = new Map();
        this.rateLimit = {
            calls: 0,
            lastReset: Date.now(),
            limit: 25,
            interval: 86400000
        };
    }

    async fetchWeather(location) {
        try {
            if (!this.checkRateLimit()) {
                throw new Error('Rate limit exceeded');
            }

            const cacheKey = `weather_${location}`;
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < 3600000) {
                console.log('📦 Tomorrow.io cache hit');
                return cached.data;
            }

            console.log('☁️ Fetching from Tomorrow.io');
            
            // Parse location to get clean location string
            const locationParam = this.parseLocation(location);

            const fields = [
                'temperature',
                'temperatureApparent',
                'humidity',
                'windSpeed',
                'windDirection',
                'windGust',
                'pressureSeaLevel',
                'uvIndex',
                'visibility',
                'cloudCover',
                'weatherCode',
                'precipitationProbability',
                'precipitationIntensity',
                'dewPoint',
                'sunriseTime',
                'sunsetTime',
                'moonPhase'
            ].join(',');

            const url = `${this.baseUrl}/timelines?location=${locationParam}&fields=${fields}&timesteps=current,1h,1d&units=metric&apikey=${this.apiKey}`;
            
            console.log('Fetching Tomorrow.io...');
            const data = await this.fetchWithRetry(url);
            
            if (!data || !data.data) {
                throw new Error('Invalid response from Tomorrow.io');
            }
            
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            console.log('✅ Tomorrow.io data fetched');
            return data;

        } catch (error) {
            console.error('❌ Tomorrow.io API error:', error);
            
            const cached = this.cache.get(`weather_${location}`);
            if (cached) {
                console.log('📦 Returning stale cache');
                return cached.data;
            }
            
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
                console.error('Tomorrow.io error:', errorData);
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            if (attempt < this.retryAttempts) {
                console.log(`Retry ${attempt}...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                return this.fetchWithRetry(url, attempt + 1);
            }
            throw error;
        }
    }

    parseLocation(location) {
        // If it's coordinates, use them directly
        if (location.includes(',')) {
            const parts = location.split(',').map(p => p.trim());
            if (parts.length === 2) {
                const lat = parseFloat(parts[0]);
                const lon = parseFloat(parts[1]);
                if (!isNaN(lat) && !isNaN(lon)) {
                    return `${lat},${lon}`;
                }
            }
        }
        
        // For city names, Tomorrow.io accepts them directly
        // Just encode the location string
        return encodeURIComponent(location.split(',')[0].trim());
    }

    checkRateLimit() {
        const now = Date.now();
        if (now - this.rateLimit.lastReset > this.rateLimit.interval) {
            this.rateLimit.calls = 0;
            this.rateLimit.lastReset = now;
        }

        if (this.rateLimit.calls >= this.rateLimit.limit) {
            console.warn(`⚠️ Tomorrow.io rate limit: ${this.rateLimit.calls}/${this.rateLimit.limit}`);
            return false;
        }

        this.rateLimit.calls++;
        console.log(`📊 Tomorrow.io calls: ${this.rateLimit.calls}/${this.rateLimit.limit}`);
        return true;
    }

    handleError(error) {
        if (error.name === 'AbortError') {
            return new Error('Request timeout');
        }
        if (error.message.includes('404')) {
            return new Error('Location not found');
        }
        if (error.message.includes('401')) {
            return new Error('Invalid API key');
        }
        if (error.message.includes('429')) {
            return new Error('Rate limit exceeded');
        }
        return error;
    }

    clearCache() {
        this.cache.clear();
    }
}