/**
 * Advanced Unit Conversion Utilities with Multiple Systems and Formatting
 */

export class UnitConverter {
    constructor() {
        this.preferredUnit = 'celsius';
        this.preferredWindUnit = 'kmh';
        this.preferredPressureUnit = 'hPa';
        this.preferredPrecipUnit = 'mm';
        this.preferredDistanceUnit = 'km';
        
        this.units = {
            // Temperature
            celsius: { symbol: '°C', name: 'Celsius' },
            fahrenheit: { symbol: '°F', name: 'Fahrenheit' },
            kelvin: { symbol: 'K', name: 'Kelvin' },
            
            // Speed
            kmh: { symbol: 'km/h', name: 'Kilometers per hour' },
            mph: { symbol: 'mph', name: 'Miles per hour' },
            ms: { symbol: 'm/s', name: 'Meters per second' },
            knots: { symbol: 'kt', name: 'Knots' },
            
            // Pressure
            hPa: { symbol: 'hPa', name: 'Hectopascal' },
            mbar: { symbol: 'mbar', name: 'Millibar' },
            psi: { symbol: 'psi', name: 'Pounds per square inch' },
            inHg: { symbol: 'inHg', name: 'Inches of mercury' },
            mmHg: { symbol: 'mmHg', name: 'Millimeters of mercury' },
            
            // Precipitation
            mm: { symbol: 'mm', name: 'Millimeters' },
            cm: { symbol: 'cm', name: 'Centimeters' },
            inches: { symbol: 'in', name: 'Inches' },
            
            // Distance
            km: { symbol: 'km', name: 'Kilometers' },
            miles: { symbol: 'mi', name: 'Miles' },
            meters: { symbol: 'm', name: 'Meters' },
            feet: { symbol: 'ft', name: 'Feet' },
            
            // Percentage
            percent: { symbol: '%', name: 'Percent' },
            
            // Other
            uv: { symbol: '', name: 'UV Index' },
            aqi: { symbol: '', name: 'Air Quality Index' }
        };
        
        this.conversionFactors = {
            // Temperature (special handling in methods)
            kmh_to_mph: 0.621371,
            kmh_to_ms: 0.277778,
            kmh_to_knots: 0.539957,
            
            mph_to_kmh: 1.60934,
            mph_to_ms: 0.44704,
            mph_to_knots: 0.868976,
            
            ms_to_kmh: 3.6,
            ms_to_mph: 2.23694,
            ms_to_knots: 1.94384,
            
            knots_to_kmh: 1.852,
            knots_to_mph: 1.15078,
            knots_to_ms: 0.514444,
            
            // Pressure
            hPa_to_mbar: 1,
            hPa_to_psi: 0.0145038,
            hPa_to_inHg: 0.02953,
            hPa_to_mmHg: 0.750062,
            
            psi_to_hPa: 68.9476,
            psi_to_mbar: 68.9476,
            psi_to_inHg: 2.03602,
            psi_to_mmHg: 51.7149,
            
            inHg_to_hPa: 33.8639,
            inHg_to_mbar: 33.8639,
            inHg_to_psi: 0.491154,
            inHg_to_mmHg: 25.4,
            
            mmHg_to_hPa: 1.33322,
            mmHg_to_mbar: 1.33322,
            mmHg_to_psi: 0.0193368,
            mmHg_to_inHg: 0.0393701,
            
            // Distance
            km_to_miles: 0.621371,
            km_to_meters: 1000,
            km_to_feet: 3280.84,
            
            miles_to_km: 1.60934,
            miles_to_meters: 1609.34,
            miles_to_feet: 5280,
            
            meters_to_km: 0.001,
            meters_to_miles: 0.000621371,
            meters_to_feet: 3.28084,
            
            feet_to_km: 0.0003048,
            feet_to_miles: 0.000189394,
            feet_to_meters: 0.3048,
            
            // Precipitation
            mm_to_cm: 0.1,
            mm_to_inches: 0.0393701,
            
            cm_to_mm: 10,
            cm_to_inches: 0.393701,
            
            inches_to_mm: 25.4,
            inches_to_cm: 2.54
        };
    }

