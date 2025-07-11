// Weather Maps Management
class WeatherMaps {
    constructor() {
        this.map = null;
        this.weatherLayers = {};
        this.currentLayer = 'temp';
        this.isInitialized = false;
        this.apiKey = 'caf87105fd3f266bec4127269ded93b4';
    }

    // Initialize the map
    init() {
        const mapContainer = document.getElementById('weather-map');
        if (!mapContainer) return;

        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            console.warn('Leaflet not loaded');
            return;
        }

        // Get current location for initial map center
        const currentLocation = storageManager.getCurrentLocation();
        
        // Initialize Leaflet map
        this.map = L.map('weather-map').setView([currentLocation.lat, currentLocation.lon], 10);

        // Add base tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Initialize weather layers
        this.initializeWeatherLayers();

        // Add default layer
        this.addWeatherLayer(this.currentLayer);

        // Setup layer controls
        this.setupLayerControls();

        // Add location marker
        this.addLocationMarker(currentLocation.lat, currentLocation.lon);

        this.isInitialized = true;
    }

    // Initialize weather layers
    initializeWeatherLayers() {
        this.weatherLayers = {
            temp: {
                name: 'Temperature',
                url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${this.apiKey}`,
                layer: null
            },
            precipitation: {
                name: 'Precipitation',
                url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${this.apiKey}`,
                layer: null
            },
            clouds: {
                name: 'Clouds',
                url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${this.apiKey}`,
                layer: null
            },
            wind: {
                name: 'Wind Speed',
                url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${this.apiKey}`,
                layer: null
            },
            pressure: {
                name: 'Pressure',
                url: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${this.apiKey}`,
                layer: null
            }
        };
    }

    // Add weather layer to map
    addWeatherLayer(layerType) {
        if (!this.weatherLayers[layerType] || !this.map) return;

        const layerConfig = this.weatherLayers[layerType];
        
        // Create layer if it doesn't exist
        if (!layerConfig.layer) {
            layerConfig.layer = L.tileLayer(layerConfig.url, {
                attribution: 'Weather data © OpenWeatherMap',
                opacity: 0.7,
                maxZoom: 18
            });
        }

        // Add layer to map
        layerConfig.layer.addTo(this.map);
        this.currentLayer = layerType;
    }

    // Remove weather layer from map
    removeWeatherLayer(layerType) {
        if (!this.weatherLayers[layerType] || !this.weatherLayers[layerType].layer) return;

        this.map.removeLayer(this.weatherLayers[layerType].layer);
    }

    // Switch weather layer
    switchWeatherLayer(layerType) {
        if (!this.isInitialized) return;

        // Remove current layer
        this.removeWeatherLayer(this.currentLayer);

        // Add new layer
        this.addWeatherLayer(layerType);

        // Update active button
        this.updateActiveButton(layerType);
    }

    // Setup layer control buttons
    setupLayerControls() {
        const mapButtons = document.querySelectorAll('.map-btn');
        
        mapButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const layerType = e.target.dataset.layer;
                if (layerType) {
                    this.switchWeatherLayer(layerType);
                }
            });
        });
    }

    // Update active button
    updateActiveButton(layerType) {
        const mapButtons = document.querySelectorAll('.map-btn');
        
        mapButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.layer === layerType) {
                button.classList.add('active');
            }
        });
    }

    // Add location marker
    addLocationMarker(lat, lon) {
        if (!this.map) return;

        // Remove existing marker
        if (this.locationMarker) {
            this.map.removeLayer(this.locationMarker);
        }

        // Create custom icon
        const customIcon = L.divIcon({
            html: '<i class="fas fa-map-marker-alt" style="color: #ff4444; font-size: 24px;"></i>',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            className: 'custom-marker'
        });

        // Add marker
        this.locationMarker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map);

        // Center map on location
        this.map.setView([lat, lon], this.map.getZoom());
    }

    // Update location
    updateLocation(lat, lon) {
        if (!this.isInitialized) return;

        this.addLocationMarker(lat, lon);
    }

    // Add weather data popup
    addWeatherPopup(lat, lon, weatherData) {
        if (!this.map) return;

        const popupContent = `
            <div class="weather-popup">
                <h3>${weatherData.location}</h3>
                <div class="popup-weather">
                    <img src="${weatherService.getWeatherIconUrl(weatherData.icon)}" alt="${weatherData.description}">
                    <div>
                        <div class="popup-temp">${weatherData.temperature}</div>
                        <div class="popup-desc">${weatherData.description}</div>
                    </div>
                </div>
                <div class="popup-details">
                    <div>Humidity: ${weatherData.humidity}%</div>
                    <div>Wind: ${weatherData.windSpeed}</div>
                    <div>Pressure: ${weatherData.pressure} hPa</div>
                </div>
            </div>
        `;

        const popup = L.popup()
            .setLatLng([lat, lon])
            .setContent(popupContent)
            .openOn(this.map);

        // Add popup styles
        if (!document.querySelector('#weather-popup-styles')) {
            const style = document.createElement('style');
            style.id = 'weather-popup-styles';
            style.textContent = `
                .weather-popup {
                    font-family: inherit;
                    min-width: 200px;
                }
                .weather-popup h3 {
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 16px;
                }
                .popup-weather {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                .popup-weather img {
                    width: 50px;
                    height: 50px;
                }
                .popup-temp {
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                }
                .popup-desc {
                    color: #666;
                    font-size: 14px;
                    text-transform: capitalize;
                }
                .popup-details {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    font-size: 12px;
                    color: #666;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Handle map click events
    onMapClick(callback) {
        if (!this.map) return;

        this.map.on('click', (e) => {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;
            callback(lat, lon);
        });
    }

    // Resize map
    resize() {
        if (this.map) {
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
        }
    }

    // Get map bounds
    getBounds() {
        if (!this.map) return null;

        const bounds = this.map.getBounds();
        return {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
        };
    }

    // Fit map to bounds
    fitBounds(bounds) {
        if (!this.map) return;

        const latLngBounds = L.latLngBounds(
            [bounds.south, bounds.west],
            [bounds.north, bounds.east]
        );

        this.map.fitBounds(latLngBounds);
    }

    // Add weather alerts layer
    addWeatherAlerts(alerts) {
        if (!this.map || !alerts || alerts.length === 0) return;

        alerts.forEach(alert => {
            const alertIcon = L.divIcon({
                html: '<i class="fas fa-exclamation-triangle" style="color: #ff9800; font-size: 20px;"></i>',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                className: 'alert-marker'
            });

            const alertMarker = L.marker([alert.lat, alert.lon], { icon: alertIcon }).addTo(this.map);

            alertMarker.bindPopup(`
                <div class="alert-popup">
                    <h4>${alert.event}</h4>
                    <p><strong>Severity:</strong> ${alert.severity}</p>
                    <p><strong>Start:</strong> ${new Date(alert.start * 1000).toLocaleString()}</p>
                    <p><strong>End:</strong> ${new Date(alert.end * 1000).toLocaleString()}</p>
                    <p>${alert.description}</p>
                </div>
            `);
        });
    }

    // Toggle fullscreen
    toggleFullscreen() {
        const mapContainer = document.getElementById('weather-map');
        if (!mapContainer) return;

        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().then(() => {
                mapContainer.classList.add('fullscreen');
                this.resize();
            });
        } else {
            document.exitFullscreen().then(() => {
                mapContainer.classList.remove('fullscreen');
                this.resize();
            });
        }
    }

    // Add zoom controls
    addZoomControls() {
        if (!this.map) return;

        const zoomControl = L.control.zoom({
            position: 'topright'
        });

        zoomControl.addTo(this.map);
    }

    // Add scale control
    addScaleControl() {
        if (!this.map) return;

        const scaleControl = L.control.scale({
            position: 'bottomleft'
        });

        scaleControl.addTo(this.map);
    }

    // Add legend
    addLegend(layerType) {
        if (!this.map) return;

        // Remove existing legend
        if (this.legend) {
            this.map.removeControl(this.legend);
        }

        const legendData = this.getLegendData(layerType);
        if (!legendData) return;

        this.legend = L.control({ position: 'bottomright' });

        this.legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <h4>${legendData.title}</h4>
                <div class="legend-content">
                    ${legendData.items.map(item => `
                        <div class="legend-item">
                            <div class="legend-color" style="background-color: ${item.color}"></div>
                            <span>${item.label}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            return div;
        };

        this.legend.addTo(this.map);

        // Add legend styles
        if (!document.querySelector('#map-legend-styles')) {
            const style = document.createElement('style');
            style.id = 'map-legend-styles';
            style.textContent = `
                .map-legend {
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 8px;
                    padding: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .map-legend h4 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    color: #333;
                }
                .legend-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                }
                .legend-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 2px;
                    border: 1px solid #ccc;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Get legend data for different layers
    getLegendData(layerType) {
        const legends = {
            temp: {
                title: 'Temperature (°C)',
                items: [
                    { color: '#313695', label: '< -20' },
                    { color: '#4575b4', label: '-20 to -10' },
                    { color: '#74add1', label: '-10 to 0' },
                    { color: '#abd9e9', label: '0 to 10' },
                    { color: '#e0f3f8', label: '10 to 20' },
                    { color: '#fee090', label: '20 to 30' },
                    { color: '#fdae61', label: '30 to 40' },
                    { color: '#f46d43', label: '40 to 50' },
                    { color: '#d73027', label: '> 50' }
                ]
            },
            precipitation: {
                title: 'Precipitation (mm)',
                items: [
                    { color: '#ffffff', label: '0' },
                    { color: '#c7e9f1', label: '0.1 - 0.5' },
                    { color: '#7ec8e3', label: '0.5 - 1' },
                    { color: '#3c9bc6', label: '1 - 2' },
                    { color: '#1f6ba8', label: '2 - 5' },
                    { color: '#174581', label: '5 - 10' },
                    { color: '#0f2c5c', label: '> 10' }
                ]
            },
            clouds: {
                title: 'Cloud Cover (%)',
                items: [
                    { color: '#ffffff', label: '0' },
                    { color: '#f0f0f0', label: '10' },
                    { color: '#d0d0d0', label: '25' },
                    { color: '#a0a0a0', label: '50' },
                    { color: '#707070', label: '75' },
                    { color: '#404040', label: '100' }
                ]
            },
            wind: {
                title: 'Wind Speed (m/s)',
                items: [
                    { color: '#ffffff', label: '0' },
                    { color: '#e6f3ff', label: '1 - 3' },
                    { color: '#b3d9ff', label: '3 - 5' },
                    { color: '#80bfff', label: '5 - 8' },
                    { color: '#4da6ff', label: '8 - 12' },
                    { color: '#1a8cff', label: '12 - 16' },
                    { color: '#0066cc', label: '> 16' }
                ]
            }
        };

        return legends[layerType] || null;
    }

    // Destroy map
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.isInitialized = false;
        }
    }
}

// Create global instance
const weatherMaps = new WeatherMaps();

// Initialize maps when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize after a short delay to ensure DOM is fully loaded
    setTimeout(() => {
        weatherMaps.init();
    }, 1000);
});

// Handle window resize
window.addEventListener('resize', () => {
    weatherMaps.resize();
});
