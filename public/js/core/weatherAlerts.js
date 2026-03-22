/**
 * Weather Alerts Manager with Multiple Alert Types and Severity Levels
 */

export class WeatherAlerts {
    constructor(app) {
        this.app = app;
        this.alerts = [];
        this.alertHistory = [];
        this.maxHistory = 50;
        this.severityLevels = {
            'extreme': 4,
            'severe': 3,
            'moderate': 2,
            'minor': 1
        };
        this.alertSounds = {
            'extreme': new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/fw=='),
            'severe': new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/fw=='),
            'moderate': new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/fw==')
        };
    }

    checkAlerts(weatherData) {
        const newAlerts = [];
        const settings = this.app?.settingsManager?.get('notifications') || {};
        
        if (!weatherData || !weatherData.current || !weatherData.kpis) return [];

        // Check temperature extremes
        if (settings.temperatureAlert !== false) {
            if (weatherData.current.temperature > 40) {
                newAlerts.push(this.createAlert(
                    'extreme',
                    'Extreme Heat Warning',
                    `Temperature of ${weatherData.current.temperature}°C - Stay hydrated, avoid sun exposure, and check on vulnerable individuals.`,
                    '🔥',
                    {
                        advice: 'Stay indoors during peak hours (11 AM - 4 PM)',
                        action: 'Drink plenty of water',
                        duration: 'Until temperature drops'
                    }
                ));
            } else if (weatherData.current.temperature > 35) {
                newAlerts.push(this.createAlert(
                    'severe',
                    'Heat Advisory',
                    `Temperature of ${weatherData.current.temperature}°C - Take precautions if spending time outdoors.`,
                    '☀️',
                    {
                        advice: 'Limit strenuous activities',
                        action: 'Use sunscreen SPF 30+',
                        duration: 'Next few hours'
                    }
                ));
            } else if (weatherData.current.temperature < 0) {
                newAlerts.push(this.createAlert(
                    'severe',
                    'Freezing Conditions',
                    `Temperature dropping to ${weatherData.current.temperature}°C - Risk of frostbite and hypothermia.`,
                    '❄️',
                    {
                        advice: 'Dress in warm layers',
                        action: 'Cover exposed skin',
                        duration: 'Overnight'
                    }
                ));
            }
        }

        // Check wind speed
        if (settings.rainAlert !== false) {
            if (weatherData.kpis.windSpeed > 70) {
                newAlerts.push(this.createAlert(
                    'extreme',
                    'Hurricane Force Winds',
                    `Wind speeds of ${weatherData.kpis.windSpeed} km/h - Seek shelter immediately.`,
                    '🌀',
                    {
                        advice: 'Stay away from windows',
                        action: 'Secure loose objects',
                        duration: 'Next 2-3 hours'
                    }
                ));
            } else if (weatherData.kpis.windSpeed > 50) {
                newAlerts.push(this.createAlert(
                    'severe',
                    'Storm Force Winds',
                    `Wind speeds of ${weatherData.kpis.windSpeed} km/h - Be cautious outdoors.`,
                    '💨',
                    {
                        advice: 'Avoid coastal areas',
                        action: 'Secure outdoor items',
                        duration: 'Next few hours'
                    }
                ));
            } else if (weatherData.kpis.windSpeed > 40) {
                newAlerts.push(this.createAlert(
                    'moderate',
                    'Strong Winds',
                    `Wind speeds of ${weatherData.kpis.windSpeed} km/h - Exercise caution.`,
                    '🌬️',
                    {
                        advice: 'Be careful driving high-profile vehicles',
                        action: 'Hold onto hats',
                        duration: 'Throughout the day'
                    }
                ));
            }
        }

        // Check UV index
        if (weatherData.kpis.uvIndex > 8) {
            newAlerts.push(this.createAlert(
                'severe',
                'Extreme UV Index',
                `UV Index ${weatherData.kpis.uvIndex} - Use SPF 50+ sunscreen and avoid sun exposure.`,
                '☀️',
                {
                    advice: 'Wear protective clothing',
                    action: 'Reapply sunscreen every 2 hours',
                    duration: '11 AM - 4 PM'
                }
            ));
        } else if (weatherData.kpis.uvIndex > 6) {
            newAlerts.push(this.createAlert(
                'moderate',
                'High UV Index',
                `UV Index ${weatherData.kpis.uvIndex} - Protect your skin.`,
                '☀️',
                {
                    advice: 'Wear sunscreen and sunglasses',
                    action: 'Seek shade during midday',
                    duration: 'Peak hours'
                }
            ));
        }

        // Check air quality
        if (settings.alerts?.severe !== false) {
            if (weatherData.kpis.aqi > 200) {
                newAlerts.push(this.createAlert(
                    'severe',
                    'Hazardous Air Quality',
                    `AQI ${weatherData.kpis.aqi} - Stay indoors and wear a mask if going outside.`,
                    '😷',
                    {
                        advice: 'Keep windows closed',
                        action: 'Use air purifier',
                        duration: 'Until air quality improves'
                    }
                ));
            } else if (weatherData.kpis.aqi > 150) {
                newAlerts.push(this.createAlert(
                    'moderate',
                    'Unhealthy Air Quality',
                    `AQI ${weatherData.kpis.aqi} - Sensitive groups should limit outdoor activities.`,
                    '🌫️',
                    {
                        advice: 'Reduce prolonged exertion',
                        action: 'Consider wearing a mask',
                        duration: 'Today'
                    }
                ));
            }
        }

        // Check precipitation
        if (settings.rainAlert !== false) {
            if (weatherData.kpis.precipitation > 20) {
                newAlerts.push(this.createAlert(
                    'severe',
                    'Extreme Rainfall',
                    `${weatherData.kpis.precipitation}mm rain expected - Flooding possible.`,
                    '🌧️',
                    {
                        advice: 'Avoid low-lying areas',
                        action: 'Prepare for flooding',
                        duration: 'Next 6 hours'
                    }
                ));
            } else if (weatherData.kpis.precipitation > 10) {
                newAlerts.push(this.createAlert(
                    'moderate',
                    'Heavy Rain',
                    `${weatherData.kpis.precipitation}mm rain expected - Bring umbrella and drive carefully.`,
                    '☔',
                    {
                        advice: 'Allow extra travel time',
                        action: 'Check for road closures',
                        duration: 'Next few hours'
                    }
                ));
            }
        }

        // Check for storms
        const condition = weatherData.current.condition?.toLowerCase() || '';
        if (condition.includes('thunder') || condition.includes('storm')) {
            newAlerts.push(this.createAlert(
                'severe',
                'Thunderstorm Warning',
                'Lightning and heavy rain - Stay indoors and avoid open areas.',
                '⛈️',
                {
                    advice: 'Unplug electronics',
                    action: 'Stay away from windows',
                    duration: 'Until storm passes'
                }
            ));
        }

        // Check for fog
        if (condition.includes('fog') || weatherData.kpis.visibility < 1) {
            newAlerts.push(this.createAlert(
                'moderate',
                'Dense Fog',
                'Low visibility conditions - Drive carefully and use fog lights.',
                '🌫️',
                {
                    advice: 'Reduce speed',
                    action: 'Use low beam headlights',
                    duration: 'Until fog lifts'
                }
            ));
        }

        // Check for snow
        if (condition.includes('snow') || weatherData.kpis.precipitation > 5 && weatherData.current.temperature < 2) {
            newAlerts.push(this.createAlert(
                'moderate',
                'Snow Expected',
                'Snowfall expected - Prepare for slippery conditions.',
                '🌨️',
                {
                    advice: 'Allow extra time',
                    action: 'Clear snow from vehicle',
                    duration: 'Next 12 hours'
                }
            ));
        }

        // Check for rapid pressure drop (storm indicator)
        if (weatherData.kpis.pressure < 990) {
            newAlerts.push(this.createAlert(
                'severe',
                'Rapid Pressure Drop',
                'Significant drop in pressure - Storm conditions possible.',
                '🌀',
                {
                    advice: 'Monitor weather updates',
                    action: 'Secure outdoor items',
                    duration: 'Next 24 hours'
                }
            ));
        }

        // Add new alerts to history
        if (newAlerts.length > 0) {
            this.alerts = [...newAlerts, ...this.alerts];
            this.alertHistory = [...newAlerts, ...this.alertHistory].slice(0, this.maxHistory);
            
            // Trigger notifications
            this.triggerNotifications(newAlerts);
        }

        return this.getActiveAlerts();
    }