    // Temperature conversions
    temperature(value, toUnit = null, fromUnit = 'celsius') {
        toUnit = toUnit || this.preferredUnit;
        
        let celsius;
        
        // Convert from source to Celsius first
        switch(fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
            default:
                celsius = value;
        }
        
        // Convert from Celsius to target
        let converted;
        let symbol;
        
        switch(toUnit) {
            case 'celsius':
                converted = celsius;
                symbol = this.units.celsius.symbol;
                break;
            case 'fahrenheit':
                converted = (celsius * 9/5) + 32;
                symbol = this.units.fahrenheit.symbol;
                break;
            case 'kelvin':
                converted = celsius + 273.15;
                symbol = this.units.kelvin.symbol;
                break;
            default:
                converted = celsius;
                symbol = this.units.celsius.symbol;
        }
        
        return {
            value: Math.round(converted * 10) / 10,
            raw: converted,
            unit: toUnit,
            symbol,
            formatted: `${Math.round(converted * 10) / 10}${symbol}`,
            original: value,
            originalUnit: fromUnit
        };
    }

    // Speed conversions
    speed(value, toUnit = null, fromUnit = 'kmh') {
        toUnit = toUnit || this.preferredWindUnit;
        
        let kmh;
        
        // Convert to km/h first
        switch(fromUnit) {
            case 'kmh':
                kmh = value;
                break;
            case 'mph':
                kmh = value * this.conversionFactors.mph_to_kmh;
                break;
            case 'ms':
                kmh = value * this.conversionFactors.ms_to_kmh;
                break;
            case 'knots':
                kmh = value * this.conversionFactors.knots_to_kmh;
                break;
            default:
                kmh = value;
        }
        
        // Convert from km/h to target
        let converted;
        let symbol;
        
        switch(toUnit) {
            case 'kmh':
                converted = kmh;
                symbol = this.units.kmh.symbol;
                break;
            case 'mph':
                converted = kmh * this.conversionFactors.kmh_to_mph;
                symbol = this.units.mph.symbol;
                break;
            case 'ms':
                converted = kmh * this.conversionFactors.kmh_to_ms;
                symbol = this.units.ms.symbol;
                break;
            case 'knots':
                converted = kmh * this.conversionFactors.kmh_to_knots;
                symbol = this.units.knots.symbol;
                break;
            default:
                converted = kmh;
                symbol = this.units.kmh.symbol;
        }
        
        return {
            value: Math.round(converted * 10) / 10,
            raw: converted,
            unit: toUnit,
            symbol,
            formatted: `${Math.round(converted * 10) / 10} ${symbol}`,
            original: value,
            originalUnit: fromUnit
        };
    }

    // Pressure conversions
    pressure(value, toUnit = null, fromUnit = 'hPa') {
        toUnit = toUnit || this.preferredPressureUnit;
        
        let hPa;
        
        // Convert to hPa first
        switch(fromUnit) {
            case 'hPa':
            case 'mbar':
                hPa = value;
                break;
            case 'psi':
                hPa = value * this.conversionFactors.psi_to_hPa;
                break;
            case 'inHg':
                hPa = value * this.conversionFactors.inHg_to_hPa;
                break;
            case 'mmHg':
                hPa = value * this.conversionFactors.mmHg_to_hPa;
                break;
            default:
                hPa = value;
        }
        
        // Convert from hPa to target
        let converted;
        let symbol;
        
        switch(toUnit) {
            case 'hPa':
                converted = hPa;
                symbol = this.units.hPa.symbol;
                break;
            case 'mbar':
                converted = hPa * this.conversionFactors.hPa_to_mbar;
                symbol = this.units.mbar.symbol;
                break;
            case 'psi':
                converted = hPa * this.conversionFactors.hPa_to_psi;
                symbol = this.units.psi.symbol;
                break;
            case 'inHg':
                converted = hPa * this.conversionFactors.hPa_to_inHg;
                symbol = this.units.inHg.symbol;
                break;
            case 'mmHg':
                converted = hPa * this.conversionFactors.hPa_to_mmHg;
                symbol = this.units.mmHg.symbol;
                break;
            default:
                converted = hPa;
                symbol = this.units.hPa.symbol;
        }
        
        return {
            value: Math.round(converted * 10) / 10,
            raw: converted,
            unit: toUnit,
            symbol,
            formatted: `${Math.round(converted * 10) / 10} ${symbol}`,
            original: value,
            originalUnit: fromUnit
        };
    }

