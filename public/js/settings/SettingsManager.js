/**
 * Simplified Settings Manager - Focus on essential settings only
 */

export class SettingsManager {
    constructor(app) {
        this.app = app;
        this.settings = {
            general: {
                temperatureUnit: 'celsius',
                windUnit: 'kmh',
                pressureUnit: 'hPa',
                precipitationUnit: 'mm',
                timeFormat: '24h',
                dateFormat: 'MM/DD/YYYY',
                language: 'en'
            },
            display: {
                animations: true,
                reduceMotion: false,
                fontSize: 'medium',
                refreshInterval: 300000
            },
            notifications: {
                enabled: true,
                sound: true,
                desktop: false,
                alerts: {
                    extreme: true,
                    severe: true,
                    moderate: true,
                    minor: false
                }
            },
            location: {
                defaultLocation: 'Chennai, Tamil Nadu',
                useGeolocation: true,
                saveRecent: true,
                recentCount: 10,
                favorites: []
            },
            advanced: {
                cacheTimeout: 300,
                debug: false,
                offlineMode: false
            }
        };
        
        this.listeners = new Set();
        this.loadSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('weatherpro_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = this.mergeSettings(this.settings, parsed);
            }
            this.applyAllSettings();
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('weatherpro_settings', JSON.stringify(this.settings));
            this.notifyListeners();
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }

    mergeSettings(defaults, custom) {
        const merged = { ...defaults };
        
        for (const [key, value] of Object.entries(custom)) {
            if (merged[key] && typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
                merged[key] = this.mergeSettings(merged[key], value);
            } else {
                merged[key] = value;
            }
        }
        
        return merged;
    }

    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.settings);
    }

    set(path, value, save = true) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.settings);
        
        if (target) {
            target[lastKey] = value;
            this.applySetting(path, value);
            if (save) this.saveSettings();
        }
    }

    applySetting(path, value) {
        switch (path) {
            case 'general.temperatureUnit':
                if (this.app?.utils?.unitConverter) {
                    this.app.utils.unitConverter.preferredUnit = value;
                }
                document.dispatchEvent(new CustomEvent('unit-toggle', {
                    detail: { unit: value }
                }));
                this.showToast(`Temperature: ${value === 'celsius' ? '°C' : '°F'}`);
                break;
                
            case 'general.windUnit':
                if (this.app?.utils?.unitConverter) {
                    this.app.utils.unitConverter.preferredWindUnit = value;
                }
                this.showToast(`Wind: ${value === 'kmh' ? 'km/h' : 'mph'}`);
                this.app?.updateUI();
                break;
                
            case 'display.animations':
                document.documentElement.style.setProperty('--animations-enabled', value ? '1' : '0');
                break;
                
            case 'display.reduceMotion':
                document.documentElement.style.setProperty('--animation-duration', value ? '0s' : '0.25s');
                break;
                
            case 'display.fontSize':
                document.documentElement.style.fontSize = 
                    value === 'small' ? '14px' : 
                    value === 'medium' ? '16px' : '18px';
                break;
                
            case 'notifications.desktop':
                if (value && this.settings.notifications.enabled) {
                    this.requestNotificationPermission();
                }
                break;
                
            case 'advanced.offlineMode':
                if (value) {
                    this.enableOfflineMode();
                } else {
                    this.disableOfflineMode();
                }
                break;
        }
        
        document.dispatchEvent(new CustomEvent('setting-changed', {
            detail: { path, value }
        }));
    }

    applyAllSettings() {
        Object.entries(this.settings).forEach(([category, values]) => {
            Object.keys(values).forEach(key => {
                const path = `${category}.${key}`;
                this.applySetting(path, this.get(path));
            });
        });
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) return;
        
        if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            this.set('notifications.desktop', permission === 'granted', true);
        }
    }

    enableOfflineMode() {
        if (this.app?.weatherEngine) {
            this.app.weatherEngine.cacheTimeout = 86400000; // 24 hours
        }
        
        const indicator = document.createElement('div');
        indicator.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm border border-yellow-500/30 z-50';
        indicator.id = 'offline-indicator';
        indicator.innerHTML = '📴 Offline Mode';
        document.body.appendChild(indicator);
        
        this.showToast('Offline mode enabled');
    }

    disableOfflineMode() {
        document.getElementById('offline-indicator')?.remove();
        
        if (this.app?.weatherEngine) {
            this.app.weatherEngine.cacheTimeout = this.get('advanced.cacheTimeout') * 1000;
        }
        
        this.showToast('Online mode restored');
    }

    resetToDefaults() {
        this.settings = {
            general: {
                temperatureUnit: 'celsius',
                windUnit: 'kmh',
                pressureUnit: 'hPa',
                precipitationUnit: 'mm',
                timeFormat: '24h',
                dateFormat: 'MM/DD/YYYY',
                language: 'en'
            },
            display: {
                animations: true,
                reduceMotion: false,
                fontSize: 'medium',
                refreshInterval: 300000
            },
            notifications: {
                enabled: true,
                sound: true,
                desktop: false,
                alerts: {
                    extreme: true,
                    severe: true,
                    moderate: true,
                    minor: false
                }
            },
            location: {
                defaultLocation: 'Chennai, Tamil Nadu',
                useGeolocation: true,
                saveRecent: true,
                recentCount: 10,
                favorites: []
            },
            advanced: {
                cacheTimeout: 300,
                debug: false,
                offlineMode: false
            }
        };
        
        this.applyAllSettings();
        this.saveSettings();
        this.showToast('Settings reset to defaults');
    }

    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.settings));
    }

    showToast(message, type = 'success') {
        if (this.app?.ui?.loader) {
            this.app.ui.loader.showToast(message, type);
        }
    }
}