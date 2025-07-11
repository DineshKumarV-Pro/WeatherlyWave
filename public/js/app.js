// Main Application Entry Point
class WeatherlyWaveApp {
    constructor() {
        this.isInitialized = false;
        this.updateInterval = null;
        this.refreshInterval = 10 * 60 * 1000; // 10 minutes
        
        this.init();
    }

    // Initialize the application
    async init() {
        try {
            console.log('Initializing WeatherlyWave...');
            
            // Initialize storage
            if (typeof storageManager !== 'undefined') {
                storageManager.init();
            }
            
            // Initialize weather service
            if (typeof weatherService !== 'undefined') {
                weatherService.init();
            }
            
            // Initialize UI manager
            if (typeof uiManager !== 'undefined') {
                await uiManager.init();
            }
            
            // Initialize service worker
            this.initServiceWorker();
            
            // Set up periodic updates
            this.setupPeriodicUpdates();
            
            // Set up visibility change handler
            this.setupVisibilityHandler();
            
            // Set up error handling
            this.setupErrorHandling();
            
            // Set up scroll animations
            this.setupScrollAnimations();
            
            // Set up touch gestures
            this.setupTouchGestures();
            
            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Set up install prompt
            this.setupInstallPrompt();
            
            // Set up network handling
            this.setupNetworkHandling();
            
            // Set up performance monitoring
            this.setupPerformanceMonitoring();
            
            // Initialize weather maps after a delay
            setTimeout(() => {
                if (typeof weatherMaps !== 'undefined') {
                    weatherMaps.init();
                }
            }, 2000);
            
            this.isInitialized = true;
            console.log('WeatherlyWave initialized successfully');
            
            // Show success message
            if (typeof uiManager !== 'undefined') {
                uiManager.showSuccessToast('WeatherlyWave is ready!');
            }
            
        } catch (error) {
            console.error('Failed to initialize WeatherlyWave:', error);
            if (typeof uiManager !== 'undefined') {
                uiManager.showErrorToast('Failed to initialize the application. Please refresh the page.');
            }
        }
    }

