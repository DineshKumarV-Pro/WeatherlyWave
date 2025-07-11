// Local Storage and Cache Management
class StorageManager {
    constructor() {
        this.prefix = 'weatherlywave_';
        this.maxRecentLocations = 5;
        this.cacheExpiry = 10 * 60 * 1000; // 10 minutes in milliseconds
    }

    // Get item from localStorage
    getItem(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting item from localStorage:', error);
            return null;
        }
    }

    // Set item in localStorage
    setItem(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (error) {
            console.error('Error setting item in localStorage:', error);
        }
    }

    // Remove item from localStorage
    removeItem(key) {
        try {
            localStorage.removeItem(this.prefix + key);
        } catch (error) {
            console.error('Error removing item from localStorage:', error);
        }
    }

    // Cache weather data
    cacheWeatherData(location, data) {
        const cacheKey = `weather_${location}`;
        const cacheData = {
            data: data,
            timestamp: Date.now()
        };
        this.setItem(cacheKey, cacheData);
    }

    // Get cached weather data
    getCachedWeatherData(location) {
        const cacheKey = `weather_${location}`;
        const cached = this.getItem(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }
        
        return null;
    }

    // Cache forecast data
    cacheForecastData(location, data) {
        const cacheKey = `forecast_${location}`;
        const cacheData = {
            data: data,
            timestamp: Date.now()
        };
        this.setItem(cacheKey, cacheData);
    }

    // Get cached forecast data
    getCachedForecastData(location) {
        const cacheKey = `forecast_${location}`;
        const cached = this.getItem(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }
        
        return null;
    }

    // Cache air quality data
    cacheAirQualityData(location, data) {
        const cacheKey = `airquality_${location}`;
        const cacheData = {
            data: data,
            timestamp: Date.now()
        };
        this.setItem(cacheKey, cacheData);
    }

    // Get cached air quality data
    getCachedAirQualityData(location) {
        const cacheKey = `airquality_${location}`;
        const cached = this.getItem(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }
        
        return null;
    }

    // Manage recent locations
    addRecentLocation(location) {
        let recentLocations = this.getItem('recent_locations') || [];
        
        // Remove if already exists
        recentLocations = recentLocations.filter(loc => loc.name !== location.name);
        
        // Add to beginning
        recentLocations.unshift(location);
        
        // Keep only max recent locations
        if (recentLocations.length > this.maxRecentLocations) {
            recentLocations = recentLocations.slice(0, this.maxRecentLocations);
        }
        
        this.setItem('recent_locations', recentLocations);
    }

    // Get recent locations
    getRecentLocations() {
        return this.getItem('recent_locations') || [];
    }

    // Remove recent location
    removeRecentLocation(locationName) {
        let recentLocations = this.getItem('recent_locations') || [];
        recentLocations = recentLocations.filter(loc => loc.name !== locationName);
        this.setItem('recent_locations', recentLocations);
    }

    // User preferences
    getUserPreferences() {
        return this.getItem('user_preferences') || {
            temperatureUnit: 'metric',
            windSpeedUnit: 'kmh',
            autoLocation: true,
            notifications: false
        };
    }

    // Save user preferences
    saveUserPreferences(preferences) {
        this.setItem('user_preferences', preferences);
    }

    // Current location
    getCurrentLocation() {
    return this.getItem('current_location') || {
        name: 'Chennai, IN',
        lat: 13.0827,
        lon: 80.2707,
        country: 'IN'
    };
}

    // Save current location
    saveCurrentLocation(location) {
        this.setItem('current_location', location);
    }

    // Weather trends data
    addWeatherTrend(location, data) {
        const trendKey = `trends_${location}`;
        let trends = this.getItem(trendKey) || [];
        
        const today = new Date().toDateString();
        
        // Remove existing entry for today
        trends = trends.filter(trend => trend.date !== today);
        
        // Add new entry
        trends.push({
            date: today,
            temperature: data.temperature,
            humidity: data.humidity,
            pressure: data.pressure,
            windSpeed: data.windSpeed,
            timestamp: Date.now()
        });
        
        // Keep only last 7 days
        if (trends.length > 7) {
            trends = trends.slice(-7);
        }
        
        this.setItem(trendKey, trends);
    }

    // Get weather trends
    getWeatherTrends(location) {
        const trendKey = `trends_${location}`;
        return this.getItem(trendKey) || [];
    }

    // Clean old cache
    cleanOldCache() {
        const keys = Object.keys(localStorage);
        const now = Date.now();
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                const item = this.getItem(key.replace(this.prefix, ''));
                if (item && item.timestamp && (now - item.timestamp) > (24 * 60 * 60 * 1000)) {
                    this.removeItem(key.replace(this.prefix, ''));
                }
            }
        });
    }

    // Export data for backup
    exportData() {
        const data = {};
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                data[key] = localStorage.getItem(key);
            }
        });
        
        return JSON.stringify(data);
    }

    // Import data from backup
    importData(dataString) {
        try {
            const data = JSON.parse(dataString);
            
            Object.keys(data).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.setItem(key, data[key]);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all app data
    clearAllData() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    // Get storage usage
    getStorageUsage() {
        let totalSize = 0;
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                totalSize += localStorage.getItem(key).length;
            }
        });
        
        return {
            size: totalSize,
            sizeKB: Math.round(totalSize / 1024),
            itemCount: keys.filter(key => key.startsWith(this.prefix)).length
        };
    }

    // Initialize storage
    init() {
        // Clean old cache on startup
        this.cleanOldCache();
        
        // Set default preferences if not exist
        if (!this.getItem('user_preferences')) {
            this.saveUserPreferences({
                temperatureUnit: 'metric',
                windSpeedUnit: 'kmh',
                autoLocation: true,
                notifications: false
            });
        }
        
        // Set default location if not exist
        if (!this.getItem('current_location')) {
            this.saveCurrentLocation({
                name: 'Chennai, IN',
                lat: 13.0827,
                lon: 80.2707,
                country: 'IN'
            });
        }
    }
}

// Create global instance
const storageManager = new StorageManager();
