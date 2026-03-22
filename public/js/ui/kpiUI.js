/**
 * Enhanced KPI Row UI Component with Interactive Metrics and Detailed Tooltips
 */

export class KpiUI {
    constructor(domHelpers, utils) {
        this.dom = domHelpers;
        this.utils = utils;
        this.expandedMetric = null;
        this.showDetails = false;
    }

    render(kpis, unit) {
        const container = document.getElementById('kpi-row');
        if (!container) return;

        container.innerHTML = `
            <!-- Humidity -->
            <div class="kpi-card glass-luxury p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 hover:border-blue-500/30 group cursor-pointer relative overflow-hidden"
                 data-metric="humidity" data-value="${kpis.humidity}" data-tooltip="Click for details">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-blue-400 text-2xl mb-2 block group-hover:animate-bounce">💧</span>
                <p class="text-gray-400 text-xs mb-1">Humidity</p>
                <p class="text-2xl font-bold text-white kpi-value">${kpis.humidity}%</p>
                <div class="w-full h-1.5 bg-gray-700 mt-2 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500" 
                         style="width: ${kpis.humidity}%"></div>
                </div>
                <p class="text-[10px] text-gray-500 mt-2">${this.getHumidityDesc(kpis.humidity)}</p>
                <div class="kpi-details hidden absolute inset-0 bg-gray-900/95 p-2 rounded-xl text-left text-[10px]">
                    <p class="text-blue-400">💧 Humidity Details</p>
                    <p>Dew Point: ${kpis.dewPoint || 16}°</p>
                    <p>Comfort: ${this.getComfortLevel(kpis.humidity)}</p>
                </div>
            </div>
            
            <!-- Wind -->
            <div class="kpi-card glass-luxury p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 hover:border-cyan-500/30 group cursor-pointer relative overflow-hidden"
                 data-metric="wind" data-value="${kpis.windSpeed}" data-tooltip="Click for details">
                <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-cyan-400 text-2xl mb-2 block group-hover:animate-pulse">💨</span>
                <p class="text-gray-400 text-xs mb-1">Wind</p>
                <p class="text-2xl font-bold text-white kpi-value">${kpis.windSpeed}</p>
                <div class="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                    <span>${unit === 'celsius' ? 'km/h' : 'mph'}</span>
                    <span class="inline-block transform rotate-${this.getWindRotation(kpis.windDirection)}">→</span>
                    <span class="text-cyan-400">${kpis.windDirection}</span>
                </div>
                <div class="mt-2 flex justify-center">
                    <span class="text-[10px] px-2 py-0.5 bg-cyan-500/20 rounded-full">${this.getWindDesc(kpis.windSpeed)}</span>
                </div>
                <div class="kpi-details hidden absolute inset-0 bg-gray-900/95 p-2 rounded-xl text-left text-[10px]">
                    <p class="text-cyan-400">💨 Wind Details</p>
                    <p>Gusts: ${kpis.gusts} km/h</p>
                    <p>Direction: ${kpis.windDirection}</p>
                    <p>Beaufort: ${this.getBeaufortScale(kpis.windSpeed)}</p>
                </div>
            </div>
            
            <!-- Pressure -->
            <div class="kpi-card glass-luxury p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 hover:border-purple-500/30 group cursor-pointer relative overflow-hidden"
                 data-metric="pressure" data-value="${kpis.pressure}" data-tooltip="Click for details">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-purple-400 text-2xl mb-2 block group-hover:rotate-12 transition-transform">📊</span>
                <p class="text-gray-400 text-xs mb-1">Pressure</p>
                <p class="text-2xl font-bold text-white kpi-value">${kpis.pressure}</p>
                <p class="text-[10px] text-gray-400">hPa</p>
                <div class="mt-2 text-[10px] ${this.getPressureTrend(kpis.pressure)}">
                    ${this.getPressureDesc(kpis.pressure)}
                </div>
                <div class="kpi-details hidden absolute inset-0 bg-gray-900/95 p-2 rounded-xl text-left text-[10px]">
                    <p class="text-purple-400">📊 Pressure Details</p>
                    <p>Trend: ${this.getPressureTrendText(kpis.pressure)}</p>
                    <p>Weather: ${this.getPressureWeather(kpis.pressure)}</p>
                </div>
            </div>
            
            <!-- UV Index -->
            <div class="kpi-card glass-luxury p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 hover:border-yellow-500/30 group cursor-pointer relative overflow-hidden"
                 data-metric="uv" data-value="${kpis.uvIndex}" data-tooltip="Click for details">
                <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-yellow-400 text-2xl mb-2 block group-hover:animate-pulse">☀️</span>
                <p class="text-gray-400 text-xs mb-1">UV Index</p>
                <p class="text-2xl font-bold ${this.getUVColor(kpis.uvIndex)} kpi-value">${kpis.uvIndex}</p>
                <div class="w-full h-1.5 bg-gray-700 mt-2 rounded-full overflow-hidden">
                    <div class="h-full ${this.getUVBarColor(kpis.uvIndex)} rounded-full" 
                         style="width: ${kpis.uvIndex * 10}%"></div>
                </div>
                <p class="text-[10px] mt-2 ${this.getUVColor(kpis.uvIndex)}">${this.getUVLabel(kpis.uvIndex)}</p>
                <div class="kpi-details hidden absolute inset-0 bg-gray-900/95 p-2 rounded-xl text-left text-[10px]">
                    <p class="text-yellow-400">☀️ UV Details</p>
                    <p>Protection: ${this.getUVProtection(kpis.uvIndex)}</p>
                    <p>Burn Time: ${this.getUVBurnTime(kpis.uvIndex)}</p>
                </div>
            </div>
            
            <!-- Air Quality -->
            <div class="kpi-card glass-luxury p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 hover:border-green-500/30 group cursor-pointer relative overflow-hidden"
                 data-metric="aqi" data-value="${kpis.aqi}" data-tooltip="Click for details">
                <div class="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-green-400 text-2xl mb-2 block group-hover:scale-110 transition-transform">🌿</span>
                <p class="text-gray-400 text-xs mb-1">Air Quality</p>
                <p class="text-2xl font-bold ${this.getAQIColor(kpis.aqi)} kpi-value">${kpis.aqi}</p>
                <p class="text-[10px] ${this.getAQIColor(kpis.aqi)}">${this.getAQILabel(kpis.aqi)}</p>
                <div class="flex justify-center gap-1 mt-2">
                    ${this.renderAQIDots(kpis.aqi)}
                </div>
                <div class="kpi-details hidden absolute inset-0 bg-gray-900/95 p-2 rounded-xl text-left text-[10px]">
                    <p class="text-green-400">🌿 Air Quality Details</p>
                    <p>PM2.5: ${Math.round(kpis.aqi * 0.6)}</p>
                    <p>PM10: ${Math.round(kpis.aqi * 0.8)}</p>
                    <p>Health: ${this.getAQIHealthAdvice(kpis.aqi)}</p>
                </div>
            </div>
            
            <!-- Visibility -->
            <div class="kpi-card glass-luxury p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 hover:border-blue-300/30 group cursor-pointer relative overflow-hidden"
                 data-metric="visibility" data-value="${kpis.visibility}" data-tooltip="Click for details">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-300/0 to-blue-300/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-blue-300 text-2xl mb-2 block group-hover:scale-110 transition-transform">👁️</span>
                <p class="text-gray-400 text-xs mb-1">Visibility</p>
                <p class="text-2xl font-bold text-white kpi-value">${kpis.visibility}</p>
                <p class="text-[10px] text-gray-400">km</p>
                <div class="mt-2 text-[10px] ${kpis.visibility > 10 ? 'text-green-400' : 'text-yellow-400'}">
                    ${kpis.visibility > 10 ? 'Excellent' : kpis.visibility > 5 ? 'Good' : 'Poor'}
                </div>
                <div class="kpi-details hidden absolute inset-0 bg-gray-900/95 p-2 rounded-xl text-left text-[10px]">
                    <p class="text-blue-300">👁️ Visibility Details</p>
                    <p>Range: ${this.getVisibilityRange(kpis.visibility)}</p>
                    <p>Driving: ${this.getDrivingCondition(kpis.visibility)}</p>
                </div>
            </div>
            
            <!-- Dew Point -->
            <div class="kpi-card glass-luxury p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 hover:border-blue-200/30 group cursor-pointer relative overflow-hidden"
                 data-metric="dew" data-value="${kpis.dewPoint}" data-tooltip="Click for details">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-200/0 to-blue-200/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-blue-200 text-2xl mb-2 block group-hover:animate-bounce">💧</span>
                <p class="text-gray-400 text-xs mb-1">Dew Point</p>
                <p class="text-2xl font-bold text-white kpi-value">${kpis.dewPoint}°</p>
                <p class="text-[10px] text-gray-400">${this.getDewLabel(kpis.dewPoint)}</p>
                <div class="mt-2 w-full h-1 bg-gray-700 rounded-full">
                    <div class="h-full bg-blue-200 rounded-full" 
                         style="width: ${(kpis.dewPoint / 30) * 100}%"></div>
                </div>
                <div class="kpi-details hidden absolute inset-0 bg-gray-900/95 p-2 rounded-xl text-left text-[10px]">
                    <p class="text-blue-200">💧 Dew Point Details</p>
                    <p>Comfort: ${this.getDewComfort(kpis.dewPoint)}</p>
                    <p>Frost Risk: ${kpis.dewPoint < 0 ? 'Yes' : 'No'}</p>
                </div>
            </div>
            
            <!-- Cloud Cover -->
            <div class="kpi-card glass-luxury p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 hover:border-gray-500/30 group cursor-pointer relative overflow-hidden"
                 data-metric="clouds" data-value="${kpis.cloudCover}" data-tooltip="Click for details">
                <div class="absolute inset-0 bg-gradient-to-br from-gray-500/0 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-gray-400 text-2xl mb-2 block group-hover:translate-y-0.5 transition-transform">☁️</span>
                <p class="text-gray-400 text-xs mb-1">Clouds</p>
                <p class="text-2xl font-bold text-white kpi-value">${kpis.cloudCover}%</p>
                <p class="text-[10px] text-gray-400">${this.getCloudLabel(kpis.cloudCover)}</p>
                <div class="w-full h-1.5 bg-gray-700 mt-2 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-gray-400 to-gray-300 rounded-full" 
                         style="width: ${kpis.cloudCover}%"></div>
                </div>
                <div class="kpi-details hidden absolute inset-0 bg-gray-900/95 p-2 rounded-xl text-left text-[10px]">
                    <p class="text-gray-400">☁️ Cloud Details</p>
                    <p>Type: ${this.getCloudType(kpis.cloudCover)}</p>
                    <p>Precipitation: ${this.getCloudPrecip(kpis.cloudCover)}</p>
                </div>
            </div>
            
            <!-- Precipitation -->
            <div class="kpi-card glass-luxury p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 hover:border-blue-500/30 group cursor-pointer relative overflow-hidden"
                 data-metric="precip" data-value="${kpis.precipitation}" data-tooltip="Click for details">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-blue-400 text-2xl mb-2 block group-hover:animate-bounce">🌧️</span>
                <p class="text-gray-400 text-xs mb-1">Rain</p>
                <p class="text-2xl font-bold text-white kpi-value">${kpis.precipitation}</p>
                <p class="text-[10px] text-gray-400">mm</p>
                <div class="w-full h-1.5 bg-gray-700 mt-2 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" 
                         style="width: ${Math.min(kpis.precipitation * 20, 100)}%"></div>
                </div>
                <div class="kpi-details hidden absolute inset-0 bg-gray-900/95 p-2 rounded-xl text-left text-[10px]">
                    <p class="text-blue-400">🌧️ Rain Details</p>
                    <p>Intensity: ${this.getRainIntensity(kpis.precipitation)}</p>
                    <p>Next 3h: ${kpis.precipitation * 3}mm</p>
                </div>
            </div>
            
            <!-- Wind Gusts -->
            <div class="kpi-card glass-luxury p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 hover:border-cyan-500/30 group cursor-pointer relative overflow-hidden"
                 data-metric="gusts" data-value="${kpis.gusts}" data-tooltip="Click for details">
                <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-cyan-400 text-2xl mb-2 block group-hover:animate-pulse">💨</span>
                <p class="text-gray-400 text-xs mb-1">Gusts</p>
                <p class="text-2xl font-bold text-white kpi-value">${kpis.gusts}</p>
                <p class="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <span>${unit === 'celsius' ? 'km/h' : 'mph'}</span>
                    <span class="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </p>
                <div class="mt-2 text-[10px] ${kpis.gusts > 50 ? 'text-red-400' : 'text-yellow-400'}">
                    ${kpis.gusts > 50 ? 'Strong gusts' : 'Moderate'}
                </div>
                <div class="kpi-details hidden absolute inset-0 bg-gray-900/95 p-2 rounded-xl text-left text-[10px]">
                    <p class="text-cyan-400">💨 Gust Details</p>
                    <p>Peak: ${kpis.gusts} km/h</p>
                    <p>Risk: ${this.getGustRisk(kpis.gusts)}</p>
                </div>
            </div>
        `;

        this.attachEventListeners(kpis, unit);
    }

