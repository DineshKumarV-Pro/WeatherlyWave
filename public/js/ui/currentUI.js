/**
 * Enhanced Current Weather UI Component with Animations and Interactive Details
 */

export class CurrentUI {
    constructor(domHelpers, utils) {
        this.dom = domHelpers;
        this.utils = utils;
        this.weatherAnimation = null;
        this.expanded = false;
    }

    render(data, unit, locationName) {
        const container = document.getElementById('current-weather-card');
        if (!container) return;

        const temp = this.utils.unitConverter.temperature(data.temperature, unit);
        const feelsLike = this.utils.unitConverter.temperature(data.feelsLike, unit);
        const high = this.utils.unitConverter.temperature(data.high || 29, unit);
        const low = this.utils.unitConverter.temperature(data.low || 15, unit);

        const weatherAnimationClass = this.getWeatherAnimation(data.icon);
        const weatherAdvice = this.getWeatherAdvice(data);

        container.innerHTML = `
            <div class="relative overflow-hidden">
                <div class="absolute inset-0 opacity-20 pointer-events-none ${weatherAnimationClass}"></div>
                <div class="relative z-10">
                    <div class="flex justify-between items-start flex-wrap gap-2">
                        <div class="flex items-center gap-2 sm:gap-3">
                            <div class="w-1.5 h-10 sm:h-12 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h2 class="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-tight">
                                        ${this.utils.dateFormatter.formatDay(new Date())}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-sm sm:text-base border border-blue-500/30 flex items-center gap-1 sm:gap-2 shadow-lg">
                                <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                                ${locationName || 'CHENNAI'}
                            </span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between mt-4 sm:mt-6 flex-wrap gap-4">
                        <div class="relative group/temp">
                            <div class="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-3xl group-hover/temp:blur-2xl transition-all"></div>
                            <div class="relative flex items-center gap-3 sm:gap-4">
                                <div class="relative">
                                    <span class="text-6xl sm:text-7xl md:text-9xl filter drop-shadow-2xl transition-all duration-500 group-hover/temp:scale-110 group-hover/temp:rotate-3 cursor-pointer"
                                          id="weather-icon" data-tooltip="Click to change view">
                                        ${data.icon || '🌤️'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right group/temp">
                            <div class="flex items-end gap-1 sm:gap-2">
                                <span class="text-6xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 bg-clip-text text-transparent 
                                             transition-all duration-500 group-hover/temp:scale-110 cursor-pointer"
                                      id="current-temp" data-tooltip="Click to toggle °C/°F">
                                    ${temp.value}°
                                </span>
                                <span class="text-xl sm:text-2xl text-gray-500 mb-3 sm:mb-5">${unit === 'celsius' ? 'C' : 'F'}</span>
                            </div>
                            <div class="flex gap-2 sm:gap-3 text-xs sm:text-sm mt-1 sm:mt-2">
                                <span class="bg-gradient-to-r from-red-500/20 to-orange-500/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 border border-red-500/20">
                                    <span class="text-red-400 text-xs sm:text-sm">▲</span>
                                    <span class="text-white text-xs sm:text-sm">${high.value}°</span>
                                </span>
                                <span class="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 border border-blue-500/20">
                                    <span class="text-blue-400 text-xs sm:text-sm">▼</span>
                                    <span class="text-white text-xs sm:text-sm">${low.value}°</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6 transition-all duration-500">
                        <div class="bg-white/5 p-3 sm:p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group/detail">
                            <div class="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                <span class="text-xl sm:text-2xl">🌡️</span>
                                <span class="text-xs sm:text-sm text-gray-400">Condition</span>
                            </div>
                            <p class="text-base sm:text-xl font-semibold text-white group-hover/detail:translate-x-1 transition-transform">
                                ${data.condition || 'Partly Cloudy'}
                            </p>
                            <div class="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
                                ${this.getConditionDetails(data.condition)}
                            </div>
                        </div>
                        <div class="bg-white/5 p-3 sm:p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group/detail">
                            <div class="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                <span class="text-xl sm:text-2xl">🤔</span>
                                <span class="text-xs sm:text-sm text-gray-400">Feels Like</span>
                            </div>
                            <p class="text-base sm:text-xl font-semibold text-white group-hover/detail:translate-x-1 transition-transform">
                                ${feelsLike.value}°${unit === 'celsius' ? 'C' : 'F'}
                            </p>
                            <div class="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
                                ${this.getFeelsLikeDescription(data.feelsLike, data.temperature)}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;

        this.attachEventListeners(data, unit);
    }

    getWeatherAnimation(icon) {
        const animations = {
            '☀️': 'animate-sunny',
            '🌤️': 'animate-partly-cloudy',
            '⛅': 'animate-cloudy',
            '☁️': 'animate-overcast',
            '🌧️': 'animate-rainy',
            '⛈️': 'animate-storm',
            '🌨️': 'animate-snowy',
            '🌫️': 'animate-foggy',
            '🌙': 'animate-clear-night'
        };
        return animations[icon] || '';
    }

    getWeatherAdvice(data) {
        const temp = data.temperature;
        const condition = data.condition?.toLowerCase() || '';
        
        if (temp > 35) {
            return {
                short: 'Extreme heat',
                long: 'Stay hydrated, avoid sun exposure between 11 AM and 4 PM'
            };
        } else if (temp < 10) {
            return {
                short: 'Cold weather',
                long: 'Dress warmly, watch for ice on surfaces'
            };
        } else if (condition.includes('rain')) {
            return {
                short: 'Rain expected',
                long: 'Bring an umbrella, roads may be slippery'
            };
        } else if (condition.includes('storm')) {
            return {
                short: 'Thunderstorm',
                long: 'Seek shelter indoors, avoid open areas'
            };
        } else if (data.windSpeed > 40) {
            return {
                short: 'Strong winds',
                long: 'Secure loose objects, be cautious outdoors'
            };
        } else {
            return {
                short: 'Pleasant weather',
                long: 'Perfect day for outdoor activities!'
            };
        }
    }

    getConditionDetails(condition) {
        const details = {
            'Sunny': 'Clear skies, high UV index',
            'Partly Cloudy': 'Mix of sun and clouds',
            'Cloudy': 'Overcast, possible precipitation',
            'Rainy': 'Wet conditions, reduced visibility',
            'Storm': 'Thunderstorms, lightning risk',
            'Snowy': 'Snowfall, slippery conditions',
            'Foggy': 'Low visibility, drive carefully'
        };
        return details[condition] || 'Current weather conditions';
    }

    getFeelsLikeDescription(feelsLike, actual) {
        const diff = feelsLike - actual;
        if (diff > 5) return 'Feels warmer due to humidity';
        if (diff < -5) return 'Feels cooler due to wind';
        return 'Feels like actual temperature';
    }

    attachEventListeners(data, unit) {
        const tempElement = document.getElementById('current-temp');
        if (tempElement) {
            tempElement.addEventListener('click', () => {
                const newUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
                document.dispatchEvent(new CustomEvent('unit-toggle', {
                    detail: { unit: newUnit }
                }));
            });
        }

        // Remove listeners for non‑existent buttons
        // const expandBtn = document.getElementById('expand-current');
        // if (expandBtn) { ... }

        // const favBtn = document.getElementById('fav-current');
        // if (favBtn) { ... }

        // const shareBtn = document.getElementById('share-current');
        // if (shareBtn) { ... }

        // const detailsBtn = document.getElementById('details-current');
        // if (detailsBtn) { ... }
    }

    async shareWeather(data) {
        const text = `Current weather: ${data.temperature}°C, ${data.condition}. Feels like ${data.feelsLike}°C.`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Weather Update',
                    text: text,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(text);
            window.weatherApp?.ui?.loader?.showSuccess('Weather info copied!');
        }
    }
}