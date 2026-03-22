/**
 * Enhanced Weather Map UI Component with Interactive Layers
 */

export class MapUI {
    constructor(domHelpers, utils) {
        this.dom = domHelpers;
        this.utils = utils;
        this.map = null;
        this.markers = [];
        this.layers = [];
        this.activeLayer = 'temp';
        this.userLocation = null;
    }

    render(lat, lon, weatherData) {
        const container = document.getElementById('map-card');
        if (!container) {
            this.createContainer();
        }

        const html = `
            <div class="glass-luxury p-4 mb-8 relative overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-white text-lg flex items-center gap-2">
                        <span class="w-1.5 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                        Weather Map
                    </h3>
                    
                    <div class="flex items-center gap-2">
                        <div class="flex bg-white/5 p-1 rounded-xl">
                            <button class="map-layer-btn px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${this.activeLayer === 'temp' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}" data-layer="temp">
                                🌡️ Temp
                            </button>
                            <button class="map-layer-btn px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${this.activeLayer === 'precip' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}" data-layer="precip">
                                🌧️ Rain
                            </button>
                            <button class="map-layer-btn px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${this.activeLayer === 'wind' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}" data-layer="wind">
                                💨 Wind
                            </button>
                            <button class="map-layer-btn px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${this.activeLayer === 'clouds' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}" data-layer="clouds">
                                ☁️ Clouds
                            </button>
                        </div>
                        
                        <div class="flex gap-1">
                            <button class="p-2 hover:bg-white/10 rounded-lg transition" id="map-zoom-in" data-tooltip="Zoom in">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            <button class="p-2 hover:bg-white/10 rounded-lg transition" id="map-zoom-out" data-tooltip="Zoom out">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                                </svg>
                            </button>
                            <button class="p-2 hover:bg-white/10 rounded-lg transition" id="map-locate" data-tooltip="My location">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Map Container -->
                <div id="weather-map" class="w-full h-96 rounded-xl relative">
                    <!-- Map will be initialized here -->
                </div>

                <!-- Legend -->
                <div class="absolute bottom-8 left-8 bg-gray-900/80 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-xs z-10">
                    <h4 class="font-medium mb-2">${this.getLayerName(this.activeLayer)}</h4>
                    <div class="flex items-center gap-2">
                        ${this.renderLegend(this.activeLayer)}
                    </div>
                </div>

                <!-- Scale -->
                <div class="absolute bottom-8 right-8 bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-xs z-10">
                    <span id="map-scale">100 km</span>
                </div>
            </div>
        `;

        const element = document.getElementById('map-card') || this.createContainer();
        element.innerHTML = html;

        // Initialize map after DOM is ready
        setTimeout(() => {
            this.initMap(lat, lon, weatherData);
        }, 100);

        this.attachEventListeners();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'map-card';
        container.className = 'mb-8';
        
        const additionalSections = document.getElementById('additional-sections');
        if (additionalSections) {
            additionalSections.appendChild(container);
        } else {
            const hourlySection = document.getElementById('hourly-section');
            if (hourlySection) {
                hourlySection.parentNode.insertBefore(container, hourlySection.nextSibling);
            }
        }
        
        return container;
    }

    initMap(lat, lon, weatherData) {
        if (!window.L) {
            console.error('Leaflet not loaded');
            return;
        }

        const mapContainer = document.getElementById('weather-map');
        if (!mapContainer) return;

        // Destroy existing map if any
        if (this.map) {
            this.map.remove();
        }

        // Initialize map
        this.map = L.map('weather-map').setView([lat, lon], 8);

        // Add base layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add scale control
        L.control.scale({ imperial: false, metric: true }).addTo(this.map);

        // Store user location
        this.userLocation = [lat, lon];

        // Add weather marker
        this.addWeatherMarker(lat, lon, weatherData);

        // Add initial layer
        this.addWeatherLayer(this.activeLayer, lat, lon);

        // Update scale on zoom
        this.map.on('zoomend', () => {
            this.updateScale();
        });
    }

