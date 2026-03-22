/**
 * Enhanced Header UI Component with Weather Insights and Quick Actions
 */

export class HeaderUI {
    constructor(domHelpers, utils) {
        this.dom = domHelpers;
        this.utils = utils;
        this.elements = {};
        this.isSearchActive = false;
        this.searchResults = [];
        this.weatherInsights = null;
    }

    render(state) {
        const header = document.getElementById('main-header');
        if (!header) return;

        const { currentLocation, lastUpdated, weatherData } = state;
        const formattedDate = lastUpdated ? this.utils.dateFormatter.formatFullDate(lastUpdated) : 'Saturday, 1 June 2024';
        const formattedTime = lastUpdated ? this.utils.dateFormatter.formatTime(lastUpdated) : '11:42 IST';
        
        this.weatherInsights = this.generateWeatherInsights(weatherData);
        const weatherQuality = this.getWeatherQuality(weatherData);

        header.innerHTML = `
            <div class="flex flex-col lg:flex-row justify-between items-center gap-4 w-full">
                <div class="flex items-center gap-3 w-full lg:w-auto">
                    <div class="relative group">
                        <img src="/logo.png" alt="WeatherlyWave" class="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl shadow-2xl shadow-blue-500/30 transform group-hover:scale-110 transition-all duration-500 group-hover:rotate-3" />
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                                Weatherly<span class="text-blue-400">Wave</span>
                            </h1>
                        </div>
                        <div class="flex items-center gap-2 text-xs sm:text-sm mt-0.5">
                            <div class="flex items-center gap-1 text-gray-400">
                                <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>${formattedDate}</span>
                            </div>
                            <span class="w-0.5 h-0.5 bg-gray-600 rounded-full"></span>
                            <div class="flex items-center gap-1 text-gray-400">
                                <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span id="live-time">${formattedTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto relative" id="search-container">
                    <div class="relative w-full lg:w-96 group">
                        <div class="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-focus-within:bg-blue-500/30 transition-all duration-500"></div>
                        <div class="relative">
                            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" 
                                   placeholder="Search city, zip code, or coordinates..." 
                                   value="${currentLocation}" 
                                   class="w-full pl-9 pr-20 py-2.5 sm:py-3 rounded-xl bg-gray-800/40 backdrop-blur-md text-white placeholder-gray-400 border-2 border-white/5 focus:outline-none focus:border-blue-500/30 focus:bg-gray-800/60 text-sm transition-all duration-300"
                                   id="location-search"
                                   autocomplete="off"
                                   spellcheck="false">
                            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button class="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-300" id="search-submit">
                                    <svg class="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div id="search-suggestions" class="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden hidden z-50 max-h-80 overflow-y-auto"></div>
                    </div>

                    <div class="flex items-center gap-1 bg-gray-800/30 backdrop-blur-sm p-1 rounded-2xl border border-white/5">
                        <button class="relative group/btn w-8 h-8 sm:w-10 sm:h-10 rounded-xl hover:bg-blue-500/20 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-300" id="location-btn" title="Use my location">
                            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <div class="w-px h-5 bg-white/10 mx-1"></div>
                        <button class="relative group/btn w-8 h-8 sm:w-10 sm:h-10 rounded-xl hover:bg-yellow-500/20 flex items-center justify-center text-gray-400 hover:text-yellow-400 transition-all duration-300" id="settings-btn" title="Settings">
                            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            </svg>
                        </button>
                        <button class="relative group/btn w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition-all duration-300" id="refresh-btn" title="Refresh data">
                            <svg class="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
        this.setupSearchAutocomplete();
        this.startLiveTimeUpdate();
    }

    startLiveTimeUpdate() {
        setInterval(() => {
            const timeElement = document.getElementById('live-time');
            if (timeElement) {
                timeElement.textContent = this.utils.dateFormatter.formatTime(new Date());
            }
        }, 1000);
    }

    generateWeatherInsights(weatherData) {
        if (!weatherData || !weatherData.current) return null;

        if (weatherData.kpis?.uvIndex > 8) {
            return { alert: '☀️ Extreme UV' };
        } else if (weatherData.kpis?.windSpeed > 40) {
            return { alert: '💨 Strong winds' };
        } else if (weatherData.kpis?.precipitation > 5) {
            return { alert: '🌧️ Rain expected' };
        } else if (weatherData.current?.temperature > 35) {
            return { alert: '🔥 Heat alert' };
        } else if (weatherData.current?.temperature < 10) {
            return { alert: '❄️ Cold weather' };
        }
        return { alert: '✨ Perfect weather' };
    }

    getWeatherQuality(weatherData) {
        if (!weatherData || !weatherData.current) return '';
        
        const { temperature, humidity } = weatherData.current;
        if (temperature > 25 && temperature < 30 && humidity < 70) {
            return '🌟 Excellent';
        } else if (temperature > 35 || humidity > 80) {
            return '⚠️ Fair';
        }
        return '✓ Good';
    }

    setupSearchAutocomplete() {
        const searchInput = document.getElementById('location-search');
        const suggestions = document.getElementById('search-suggestions');
        
        if (!searchInput || !suggestions) return;

        let timeoutId;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            const query = e.target.value.trim();

            if (query.length < 2) {
                suggestions.classList.add('hidden');
                return;
            }

            timeoutId = setTimeout(async () => {
                try {
                    const results = await window.weatherApp?.searchManager?.search(query) || [];
                    this.displaySuggestions(results);
                } catch (error) {
                    console.error('Search error:', error);
                }
            }, 300);
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length >= 2) {
                const event = new Event('input');
                searchInput.dispatchEvent(event);
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const location = searchInput.value.trim();
                if (location) {
                    suggestions.classList.add('hidden');
                    document.dispatchEvent(new CustomEvent('location-search', {
                        detail: { location }
                    }));
                }
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            const container = document.getElementById('search-container');
            if (container && !container.contains(e.target)) {
                suggestions.classList.add('hidden');
            }
        });
    }

    displaySuggestions(results) {
        const suggestions = document.getElementById('search-suggestions');
        if (!suggestions) return;

        if (!results || !results.length) {
            suggestions.classList.add('hidden');
            return;
        }

        suggestions.innerHTML = results.map((result) => `
            <div class="suggestion-item px-4 py-3 hover:bg-white/10 cursor-pointer transition-all duration-200 border-b border-white/5 last:border-0"
                 data-lat="${result.lat || ''}" data-lon="${result.lon || ''}" data-name="${result.displayName || result.name}">
                <div class="flex items-center gap-3">
                    <span class="text-xl">${this.getLocationIcon(result.type)}</span>
                    <div>
                        <span class="text-white font-medium">${result.name}</span>
                        ${result.country ? `<span class="text-xs text-gray-500 ml-2">${result.country}</span>` : ''}
                        <div class="text-xs text-gray-400">${result.displayName || result.name}</div>
                    </div>
                </div>
            </div>
        `).join('');

        suggestions.classList.remove('hidden');

        suggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const name = item.dataset.name;
                document.getElementById('location-search').value = name;
                suggestions.classList.add('hidden');
                
                document.dispatchEvent(new CustomEvent('location-search', {
                    detail: { location: name }
                }));
            });
        });
    }

    getLocationIcon(type) {
        const icons = {
            'city': '🏙️',
            'popular': '⭐',
            'coordinates': '📍',
            'history': '🕒',
            'current': '📍'
        };
        return icons[type] || '📍';
    }

    attachEventListeners() {
        const searchInput = document.getElementById('location-search');
        const searchSubmit = document.getElementById('search-submit');
        const locationBtn = document.getElementById('location-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const refreshBtn = document.getElementById('refresh-btn');
        // const shareBtn = document.getElementById('share-btn');  // not used
        // const favoritesBtn = document.getElementById('favorites-btn'); // not used
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const location = searchInput.value.trim();
                    if (location) {
                        document.getElementById('search-suggestions')?.classList.add('hidden');
                        document.dispatchEvent(new CustomEvent('location-search', {
                            detail: { location }
                        }));
                    }
                }
            });
        }
        
        if (searchSubmit) {
            searchSubmit.addEventListener('click', () => {
                const location = searchInput ? searchInput.value.trim() : '';
                if (location) {
                    document.getElementById('search-suggestions')?.classList.add('hidden');
                    document.dispatchEvent(new CustomEvent('location-search', {
                        detail: { location }
                    }));
                }
            });
        }
        
        if (locationBtn) {
            locationBtn.addEventListener('click', () => {
                if (navigator.geolocation) {
                    window.weatherApp?.ui?.loader?.showToast('Getting your location...', 'info');
                    
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            
                            try {
                                const locationName = await window.weatherApp?.searchManager?.reverseGeocode(latitude, longitude);
                                if (locationName && locationName.displayName) {
                                    document.dispatchEvent(new CustomEvent('location-search', {
                                        detail: { location: locationName.displayName }
                                    }));
                                } else {
                                    document.dispatchEvent(new CustomEvent('location-search', {
                                        detail: { location: `${latitude.toFixed(4)},${longitude.toFixed(4)}` }
                                    }));
                                }
                            } catch {
                                document.dispatchEvent(new CustomEvent('location-search', {
                                    detail: { location: `${latitude.toFixed(4)},${longitude.toFixed(4)}` }
                                }));
                            }
                        },
                        (error) => {
                            let message = 'Could not get your location';
                            if (error.code === 1) message = 'Location permission denied';
                            else if (error.code === 2) message = 'Location unavailable';
                            else if (error.code === 3) message = 'Location request timeout';
                            
                            window.weatherApp?.ui?.loader?.showError(message);
                        }
                    );
                } else {
                    window.weatherApp?.ui?.loader?.showError('Geolocation not supported');
                }
            });
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                refreshBtn.classList.add('animate-spin');
                document.dispatchEvent(new CustomEvent('refresh-request'));
                setTimeout(() => refreshBtn.classList.remove('animate-spin'), 1000);
            });
        }

        // Remove share and favorites listeners because buttons don't exist
        // if (shareBtn) { ... }
        // if (favoritesBtn) { ... }

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('location-search')?.focus();
            }
        });
    }

    async shareWeather() {
        const { weatherData, currentLocation } = window.weatherApp?.state || {};
        
        if (!weatherData || !currentLocation) return;
        
        const unit = window.weatherApp?.state?.unit || 'celsius';
        const tempUnit = unit === 'celsius' ? '°C' : '°F';
        
        const text = `Weather in ${currentLocation}: ${weatherData.current?.temperature}${tempUnit}, ${weatherData.current?.condition}. Humidity: ${weatherData.current?.humidity}%, Wind: ${weatherData.kpis?.windSpeed} km/h`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Weather in ${currentLocation}`,
                    text: text,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(text);
            window.weatherApp?.ui?.loader?.showSuccess('Weather info copied to clipboard!');
        }
    }

    showFavorites() {
        // ... (favorites modal remains unchanged)
    }

    showSettingsModal() {
        const existingModal = document.querySelector('.settings-modal');
        if (existingModal) existingModal.remove();
        
        const currentUnit = window.weatherApp?.state?.unit || 'celsius';
        const currentWindUnit = window.weatherApp?.settingsManager?.get('general.windUnit') || 'kmh';
        
        const modal = document.createElement('div');
        modal.className = 'settings-modal fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="glass-luxury p-6 max-w-md w-full">
                <div class="space-y-6">
                    <div>
                        <label class="block text-gray-400 text-sm mb-3">Temperature Unit</label>
                        <div class="flex gap-3">
                            <button class="flex-1 ${currentUnit === 'celsius' ? 'bg-blue-500/20 text-white border-blue-500/30' : 'bg-white/5 text-gray-400'} px-4 py-3 rounded-xl border hover:bg-blue-500/30 transition-all duration-300 text-lg font-medium unit-btn" 
                                    data-unit="celsius">
                                °C
                            </button>
                            <button class="flex-1 ${currentUnit === 'fahrenheit' ? 'bg-blue-500/20 text-white border-blue-500/30' : 'bg-white/5 text-gray-400'} px-4 py-3 rounded-xl border hover:bg-blue-500/30 transition-all duration-300 text-lg font-medium unit-btn" 
                                    data-unit="fahrenheit">
                                °F
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-400 text-sm mb-3">Wind Speed</label>
                        <div class="flex gap-3">
                            <button class="flex-1 ${currentWindUnit === 'kmh' ? 'bg-blue-500/20 text-white border-blue-500/30' : 'bg-white/5 text-gray-400'} px-4 py-3 rounded-xl border hover:bg-blue-500/30 transition-all duration-300 text-lg font-medium wind-btn" 
                                    data-unit="kmh">
                                km/h
                            </button>
                            <button class="flex-1 ${currentWindUnit === 'mph' ? 'bg-blue-500/20 text-white border-blue-500/30' : 'bg-white/5 text-gray-400'} px-4 py-3 rounded-xl border hover:bg-blue-500/30 transition-all duration-300 text-lg font-medium wind-btn" 
                                    data-unit="mph">
                                mph
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end mt-8">
                    <button class="px-6 py-2 bg-blue-500/20 text-white rounded-xl hover:bg-blue-500/30 transition" id="close-modal-bottom">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Temperature unit toggle
        modal.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const unit = e.target.dataset.unit;
                
                // Update UI
                modal.querySelectorAll('.unit-btn').forEach(b => {
                    b.classList.remove('bg-blue-500/20', 'text-white', 'border-blue-500/30');
                    b.classList.add('bg-white/5', 'text-gray-400');
                });
                e.target.classList.remove('bg-white/5', 'text-gray-400');
                e.target.classList.add('bg-blue-500/20', 'text-white', 'border-blue-500/30');
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('unit-toggle', {
                    detail: { unit }
                }));
            });
        });
        
        // Wind unit toggle
        modal.querySelectorAll('.wind-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const unit = e.target.dataset.unit;
                
                // Update UI
                modal.querySelectorAll('.wind-btn').forEach(b => {
                    b.classList.remove('bg-blue-500/20', 'text-white', 'border-blue-500/30');
                    b.classList.add('bg-white/5', 'text-gray-400');
                });
                e.target.classList.remove('bg-white/5', 'text-gray-400');
                e.target.classList.add('bg-blue-500/20', 'text-white', 'border-blue-500/30');
                
                // Update settings
                if (window.weatherApp?.settingsManager) {
                    window.weatherApp.settingsManager.set('general.windUnit', unit);
                }
                
                // Update UI
                window.weatherApp?.updateUI();
                window.weatherApp?.ui?.loader?.showToast(`Wind: ${unit === 'kmh' ? 'km/h' : 'mph'}`, 'info');
            });
        });
        
        // Close handlers
        ['close-modal', 'close-modal-bottom'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', () => modal.remove());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}