    // Precipitation conversions
    precipitation(value, toUnit = null, fromUnit = 'mm') {
        toUnit = toUnit || this.preferredPrecipUnit;
        
        let mm;
        
        // Convert to mm first
        switch(fromUnit) {
            case 'mm':
                mm = value;
                break;
            case 'cm':
                mm = value * this.conversionFactors.cm_to_mm;
                break;
            case 'inches':
                mm = value * this.conversionFactors.inches_to_mm;
                break;
            default:
                mm = value;
        }
        
        // Convert from mm to target
        let converted;
        let symbol;
        
        switch(toUnit) {
            case 'mm':
                converted = mm;
                symbol = this.units.mm.symbol;
                break;
            case 'cm':
                converted = mm * this.conversionFactors.mm_to_cm;
                symbol = this.units.cm.symbol;
                break;
            case 'inches':
                converted = mm * this.conversionFactors.mm_to_inches;
                symbol = this.units.inches.symbol;
                break;
            default:
                converted = mm;
                symbol = this.units.mm.symbol;
        }
        
        return {
            value: Math.round(converted * 100) / 100,
            raw: converted,
            unit: toUnit,
            symbol,
            formatted: `${Math.round(converted * 100) / 100} ${symbol}`,
            original: value,
            originalUnit: fromUnit
        };
    }

    // Distance conversions
    distance(value, toUnit = null, fromUnit = 'km') {
        toUnit = toUnit || this.preferredDistanceUnit;
        
        let km;
        
        // Convert to km first
        switch(fromUnit) {
            case 'km':
                km = value;
                break;
            case 'miles':
                km = value * this.conversionFactors.miles_to_km;
                break;
            case 'meters':
                km = value * this.conversionFactors.meters_to_km;
                break;
            case 'feet':
                km = value * this.conversionFactors.feet_to_km;
                break;
            default:
                km = value;
        }
        
        // Convert from km to target
        let converted;
        let symbol;
        
        switch(toUnit) {
            case 'km':
                converted = km;
                symbol = this.units.km.symbol;
                break;
            case 'miles':
                converted = km * this.conversionFactors.km_to_miles;
                symbol = this.units.miles.symbol;
                break;
            case 'meters':
                converted = km * this.conversionFactors.km_to_meters;
                symbol = this.units.meters.symbol;
                break;
            case 'feet':
                converted = km * this.conversionFactors.km_to_feet;
                symbol = this.units.feet.symbol;
                break;
            default:
                converted = km;
                symbol = this.units.km.symbol;
        }
        
        return {
            value: Math.round(converted * 100) / 100,
            raw: converted,
            unit: toUnit,
            symbol,
            formatted: `${Math.round(converted * 100) / 100} ${symbol}`,
            original: value,
            originalUnit: fromUnit
        };
    }

    // Percentage (simple pass-through with formatting)
    percentage(value) {
        return {
            value: Math.round(value),
            raw: value,
            unit: 'percent',
            symbol: this.units.percent.symbol,
            formatted: `${Math.round(value)}${this.units.percent.symbol}`,
            original: value
        };
    }

    // UV Index (simple pass-through with category)
    uvIndex(value) {
        let category;
        if (value >= 8) category = 'Extreme';
        else if (value >= 6) category = 'High';
        else if (value >= 3) category = 'Moderate';
        else category = 'Low';
        
        return {
            value: Math.round(value),
            raw: value,
            unit: 'uv',
            symbol: this.units.uv.symbol,
            formatted: `${Math.round(value)}`,
            category,
            original: value
        };
    }

    // Air Quality Index
    aqi(value) {
        let category, color, advice;
        
        if (value <= 50) {
            category = 'Good';
            color = 'green';
            advice = 'Great day for outdoor activities';
        } else if (value <= 100) {
            category = 'Moderate';
            color = 'yellow';
            advice = 'Sensitive individuals should limit exertion';
        } else if (value <= 150) {
            category = 'Unhealthy for Sensitive Groups';
            color = 'orange';
            advice = 'Reduce prolonged outdoor activities';
        } else if (value <= 200) {
            category = 'Unhealthy';
            color = 'red';
            advice = 'Avoid outdoor activities';
        } else if (value <= 300) {
            category = 'Very Unhealthy';
            color = 'purple';
            advice = 'Stay indoors';
        } else {
            category = 'Hazardous';
            color = 'maroon';
            advice = 'Emergency conditions - stay inside';
        }
        
        return {
            value: Math.round(value),
            raw: value,
            unit: 'aqi',
            symbol: this.units.aqi.symbol,
            formatted: `${Math.round(value)}`,
            category,
            color,
            advice,
            original: value
        };
    }

    // Wind chill calculation
    calculateWindChill(temperature, windSpeed, unit = 'celsius') {
        const temp = this.temperature(temperature, 'celsius').raw;
        const wind = this.speed(windSpeed, 'kmh').raw;
        
        if (temp > 10 || wind < 4.8) {
            return this.temperature(temp, unit);
        }
        
        // Wind chill formula (metric)
        const windChill = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16);
        
