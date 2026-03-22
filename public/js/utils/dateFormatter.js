/**
 * Advanced Date Formatting Utilities with Localization and Relative Time
 */

export class DateFormatter {
    constructor(locale = 'en-US') {
        this.locale = locale;
        this.supportedLocales = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'ja-JP', 'zh-CN', 'ru-RU', 'ar-SA'];
        this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.updateLocale(locale);
    }

    updateLocale(locale) {
        this.locale = this.supportedLocales.includes(locale) ? locale : 'en-US';
        
        // Initialize formatters with new locale
        this.fullDateFormatter = new Intl.DateTimeFormat(this.locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: this.timezone
        });

        this.longDateFormatter = new Intl.DateTimeFormat(this.locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: this.timezone
        });

        this.mediumDateFormatter = new Intl.DateTimeFormat(this.locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: this.timezone
        });

        this.shortDateFormatter = new Intl.DateTimeFormat(this.locale, {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
            timeZone: this.timezone
        });

        this.timeFormatter = new Intl.DateTimeFormat(this.locale, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: this.locale === 'en-US',
            timeZone: this.timezone
        });

        this.timeWithSecondsFormatter = new Intl.DateTimeFormat(this.locale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: this.locale === 'en-US',
            timeZone: this.timezone
        });

        this.weekdayFormatter = new Intl.DateTimeFormat(this.locale, {
            weekday: 'long',
            timeZone: this.timezone
        });

        this.shortWeekdayFormatter = new Intl.DateTimeFormat(this.locale, {
            weekday: 'short',
            timeZone: this.timezone
        });

        this.monthFormatter = new Intl.DateTimeFormat(this.locale, {
            month: 'long',
            timeZone: this.timezone
        });

        this.shortMonthFormatter = new Intl.DateTimeFormat(this.locale, {
            month: 'short',
            timeZone: this.timezone
        });

        this.yearFormatter = new Intl.DateTimeFormat(this.locale, {
            year: 'numeric',
            timeZone: this.timezone
        });

        this.relativeTimeFormatter = new Intl.RelativeTimeFormat(this.locale, {
            numeric: 'auto',
            style: 'long'
        });
    }

    formatFullDate(date) {
        return this.fullDateFormatter.format(date);
    }

    formatLongDate(date) {
        return this.longDateFormatter.format(date);
    }

    formatDate(date, options = {}) {
        const { style = 'medium' } = options;
        
        switch(style) {
            case 'long':
                return this.longDateFormatter.format(date);
            case 'medium':
                return this.mediumDateFormatter.format(date);
            case 'short':
                return this.shortDateFormatter.format(date);
            default:
                return this.mediumDateFormatter.format(date);
        }
    }

    formatTime(date, options = {}) {
        const { withSeconds = false, hour12 = undefined } = options;
        
        if (withSeconds) {
            return this.timeWithSecondsFormatter.format(date);
        }
        return this.timeFormatter.format(date);
    }

    formatDateTime(date, options = {}) {
        const { dateStyle = 'medium', timeStyle = 'short' } = options;
        
        return new Intl.DateTimeFormat(this.locale, {
            dateStyle,
            timeStyle,
            timeZone: this.timezone
        }).format(date);
    }

    formatDay(date, options = {}) {
        const { style = 'long' } = options;
        
        if (style === 'short') {
            return this.shortWeekdayFormatter.format(date);
        }
        return this.weekdayFormatter.format(date);
    }

    formatShortDay(date) {
        return this.shortWeekdayFormatter.format(date).toUpperCase();
    }

    formatMonth(date, options = {}) {
        const { style = 'long' } = options;
        
        if (style === 'short') {
            return this.shortMonthFormatter.format(date);
        }
        return this.monthFormatter.format(date);
    }

    formatYear(date) {
        return this.yearFormatter.format(date);
    }

    formatHour(date, options = {}) {
        const { withMinutes = false, hour12 = undefined } = options;
        
        return new Intl.DateTimeFormat(this.locale, {
            hour: '2-digit',
            minute: withMinutes ? '2-digit' : undefined,
            hour12: hour12 ?? (this.locale === 'en-US'),
            timeZone: this.timezone
        }).format(date);
    }

    getRelativeTime(date, options = {}) {
        const now = new Date();
        const diff = date - now;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        if (Math.abs(years) > 0) {
            return this.relativeTimeFormatter.format(years, 'year');
        }
        if (Math.abs(months) > 0) {
            return this.relativeTimeFormatter.format(months, 'month');
        }
        if (Math.abs(weeks) > 0) {
            return this.relativeTimeFormatter.format(weeks, 'week');
        }
        if (Math.abs(days) > 0) {
            return this.relativeTimeFormatter.format(days, 'day');
        }
        if (Math.abs(hours) > 0) {
            return this.relativeTimeFormatter.format(hours, 'hour');
        }
        if (Math.abs(minutes) > 0) {
            return this.relativeTimeFormatter.format(minutes, 'minute');
        }
        return this.relativeTimeFormatter.format(seconds, 'second');
    }

    getRelativeTimeShort(date) {
        const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto', style: 'short' });
        const now = new Date();
        const diff = date - now;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (Math.abs(days) > 0) return rtf.format(days, 'day');
        if (Math.abs(hours) > 0) return rtf.format(hours, 'hour');
        if (Math.abs(minutes) > 0) return rtf.format(minutes, 'minute');
        return rtf.format(seconds, 'second');
    }

    getRelativeTimeDetailed(date) {
        const now = new Date();
        const diff = date - now;
        const absDiff = Math.abs(diff);
        
        const seconds = Math.floor(absDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        const direction = diff >= 0 ? 'from now' : 'ago';
        
        if (days > 0) {
            const remainingHours = hours % 24;
            return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''} ${direction}`;
        }
        if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} ${direction}`;
        }
        if (minutes > 0) {
            const remainingSeconds = seconds % 60;
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} ${direction}`;
        }
        return `${seconds} second${seconds !== 1 ? 's' : ''} ${direction}`;
    }

    getTimeOfDay(date = new Date()) {
        const hours = date.getHours();
        
        if (hours < 5) return 'Night';
        if (hours < 12) return 'Morning';
        if (hours < 17) return 'Afternoon';
        if (hours < 21) return 'Evening';
        return 'Night';
    }

    getDayPeriod(date = new Date()) {
        const hours = date.getHours();
        return hours < 12 ? 'AM' : 'PM';
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isTomorrow(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    }

    isYesterday(date) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return date.toDateString() === yesterday.toDateString();
    }

    isThisWeek(date) {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo && date <= now;
    }

    isNextWeek(date) {
        const now = new Date();
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const twoWeeks = new Date(now);
        twoWeeks.setDate(twoWeeks.getDate() + 14);
        return date >= nextWeek && date <= twoWeeks;
    }

    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    getQuarter(date) {
        const month = date.getMonth();
        return Math.floor(month / 3) + 1;
    }

    getTimezoneInfo() {
        return {
            timezone: this.timezone,
            offset: -new Date().getTimezoneOffset() / 60,
            offsetString: this.getTimezoneOffsetString()
        };
    }

    getTimezoneOffsetString() {
        const offset = -new Date().getTimezoneOffset();
        const hours = Math.floor(Math.abs(offset) / 60);
        const minutes = Math.abs(offset) % 60;
        const sign = offset >= 0 ? '+' : '-';
        return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    getSunriseSunsetTimes(lat, lon, date = new Date()) {
        // This would typically call an API, but here we'll return approximate times
        const dayOfYear = this.getDayOfYear(date);
        const latitude = lat || 40; // Default latitude
        
        // Approximate calculation (not accurate for production)
        const sunriseHour = 6 - (latitude / 15) * Math.cos(dayOfYear * 2 * Math.PI / 365);
        const sunsetHour = 18 + (latitude / 15) * Math.cos(dayOfYear * 2 * Math.PI / 365);
        
        const sunrise = new Date(date);
        sunrise.setHours(Math.floor(sunriseHour), Math.floor((sunriseHour % 1) * 60));
        
        const sunset = new Date(date);
        sunset.setHours(Math.floor(sunsetHour), Math.floor((sunsetHour % 1) * 60));
        
        return { sunrise, sunset };
    }

    formatRange(startDate, endDate, options = {}) {
        const { separator = '–', sameDay = true } = options;
        
        if (sameDay && startDate.toDateString() === endDate.toDateString()) {
            return `${this.formatDate(startDate)} ${separator} ${this.formatTime(startDate)}–${this.formatTime(endDate)}`;
        }
        
        return `${this.formatDate(startDate)} ${separator} ${this.formatDate(endDate)}`;
    }

    formatList(dates, options = {}) {
        const { style = 'long', max = 5 } = options;
        const formatter = new Intl.ListFormat(this.locale, { style, type: 'conjunction' });
        
        const dateStrings = dates.slice(0, max).map(date => this.formatDate(date));
        
        if (dates.length > max) {
            dateStrings.push(`${dates.length - max} more`);
        }
        
        return formatter.format(dateStrings);
    }

    getHoliday(date) {
        const month = date.getMonth();
        const day = date.getDate();
        
        // Major holidays (simplified)
        const holidays = {
            '1-1': 'New Year\'s Day',
            '12-25': 'Christmas Day',
            '12-31': 'New Year\'s Eve',
            '7-4': 'Independence Day (US)',
            '10-31': 'Halloween',
            '2-14': 'Valentine\'s Day',
            '3-17': 'St. Patrick\'s Day'
        };
        
        return holidays[`${month + 1}-${day}`] || null;
    }

    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    addTime(date, amount, unit) {
        const result = new Date(date);
        
        switch(unit) {
            case 'seconds':
                result.setSeconds(result.getSeconds() + amount);
                break;
            case 'minutes':
                result.setMinutes(result.getMinutes() + amount);
                break;
            case 'hours':
                result.setHours(result.getHours() + amount);
                break;
            case 'days':
                result.setDate(result.getDate() + amount);
                break;
            case 'weeks':
                result.setDate(result.getDate() + amount * 7);
                break;
            case 'months':
                result.setMonth(result.getMonth() + amount);
                break;
            case 'years':
                result.setFullYear(result.getFullYear() + amount);
                break;
        }
        
        return result;
    }

    getAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    getTimeUntilNext(date, unit) {
        const now = new Date();
        const next = new Date(date);
        
        if (next < now) {
            switch(unit) {
                case 'day':
                    next.setDate(next.getDate() + 1);
                    break;
                case 'week':
                    next.setDate(next.getDate() + 7);
                    break;
                case 'month':
                    next.setMonth(next.getMonth() + 1);
                    break;
                case 'year':
                    next.setFullYear(next.getFullYear() + 1);
                    break;
            }
        }
        
        return this.getRelativeTime(next);
    }

    toUTC(date) {
        return new Date(date.toUTCString());
    }

    fromUTC(utcDate) {
        return new Date(utcDate);
    }

    toTimestamp(date) {
        return Math.floor(date.getTime() / 1000);
    }

    fromTimestamp(timestamp) {
        return new Date(timestamp * 1000);
    }

    formatISO(date, options = {}) {
        const { withTimezone = true } = options;
        
        if (withTimezone) {
            return date.toISOString();
        }
        return date.toISOString().split('T')[0];
    }

    parseISO(isoString) {
        return new Date(isoString);
    }

    getTimeZones() {
        return Intl.supportedValuesOf('timeZone');
    }

    setLocale(locale) {
        this.updateLocale(locale);
    }

    setTimeZone(timezone) {
        this.timezone = timezone;
        this.updateLocale(this.locale);
    }
}