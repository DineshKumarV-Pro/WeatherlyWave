/**
 * Weather Engine - Manages API requests with OpenWeather as primary
 */

export class WeatherEngine {
    constructor(apis, config = {}) {
        this.apis = apis;
        this.priority = config.priority || ['openweather', 'tomorrowio'];
        this.fallbackEnabled = config.fallback || true;
        this.cache = new Map();
        this.cacheTimeout = config.cacheTimeout || 1800000;
        this.retryAttempts = config.retryAttempts || 2;
        this.metrics = {
            apiCalls: 0,
            cacheHits: 0,
            fallbacks: 0,
            errors: []
        };
    }

    async getWeatherData(location) {
        const cacheKey = `weather_${location}`;
        const startTime = Date.now();
        
        try {
            // Check cache first
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('📦 Cache hit for:', location);
                this.metrics.cacheHits++;
                return cached.data;
            }

            // Try APIs in priority order
            for (let i = 0; i < this.priority.length; i++) {
                const apiName = this.priority[i];
                const api = this.apis[apiName];
                
                if (!api) continue;
                
                try {
                    console.log(`🎯 Trying ${apiName} for:`, location);
                    
                    const data = await api.fetchWeather(location);
                    
                    if (!data) {
                        throw new Error('No data received');
                    }
                    
                    // Process and normalize data
                    const normalizedData = this.normalizeData(data, apiName, location);
                    
                    // Add metadata
                    normalizedData.metadata = {
                        source: apiName,
                        timestamp: Date.now(),
                        location: location,
                        responseTime: Date.now() - startTime
                    };
                    
                    // Cache the result
                    this.cache.set(cacheKey, {
                        data: normalizedData,
                        timestamp: Date.now()
                    });
                    
                    this.metrics.apiCalls++;
                    
                    console.log(`✅ Successfully got data from ${apiName} for:`, location);
                    
                    return normalizedData;
                    
                } catch (error) {
                    console.warn(`❌ ${apiName} failed:`, error.message);
                    this.metrics.errors.push({
                        api: apiName,
                        error: error.message,
                        timestamp: Date.now()
                    });
                    
                    if (this.fallbackEnabled && i < this.priority.length - 1) {
                        this.metrics.fallbacks++;
                        console.log(`🔄 Falling back to ${this.priority[i + 1]}`);
                    }
                    
                    continue;
                }
            }
            
            // If all APIs fail, use default data with location info
            console.warn('⚠️ All APIs failed, using default data for:', location);
            const defaultData = this.getDefaultWeatherData(location);
            defaultData.metadata = {
                source: 'default',
                timestamp: Date.now(),
                location: location,
                isFallback: true
            };
            
            return defaultData;
            
        } catch (error) {
            console.error('Weather engine error:', error);
            throw error;
        }
    }

    normalizeData(data, source, location) {
        try {
            switch (source) {
                case 'openweather':
                    return this.normalizeOpenWeather(data, location);
                case 'tomorrowio':
                    return this.normalizeTomorrowio(data, location);
                default:
                    return data;
            }
        } catch (error) {
            console.error('Error normalizing data:', error);
            return this.getDefaultWeatherData(location);
        }
    }

    normalizeOpenWeather(data, location) {
        try {
            const current = data.current || {};
            const forecast = data.forecast || { list: [] };
            const air = data.air_pollution || { list: [{ main: { aqi: 2 } }] };

            // Get location name from data or extract from location string
            let locationName = data.location_name || location.split(',')[0].trim();
            
            // If location is coordinates, format nicely
            if (location.includes(',')) {
                const [lat, lon] = location.split(',').map(v => parseFloat(v.trim()));
                if (!isNaN(lat) && !isNaN(lon)) {
                    locationName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
                }
            }

            const currentWeather = {
                temperature: Math.round(current.main?.temp || 27),
                feelsLike: Math.round(current.main?.feels_like || 27),
                humidity: Math.round(current.main?.humidity || 72),
                windSpeed: Math.round((current.wind?.speed || 12) * 3.6), // Convert m/s to km/h
                windDirection: this.getWindDirection(current.wind?.deg || 315),
                pressure: Math.round(current.main?.pressure || 1012),
                uvIndex: 6,
                visibility: current.visibility ? (current.visibility / 1000).toFixed(1) : 10,
                cloudCover: Math.round(current.clouds?.all || 45),
                condition: this.mapOpenWeatherCondition(current.weather?.[0]?.id || 801),
                icon: this.mapOpenWeatherIcon(current.weather?.[0]?.icon || '02d'),
                high: null,
                low: null
            };

            const forecastData = this.normalizeOpenWeatherForecast(forecast.list || []);
            
            if (forecastData.length > 0) {
                currentWeather.high = forecastData[0].temp;
                currentWeather.low = forecastData[0].tempMin;
            }

            const hourlyData = this.normalizeOpenWeatherHourly(forecast.list || []);

            const kpis = {
                humidity: currentWeather.humidity,
                windSpeed: currentWeather.windSpeed,
                windDirection: currentWeather.windDirection,
                pressure: currentWeather.pressure,
                uvIndex: currentWeather.uvIndex,
                aqi: this.convertAQI(air.list[0]?.main?.aqi || 2),
                visibility: currentWeather.visibility,
                dewPoint: Math.round(current.main?.temp ? current.main.temp - ((100 - currentWeather.humidity) / 5) : 16),
                cloudCover: currentWeather.cloudCover,
                precipitation: this.calculatePrecipitation(forecast.list || []),
                gusts: current.wind?.gust ? Math.round(current.wind.gust * 3.6) : Math.round(currentWeather.windSpeed * 1.5)
            };

            return {
                current: currentWeather,
                forecast: forecastData,
                hourly: hourlyData,
                solar: this.getSolarData(current.sys || {}),
                kpis: kpis,
                coords: data.coords || { lat: 0, lon: 0 },
                location_name: locationName
            };

        } catch (error) {
            console.error('Error normalizing OpenWeather:', error);
            return this.getDefaultWeatherData(location);
        }
    }

    normalizeTomorrowio(data, location) {
        try {
            if (!data || !data.data) {
                throw new Error('Invalid Tomorrow.io data');
            }

            const timelines = data.data.timelines || {};
            const current = timelines.current?.[0]?.values || {};
            const hourly = timelines.hourly || [];
            const daily = timelines.daily || [];

            // Get location name
            let locationName = location.split(',')[0].trim();
            if (location.includes(',')) {
                const [lat, lon] = location.split(',').map(v => parseFloat(v.trim()));
                if (!isNaN(lat) && !isNaN(lon)) {
                    locationName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
                }
            }

            return {
                current: {
                    temperature: Math.round(current.temperature) || 27,
                    feelsLike: Math.round(current.temperatureApparent) || 27,
                    humidity: Math.round(current.humidity) || 72,
                    windSpeed: Math.round(current.windSpeed) || 12,
                    windDirection: this.getWindDirection(current.windDirection || 315),
                    pressure: Math.round(current.pressureSeaLevel) || 1012,
                    uvIndex: Math.round(current.uvIndex) || 6,
                    visibility: (current.visibility || 10).toFixed(1),
                    cloudCover: Math.round(current.cloudCover) || 45,
                    condition: this.mapCondition(current.weatherCode || 1101),
                    icon: this.mapWeatherIcon(current.weatherCode || 1101),
                    high: daily[0]?.values?.temperatureMax ? Math.round(daily[0].values.temperatureMax) : 29,
                    low: daily[0]?.values?.temperatureMin ? Math.round(daily[0].values.temperatureMin) : 15
                },
                forecast: this.normalizeTomorrowioForecast(daily),
                hourly: this.normalizeTomorrowioHourly(hourly),
                solar: this.getTomorrowioSolarData(current),
                kpis: this.getTomorrowioKPIs(current),
                coords: data.location || { lat: 0, lon: 0 },
                location_name: locationName
            };
        } catch (error) {
            console.error('Error normalizing Tomorrow.io:', error);
            return this.getDefaultWeatherData(location);
        }
    }

    normalizeOpenWeatherForecast(forecastList) {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dailyMap = new Map();

        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            
            if (!dailyMap.has(dayKey)) {
                dailyMap.set(dayKey, {
                    temps: [],
                    temps_min: [],
                    temps_max: [],
                    pops: [],
                    winds: [],
                    humidities: [],
                    weather: item.weather?.[0] || { icon: '02d' } // fallback
                });
            }
            
            const day = dailyMap.get(dayKey);
            day.temps.push(item.main.temp);
            day.temps_min.push(item.main.temp_min);
            day.temps_max.push(item.main.temp_max);
            day.pops.push(item.pop || 0);
            day.winds.push(item.wind.speed * 3.6); // Convert m/s to km/h
            day.humidities.push(item.main.humidity);
        });

        return Array.from(dailyMap.entries()).map(([dateStr, data]) => {
            const date = new Date(dateStr);
            return {
                day: days[date.getDay()],
                icon: this.mapOpenWeatherIcon(data.weather.icon),
                temp: Math.round(Math.max(...data.temps_max)),
                tempMin: Math.round(Math.min(...data.temps_min)),
                precipChance: Math.round(Math.max(...data.pops) * 100),
                wind: Math.round(data.winds.reduce((a, b) => a + b, 0) / data.winds.length),
                humidity: Math.round(data.humidities.reduce((a, b) => a + b, 0) / data.humidities.length),
                uv: 6
            };
        }).slice(0, 7);
    }

    normalizeOpenWeatherHourly(forecastList) {
        return forecastList.slice(0, 24).map((item, index) => {
            const date = new Date(item.dt * 1000);
            return {
                time: index === 0 ? 'NOW' : date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
                temp: Math.round(item.main.temp),
                icon: this.mapOpenWeatherIcon(item.weather?.[0]?.icon || '02d'),
                precip: Math.round((item.pop || 0) * 100),
                wind: Math.round(item.wind.speed * 3.6),
                humidity: Math.round(item.main.humidity)
            };
        });
    }

    normalizeTomorrowioForecast(dailyData) {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const forecast = [];

        if (!dailyData || !dailyData.length) {
            return this.getDefaultForecast();
        }

        for (let i = 0; i < Math.min(7, dailyData.length); i++) {
            const day = dailyData[i];
            const date = new Date(day.time);
            const dayName = days[date.getDay()];
            
            forecast.push({
                day: dayName,
                icon: this.mapWeatherIcon(day.values?.weatherCode || 1100),
                temp: Math.round(day.values?.temperatureMax || 25),
                tempMin: Math.round(day.values?.temperatureMin || 18),
                precipChance: Math.round(day.values?.precipitationProbability || 0),
                wind: Math.round(day.values?.windSpeed || 12),
                humidity: Math.round(day.values?.humidity || 65),
                uv: Math.round(day.values?.uvIndex || 6)
            });
        }

        return forecast;
    }

    normalizeTomorrowioHourly(hourlyData) {
        const hours = [];

        if (!hourlyData || !hourlyData.length) {
            return this.getDefaultHourly();
        }

        for (let i = 0; i < Math.min(24, hourlyData.length); i++) {
            const hour = hourlyData[i];
            const time = new Date(hour.time);
            
            hours.push({
                time: i === 0 ? 'NOW' : time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
                temp: Math.round(hour.values?.temperature || 25),
                icon: this.mapWeatherIcon(hour.values?.weatherCode || 1100),
                precip: Math.round(hour.values?.precipitationProbability || 0),
                wind: Math.round(hour.values?.windSpeed || 10),
                humidity: Math.round(hour.values?.humidity || 65)
            });
        }

        return hours;
    }

    getTomorrowioSolarData(current) {
        return {
            sunrise: this.formatTimeFromTimestamp(current.sunriseTime),
            sunset: this.formatTimeFromTimestamp(current.sunsetTime),
            daylightDuration: this.calculateDaylightDuration(current.sunriseTime, current.sunsetTime),
            currentTime: this.formatTime(new Date()),
            solarNoon: '12:00 PM',
            firstLight: this.formatTimeFromTimestamp((current.sunriseTime || Date.now()/1000) - 25 * 60),
            lastLight: this.formatTimeFromTimestamp((current.sunsetTime || Date.now()/1000) + 25 * 60),
            moonPhase: this.getMoonPhase(current.moonPhase || 0.32),
            moonIllumination: Math.round((current.moonPhase || 0.32) * 100),
            moonrise: this.formatTimeFromTimestamp(current.moonriseTime),
            moonset: this.formatTimeFromTimestamp(current.moonsetTime)
        };
    }

    getTomorrowioKPIs(current) {
        return {
            humidity: Math.round(current.humidity || 72),
            windSpeed: Math.round(current.windSpeed || 12),
            windDirection: this.getWindDirection(current.windDirection || 315),
            pressure: Math.round(current.pressureSeaLevel || 1012),
            uvIndex: Math.round(current.uvIndex || 6),
            aqi: Math.round(current.pm25 || 42),
            visibility: (current.visibility || 10).toFixed(1),
            dewPoint: Math.round(current.dewPoint || 16),
            cloudCover: Math.round(current.cloudCover || 45),
            precipitation: (current.precipitationIntensity || 0.2).toFixed(1),
            gusts: Math.round((current.windGust || current.windSpeed * 1.8) || 22)
        };
    }

    getSolarData(sys) {
        return {
            sunrise: this.formatTimeFromTimestamp(sys.sunrise),
            sunset: this.formatTimeFromTimestamp(sys.sunset),
            daylightDuration: this.calculateDaylightDuration(sys.sunrise, sys.sunset),
            currentTime: this.formatTime(new Date()),
            solarNoon: '12:00 PM',
            firstLight: this.formatTimeFromTimestamp((sys.sunrise || Date.now()/1000) - 25 * 60),
            lastLight: this.formatTimeFromTimestamp((sys.sunset || Date.now()/1000) + 25 * 60),
            moonPhase: 'Waxing Crescent',
            moonIllumination: 32,
            moonrise: '--:--',
            moonset: '--:--'
        };
    }

    calculatePrecipitation(forecastList) {
        if (!forecastList || forecastList.length === 0) return '0.0';
        const next3h = forecastList.slice(0, 3);
        const total = next3h.reduce((sum, item) => {
            return sum + (item.rain ? (item.rain['3h'] || 0) : 0);
        }, 0);
        return total.toFixed(1);
    }

    convertAQI(aqi) {
        const map = { 1: 25, 2: 60, 3: 100, 4: 150, 5: 200 };
        return map[aqi] || 42;
    }

    mapOpenWeatherCondition(conditionId) {
        if (conditionId >= 200 && conditionId < 300) return 'Thunderstorm';
        if (conditionId >= 300 && conditionId < 400) return 'Drizzle';
        if (conditionId >= 500 && conditionId < 600) return 'Rain';
        if (conditionId >= 600 && conditionId < 700) return 'Snow';
        if (conditionId >= 700 && conditionId < 800) return 'Fog';
        if (conditionId === 800) return 'Clear';
        if (conditionId > 800) return 'Cloudy';
        return 'Unknown';
    }

    mapOpenWeatherIcon(iconCode) {
        const icons = {
            '01d': '☀️', '01n': '🌙',
            '02d': '🌤️', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return icons[iconCode] || '☁️';
    }

    mapCondition(weatherCode) {
        const conditions = {
            1000: 'Clear', 1100: 'Mostly Clear', 1101: 'Partly Cloudy',
            1102: 'Mostly Cloudy', 1001: 'Cloudy', 2000: 'Fog',
            4000: 'Drizzle', 4001: 'Rain', 4200: 'Light Rain',
            4201: 'Heavy Rain', 5000: 'Snow', 8000: 'Thunderstorm'
        };
        return conditions[weatherCode] || 'Unknown';
    }

    mapWeatherIcon(weatherCode) {
        const icons = {
            1000: '☀️', 1100: '🌤️', 1101: '⛅',
            1102: '☁️', 1001: '☁️', 2000: '🌫️',
            4000: '🌧️', 4001: '🌧️', 4200: '🌦️',
            4201: '🌧️', 5000: '❄️', 8000: '⛈️'
        };
        return icons[weatherCode] || '☁️';
    }

    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    getMoonPhase(phase) {
        if (phase < 0.125) return 'New Moon';
        if (phase < 0.25) return 'Waxing Crescent';
        if (phase < 0.375) return 'First Quarter';
        if (phase < 0.5) return 'Waxing Gibbous';
        if (phase < 0.625) return 'Full Moon';
        if (phase < 0.75) return 'Waning Gibbous';
        if (phase < 0.875) return 'Last Quarter';
        return 'Waning Crescent';
    }

    formatTime(timestamp) {
        if (!timestamp) return '12:00 PM';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    formatTimeFromTimestamp(timestamp) {
        if (!timestamp) return '12:00 PM';
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    calculateDaylightDuration(sunrise, sunset) {
        if (!sunrise || !sunset) return '10h 35m';
        const duration = (sunset - sunrise) * 1000;
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    getDefaultWeatherData(location) {
        const now = new Date();
        // Extract location name
        let locationName = location.split(',')[0].trim();
        if (location.includes(',')) {
            const [lat, lon] = location.split(',').map(v => parseFloat(v.trim()));
            if (!isNaN(lat) && !isNaN(lon)) {
                locationName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
            }
        }

        return {
            current: {
                temperature: 27,
                feelsLike: 27,
                humidity: 72,
                windSpeed: 12,
                windDirection: 'NW',
                pressure: 1012,
                uvIndex: 6,
                visibility: 10,
                cloudCover: 45,
                condition: 'Partly Cloudy',
                icon: '⛅',
                high: 29,
                low: 15
            },
            forecast: this.getDefaultForecast(),
            hourly: this.getDefaultHourly(),
            solar: {
                sunrise: '6:40 AM',
                sunset: '5:15 PM',
                daylightDuration: '10h 35m',
                currentTime: this.formatTime(now),
                solarNoon: '12:00 PM',
                firstLight: '6:15 AM',
                lastLight: '5:40 PM',
                moonPhase: 'Waxing Crescent',
                moonIllumination: 32,
                moonrise: '11:22 AM',
                moonset: '12:46 AM'
            },
            kpis: {
                humidity: 72,
                windSpeed: 12,
                windDirection: 'NW',
                pressure: 1012,
                uvIndex: 6,
                aqi: 42,
                visibility: 10,
                dewPoint: 16,
                cloudCover: 45,
                precipitation: 0.2,
                gusts: 22
            },
            location_name: locationName
        };
    }

    getDefaultForecast() {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const icons = ['🌩️', '🌧️', '🌤️', '☁️', '☀️', '⛅', '🌤️'];
        const highs = [19, 17, 20, 26, 28, 27, 24];
        const lows = [12, 10, 14, 18, 20, 19, 16];
        const precip = [70, 85, 30, 15, 5, 25, 20];
        const winds = [15, 20, 12, 8, 10, 12, 8];
        const humidities = [75, 80, 65, 60, 55, 65, 70];
        const uvs = [2, 1, 3, 4, 6, 5, 3];

        return days.map((day, index) => ({
            day,
            icon: icons[index],
            temp: highs[index],
            tempMin: lows[index],
            precipChance: precip[index],
            wind: winds[index],
            humidity: humidities[index],
            uv: uvs[index]
        }));
    }

    getDefaultHourly() {
        const hours = [];
        const times = ['NOW', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00',
                      '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];
        const temps = [27, 28, 27, 26, 24, 22, 21, 20, 19, 18, 17, 17, 16, 16, 15, 15, 16, 18, 20, 22, 24, 25, 26, 27];
        const icons = ['🌤️', '☀️', '☀️', '⛅', '☁️', '☁️', '🌙', '🌙', '🌙', '🌙', '🌙', '🌙', '🌙', '🌙', '🌙', '🌙', '☀️', '☀️', '☀️', '🌤️', '🌤️', '☀️', '☀️', '🌤️'];
        const precip = [10, 5, 5, 8, 12, 15, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10, 10, 15, 15, 10];
        const wind = [12, 18, 16, 14, 12, 10, 8, 7, 6, 5, 5, 5, 5, 5, 5, 6, 8, 10, 12, 14, 16, 18, 18, 16];
        const humidity = [65, 62, 60, 63, 68, 72, 75, 77, 78, 79, 80, 80, 81, 81, 82, 81, 78, 72, 65, 60, 58, 55, 55, 58];

        for (let i = 0; i < 24; i++) {
            hours.push({
                time: times[i],
                temp: temps[i],
                icon: icons[i],
                precip: precip[i],
                wind: wind[i],
                humidity: humidity[i]
            });
        }

        return hours;
    }

    clearCache() {
        this.cache.clear();
        this.metrics.cacheHits = 0;
    }

    getMetrics() {
        return this.metrics;
    }
}