    renderAQIDots(aqi) {
        const dots = [];
        const quality = this.getAQILevel(aqi);
        
        for (let i = 0; i < 5; i++) {
            const isActive = i < quality;
            dots.push(`
                <div class="w-2 h-2 ${isActive ? 'bg-green-400' : 'bg-gray-600'} rounded-full 
                          ${isActive ? 'animate-pulse' : ''}"></div>
            `);
        }
        
        return dots.join('');
    }

    getAQILevel(aqi) {
        if (aqi <= 50) return 5;
        if (aqi <= 100) return 4;
        if (aqi <= 150) return 3;
        if (aqi <= 200) return 2;
        return 1;
    }

    getHumidityDesc(humidity) {
        if (humidity > 70) return 'High humidity';
        if (humidity < 30) return 'Low humidity';
        return 'Comfortable';
    }

    getComfortLevel(humidity) {
        if (humidity > 70) return 'Sticky';
        if (humidity < 30) return 'Dry';
        return 'Pleasant';
    }

    getWindDesc(speed) {
        if (speed > 50) return 'Strong wind';
        if (speed > 30) return 'Moderate wind';
        if (speed > 10) return 'Light breeze';
        return 'Calm';
    }

    getBeaufortScale(speed) {
        if (speed < 1) return 'Calm';
        if (speed < 6) return 'Light air';
        if (speed < 12) return 'Light breeze';
        if (speed < 20) return 'Gentle breeze';
        if (speed < 29) return 'Moderate breeze';
        if (speed < 39) return 'Fresh breeze';
        if (speed < 50) return 'Strong breeze';
        if (speed < 62) return 'Near gale';
        if (speed < 75) return 'Gale';
        if (speed < 89) return 'Strong gale';
        if (speed < 103) return 'Storm';
        return 'Hurricane force';
    }