    addWeatherMarker(lat, lon, weatherData) {
        const marker = L.marker([lat, lon], {
            icon: L.divIcon({
                className: 'weather-marker',
                html: `
                    <div class="relative group">
                        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <span class="text-2xl">${weatherData.current?.icon || '🌤️'}</span>
                        </div>
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                `,
                iconSize: [48, 48],
                iconAnchor: [24, 24]
            })
        }).addTo(this.map);

        // Bind popup
        marker.bindPopup(`
            <div class="text-gray-900 p-2 min-w-[150px]">
                <h3 class="font-bold text-lg mb-1">${weatherData.current?.location || 'Current Location'}</h3>
                <div class="space-y-1 text-sm">
                    <p class="flex items-center gap-2">
                        <span class="text-2xl">${weatherData.current?.icon || '🌤️'}</span>
                        <span class="font-bold">${weatherData.current?.temperature}°C</span>
                    </p>
                    <p>💧 ${weatherData.current?.humidity}% Humidity</p>
                    <p>💨 ${weatherData.kpis?.windSpeed} km/h ${weatherData.kpis?.windDirection}</p>
                    <p>☁️ ${weatherData.current?.condition}</p>
                </div>
            </div>
        `).openPopup();

        this.markers.push(marker);
    }

    addWeatherLayer(type, centerLat, centerLon) {
        // Remove existing weather layers
        this.layers.forEach(layer => this.map.removeLayer(layer));
        this.layers = [];

        const bounds = this.map.getBounds();
        const points = this.generateGridPoints(centerLat, centerLon, 5, 0.5);

        switch(type) {
            case 'temp':
                this.addTemperatureLayer(points);
                break;
            case 'precip':
                this.addPrecipitationLayer(points);
                break;
            case 'wind':
                this.addWindLayer(points);
                break;
            case 'clouds':
                this.addCloudLayer(points);
                break;
        }
    }