        return this.temperature(windChill, unit);
    }

    // Heat index calculation
    calculateHeatIndex(temperature, humidity, unit = 'celsius') {
        const temp = this.temperature(temperature, 'celsius').raw;
        
        if (temp < 27) {
            return this.temperature(temp, unit);
        }
        
        // Heat index formula (simplified)
        const heatIndex = -8.784695 + 1.61139411 * temp + 2.338549 * humidity - 0.14611605 * temp * humidity 
            - 0.012308094 * temp * temp - 0.016424828 * humidity * humidity 
            + 0.002211732 * temp * temp * humidity + 0.00072546 * temp * humidity * humidity 
            - 0.000003582 * temp * temp * humidity * humidity;
        
        return this.temperature(heatIndex, unit);
    }

    // Dew point calculation
    calculateDewPoint(temperature, humidity, unit = 'celsius') {
        const temp = this.temperature(temperature, 'celsius').raw;
        
        // Magnus formula
        const a = 17.27;
        const b = 237.7;
        
        const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
        const dewPoint = (b * alpha) / (a - alpha);
        
        return this.temperature(dewPoint, unit);
    }

    // Visibility description
    getVisibilityDescription(visibility, unit = 'km') {
        const vis = this.distance(visibility, 'km').raw;
        
        if (vis > 20) return 'Excellent';
        if (vis > 10) return 'Very Good';
        if (vis > 5) return 'Good';
        if (vis > 2) return 'Moderate';
        if (vis > 1) return 'Poor';
        return 'Very Poor';
    }

    // Cloud cover description
    getCloudCoverDescription(cover) {
        if (cover >= 90) return 'Overcast';
        if (cover >= 70) return 'Mostly Cloudy';
        if (cover >= 50) return 'Partly Cloudy';
        if (cover >= 20) return 'Mostly Clear';
        return 'Clear';
    }

    // Beaufort scale for wind
    getBeaufortScale(windSpeed, unit = 'kmh') {
        const speed = this.speed(windSpeed, 'kmh').raw;
        
        if (speed < 1) return { force: 0, description: 'Calm' };
        if (speed < 6) return { force: 1, description: 'Light air' };
        if (speed < 12) return { force: 2, description: 'Light breeze' };
        if (speed < 20) return { force: 3, description: 'Gentle breeze' };
        if (speed < 29) return { force: 4, description: 'Moderate breeze' };
        if (speed < 39) return { force: 5, description: 'Fresh breeze' };
        if (speed < 50) return { force: 6, description: 'Strong breeze' };
        if (speed < 62) return { force: 7, description: 'Near gale' };
        if (speed < 75) return { force: 8, description: 'Gale' };
        if (speed < 89) return { force: 9, description: 'Strong gale' };
        if (speed < 103) return { force: 10, description: 'Storm' };
        if (speed < 117) return { force: 11, description: 'Violent storm' };
        return { force: 12, description: 'Hurricane' };
    }

    // Format with preferred units
    formatTemperature(value, unit = null) {
        const result = this.temperature(value, unit);
        return result.formatted;
    }

    formatSpeed(value, unit = null) {
        const result = this.speed(value, unit);
        return result.formatted;
    }

    formatPressure(value, unit = null) {
        const result = this.pressure(value, unit);
        return result.formatted;
    }

    formatPrecipitation(value, unit = null) {
        const result = this.precipitation(value, unit);
        return result.formatted;
    }

    formatDistance(value, unit = null) {
        const result = this.distance(value, unit);
        return result.formatted;
    }

    // Get all available units
    getAvailableUnits(type) {
        switch(type) {
            case 'temperature':
                return ['celsius', 'fahrenheit', 'kelvin'];
            case 'speed':
                return ['kmh', 'mph', 'ms', 'knots'];
            case 'pressure':
                return ['hPa', 'mbar', 'psi', 'inHg', 'mmHg'];
            case 'precipitation':
                return ['mm', 'cm', 'inches'];
            case 'distance':
                return ['km', 'miles', 'meters', 'feet'];
            default:
                return [];
        }
    }

    // Set preferred units
    setPreferredUnits(units) {
        if (units.temperature) this.preferredUnit = units.temperature;
        if (units.wind) this.preferredWindUnit = units.wind;
        if (units.pressure) this.preferredPressureUnit = units.pressure;
        if (units.precipitation) this.preferredPrecipUnit = units.precipitation;
        if (units.distance) this.preferredDistanceUnit = units.distance;
    }

    // Get unit info
    getUnitInfo(unit) {
        return this.units[unit] || null;
    }
}