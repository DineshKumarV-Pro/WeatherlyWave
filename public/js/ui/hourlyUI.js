/**
 * Enhanced Hourly Forecast UI Component with Timeline and Interactive Charts
 */

export class HourlyUI {
    constructor(domHelpers, utils) {
        this.dom = domHelpers;
        this.utils = utils;
        this.selectedView = 'temp';
        this.autoScroll = true;
        this.expanded = false;
        this.chart = null;
    }

    render(hourly, unit) {
        const container = document.getElementById('hourly-card');
        if (!container) return;

        const now = hourly[0];
        const next24 = hourly.slice(0, 24);
        const tempNow = this.utils.unitConverter.temperature(now.temp, unit);

        container.innerHTML = `
            <div class="flex flex-col gap-3 sm:gap-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 class="font-semibold text-white text-base sm:text-lg flex items-center gap-2">
                        <span class="w-1.5 h-5 sm:h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></span>
                        24-Hour Forecast
                    </h3>
                    <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                        <div class="flex bg-white/5 p-1 rounded-xl">
                            <button class="view-btn px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs rounded-lg transition-all duration-300 ${this.selectedView === 'temp' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}" data-view="temp">
                                🌡️ Temp
                            </button>
                            <button class="view-btn px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs rounded-lg transition-all duration-300 ${this.selectedView === 'precip' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}" data-view="precip">
                                🌧️ Precip
                            </button>
                            <button class="view-btn px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs rounded-lg transition-all duration-300 ${this.selectedView === 'wind' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}" data-view="wind">
                                💨 Wind
                            </button>
                            <button class="view-btn px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs rounded-lg transition-all duration-300 ${this.selectedView === 'humidity' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}" data-view="humidity">
                                💧 Humidity
                            </button>
                        </div>
                    </div>
                </div>

                <div class="relative overflow-hidden">
                    <div class="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" id="hourly-scroll">
                        ${next24.map((hour, index) => this.renderHourCard(hour, index, unit)).join('')}
                    </div>
                    <button class="scroll-btn absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800/80 p-1.5 sm:p-2 rounded-full backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity z-10" id="scroll-left">
                        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button class="scroll-btn absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800/80 p-1.5 sm:p-2 rounded-full backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity z-10" id="scroll-right">
                        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div class="mt-4 pt-2 border-t border-white/5">
                    <canvas id="hourly-timeline" class="w-full h-64"></canvas>
                </div>

                <div class="transition-all duration-500 overflow-hidden ${this.expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}">
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5">
                        <div class="bg-white/5 p-2 sm:p-3 rounded-xl text-center">
                            <span class="text-yellow-500 text-lg sm:text-xl">🌅</span>
                            <p class="text-[10px] sm:text-xs text-gray-400 mt-1">Sunrise</p>
                            <p class="text-xs sm:text-sm font-bold">6:40 AM</p>
                        </div>
                        <div class="bg-white/5 p-2 sm:p-3 rounded-xl text-center">
                            <span class="text-orange-500 text-lg sm:text-xl">🌇</span>
                            <p class="text-[10px] sm:text-xs text-gray-400 mt-1">Sunset</p>
                            <p class="text-xs sm:text-sm font-bold">5:15 PM</p>
                        </div>
                        <div class="bg-white/5 p-2 sm:p-3 rounded-xl text-center">
                            <span class="text-blue-400 text-lg sm:text-xl">📊</span>
                            <p class="text-[10px] sm:text-xs text-gray-400 mt-1">Max Temp</p>
                            <p class="text-xs sm:text-sm font-bold">${this.getMaxTemp(next24, unit)}°</p>
                        </div>
                        <div class="bg-white/5 p-2 sm:p-3 rounded-xl text-center">
                            <span class="text-cyan-400 text-lg sm:text-xl">💧</span>
                            <p class="text-[10px] sm:text-xs text-gray-400 mt-1">Total Precip</p>
                            <p class="text-xs sm:text-sm font-bold">${this.getTotalPrecip(next24)}mm</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-white/5 text-center">
                    <div>
                        <span class="text-[10px] sm:text-xs text-gray-400">Max Temp</span>
                        <p class="text-xs sm:text-sm font-bold text-white">${this.getMaxTemp(next24, unit)}°</p>
                    </div>
                    <div>
                        <span class="text-[10px] sm:text-xs text-gray-400">Min Temp</span>
                        <p class="text-xs sm:text-sm font-bold text-white">${this.getMinTemp(next24, unit)}°</p>
                    </div>
                    <div>
                        <span class="text-[10px] sm:text-xs text-gray-400">Total Precip</span>
                        <p class="text-xs sm:text-sm font-bold text-white">${this.getTotalPrecip(next24)}mm</p>
                    </div>
                    <div>
                        <span class="text-[10px] sm:text-xs text-gray-400">Avg Wind</span>
                        <p class="text-xs sm:text-sm font-bold text-white">${this.getAvgWind(next24)} km/h</p>
                    </div>
                </div>
            </div>
        `;

        this.renderChart(next24, unit);
        this.attachEventListeners(next24, unit);
    }

