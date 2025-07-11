// UI Management and Interactions
class UIManager {
    constructor() {
        this.currentLocation = null;
        this.currentWeatherData = null;
        this.forecastData = null;
        this.airQualityData = null;
        this.trendsChart = null;
        this.searchTimeout = null;
        this.isLoading = false;
        
        this.initializeEventListeners();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Header buttons
        const searchBtn = document.getElementById('search-btn');
        const locationBtn = document.getElementById('location-btn');
        const settingsBtn = document.getElementById('settings-btn');
        
        if (searchBtn) searchBtn.addEventListener('click', () => this.showSearchModal());
        if (locationBtn) locationBtn.addEventListener('click', () => this.getCurrentLocation());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.showSettingsModal());
        
        // Modal controls
        const closeSearch = document.getElementById('close-search');
        const closeSettings = document.getElementById('close-settings');
        
        if (closeSearch) closeSearch.addEventListener('click', () => this.hideSearchModal());
        if (closeSettings) closeSettings.addEventListener('click', () => this.hideSettingsModal());
        
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearchSubmit();
                }
            });
        }
        
        // Settings
        const tempUnit = document.getElementById('temp-unit');
        const windUnit = document.getElementById('wind-unit');
        const autoLocation = document.getElementById('auto-location');
        const notifications = document.getElementById('notifications');
        
        if (tempUnit) tempUnit.addEventListener('change', () => this.saveSettings());
        if (windUnit) windUnit.addEventListener('change', () => this.saveSettings());
        if (autoLocation) autoLocation.addEventListener('change', () => this.saveSettings());
        if (notifications) notifications.addEventListener('change', () => this.saveSettings());
        
        // Toast close buttons
        const closeError = document.getElementById('close-error');
        const closeSuccess = document.getElementById('close-success');
        
        if (closeError) closeError.addEventListener('click', () => this.hideErrorToast());
        if (closeSuccess) closeSuccess.addEventListener('click', () => this.hideSuccessToast());
        
        // Click outside modals to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    // Show loading screen
    showLoading() {
        this.isLoading = true;
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    // Hide loading screen
    hideLoading() {
        this.isLoading = false;
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    // Update current weather display
    updateCurrentWeather(data) {
        this.currentWeatherData = data;
        
        // Update location and date
        document.getElementById('current-location').textContent = data.location;
        // Set and update the current date/time continuously
        const updateDateTime = () => {
            document.getElementById('current-date').textContent = this.formatDateTime(new Date());
        };
        updateDateTime();
        if (this._dateInterval) clearInterval(this._dateInterval);
        this._dateInterval = setInterval(updateDateTime, 1000);
        
        // Update main temperature and description
        document.getElementById('main-temp').textContent = data.temperature;
        document.getElementById('weather-desc').textContent = data.description;
        
        // Update weather details
        document.getElementById('wind-speed').textContent = data.windSpeed;
        document.getElementById('humidity').textContent = `${data.humidity}%`;
        document.getElementById('pressure').textContent = `${data.pressure} hPa`;
        document.getElementById('visibility').textContent = `${data.visibility} km`;
        
        // Update sunrise/sunset
        document.getElementById('sunrise').textContent = this.formatTime(data.sunrise);
        document.getElementById('sunset').textContent = this.formatTime(data.sunset);
        
        // Update weather icon
        this.updateWeatherIcon(data.icon, data.condition);
        
        // Update background based on weather condition
        this.updateWeatherBackground(data.condition);
        
        // Add to trends
        this.addToTrends(data);
    }

    // Update weather icon with animation
    updateWeatherIcon(iconCode, condition) {
        const iconElement = document.getElementById('weather-icon');
        if (iconElement) {
            iconElement.style.backgroundImage = `url(${weatherService.getWeatherIconUrl(iconCode)})`;
            
            // Add animation class
            const animationClass = weatherService.getAnimatedWeatherIcon(condition);
            iconElement.className = `weather-icon ${animationClass}`;
        }
    }

    // Update weather background
    updateWeatherBackground(condition) {
        const body = document.body;
        body.className = body.className.replace(/weather-bg-\w+/g, '');
        
        const conditionMap = {
            'Clear': 'weather-bg-clear',
            'Clouds': 'weather-bg-clouds',
            'Rain': 'weather-bg-rain',
            'Drizzle': 'weather-bg-rain',
            'Thunderstorm': 'weather-bg-thunderstorm',
            'Snow': 'weather-bg-snow'
        };
        
        const bgClass = conditionMap[condition] || 'weather-bg-clear';
        body.classList.add(bgClass);
    }

    // Update hourly forecast
    updateHourlyForecast(hourlyData) {
        const container = document.getElementById('hourly-timeline');
        container.innerHTML = '';
        
        hourlyData.forEach((hour, index) => {
            const hourElement = document.createElement('div');
            hourElement.className = 'hourly-item';
            hourElement.style.animationDelay = `${index * 0.1}s`;
            
            hourElement.innerHTML = `
                <div class="time">${this.formatTime(hour.time)}</div>
                <div class="icon" style="background-image: url(${weatherService.getWeatherIconUrl(hour.icon)})"></div>
                <div class="temp">${hour.temperature}°C</div>
                <div class="desc">${hour.description}</div>
            `;
            
            container.appendChild(hourElement);
        });
    }

    // Update daily forecast
    updateDailyForecast(dailyData) {
        const container = document.getElementById('daily-cards');
        container.innerHTML = '';
        
        dailyData.forEach((day, index) => {
            const dayElement = document.createElement('div');
            dayElement.className = 'daily-card';
            dayElement.style.animationDelay = `${index * 0.1}s`;
            
            dayElement.innerHTML = `
                <div class="daily-header">
                    <div class="daily-date">${this.formatDayName(day.date)}</div>
                    <div class="daily-icon" style="background-image: url(${weatherService.getWeatherIconUrl(day.icon)})"></div>
                </div>
                <div class="daily-temps">
                    <span class="daily-high">${day.high}°C</span>
                    <span class="daily-low">${day.low}°C</span>
                </div>
                <div class="daily-desc">${day.description}</div>
                <div class="daily-details">
                    <div class="daily-detail">
                        <i class="fas fa-tint"></i>
                        <span>${day.humidity}%</span>
                    </div>
                    <div class="daily-detail">
                        <i class="fas fa-wind"></i>
                        <span>${day.windSpeed} km/h</span>
                    </div>
                    <div class="daily-detail">
                        <i class="fas fa-cloud-rain"></i>
                        <span>${day.precipitation} mm</span>
                    </div>
                </div>
            `;
            
            // Add click handler to expand/collapse
            dayElement.addEventListener('click', () => {
                dayElement.classList.toggle('expanded');
            });
            
            container.appendChild(dayElement);
        });
    }

    // Update air quality display
    updateAirQuality(data) {
        this.airQualityData = data;
        
        document.getElementById('aqi-index').textContent = data.aqi;
        document.getElementById('aqi-label').textContent = data.label;
        document.getElementById('aqi-desc').textContent = data.description;
        
        // Update component values
        document.getElementById('pm25').textContent = `${data.components.pm25} μg/m³`;
        document.getElementById('pm10').textContent = `${data.components.pm10} μg/m³`;
        document.getElementById('o3').textContent = `${data.components.o3} μg/m³`;
        document.getElementById('no2').textContent = `${data.components.no2} μg/m³`;
        
        // Update AQI color
        const aqiElement = document.getElementById('aqi-index');
        aqiElement.className = `aqi-${data.aqi}`;
        
        // Add CSS for AQI colors
        const style = document.createElement('style');
        style.textContent = `
            .aqi-1 { color: #00e400; }
            .aqi-2 { color: #ffff00; }
            .aqi-3 { color: #ff7e00; }
            .aqi-4 { color: #ff0000; }
            .aqi-5 { color: #8f3f97; }
        `;
        document.head.appendChild(style);
    }

    // Update weather trends chart
    updateTrendsChart(location) {
        const trendsData = storageManager.getWeatherTrends(location);
        const ctx = document.getElementById('trends-chart');
        
        if (!ctx) {
            console.warn('Trends chart canvas not found');
            return;
        }
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }
        
        if (this.trendsChart) {
            this.trendsChart.destroy();
        }
        
        const labels = trendsData.map(trend => new Date(trend.date).toLocaleDateString());
        const temperatureData = trendsData.map(trend => trend.temperature);
        const humidityData = trendsData.map(trend => trend.humidity);
        
        this.trendsChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temperatureData,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Humidity (%)',
                    data: humidityData,
                    borderColor: '#4ecdc4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                }
            }
        });
        
        // Update trend comparison
        this.updateTrendComparison(trendsData);
    }

    // Update trend comparison
    updateTrendComparison(trendsData) {
        const container = document.getElementById('trend-comparison');
        container.innerHTML = '';
        
        if (trendsData.length < 2) {
            container.innerHTML = '<p>Not enough data for comparison</p>';
            return;
        }
        
        const today = trendsData[trendsData.length - 1];
        const yesterday = trendsData[trendsData.length - 2];
        
        const comparisons = [
            {
                label: 'Temperature',
                today: today.temperature,
                yesterday: yesterday.temperature,
                unit: '°C'
            },
            {
                label: 'Humidity',
                today: today.humidity,
                yesterday: yesterday.humidity,
                unit: '%'
            },
            {
                label: 'Pressure',
                today: today.pressure,
                yesterday: yesterday.pressure,
                unit: ' hPa'
            },
            {
                label: 'Wind Speed',
                today: today.windSpeed,
                yesterday: yesterday.windSpeed,
                unit: ' km/h'
            }
        ];
        
        comparisons.forEach(comparison => {
            const diff = comparison.today - comparison.yesterday;
            const isPositive = diff > 0;
            const changeClass = isPositive ? 'positive' : 'negative';
            const changeIcon = isPositive ? '↗' : '↘';
            
            const element = document.createElement('div');
            element.className = 'trend-item';
            element.innerHTML = `
                <span class="label">${comparison.label}</span>
                <span class="value">${comparison.today}${comparison.unit}</span>
                <span class="change ${changeClass}">${changeIcon} ${Math.abs(diff).toFixed(1)}</span>
            `;
            
            container.appendChild(element);
        });
    }

    // Show search modal
    showSearchModal() {
        const modal = document.getElementById('search-modal');
        modal.classList.add('active');
        document.getElementById('search-input').focus();
        this.updateRecentLocations();
    }

    // Hide search modal
    hideSearchModal() {
        const modal = document.getElementById('search-modal');
        modal.classList.remove('active');
        document.getElementById('search-input').value = '';
        document.getElementById('search-suggestions').style.display = 'none';
    }

    // Handle search input
    handleSearchInput(e) {
        const query = e.target.value.trim();
        
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        if (query.length < 2) {
            document.getElementById('search-suggestions').style.display = 'none';
            return;
        }
        
        this.searchTimeout = setTimeout(() => {
            this.searchLocations(query);
        }, 300);
    }

    // Search locations
    async searchLocations(query) {
        try {
            const locations = await weatherService.geocodeCity(query);
            this.displaySearchSuggestions(locations);
        } catch (error) {
            console.error('Error searching locations:', error);
            this.showErrorToast('Failed to search locations');
        }
    }

    // Display search suggestions
    displaySearchSuggestions(locations) {
        const container = document.getElementById('search-suggestions');
        container.innerHTML = '';
        
        if (locations.length === 0) {
            container.innerHTML = '<div class="suggestion-item">No locations found</div>';
            container.style.display = 'block';
            return;
        }
        
        locations.forEach(location => {
            const element = document.createElement('div');
            element.className = 'suggestion-item';
            
            // Create a more descriptive location string
            let locationStr = location.name;
            if (location.state) {
                locationStr += `, ${location.state}`;
            }
            locationStr += `, ${location.country}`;
            
            element.innerHTML = `
                <div class="suggestion-main">
                    <div class="suggestion-name">${locationStr}</div>
                    <div class="suggestion-coords">${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}</div>
                </div>
            `;
            
            element.addEventListener('click', () => {
                this.selectLocation(location);
            });
            container.appendChild(element);
        });
        
        container.style.display = 'block';
    }

    // Select location from search
    selectLocation(location) {
        // Create a more descriptive location name
        let locationName = location.name;
        if (location.state) {
            locationName += `, ${location.state}`;
        }
        locationName += `, ${location.country}`;
        
        const locationData = {
            name: locationName,
            lat: location.lat,
            lon: location.lon,
            country: location.country,
            state: location.state
        };
        
        this.currentLocation = locationData;
        storageManager.saveCurrentLocation(locationData);
        storageManager.addRecentLocation(locationData);
        
        this.hideSearchModal();
        this.loadWeatherData(locationData.lat, locationData.lon);
        this.showSuccessToast(`Weather updated for ${locationData.name}`);
    }

    // Handle search submit
    handleSearchSubmit() {
        const query = document.getElementById('search-input').value.trim();
        if (query) {
            this.searchLocations(query);
        }
    }

    // Update recent locations
    updateRecentLocations() {
        const container = document.getElementById('recent-list');
        const recentLocations = storageManager.getRecentLocations();
        
        container.innerHTML = '';
        
        if (recentLocations.length === 0) {
            container.innerHTML = '<div class="recent-item">No recent locations</div>';
            return;
        }
        
        recentLocations.forEach(location => {
            const element = document.createElement('div');
            element.className = 'recent-item';
            element.innerHTML = `
                <span>${location.name}</span>
                <button class="remove-btn" aria-label="Remove location">×</button>
            `;
            
            element.querySelector('span').addEventListener('click', () => {
                this.selectLocation(location);
            });
            
            element.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                storageManager.removeRecentLocation(location.name);
                this.updateRecentLocations();
            });
            
            container.appendChild(element);
        });
    }

    // Get current location
    async getCurrentLocation() {
        try {
            this.showLoading();
            const coords = await weatherService.getCurrentLocation();
            
            // Reverse geocode to get location name
            const locationData = await weatherService.reverseGeocode(coords.lat, coords.lon);
            
            if (locationData.length > 0) {
                const location = locationData[0];
                this.selectLocation(location);
            } else {
                this.showErrorToast('Unable to determine location name');
            }
        } catch (error) {
            console.error('Error getting current location:', error);
            this.showErrorToast('Unable to get current location. Please check your location permissions.');
        } finally {
            this.hideLoading();
        }
    }

    // Show settings modal
    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('active');
        this.loadSettings();
    }

    // Hide settings modal
    hideSettingsModal() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('active');
    }

    // Load settings
    loadSettings() {
        const preferences = storageManager.getUserPreferences();
        
        document.getElementById('temp-unit').value = preferences.temperatureUnit;
        document.getElementById('wind-unit').value = preferences.windSpeedUnit;
        document.getElementById('auto-location').checked = preferences.autoLocation;
        document.getElementById('notifications').checked = preferences.notifications;
    }

    // Save settings
    saveSettings() {
        const preferences = {
            temperatureUnit: document.getElementById('temp-unit').value,
            windSpeedUnit: document.getElementById('wind-unit').value,
            autoLocation: document.getElementById('auto-location').checked,
            notifications: document.getElementById('notifications').checked
        };
        
        storageManager.saveUserPreferences(preferences);
        this.showSuccessToast('Settings saved successfully');
        
        // Reload weather data with new units
        if (this.currentLocation) {
            this.loadWeatherData(this.currentLocation.lat, this.currentLocation.lon);
        }
    }

    // Hide all modals
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Show error toast
    showErrorToast(message) {
        const toast = document.getElementById('error-toast');
        const messageElement = document.getElementById('error-message');
        
        messageElement.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            this.hideErrorToast();
        }, 5000);
    }

    // Hide error toast
    hideErrorToast() {
        const toast = document.getElementById('error-toast');
        toast.classList.remove('show');
    }

    // Show success toast
    showSuccessToast(message) {
        const toast = document.getElementById('success-toast');
        const messageElement = document.getElementById('success-message');
        
        messageElement.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            this.hideSuccessToast();
        }, 3000);
    }

    // Hide success toast
    hideSuccessToast() {
        const toast = document.getElementById('success-toast');
        toast.classList.remove('show');
    }

    // Load all weather data
    async loadWeatherData(lat, lon) {
        try {
            this.showLoading();
            
            // Load current weather
            const currentWeather = await weatherService.getCurrentWeather(lat, lon);
            const formattedWeather = weatherService.formatWeatherData(currentWeather);
            this.updateCurrentWeather(formattedWeather);
            
            // Load forecast
            const forecast = await weatherService.getForecast(lat, lon);
            const processedForecast = weatherService.processForecastData(forecast);
            this.updateHourlyForecast(processedForecast.hourly);
            this.updateDailyForecast(processedForecast.daily);
            
            // Load air quality
            const airQuality = await weatherService.getAirQuality(lat, lon);
            const formattedAirQuality = weatherService.formatAirQualityData(airQuality);
            this.updateAirQuality(formattedAirQuality);
            
            // Update trends chart
            this.updateTrendsChart(this.currentLocation.name);
            
            // Initialize weather map
            if (window.weatherMap) {
                window.weatherMap.updateLocation(lat, lon);
            }
            
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showErrorToast('Failed to load weather data. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    // Add current weather to trends
    addToTrends(weatherData) {
        if (this.currentLocation) {
            const trendsData = {
                temperature: parseInt(weatherData.temperature),
                humidity: weatherData.humidity,
                pressure: weatherData.pressure,
                windSpeed: parseInt(weatherData.windSpeed)
            };
            
            storageManager.addWeatherTrend(this.currentLocation.name, trendsData);
        }
    }

    // Utility functions
    formatDateTime(date) {
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDayName(date) {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }
    }

    // Initialize UI
    async init() {
        // Load current location
        this.currentLocation = storageManager.getCurrentLocation();
        
        // Load weather data
        await this.loadWeatherData(this.currentLocation.lat, this.currentLocation.lon);
        
        // Check if auto-location is enabled
        const preferences = storageManager.getUserPreferences();
        if (preferences.autoLocation) {
            this.getCurrentLocation();
        }
        
        // Hide loading screen
        this.hideLoading();
    }
}

// Create global instance
const uiManager = new UIManager();
