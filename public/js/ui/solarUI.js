/**
 * Solar & Astronomy UI - Enhanced with Additional Features
 */

export class SolarUI {
    constructor(domHelpers, utils) {
        this.dom = domHelpers;
        this.utils = utils;
    }

    render(data) {
        const container = document.getElementById('solar-card');
        if (!container) return;

        const sunPosition = this.calculateSunPosition(data.sunrise, data.sunset);
        const isDaytime = this.isDaytime(new Date(), data.sunrise, data.sunset);
        const moonPhase = this.getMoonPhase(data.moonIllumination || 32);
        const nextEvent = this.getNextEvent(data);
        const solsticeInfo = this.getSolsticeInfo();

        container.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="flex items-center gap-2 mb-3 sm:mb-4">
                    <span class="w-1 h-4 sm:h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></span>
                    <h3 class="font-semibold text-white text-base sm:text-lg">Solar & Lunar</h3>
                    <span class="ml-auto text-[10px] sm:text-xs bg-white/5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1">
                        <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 ${isDaytime ? 'bg-yellow-500' : 'bg-blue-400'} rounded-full animate-pulse"></span>
                        ${isDaytime ? 'Day' : 'Night'}
                    </span>
                </div>

                <div class="mb-4 sm:mb-5">
                    <div class="flex justify-between text-[10px] sm:text-xs mb-1 sm:mb-2">
                        <span class="text-gray-400">Sun Position</span>
                        <div class="flex items-center gap-2 sm:gap-3">
                            <span class="text-yellow-400">${sunPosition.angle}°</span>
                            <span class="text-gray-600">|</span>
                            <span class="text-gray-400">${sunPosition.percent}%</span>
                        </div>
                    </div>
                    <div class="relative h-12 sm:h-16 bg-white/5 rounded-lg overflow-hidden">
                        <div class="absolute inset-0">
                            <div class="w-full h-full flex items-center px-2 sm:px-3">
                                <div class="w-full h-0.5 sm:h-1 bg-gray-700 rounded-full relative">
                                    <div class="absolute h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full transition-all duration-1000" style="width: ${sunPosition.percent}%"></div>
                                    <div class="absolute w-2.5 h-2.5 sm:w-4 sm:h-4 -mt-1 sm:-mt-1.5 transition-all duration-1000" style="left: calc(${sunPosition.percent}% - 5px);">
                                        <div class="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="absolute bottom-0.5 sm:bottom-1 left-2 sm:left-3 right-2 sm:right-3 flex justify-between text-[8px] sm:text-[10px]">
                            <span class="text-gray-500">${this.formatTimeShort(data.sunrise) || '06:40'}</span>
                            <span class="text-yellow-400 bg-gray-900/50 px-1 py-0.5 sm:px-2 rounded-full text-[7px] sm:text-[8px] font-medium">${sunPosition.timeRemaining}</span>
                            <span class="text-gray-500">${this.formatTimeShort(data.sunset) || '17:15'}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 sm:mb-4">
                    <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-2 rounded-lg border border-blue-500/20">
                        <div class="flex items-center gap-2">
                            <span class="text-blue-300 text-sm sm:text-base">🌅</span>
                            <div>
                                <p class="text-gray-400 text-[9px] sm:text-[10px]">First Light</p>
                                <p class="text-white text-xs sm:text-sm font-medium">${data.firstLight ? this.formatTimeShort(data.firstLight) : '06:15'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-2 rounded-lg border border-purple-500/20">
                        <div class="flex items-center gap-2">
                            <span class="text-purple-300 text-sm sm:text-base">🌆</span>
                            <div>
                                <p class="text-gray-400 text-[9px] sm:text-[10px]">Last Light</p>
                                <p class="text-white text-xs sm:text-sm font-medium">${data.lastLight ? this.formatTimeShort(data.lastLight) : '17:40'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                    <div class="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-2 rounded-lg border border-yellow-500/20">
                        <div class="flex items-center gap-2">
                            <span class="text-yellow-400 text-sm sm:text-base">✨</span>
                            <div>
                                <p class="text-gray-400 text-[9px] sm:text-[10px]">Golden Hour AM</p>
                                <p class="text-white text-[10px] sm:text-xs font-medium">${this.formatTimeShort(data.sunrise) || '06:40'} - 07:40</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-2 rounded-lg border border-orange-500/20">
                        <div class="flex items-center gap-2">
                            <span class="text-orange-400 text-sm sm:text-base">🌟</span>
                            <div>
                                <p class="text-gray-400 text-[9px] sm:text-[10px]">Golden Hour PM</p>
                                <p class="text-white text-[10px] sm:text-xs font-medium">16:15 - ${this.formatTimeShort(data.sunset) || '17:15'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-3 border-t border-white/5">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xl sm:text-2xl">${moonPhase.icon}</span>
                            <div>
                                <p class="text-[10px] sm:text-xs text-gray-400">Moon Phase</p>
                                <p class="text-xs sm:text-sm font-medium text-white">${moonPhase.name}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] sm:text-xs text-gray-400">Illumination</p>
                            <p class="text-xs sm:text-sm font-medium text-white">${data.moonIllumination || 32}%</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <div class="flex items-center gap-1">
                            <span class="text-gray-500 text-[8px] sm:text-[10px]">🌙 Rise:</span>
                            <span class="text-white text-[10px] sm:text-xs">${data.moonrise || '23:22'}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <span class="text-gray-500 text-[8px] sm:text-[10px]">🌙 Set:</span>
                            <span class="text-white text-[10px] sm:text-xs">${data.moonset || '12:46'}</span>
                        </div>
                    </div>
                    <div class="flex justify-between mt-1 sm:mt-2 text-[7px] sm:text-[9px] bg-white/5 p-1.5 sm:p-2 rounded-lg">
                        <span class="flex items-center gap-1 text-gray-400"><span>🌑</span> New: ${this.getNextMoonPhase('new')}</span>
                        <span class="flex items-center gap-1 text-gray-400"><span>🌕</span> Full: ${this.getNextMoonPhase('full')}</span>
                        <span class="flex items-center gap-1 text-gray-400"><span>⏰</span> ${nextEvent}</span>
                    </div>
                    <div class="flex justify-between mt-1 text-[6px] sm:text-[8px] text-gray-600">
                        <span>🌸 ${solsticeInfo.spring}</span>
                        <span>☀️ ${solsticeInfo.summer}</span>
                        <span>🍂 ${solsticeInfo.fall}</span>
                        <span>❄️ ${solsticeInfo.winter}</span>
                    </div>
                </div>
            </div>
        `;
    }


    formatTimeShort(timeStr) {
        if (!timeStr) return null;
        return timeStr.replace(' AM', '').replace(' PM', '');
    }

    calculateSunPosition(sunrise, sunset) {
        const now = new Date();
        const sunriseTime = this.parseTime(sunrise || '6:40 AM');
        const sunsetTime = this.parseTime(sunset || '5:15 PM');
        
        const total = sunsetTime - sunriseTime;
        const elapsed = now - sunriseTime;
        
        let progress = 0;
        let timeRemaining = '';
        
        if (now < sunriseTime) {
            progress = 0;
            const diff = sunriseTime - now;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            timeRemaining = `↑ in ${hours}h ${minutes}m`;
        } else if (now > sunsetTime) {
            progress = 100;
            const tomorrow = new Date(sunriseTime);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const diff = tomorrow - now;
            const hours = Math.floor(diff / 3600000);
            timeRemaining = `↓ in ${hours}h`;
        } else {
            progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
            const remaining = sunsetTime - now;
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            timeRemaining = `${hours}h ${minutes}m left`;
        }
        
        return {
            percent: Math.round(progress),
            angle: Math.round((progress / 100) * 180 - 90),
            timeRemaining
        };
    }

    getNextEvent(data) {
        const now = new Date();
        const sunrise = this.parseTime(data.sunrise || '6:40 AM');
        const sunset = this.parseTime(data.sunset || '5:15 PM');
        
        if (now < sunrise) {
            const diff = sunrise - now;
            const hours = Math.floor(diff / 3600000);
            return `🌅 ${hours}h`;
        }
        if (now < sunset) {
            const diff = sunset - now;
            const hours = Math.floor(diff / 3600000);
            return `🌇 ${hours}h`;
        }
        return '🌅 tomorrow';
    }

    getSolsticeInfo() {
        const today = new Date();
        const year = today.getFullYear();
        
        return {
            spring: `Mar 20`,
            summer: `Jun 21`,
            fall: `Sep 22`,
            winter: `Dec 21`
        };
    }

    isDaytime(now, sunrise, sunset) {
        const rise = this.parseTime(sunrise || '6:40 AM');
        const set = this.parseTime(sunset || '5:15 PM');
        return now >= rise && now <= set;
    }

    getMoonPhase(illumination) {
        if (illumination < 12.5) return { name: 'New Moon', icon: '🌑' };
        if (illumination < 25) return { name: 'Waxing Crescent', icon: '🌒' };
        if (illumination < 37.5) return { name: 'First Quarter', icon: '🌓' };
        if (illumination < 50) return { name: 'Waxing Gibbous', icon: '🌔' };
        if (illumination < 62.5) return { name: 'Full Moon', icon: '🌕' };
        if (illumination < 75) return { name: 'Waning Gibbous', icon: '🌖' };
        if (illumination < 87.5) return { name: 'Last Quarter', icon: '🌗' };
        return { name: 'Waning Crescent', icon: '🌘' };
    }

    getNextMoonPhase(phase) {
        const today = new Date().getDate();
        if (phase === 'new') {
            const days = (29 - today) % 29;
            if (days === 0) return 'Tonight';
            if (days === 1) return 'Tomorrow';
            return `${days}d`;
        } else {
            const days = (15 - today + 29) % 29;
            if (days === 0) return 'Tonight';
            if (days === 1) return 'Tomorrow';
            return `${days}d`;
        }
    }

    getTimeUntil(timeStr) {
        if (!timeStr) return '';
        
        const now = new Date();
        const target = this.parseTime(timeStr);
        
        if (target < now) {
            target.setDate(target.getDate() + 1);
        }
        
        const diff = target - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        
        if (hours === 0) return `in ${minutes}m`;
        if (hours === 1) return `in 1h`;
        if (hours < 24) return `in ${hours}h`;
        return `in ${Math.floor(hours/24)}d`;
    }

    parseTime(timeStr) {
        if (!timeStr) return new Date();
        
        try {
            const [time, period] = timeStr.split(' ');
            if (!time) return new Date();
            
            let [hours, minutes] = time.split(':').map(Number);
            
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            const date = new Date();
            date.setHours(hours, minutes || 0, 0, 0);
            return date;
        } catch {
            return new Date();
        }
    }
}