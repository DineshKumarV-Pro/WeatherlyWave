// Weather API and Data Management
class WeatherService {
    constructor() {
        this.apiKey = 'caf87105fd3f266bec4127269ded93b4';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.geoUrl = 'https://api.openweathermap.org/geo/1.0';
        this.isOnline = navigator.onLine;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineIndicator();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineIndicator();
        });
    }

    // Get current weather data
    async getCurrentWeather(lat, lon) {
        const locationKey = `${lat},${lon}`;
        
        // Try to get cached data first
        const cachedData = storageManager.getCachedWeatherData(locationKey);
        if (cachedData && !this.isOnline) {
            return cachedData;
        }
        
        try {
            const response = await fetch(
                `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the data
            storageManager.cacheWeatherData(locationKey, data);
            
            return data;
        } catch (error) {
            console.error('Error fetching current weather:', error);
            
            // Return cached data if available
            if (cachedData) {
                return cachedData;
            }
            
            throw error;
        }
    }

    // Get 5-day forecast
    async getForecast(lat, lon) {
        const locationKey = `${lat},${lon}`;
        
        // Try to get cached data first
        const cachedData = storageManager.getCachedForecastData(locationKey);
        if (cachedData && !this.isOnline) {
            return cachedData;
        }
        
        try {
            const response = await fetch(
                `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the data
            storageManager.cacheForecastData(locationKey, data);
            
            return data;
        } catch (error) {
            console.error('Error fetching forecast:', error);
            
            // Return cached data if available
            if (cachedData) {
                return cachedData;
            }
            
            throw error;
        }
    }

    // Get air quality data
    async getAirQuality(lat, lon) {
        const locationKey = `${lat},${lon}`;
        
        // Try to get cached data first
        const cachedData = storageManager.getCachedAirQualityData(locationKey);
        if (cachedData && !this.isOnline) {
            return cachedData;
        }
        
        try {
            const response = await fetch(
                `${this.baseUrl}/air_pollution?lat=${lat}&lon=${lon}&appid=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the data
            storageManager.cacheAirQualityData(locationKey, data);
            
            return data;
        } catch (error) {
            console.error('Error fetching air quality:', error);
            
            // Return cached data if available
            if (cachedData) {
                return cachedData;
            }
            
            throw error;
        }
    }

    // Geocoding - get coordinates from city name
    async geocodeCity(cityName) {
        try {
            // First try with just the city name
            let response = await fetch(
                `${this.geoUrl}/direct?q=${encodeURIComponent(cityName)}&limit=10&appid=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let data = await response.json();
            
            // If we have results, prioritize based on population and country
            if (data.length > 0) {
                // Sort by population (descending) and prioritize major cities
                data.sort((a, b) => {
                    // Special handling for specific cities
                    const cityLower = cityName.toLowerCase();
                    
                    // Chennai specific handling
                    if (cityLower.includes('chennai')) {
                        if (a.country === 'IN' && a.state === 'Tamil Nadu') return -1;
                        if (b.country === 'IN' && b.state === 'Tamil Nadu') return 1;
                    }
                    
                    // Mumbai specific handling
                    if (cityLower.includes('mumbai')) {
                        if (a.country === 'IN' && a.state === 'Maharashtra') return -1;
                        if (b.country === 'IN' && b.state === 'Maharashtra') return 1;
                    }
                    
                    // Delhi specific handling
                    if (cityLower.includes('delhi')) {
                        if (a.country === 'IN' && (a.state === 'Delhi' || a.state === 'National Capital Territory of Delhi')) return -1;
                        if (b.country === 'IN' && (b.state === 'Delhi' || b.state === 'National Capital Territory of Delhi')) return 1;
                    }
                    
                    // General sorting by population if available
                    const popA = a.population || 0;
                    const popB = b.population || 0;
                    
                    if (popA !== popB) {
                        return popB - popA;
                    }
                    
                    // If no population data, prioritize by country (major countries first)
                    const majorCountries = ['US', 'GB', 'IN', 'CN', 'DE', 'FR', 'JP', 'BR', 'AU', 'CA'];
                    const aIndex = majorCountries.indexOf(a.country);
                    const bIndex = majorCountries.indexOf(b.country);
                    
                    if (aIndex !== -1 && bIndex !== -1) {
                        return aIndex - bIndex;
                    }
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                    
                    return 0;
                });
            }
            
            return data;
        } catch (error) {
            console.error('Error geocoding city:', error);
            throw error;
        }
    }

    // Reverse geocoding - get city name from coordinates
    async reverseGeocode(lat, lon) {
        try {
            const response = await fetch(
                `${this.geoUrl}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            throw error;
        }
    }

    // Get weather icon URL
    getWeatherIconUrl(iconCode, size = '2x') {
        return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
    }

    // Get animated weather icon class
    getAnimatedWeatherIcon(condition, isDay = true) {
        const conditionMap = {
            'clear sky': isDay ? 'clear-day' : 'clear-night',
            'few clouds': isDay ? 'partly-cloudy-day' : 'partly-cloudy-night',
            'scattered clouds': isDay ? 'partly-cloudy-day' : 'partly-cloudy-night',
            'broken clouds': 'cloudy',
            'overcast clouds': 'cloudy',
            'shower rain': 'rain',
            'rain': 'rain',
            'light rain': 'drizzle',
            'moderate rain': 'rain',
            'heavy rain': 'rain',
            'thunderstorm': 'thunderstorm',
            'snow': 'snow',
            'mist': 'fog',
            'fog': 'fog',
            'haze': 'fog'
        };
        
        return conditionMap[condition.toLowerCase()] || 'clear-day';
    }

    // Format weather data for display
    formatWeatherData(data) {
        const preferences = storageManager.getUserPreferences();
        
        return {
            location: `${data.name}, ${data.sys.country}`,
            temperature: this.formatTemperature(data.main.temp, preferences.temperatureUnit),
            feelsLike: this.formatTemperature(data.main.feels_like, preferences.temperatureUnit),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: this.formatWindSpeed(data.wind.speed, preferences.windSpeedUnit),
            windDegree: data.wind.deg,
            visibility: data.visibility / 1000, // Convert to km
            cloudiness: data.clouds.all,
            sunrise: new Date(data.sys.sunrise * 1000),
            sunset: new Date(data.sys.sunset * 1000),
            icon: data.weather[0].icon,
            condition: data.weather[0].main,
            timestamp: new Date(data.dt * 1000)
        };
    }

    // Format temperature based on unit preference
    formatTemperature(temp, unit = 'metric') {
        switch (unit) {
            case 'imperial':
                return `${Math.round(temp * 9/5 + 32)}°F`;
            case 'kelvin':
                return `${Math.round(temp + 273.15)}K`;
            default:
                return `${Math.round(temp)}°C`;
        }
    }

    // Format wind speed based on unit preference
    formatWindSpeed(speed, unit = 'kmh') {
        switch (unit) {
            case 'mph':
                return `${Math.round(speed * 2.237)} mph`;
            case 'ms':
                return `${Math.round(speed * 10) / 10} m/s`;
            default:
                return `${Math.round(speed * 3.6)} km/h`;
        }
    }

    // Format air quality data
    formatAirQualityData(data) {
        const aqi = data.list[0].main.aqi;
        const components = data.list[0].components;
        
        const aqiLabels = {
            1: 'Good',
            2: 'Fair',
            3: 'Moderate',
            4: 'Poor',
            5: 'Very Poor'
        };
        
        const aqiDescriptions = {
            1: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
            2: 'Air quality is acceptable; however, there may be a moderate health concern for a very small number of people.',
            3: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.',
            4: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
            5: 'Health warnings of emergency conditions. The entire population is more likely to be affected.'
        };
        
        return {
            aqi: aqi,
            label: aqiLabels[aqi],
            description: aqiDescriptions[aqi],
            components: {
                pm25: Math.round(components.pm2_5 * 10) / 10,
                pm10: Math.round(components.pm10 * 10) / 10,
                o3: Math.round(components.o3 * 10) / 10,
                no2: Math.round(components.no2 * 10) / 10,
                so2: Math.round(components.so2 * 10) / 10,
                co: Math.round(components.co * 10) / 10
            }
        };
    }

    // Process forecast data for hourly and daily views
    processForecastData(data) {
        const hourlyData = [];
        const dailyData = {};
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            
            // Hourly data (next 48 hours)
            if (hourlyData.length < 16) {
                hourlyData.push({
                    time: date,
                    temperature: Math.round(item.main.temp),
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    humidity: item.main.humidity,
                    windSpeed: item.wind.speed,
                    precipitation: item.rain ? item.rain['3h'] || 0 : 0
                });
            }
            
            // Daily data
            if (!dailyData[dayKey]) {
                dailyData[dayKey] = {
                    date: date,
                    temperatures: [],
                    conditions: [],
                    humidity: [],
                    windSpeed: [],
                    precipitation: 0
                };
            }
            
            dailyData[dayKey].temperatures.push(item.main.temp);
            dailyData[dayKey].conditions.push(item.weather[0]);
            dailyData[dayKey].humidity.push(item.main.humidity);
            dailyData[dayKey].windSpeed.push(item.wind.speed);
            dailyData[dayKey].precipitation += item.rain ? item.rain['3h'] || 0 : 0;
        });
        
        // Process daily data
        const dailyArray = Object.values(dailyData).slice(0, 5).map(day => {
            const temps = day.temperatures;
            const mostCommonCondition = this.getMostCommonCondition(day.conditions);
            
            return {
                date: day.date,
                high: Math.round(Math.max(...temps)),
                low: Math.round(Math.min(...temps)),
                condition: mostCommonCondition.main,
                description: mostCommonCondition.description,
                icon: mostCommonCondition.icon,
                humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
                windSpeed: Math.round((day.windSpeed.reduce((a, b) => a + b) / day.windSpeed.length) * 10) / 10,
                precipitation: Math.round(day.precipitation * 10) / 10
            };
        });
        
        return { hourly: hourlyData, daily: dailyArray };
    }

    // Get most common weather condition for a day
    getMostCommonCondition(conditions) {
        const conditionCounts = {};
        
        conditions.forEach(condition => {
            const key = condition.main;
            conditionCounts[key] = (conditionCounts[key] || 0) + 1;
        });
        
        const mostCommon = Object.keys(conditionCounts).reduce((a, b) => 
            conditionCounts[a] > conditionCounts[b] ? a : b
        );
        
        return conditions.find(c => c.main === mostCommon);
    }

    // Calculate golden hour times
    calculateGoldenHour(sunrise, sunset) {
        const goldenHourDuration = 60 * 60 * 1000; // 1 hour in milliseconds
        
        return {
            morningStart: new Date(sunrise.getTime() - goldenHourDuration),
            morningEnd: new Date(sunrise.getTime() + goldenHourDuration),
            eveningStart: new Date(sunset.getTime() - goldenHourDuration),
            eveningEnd: new Date(sunset.getTime() + goldenHourDuration)
        };
    }

    // Show offline indicator
    showOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.add('show');
        }
    }

    // Hide offline indicator
    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.remove('show');
        }
    }

    // Get current location using geolocation API
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    // Initialize weather service
    init() {
        // Show offline indicator if offline
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }
}

// Create global instance
const weatherService = new WeatherService();