    renderHourCard(hour, index, unit) {
        const temp = this.utils.unitConverter.temperature(hour.temp, unit);
        const isNow = index === 0;
        const isNight = hour.icon === '🌙';
        
        return `
            <div class="hour-card min-w-[70px] sm:min-w-[90px] ${isNow ? 'bg-gradient-to-b from-blue-600/30 to-purple-600/30 border border-blue-500/30' : 'hover:bg-white/5'} 
                        rounded-xl p-2 sm:p-3 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden"
                 data-hour="${index}">
                ${isNow ? '<div class="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>' : ''}
                <p class="text-[10px] sm:text-xs ${isNow ? 'text-blue-400' : 'text-gray-400'} font-medium mb-1 sm:mb-2">${isNow ? 'NOW' : hour.time}</p>
                <p class="text-base sm:text-xl font-bold text-white my-0.5 sm:my-1 group-hover:scale-110 transition-transform">${temp.value}°</p>
                <span class="text-2xl sm:text-3xl block my-1 sm:my-2 filter drop-shadow-lg ${isNight ? 'text-blue-200' : ''}">${hour.icon}</span>
                <div class="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
                    ${this.renderHourData(hour, this.selectedView)}
                </div>
                <div class="mt-1 sm:mt-2 w-full h-0.5 sm:h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full ${this.getTrendColor(hour, index)} transition-all duration-300" style="width: ${this.getTrendValue(hour, this.selectedView)}%"></div>
                </div>
            </div>
        `;
    }

    renderHourData(hour, view) {
        switch(view) {
            case 'precip':
                return `
                    <p class="text-blue-400 font-medium">${hour.precip}%</p>
                    <p class="text-[10px] text-gray-500">chance</p>
                `;
            case 'wind':
                return `
                    <p class="text-cyan-400 font-medium">${hour.wind}</p>
                    <p class="text-[10px] text-gray-500">km/h</p>
                `;
            case 'humidity':
                return `
                    <p class="text-green-400 font-medium">${hour.humidity || 65}%</p>
                    <p class="text-[10px] text-gray-500">humidity</p>
                `;
            default:
                return `
                    <p class="text-orange-400 font-medium">${hour.precip}%</p>
                    <p class="text-[10px] text-gray-500">precip</p>
                `;
        }
    }