    getWindRotation(direction) {
        const rotations = {
            'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
            'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
            'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
            'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
        };
        return rotations[direction] || 0;
    }

    getPressureDesc(pressure) {
        if (pressure > 1020) return 'High pressure';
        if (pressure < 1000) return 'Low pressure';
        return 'Normal pressure';
    }

    getPressureTrend(pressure) {
        if (pressure > 1020) return 'text-green-400';
        if (pressure < 1000) return 'text-red-400';
        return 'text-yellow-400';
    }

    getPressureTrendText(pressure) {
        if (pressure > 1020) return 'Rising - Fair weather';
        if (pressure < 1000) return 'Falling - Storm possible';
        return 'Stable';
    }

    getPressureWeather(pressure) {
        if (pressure > 1020) return 'Clear skies';
        if (pressure < 1000) return 'Precipitation likely';
        return 'Mixed conditions';
    }

    getUVColor(uv) {
        if (uv >= 8) return 'text-red-400';
        if (uv >= 6) return 'text-orange-400';
        if (uv >= 3) return 'text-yellow-400';
        return 'text-green-400';
    }

    getUVBarColor(uv) {
        if (uv >= 8) return 'bg-red-500';
        if (uv >= 6) return 'bg-orange-500';
        if (uv >= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    getUVLabel(uv) {
        if (uv >= 8) return 'Extreme';
        if (uv >= 6) return 'High';
        if (uv >= 3) return 'Moderate';
        return 'Low';
    }

    getUVProtection(uv) {
        if (uv >= 8) return 'SPF 50+ required';
        if (uv >= 6) return 'SPF 30+ recommended';
        if (uv >= 3) return 'SPF 15+ suggested';
        return 'No protection needed';
    }

    getUVBurnTime(uv) {
        if (uv >= 8) return '< 15 minutes';
        if (uv >= 6) return '15-20 minutes';
        if (uv >= 3) return '20-30 minutes';
        return '> 60 minutes';
    }

    getAQIColor(aqi) {
        if (aqi <= 50) return 'text-green-400';
        if (aqi <= 100) return 'text-yellow-400';
        if (aqi <= 150) return 'text-orange-400';
        if (aqi <= 200) return 'text-red-400';
        return 'text-purple-400';
    }

    getAQILabel(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    }

    getAQIHealthAdvice(aqi) {
        if (aqi <= 50) return 'Great for outdoor activities';
        if (aqi <= 100) return 'Sensitive individuals should limit exertion';
        if (aqi <= 150) return 'Reduce prolonged outdoor activities';
        if (aqi <= 200) return 'Avoid outdoor activities';
        if (aqi <= 300) return 'Stay indoors';
        return 'Emergency conditions - stay inside';
    }

    getVisibilityRange(visibility) {
        if (visibility > 20) return 'Excellent';
        if (visibility > 10) return 'Good';
        if (visibility > 5) return 'Moderate';
        if (visibility > 1) return 'Poor';
        return 'Very poor';
    }

    getDrivingCondition(visibility) {
        if (visibility > 10) return 'Safe driving';
        if (visibility > 5) return 'Use headlights';
        if (visibility > 1) return 'Drive carefully';
        return 'Pull over if possible';
    }

    getDewLabel(dew) {
        if (dew >= 20) return 'Humid';
        if (dew >= 15) return 'Moderate';
        return 'Dry';
    }

    getDewComfort(dew) {
        if (dew >= 20) return 'Uncomfortably humid';
        if (dew >= 15) return 'Slightly humid';
        if (dew >= 10) return 'Comfortable';
        return 'Dry air';
    }

    getCloudLabel(clouds) {
        if (clouds >= 70) return 'Cloudy';
        if (clouds >= 30) return 'Partly cloudy';
        return 'Clear';
    }

    getCloudType(clouds) {
        if (clouds >= 70) return 'Overcast';
        if (clouds >= 50) return 'Broken clouds';
        if (clouds >= 20) return 'Scattered clouds';
        return 'Few clouds';
    }

    getCloudPrecip(clouds) {
        if (clouds >= 80) return 'Rain likely';
        if (clouds >= 50) return 'Possible showers';
        return 'No precipitation';
    }

    getRainIntensity(precip) {
        if (precip > 10) return 'Heavy rain';
        if (precip > 5) return 'Moderate rain';
        if (precip > 1) return 'Light rain';
        if (precip > 0.1) return 'Drizzle';
        return 'No rain';
    }

    getGustRisk(gusts) {
        if (gusts > 70) return 'Dangerous';
        if (gusts > 50) return 'High';
        if (gusts > 30) return 'Moderate';
        return 'Low';
    }

    attachEventListeners(kpis, unit) {
        document.querySelectorAll('.kpi-card').forEach(card => {
            // Click to show details
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const metric = card.dataset.metric;
                const value = card.dataset.value;
                
                // Toggle details
                const details = card.querySelector('.kpi-details');
                const mainContent = card.querySelector('.kpi-value').parentNode;
                
                if (details.classList.contains('hidden')) {
                    // Hide all other details first
                    document.querySelectorAll('.kpi-details').forEach(d => d.classList.add('hidden'));
                    document.querySelectorAll('.kpi-card > div:not(.kpi-details)').forEach(d => d.classList.remove('hidden'));
                    
                    // Show this detail
                    details.classList.remove('hidden');
                    mainContent.classList.add('hidden');
                } else {
                    details.classList.add('hidden');
                    mainContent.classList.remove('hidden');
                }
                
                // Add visual feedback
                card.classList.add('ring-2', 'ring-blue-500');
                setTimeout(() => {
                    card.classList.remove('ring-2', 'ring-blue-500');
                }, 300);
            });

            // Hover to show tooltip
            card.addEventListener('mouseenter', () => {
                // Optional: Add subtle highlight
                card.classList.add('brightness-110');
            });

            card.addEventListener('mouseleave', () => {
                card.classList.remove('brightness-110');
                
                // Hide details on mouse leave (optional)
                // Comment out if you want details to stay visible until clicked again
                const details = card.querySelector('.kpi-details');
                const mainContent = card.querySelector('.kpi-value').parentNode;
                if (details && !details.classList.contains('hidden')) {
                    details.classList.add('hidden');
                    mainContent.classList.remove('hidden');
                }
            });
        });

        // Click anywhere else to hide details
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.kpi-card')) {
                document.querySelectorAll('.kpi-details').forEach(d => d.classList.add('hidden'));
                document.querySelectorAll('.kpi-card > div:not(.kpi-details)').forEach(d => d.classList.remove('hidden'));
            }
        });
    }
}