/**
 * Simplified 7-Day Forecast UI Component - Clean and Informative
 */

export class ForecastUI {
    constructor(domHelpers, utils) {
        this.dom = domHelpers;
        this.utils = utils;
        this.expandedDay = null;
    }

    render(forecast, unit) {
        const container = document.getElementById('forecast-card');
        if (!container) return;

        const avgHigh = Math.round(forecast.reduce((acc, day) => acc + day.temp, 0) / forecast.length);
        const avgLow = Math.round(forecast.reduce((acc, day) => acc + day.tempMin, 0) / forecast.length);
        const totalRain = forecast.reduce((acc, day) => acc + (day.precipChance * 0.1), 0).toFixed(1);

        let html = `
            <div class="flex flex-col gap-3 sm:gap-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 sm:gap-3">
                        <span class="w-1.5 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                        <div>
                            <h3 class="font-semibold text-white text-base sm:text-lg">7-Day Forecast</h3>
                            <p class="text-xs text-gray-400">Avg ${avgHigh}° / ${avgLow}° · ${totalRain}mm rain</p>
                        </div>
                    </div>
                </div>
                <div class="space-y-2" id="forecast-list">
        `;

        forecast.forEach((day, index) => {
            const isToday = index === new Date().getDay();
            const isExpanded = this.expandedDay === index;
            const temp = this.utils.unitConverter.temperature(day.temp, unit);
            const tempMin = this.utils.unitConverter.temperature(day.tempMin, unit);

            html += this.renderForecastDay(day, index, temp, tempMin, isToday, isExpanded);
        });

        html += `</div></div>`;
        container.innerHTML = html;
        this.attachEventListeners(forecast, unit);
    }

    renderForecastDay(day, index, temp, tempMin, isToday, isExpanded) {
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dayName = dayNames[index] || day.day;
        
        const details = {
            humidity: day.humidity || 65,
            wind: day.wind || 12,
            uv: day.uv || 6,
            sunrise: day.sunrise || '6:40 AM',
            sunset: day.sunset || '5:15 PM',
            feelsLike: Math.round((day.temp + day.tempMin) / 2)
        };

        // Responsive grid: on small screens, stack vertically; on larger, use 12 columns
        return `
            <div class="forecast-day group ${isToday ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20' : 'hover:bg-white/5'} 
                        rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
                 data-index="${index}">
                ${isToday ? '<div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>' : ''}
                
                <div class="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-2 text-sm py-3 px-2 sm:py-4 sm:px-3">
                    <!-- Day -->
                    <div class="flex items-center justify-between sm:justify-start sm:col-span-2 w-full sm:w-auto">
                        <span class="${isToday ? 'text-white font-semibold' : 'text-gray-400'}">${dayName}</span>
                        <span class="text-[10px] text-gray-500 sm:hidden">${this.getDayDate(index)}</span>
                    </div>
                    
                    <!-- Icon -->
                    <div class="flex items-center gap-2 sm:col-span-1">
                        <span class="text-2xl transform group-hover:scale-125 transition-transform" data-tooltip="${this.getWeatherDescription(day.icon)}">${day.icon}</span>
                        <span class="text-xs text-gray-400 sm:hidden">${this.getWeatherDescription(day.icon)}</span>
                    </div>
                    
                    <!-- Temperatures -->
                    <div class="flex items-baseline gap-1 sm:col-span-2">
                        <span class="text-white font-medium">${temp.value}°</span>
                        <span class="text-gray-500 text-xs">/${tempMin.value}°</span>
                    </div>
                    
                    <!-- Feels like (hidden on mobile) -->
                    <span class="hidden sm:block sm:col-span-2 text-xs text-gray-500">
                        feels ${details.feelsLike}°
                    </span>
                    
                    <!-- Precipitation bar -->
                    <div class="flex items-center gap-2 sm:col-span-3 w-full">
                        <div class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full ${this.getPrecipColor(day.precipChance)} rounded-full" style="width: ${day.precipChance}%"></div>
                        </div>
                        <span class="text-xs ${this.getPrecipTextColor(day.precipChance)} min-w-[40px]">${day.precipChance}%</span>
                    </div>
                    
                    <!-- Quick icons (hidden on mobile) -->
                    <div class="hidden sm:flex sm:col-span-2 text-right items-center justify-end gap-2">
                        <span class="text-xs text-gray-500" data-tooltip="Humidity">💧 ${details.humidity}%</span>
                        <span class="text-xs text-gray-500" data-tooltip="Wind">💨 ${details.wind}</span>
                    </div>
                </div>
                
                ${isExpanded ? this.renderExpandedDetails(day, details) : ''}
            </div>
        `;
    }


    renderExpandedDetails(day, details) {
        return `
            <div class="px-3 pb-4 pt-2 bg-white/5 rounded-b-xl mt-1">
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="text-blue-400">🌡️</span>
                        <div>
                            <p class="text-gray-400 text-xs">Feels Like</p>
                            <p class="text-white font-medium">${details.feelsLike}°</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-green-400">💧</span>
                        <div>
                            <p class="text-gray-400 text-xs">Humidity</p>
                            <p class="text-white font-medium">${details.humidity}%</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDayDate(index) {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    getWeatherDescription(icon) {
        const descriptions = {
            '☀️': 'Clear sky',
            '🌤️': 'Mostly sunny',
            '⛅': 'Partly cloudy',
            '☁️': 'Cloudy',
            '🌧️': 'Rainy',
            '⛈️': 'Thunderstorms',
            '🌨️': 'Snowy',
            '🌫️': 'Foggy',
            '🌙': 'Clear night',
            '❄️': 'Snow'
        };
        return descriptions[icon] || 'Variable conditions';
    }

    getPrecipColor(chance) {
        if (chance >= 70) return 'bg-red-500';
        if (chance >= 50) return 'bg-orange-500';
        if (chance >= 30) return 'bg-yellow-500';
        if (chance >= 10) return 'bg-blue-500';
        return 'bg-gray-500';
    }

    getPrecipTextColor(chance) {
        if (chance >= 70) return 'text-red-400';
        if (chance >= 50) return 'text-orange-400';
        if (chance >= 30) return 'text-yellow-400';
        if (chance >= 10) return 'text-blue-400';
        return 'text-gray-400';
    }

    attachEventListeners(forecast, unit) {
        // Day click for expansion
        document.querySelectorAll('.forecast-day').forEach(day => {
            day.addEventListener('click', (e) => {
                // Don't toggle if clicking on tooltips or interactive elements
                if (e.target.closest('[data-tooltip]')) return;
                
                const index = parseInt(day.dataset.index);
                this.expandedDay = this.expandedDay === index ? null : index;
                this.render(forecast, unit);
            });
        });
    }
}