    createAlert(severity, title, description, icon, details = {}) {
        return {
            id: Date.now() + Math.random() + Math.random(),
            severity,
            title,
            description,
            icon,
            details,
            timestamp: new Date(),
            acknowledged: false,
            expires: new Date(Date.now() + 3600000) // Expires in 1 hour
        };
    }

    triggerNotifications(alerts) {
        const settings = this.app?.settingsManager?.get('notifications') || {};
        
        alerts.forEach(alert => {
            // Check if this severity level is enabled
            if (!settings.alerts?.[alert.severity] && alert.severity !== 'extreme') {
                return;
            }

            // Play sound if enabled
            if (settings.sound && this.alertSounds[alert.severity]) {
                this.alertSounds[alert.severity].play().catch(() => {});
            }

            // Show desktop notification if enabled
            if (settings.desktop && Notification.permission === 'granted') {
                new Notification(alert.title, {
                    body: alert.description,
                    icon: '/icon.png',
                    tag: alert.id,
                    requireInteraction: alert.severity === 'extreme'
                });
            }

            // Show in-app notification
            this.app?.ui?.loader?.showToast(
                `${alert.icon} ${alert.title}: ${alert.description}`,
                alert.severity === 'extreme' ? 'error' : 
                alert.severity === 'severe' ? 'warning' : 'info',
                alert.severity === 'extreme' ? 10000 : 6000
            );
        });
    }