    // Initialize service worker for offline support
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New version available
                                    this.showUpdateNotification();
                                }
                            });
                        }
                    });
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }

    // Show update notification
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <i class="fas fa-download"></i>
                <span>A new version is available!</span>
                <button id="update-btn" class="update-btn">Update</button>
                <button id="dismiss-update" class="dismiss-btn">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .update-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 1rem;
                border-radius: 10px;
                z-index: 1200;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease;
            }
            .update-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .update-btn {
                background: white;
                color: #4CAF50;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 600;
            }
            .dismiss-btn {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.25rem;
            }
        `;
        document.head.appendChild(style);
        
        // Handle update button click
        document.getElementById('update-btn').addEventListener('click', () => {
            window.location.reload();
        });
        
        // Handle dismiss button click
        document.getElementById('dismiss-update').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // Setup periodic updates
    setupPeriodicUpdates() {
        this.updateInterval = setInterval(() => {
            if (document.visibilityState === 'visible' && typeof uiManager !== 'undefined' && uiManager.currentLocation) {
                console.log('Refreshing weather data...');
                uiManager.loadWeatherData(uiManager.currentLocation.lat, uiManager.currentLocation.lon);
            }
        }, this.refreshInterval);
    }

    // Setup visibility change handler
    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // App became visible, refresh data if it's been more than 5 minutes
                const lastUpdate = typeof storageManager !== 'undefined' ? storageManager.getItem('last_update') : null;
                if (!lastUpdate || (Date.now() - lastUpdate) > 5 * 60 * 1000) {
                    if (typeof uiManager !== 'undefined' && uiManager.currentLocation) {
                        uiManager.loadWeatherData(uiManager.currentLocation.lat, uiManager.currentLocation.lon);
                    }
                }
            }
        });
    }

    // Setup global error handling
    setupErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            // Show user-friendly error message
            if (event.reason && event.reason.message && typeof uiManager !== 'undefined') {
                if (event.reason.message.includes('fetch')) {
                    uiManager.showErrorToast('Network error. Please check your connection.');
                } else if (event.reason.message.includes('API')) {
                    uiManager.showErrorToast('Weather service temporarily unavailable.');
                } else {
                    uiManager.showErrorToast('An unexpected error occurred.');
                }
            }
            
            // Prevent default browser error handling
            event.preventDefault();
        });

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            
            // Don't show error toast for script loading errors
            if (!event.filename || event.filename.includes('extensions')) {
                return;
            }
            
            if (typeof uiManager !== 'undefined' && uiManager.showErrorToast) {
                uiManager.showErrorToast('An error occurred. Please refresh the page.');
            }
        });
    }

    // Setup scroll animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('fade-in-on-scroll');
            observer.observe(section);
        });
    }

    // Setup touch gestures
    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let isSwipeGesture = false;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipeGesture = true;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isSwipeGesture) return;

            const deltaX = Math.abs(e.touches[0].clientX - startX);
            const deltaY = Math.abs(e.touches[0].clientY - startY);

            // If more vertical movement, cancel swipe
            if (deltaY > deltaX) {
                isSwipeGesture = false;
            }
        });

        document.addEventListener('touchend', (e) => {
            if (!isSwipeGesture) return;

            const endX = e.changedTouches[0].clientX;
            const deltaX = endX - startX;

            // Swipe right to open search
            if (deltaX > 100 && typeof uiManager !== 'undefined') {
                uiManager.showSearchModal();
            }
            // Swipe left to refresh
            else if (deltaX < -100 && typeof uiManager !== 'undefined') {
                if (uiManager.currentLocation) {
                    uiManager.loadWeatherData(uiManager.currentLocation.lat, uiManager.currentLocation.lon);
                    uiManager.showSuccessToast('Refreshing weather data...');
                }
            }

            isSwipeGesture = false;
        });
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k' && typeof uiManager !== 'undefined') {
                e.preventDefault();
                uiManager.showSearchModal();
            }
            // Ctrl/Cmd + R to refresh (in addition to browser default)
            else if ((e.ctrlKey || e.metaKey) && e.key === 'r' && typeof uiManager !== 'undefined') {
                if (uiManager.currentLocation) {
                    setTimeout(() => {
                        uiManager.loadWeatherData(uiManager.currentLocation.lat, uiManager.currentLocation.lon);
                    }, 100);
                }
            }
            // Ctrl/Cmd + , to open settings
            else if ((e.ctrlKey || e.metaKey) && e.key === ',' && typeof uiManager !== 'undefined') {
                e.preventDefault();
                uiManager.showSettingsModal();
            }
            // L to get current location
            else if (e.key === 'l' && !e.target.matches('input, textarea') && typeof uiManager !== 'undefined') {
                e.preventDefault();
                uiManager.getCurrentLocation();
            }
        });
    }

    // Handle app installation
    setupInstallPrompt() {
        this.deferredPrompt = null;

        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Show install button
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('App installed successfully');
            if (typeof uiManager !== 'undefined') {
                uiManager.showSuccessToast('WeatherlyWave installed successfully!');
            }
            this.deferredPrompt = null;
        });
    }

    // Show install button
    showInstallButton() {
        // Check if button already exists
        if (document.getElementById('install-btn')) {
            return;
        }
        
        const installButton = document.createElement('button');
        installButton.id = 'install-btn';
        installButton.className = 'install-btn';
        installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
        
        // Add to header actions
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            headerActions.appendChild(installButton);
        } else {
            // Fallback: add to body if header actions not found
            document.body.appendChild(installButton);
        }
        
        // Add click handler
        installButton.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                
                this.deferredPrompt = null;
                installButton.remove();
            }
        });
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .install-btn {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .install-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            @media (max-width: 768px) {
                .install-btn {
                    padding: 0.5rem;
                    font-size: 0;
                }
                .install-btn i {
                    margin: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Handle network status changes
    setupNetworkHandling() {
        window.addEventListener('online', () => {
            console.log('Network connection restored');
            if (typeof uiManager !== 'undefined') {
                uiManager.showSuccessToast('Connection restored');
                
                // Refresh data when coming back online
                if (uiManager.currentLocation) {
                    uiManager.loadWeatherData(uiManager.currentLocation.lat, uiManager.currentLocation.lon);
                }
            }
        });

        window.addEventListener('offline', () => {
            console.log('Network connection lost');
            if (typeof uiManager !== 'undefined') {
                uiManager.showErrorToast('You are offline. Showing cached data.');
            }
        });
    }

    // Performance monitoring
    setupPerformanceMonitoring() {
        // Monitor loading performance
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`App loaded in ${loadTime.toFixed(2)}ms`);
            
            // Store performance metrics
            if (typeof storageManager !== 'undefined') {
                storageManager.setItem('performance_metrics', {
                    loadTime: loadTime,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent
                });
            }
        });

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                if (memInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                    console.warn('High memory usage detected');
                }
            }, 60000); // Check every minute
        }
    }

    // Clean up resources
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Clean up storage
        if (typeof storageManager !== 'undefined') {
            storageManager.cleanOldCache();
        }
        
        console.log('App cleanup completed');
    }

    // Get app info
    getAppInfo() {
        return {
            name: 'WeatherlyWave',
            version: '1.0.0',
            description: 'Advanced Weather Application',
            isInitialized: this.isInitialized,
            storageUsage: typeof storageManager !== 'undefined' ? storageManager.getStorageUsage() : 0,
            isOnline: navigator.onLine
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.weatherlyWaveApp = new WeatherlyWaveApp();
    
    // Expose app info to global scope for debugging
    window.getAppInfo = () => window.weatherlyWaveApp.getAppInfo();
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        if (window.weatherlyWaveApp) {
            window.weatherlyWaveApp.cleanup();
        }
    });
});

// Handle critical errors during startup
window.addEventListener('error', (event) => {
    if (event.filename && event.filename.includes('app.js')) {
        console.error('Critical error in app.js:', event.error);
        
        // Show fallback error message
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: Arial, sans-serif; text-align: center;">
                <div>
                    <h1>WeatherlyWave</h1>
                    <p>Sorry, something went wrong. Please refresh the page.</p>
                    <button onclick="location.reload()" style="background: white; color: #667eea; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px;">Refresh</button>
                </div>
            </div>
        `;
    }
});