    generateGridPoints(centerLat, centerLon, count, spacing) {
        const points = [];
        const startLat = centerLat - (spacing * count / 2);
        const startLon = centerLon - (spacing * count / 2);

        for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
                const lat = startLat + (i * spacing);
                const lon = startLon + (j * spacing);
                // Simulate temperature variation based on position
                const temp = 20 + Math.sin(i) * 5 + Math.cos(j) * 5;
                points.push({ lat, lon, value: temp });
            }
        }
        return points;
    }

    addTemperatureLayer(points) {
        const heatLayer = L.layerGroup();

        points.forEach(point => {
            const circle = L.circle([point.lat, point.lon], {
                color: this.getTempColor(point.value),
                fillColor: this.getTempColor(point.value),
                fillOpacity: 0.4,
                radius: 15000,
                weight: 1
            }).addTo(heatLayer);

            circle.bindPopup(`${Math.round(point.value)}°C`);
        });

        heatLayer.addTo(this.map);
        this.layers.push(heatLayer);
    }

    addPrecipitationLayer(points) {
        const layer = L.layerGroup();

        points.forEach(point => {
            const precip = Math.random() * 100;
            const circle = L.circle([point.lat, point.lon], {
                color: this.getPrecipColor(precip),
                fillColor: this.getPrecipColor(precip),
                fillOpacity: 0.3,
                radius: 15000,
                weight: 1
            }).addTo(layer);

            circle.bindPopup(`${Math.round(precip)}% chance`);
        });

        layer.addTo(this.map);
        this.layers.push(layer);
    }

    addWindLayer(points) {
        const layer = L.layerGroup();

        points.forEach(point => {
            const speed = 10 + Math.random() * 30;
            const direction = Math.random() * 360;
            
            // Create wind barb
            const endLat = point.lat + (Math.sin(direction * Math.PI / 180) * 0.1);
            const endLon = point.lon + (Math.cos(direction * Math.PI / 180) * 0.1);
            
            const line = L.polyline([[point.lat, point.lon], [endLat, endLon]], {
                color: this.getWindColor(speed),
                weight: 2,
                opacity: 0.6
            }).addTo(layer);

            line.bindPopup(`${Math.round(speed)} km/h`);
        });

        layer.addTo(this.map);
        this.layers.push(layer);
    }

    addCloudLayer(points) {
        const layer = L.layerGroup();

        points.forEach(point => {
            const cover = Math.random() * 100;
            const circle = L.circle([point.lat, point.lon], {
                color: this.getCloudColor(cover),
                fillColor: this.getCloudColor(cover),
                fillOpacity: 0.2,
                radius: 20000,
                weight: 0
            }).addTo(layer);

            circle.bindPopup(`${Math.round(cover)}% cloud cover`);
        });

        layer.addTo(this.map);
        this.layers.push(layer);
    }

    getTempColor(temp) {
        if (temp >= 30) return '#ef4444';
        if (temp >= 25) return '#f97316';
        if (temp >= 20) return '#eab308';
        if (temp >= 15) return '#22c55e';
        if (temp >= 10) return '#3b82f6';
        return '#6366f1';
    }

    getPrecipColor(precip) {
        if (precip >= 70) return '#3b82f6';
        if (precip >= 50) return '#60a5fa';
        if (precip >= 30) return '#93c5fd';
        if (precip >= 10) return '#bfdbfe';
        return '#dbeafe';
    }

    getWindColor(speed) {
        if (speed >= 50) return '#ef4444';
        if (speed >= 30) return '#f97316';
        if (speed >= 15) return '#eab308';
        return '#22c55e';
    }

    getCloudColor(cover) {
        if (cover >= 70) return '#1f2937';
        if (cover >= 40) return '#4b5563';
        if (cover >= 20) return '#9ca3af';
        return '#d1d5db';
    }

    getLayerName(layer) {
        const names = {
            'temp': 'Temperature',
            'precip': 'Precipitation',
            'wind': 'Wind Speed',
            'clouds': 'Cloud Cover'
        };
        return names[layer] || 'Weather Layer';
    }

    renderLegend(layer) {
        switch(layer) {
            case 'temp':
                return `
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-red-500 rounded-full"></span> Hot</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-orange-500 rounded-full"></span> Warm</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-yellow-500 rounded-full"></span> Mild</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-green-500 rounded-full"></span> Cool</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-500 rounded-full"></span> Cold</div>
                `;
            case 'precip':
                return `
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-700 rounded-full"></span> Heavy</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-500 rounded-full"></span> Moderate</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-300 rounded-full"></span> Light</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-100 rounded-full"></span> Trace</div>
                `;
            case 'wind':
                return `
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-red-500 rounded-full"></span> Strong</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-orange-500 rounded-full"></span> Moderate</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-yellow-500 rounded-full"></span> Light</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-green-500 rounded-full"></span> Calm</div>
                `;
            case 'clouds':
                return `
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-gray-700 rounded-full"></span> Overcast</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-gray-500 rounded-full"></span> Cloudy</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-gray-300 rounded-full"></span> Partly</div>
                    <div class="flex items-center gap-1"><span class="w-3 h-3 bg-gray-100 rounded-full"></span> Clear</div>
                `;
        }
    }

    updateScale() {
        const scaleElement = document.getElementById('map-scale');
        if (!scaleElement || !this.map) return;

        const center = this.map.getCenter();
        const point1 = this.map.latLngToContainerPoint(center);
        const point2 = L.point(point1.x + 100, point1.y);
        const latLng2 = this.map.containerPointToLatLng(point2);
        const distance = center.distanceTo(latLng2) / 1000; // in km

        scaleElement.textContent = `${Math.round(distance)} km`;
    }

    attachEventListeners() {
        // Layer buttons
        document.querySelectorAll('.map-layer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.map-layer-btn').forEach(b => {
                    b.classList.remove('bg-blue-500', 'text-white');
                    b.classList.add('text-gray-400');
                });
                e.target.classList.remove('text-gray-400');
                e.target.classList.add('bg-blue-500', 'text-white');

                this.activeLayer = e.target.dataset.layer;
                if (this.userLocation) {
                    this.addWeatherLayer(this.activeLayer, this.userLocation[0], this.userLocation[1]);
                }
            });
        });

        // Zoom controls
        const zoomIn = document.getElementById('map-zoom-in');
        const zoomOut = document.getElementById('map-zoom-out');
        const locate = document.getElementById('map-locate');

        if (zoomIn && this.map) {
            zoomIn.addEventListener('click', () => {
                this.map.zoomIn();
            });
        }

        if (zoomOut && this.map) {
            zoomOut.addEventListener('click', () => {
                this.map.zoomOut();
            });
        }

        if (locate && this.map && this.userLocation) {
            locate.addEventListener('click', () => {
                this.map.setView(this.userLocation, 10);
            });
        }
    }
}