    getActiveAlerts() {
        const now = new Date();
        return this.alerts.filter(alert => 
            !alert.acknowledged && alert.expires > now
        );
    }

    getAlertsBySeverity(severity) {
        return this.alerts.filter(alert => alert.severity === severity);
    }

    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            this.app?.ui?.loader?.showToast(`Alert acknowledged: ${alert.title}`, 'info');
        }
    }

    acknowledgeAllAlerts() {
        this.alerts.forEach(alert => {
            alert.acknowledged = true;
        });
        this.app?.ui?.loader?.showToast('All alerts acknowledged', 'success');
    }

    clearExpiredAlerts() {
        const now = new Date();
        this.alerts = this.alerts.filter(alert => alert.expires > now);
    }

    clearAcknowledged() {
        this.alerts = this.alerts.filter(alert => !alert.acknowledged);
    }

    getAlertStats() {
        const stats = {
            total: this.alerts.length,
            active: this.getActiveAlerts().length,
            bySeverity: {
                extreme: this.getAlertsBySeverity('extreme').length,
                severe: this.getAlertsBySeverity('severe').length,
                moderate: this.getAlertsBySeverity('moderate').length,
                minor: this.getAlertsBySeverity('minor').length
            },
            mostRecent: this.alerts[0] || null
        };
        return stats;
    }

    getAlertHistory(limit = 10) {
        return this.alertHistory.slice(0, limit);
    }

    simulateAlerts() {
        // For testing purposes
        const testAlerts = [
            this.createAlert('severe', 'Test Severe Alert', 'This is a test alert', '⚠️'),
            this.createAlert('moderate', 'Test Moderate Alert', 'This is another test alert', 'ℹ️')
        ];
        
        this.triggerNotifications(testAlerts);
        return testAlerts;
    }
}