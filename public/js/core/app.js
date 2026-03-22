/**
 * weatherpro - Main Application Core
 * Version: 4.3.0 - Fixed event listeners & API error handling
 */

import { WeatherEngine } from './weatherEngine.js';
import { PerformanceManager } from './performanceManager.js';
import { WeatherAlerts } from './weatherAlerts.js';
import { SearchManager } from '../search/SearchManager.js';
import { SettingsManager } from '../settings/SettingsManager.js';
import { HeaderUI } from '../ui/headerUI.js';
import { CurrentUI } from '../ui/currentUI.js';
import { ForecastUI } from '../ui/forecastUI.js';
import { HourlyUI } from '../ui/hourlyUI.js';
import { SolarUI } from '../ui/solarUI.js';
import { KpiUI } from '../ui/kpiUI.js';
import { LoaderUI } from '../ui/loaderUI.js';
import { AlertsUI } from '../ui/alertsUI.js';
import { DateFormatter } from '../utils/dateFormatter.js';
import { UnitConverter } from '../utils/unitConverter.js';
import { DomHelpers } from '../utils/domHelpers.js';

class WeatherApp {
    constructor(config = {}) {
        console.log('WeatherApp initializing...');
        
        this.config = {
            defaultLocation: 'Chennai, Tamil Nadu',
            defaultUnit: 'celsius',
            refreshInterval: 900000,
            apiPriority: ['openweather', 'tomorrowio'],
            ...config
        };
        
        this.state = {
            currentLocation: this.config.defaultLocation,
            weatherData: null,
            unit: this.config.defaultUnit,
            isLoading: true,
            error: null,
            lastUpdated: null,
            coords: null,
            favorites: this.loadFavorites()
        };
        
        // Core modules
        this.engines = {};
        this.ui = {};
        this.utils = {
            dateFormatter: new DateFormatter(),
            unitConverter: new UnitConverter(),
            domHelpers: DomHelpers
        };
        
        // Set preferred units in converter
        this.utils.unitConverter.preferredUnit = this.state.unit;
        
        // Bind methods
        this.handleLocationSearch = this.handleLocationSearch.bind(this);
        this.handleUnitToggle = this.handleUnitToggle.bind(this);
        this.refreshData = this.refreshData.bind(this);
        
        // Initialize immediately
        this.init();
    }
    
    loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem('weatherpro_favorites')) || [];
        } catch {
            return [];
        }
    }

    saveFavorites() {
        localStorage.setItem('weatherpro_favorites', JSON.stringify(this.state.favorites));
    }

    async init() {
        try {
            // Initialize loader first
            this.ui.loader = new LoaderUI(this.utils.domHelpers);
            this.ui.loader.show('Starting WeatherlyWave...');
            
            // Initialize managers
            this.settingsManager = new SettingsManager(this);
            this.searchManager = new SearchManager(this);
            this.performance = new PerformanceManager(this);
            this.alerts = new WeatherAlerts(this);
            
            // Apply settings
            this.applySettings();
            
            // Initialize weather engines
            await this.initWeatherEngines();
            this.ui.loader.updateProgress(30);
            
            // Initialize UI components
            this.initUIComponents();
            this.ui.loader.updateProgress(50);
            
            // Try to get user's location first
            await this.tryGetUserLocation();
            
            // Load initial data
            await this.loadWeatherData(this.state.currentLocation);
            this.ui.loader.updateProgress(90);
            
            // Set up auto-refresh
            this.setupAutoRefresh();
            
            // *** FIX: Add event listeners ***
            document.addEventListener('location-search', this.handleLocationSearch);
            document.addEventListener('unit-toggle', this.handleUnitToggle);
            document.addEventListener('refresh-request', this.refreshData);
            
            // Hide loader
            setTimeout(() => this.ui.loader.hide(), 500);
            
            console.log('WeatherApp ready');
            
        } catch (error) {
            console.error('Init failed:', error);
            this.handleError(error);
        }
    }

    async tryGetUserLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.log('Geolocation not supported');
                resolve();
                return;
            }

            this.ui.loader.updateLocation('Detecting your location...');

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        this.ui.loader.updateLocation(`Found! Getting weather...`);
                        
                        // Try to get location name
                        const locationName = await this.searchManager?.reverseGeocode(latitude, longitude);
                        
                        if (locationName && locationName.displayName) {
                            this.state.currentLocation = locationName.displayName;
                        } else {
                            this.state.currentLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                        }
                        
                        this.state.coords = { lat: latitude, lon: longitude };
                        console.log('📍 Got user location:', this.state.currentLocation);
                    } catch (error) {
                        console.warn('Failed to get location name:', error);
                    }
                    resolve();
                },
                (error) => {
                    console.log('Geolocation error:', error.message);
                    resolve(); // Continue with default location
                },
                {
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    applySettings() {
        // Only dark theme - no theme switching
        document.documentElement.setAttribute('data-theme', 'dark');
        
        const fontSize = this.settingsManager.get('display.fontSize') || 'medium';
        document.documentElement.style.fontSize = 
            fontSize === 'small' ? '14px' : 
            fontSize === 'medium' ? '16px' : '18px';
    }
    
    async initWeatherEngines() {
        const { TomorrowioAPI } = await import('../api/tomorrowio.js');
        const { OpenWeatherAPI } = await import('../api/openweather.js');
        
        this.engines = {
            openweather: new OpenWeatherAPI({ 
                apiKey: this.config.openweatherKey || 'caf87105fd3f266bec4127269ded93b4' 
            }),
            tomorrowio: new TomorrowioAPI({ 
                apiKey: this.config.tomorrowioKey || 'q2VhuCvqIFaBWhtOhliEUwHtCbiwDVKg' 
            })
        };
        
        this.weatherEngine = new WeatherEngine(this.engines, {
            priority: ['openweather', 'tomorrowio'],
            fallback: true,
            cacheTimeout: 1800000
        });
    }
    
    initUIComponents() {
        const components = {
            header: { Component: HeaderUI, id: 'main-header' },
            current: { Component: CurrentUI, id: 'current-weather-card' },
            forecast: { Component: ForecastUI, id: 'forecast-card' },
            hourly: { Component: HourlyUI, id: 'hourly-card' },
            solar: { Component: SolarUI, id: 'solar-card' },
            kpi: { Component: KpiUI, id: 'kpi-row' },
            alerts: { Component: AlertsUI, id: null },
        };
        
        Object.entries(components).forEach(([key, { Component, id }]) => {
            try {
                this.ui[key] = new Component(this.utils.domHelpers, {
                    unitConverter: this.utils.unitConverter,
                    dateFormatter: this.utils.dateFormatter,
                    loader: this.ui.loader
                });
                
                if (id) {
                    this.ui[`${key}Element`] = document.getElementById(id);
                }
            } catch (error) {
                console.warn(`Failed to init ${key}:`, error);
            }
        });
    }
    
    async loadWeatherData(location, silent = false) {
        try {
            if (!silent) {
                this.state.isLoading = true;
            }
            
            console.log('🌤️ Loading weather for:', location);
            const data = await this.weatherEngine.getWeatherData(location);
            
            if (data.coords) {
                this.state.coords = data.coords;
            }
            
            this.state.weatherData = data;
            this.state.currentLocation = location;
            this.state.lastUpdated = new Date();
            this.state.isLoading = false;
            
            // Update UI
            this.updateUI();
            
            // Add to search history
            if (this.searchManager && !silent) {
                this.searchManager.addToHistory({ 
                    name: location, 
                    displayName: location 
                });
            }
            
            // Check for alerts
            if (this.alerts) {
                const alerts = this.alerts.checkAlerts(data);
                if (alerts.length && this.ui.alerts) {
                    this.ui.alerts.render(alerts);
                }
            }
            
        } catch (error) {
            console.error('❌ Load failed:', error);
            this.state.isLoading = false;
            this.state.error = error.message;
            this.handleError(error);
        }
    }
    
    updateUI() {
        if (!this.state.weatherData) return;
        
        const data = this.state.weatherData;
        const unit = this.state.unit;
        
        console.log('🔄 Updating UI with unit:', unit);
        
        // Update each UI component
        if (this.ui.header) {
            this.ui.header.render(this.state);
        }
        
        if (this.ui.current && this.ui.currentElement) {
            this.ui.current.render(data.current, unit, data.location_name);
        }
        
        if (this.ui.forecast && this.ui.forecastElement) {
            this.ui.forecast.render(data.forecast, unit);
        }
        
        if (this.ui.hourly && this.ui.hourlyElement) {
            this.ui.hourly.render(data.hourly, unit);
        }
        
        if (this.ui.solar && this.ui.solarElement) {
            this.ui.solar.render(data.solar);
        }
        
        if (this.ui.kpi && this.ui.kpiElement) {
            this.ui.kpi.render(data.kpis, unit);
        }
        
        // Update footer
        this.updateFooter();
    }
    
    updateFooter() {
        const footer = document.getElementById('main-footer');
        if (!footer) return;
        
        const source = this.state.weatherData?.metadata?.source || 'unknown';
        const sourceIcon = source === 'openweather' ? '🌤️' : source === 'tomorrowio' ? '☁️' : '💾';
        
        const lastUpdatedStr = this.state.lastUpdated ? 
            this.utils.dateFormatter.formatTime(this.state.lastUpdated) + ' · ' + 
            this.utils.dateFormatter.formatDate(this.state.lastUpdated) : 
            'Just now';
        
        footer.innerHTML = `
            <p>WeatherlyWave</p>
            <span>|</span>
            <p>updated: ${lastUpdatedStr}</p>
            <span>|</span>
            <p>source: ${sourceIcon} ${source}</p>
        `;
    }
    
    async handleLocationSearch(e) {
        const location = e.detail.location;
        if (!location?.trim()) {
            this.ui.loader.showToast('Please enter a location', 'warning');
            return;
        }
        
        console.log('📍 Location search:', location);
        await this.loadWeatherData(location);
    }
    
    handleUnitToggle(e) {
        const newUnit = e.detail.unit;
        console.log('🔄 Unit toggle:', newUnit);
        
        this.state.unit = newUnit;
        this.utils.unitConverter.preferredUnit = newUnit;
        
        // Update settings
        if (this.settingsManager) {
            this.settingsManager.set('general.temperatureUnit', newUnit, false);
        }
        
        // Force UI update
        this.updateUI();
        
        // Show toast
        this.ui.loader.showToast(
            `Switched to ${newUnit === 'celsius' ? '°C' : '°F'}`, 
            'info'
        );
    }
    
    async refreshData() {
        this.ui.loader.showToast('Refreshing...', 'info');
        await this.loadWeatherData(this.state.currentLocation, true);
    }
    
    setupAutoRefresh() {
        setInterval(() => {
            const lastUpdate = this.state.lastUpdated;
            if (lastUpdate && Date.now() - lastUpdate > this.config.refreshInterval) {
                console.log('Auto-refreshing...');
                this.refreshData();
            }
        }, 60000);
    }
    
    handleError(error) {
        if (this.ui.loader) {
            this.ui.loader.showError(error.message || 'An error occurred');
        }
        console.error('App error:', error);
    }
}

// Initialize
function initApp() {
    console.log('DOM ready, starting app...');
    
    window.weatherApp = new WeatherApp({
        openweatherKey: 'caf87105fd3f266bec4127269ded93b4',
        tomorrowioKey: 'q2VhuCvqIFaBWhtOhliEUwHtCbiwDVKg',
        defaultLocation: 'Chennai, Tamil Nadu',
        defaultUnit: 'celsius'
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

export { WeatherApp };