    renderChart(hourly, unit) {
        const canvas = document.getElementById('hourly-timeline');
        if (!canvas || !window.Chart) return;

        if (this.chart) this.chart.destroy();

        const ctx = canvas.getContext('2d');
        const labels = hourly.map((h, i) => i === 0 ? 'Now' : h.time);
        
        let data, label, borderColor, backgroundColor;
        switch(this.selectedView) {
            case 'precip':
                data = hourly.map(h => h.precip);
                label = 'Precipitation (%)';
                borderColor = '#10b981';
                backgroundColor = 'rgba(16, 185, 129, 0.1)';
                break;
            case 'wind':
                data = hourly.map(h => h.wind);
                label = 'Wind Speed (km/h)';
                borderColor = '#06b6d4';
                backgroundColor = 'rgba(6, 182, 212, 0.1)';
                break;
            case 'humidity':
                data = hourly.map(h => h.humidity || 65);
                label = 'Humidity (%)';
                borderColor = '#8b5cf6';
                backgroundColor = 'rgba(139, 92, 246, 0.1)';
                break;
            default:
                data = hourly.map(h => this.utils.unitConverter.temperature(h.temp, unit).value);
                label = `Temperature (°${unit === 'celsius' ? 'C' : 'F'})`;
                borderColor = '#f97316';
                backgroundColor = 'rgba(249, 115, 22, 0.1)';
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: data.map((d, i) => i === 0 ? '#ef4444' : borderColor),
                    pointBorderColor: '#fff',
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#f0f4fa' } },
                    x: { grid: { display: false }, ticks: { color: '#f0f4fa', maxRotation: 45, maxTicksLimit: 6 } }
                }
            }
        });
    }

    getTrendColor(hour, index) {
        if (index === 0) return 'bg-orange-500';
        
        switch(this.selectedView) {
            case 'precip':
                return hour.precip > 50 ? 'bg-red-500' : hour.precip > 30 ? 'bg-yellow-500' : 'bg-blue-500';
            case 'wind':
                return hour.wind > 30 ? 'bg-red-500' : hour.wind > 20 ? 'bg-yellow-500' : 'bg-cyan-500';
            case 'humidity':
                return hour.humidity > 70 ? 'bg-blue-500' : hour.humidity > 40 ? 'bg-green-500' : 'bg-yellow-500';
            default:
                return hour.temp > 30 ? 'bg-red-500' : 
                       hour.temp > 25 ? 'bg-orange-500' :
                       hour.temp > 20 ? 'bg-yellow-500' :
                       hour.temp > 15 ? 'bg-blue-500' : 'bg-cyan-500';
        }
    }

    getTrendValue(hour, view) {
        switch(view) {
            case 'precip': return hour.precip;
            case 'wind': return (hour.wind / 60) * 100;
            case 'humidity': return hour.humidity || 65;
            default: return ((hour.temp + 10) / 50) * 100;
        }
    }

    getMaxTemp(hourly, unit) {
        const max = Math.max(...hourly.map(h => h.temp));
        return this.utils.unitConverter.temperature(max, unit).value;
    }

    getMinTemp(hourly, unit) {
        const min = Math.min(...hourly.map(h => h.temp));
        return this.utils.unitConverter.temperature(min, unit).value;
    }

    getTotalPrecip(hourly) {
        return hourly.reduce((sum, h) => sum + (h.precip || 0), 0).toFixed(1);
    }

    getAvgWind(hourly) {
        const sum = hourly.reduce((sum, h) => sum + (h.wind || 0), 0);
        return Math.round(sum / hourly.length);
    }

    attachEventListeners(hourly, unit) {
        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => {
                    b.classList.remove('bg-blue-500', 'text-white');
                    b.classList.add('text-gray-400');
                });
                e.target.classList.remove('text-gray-400');
                e.target.classList.add('bg-blue-500', 'text-white');

                this.selectedView = e.target.dataset.view;
                this.renderChart(hourly, unit);
                
                // Update cards data display
                document.querySelectorAll('.hour-card').forEach((card, i) => {
                    const dataDiv = card.querySelector('.mt-2');
                    if (dataDiv) {
                        dataDiv.innerHTML = this.renderHourData(hourly[i], this.selectedView);
                    }
                    
                    const trendBar = card.querySelector('.h-full');
                    if (trendBar) {
                        trendBar.className = `h-full ${this.getTrendColor(hourly[i], i)} transition-all duration-300`;
                        trendBar.style.width = `${this.getTrendValue(hourly[i], this.selectedView)}%`;
                    }
                });
            });
        });

        // Hour card click
        document.querySelectorAll('.hour-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.hour-card').forEach(c => {
                    c.classList.remove('ring-2', 'ring-blue-500', 'scale-105');
                });
                
                card.classList.add('ring-2', 'ring-blue-500', 'scale-105');
                
                const hour = hourly[index];
                window.weatherApp?.ui?.loader?.showInfo(
                    `${hour.time}: ${hour.temp}°C, ${hour.precip}% precip, ${hour.wind} km/h wind`
                );
                
                setTimeout(() => {
                    card.classList.remove('ring-2', 'ring-blue-500', 'scale-105');
                }, 2000);
            });
        });

        // Scroll controls
        const scrollContainer = document.getElementById('hourly-scroll');
        const scrollLeft = document.getElementById('scroll-left');
        const scrollRight = document.getElementById('scroll-right');

        if (scrollLeft) {
            scrollLeft.addEventListener('click', () => {
                scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
            });
        }

        if (scrollRight) {
            scrollRight.addEventListener('click', () => {
                scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }

        const container = scrollContainer?.parentElement;
        if (container) {
            let timeout;
            container.addEventListener('mousemove', () => {
                document.querySelectorAll('.scroll-btn').forEach(btn => {
                    btn.classList.remove('opacity-0');
                });
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    document.querySelectorAll('.scroll-btn').forEach(btn => {
                        btn.classList.add('opacity-0');
                    });
                }, 2000);
            });
            container.addEventListener('mouseleave', () => {
                document.querySelectorAll('.scroll-btn').forEach(btn => {
                    btn.classList.add('opacity-0');
                });
            });
        }

        // Inside attachEventListeners, replace the auto-scroll block with:

if (this.autoScroll && scrollContainer) {
    const nowCard = scrollContainer.querySelector('[data-hour="0"]');
    if (nowCard) {
        // Calculate scroll position to center the "NOW" card horizontally
        const cardLeft = nowCard.offsetLeft;
        const cardWidth = nowCard.offsetWidth;
        const containerWidth = scrollContainer.clientWidth;
        const scrollTo = cardLeft - (containerWidth / 2) + (cardWidth / 2);
        scrollContainer.scrollLeft = Math.max(0, scrollTo);
    }
}
    }
}