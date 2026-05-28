import type { AppSettings } from "@/types/weather";

const SETTINGS_KEY = "weatherpro_settings";

export const defaultSettings: AppSettings = {
  general: {
    temperatureUnit: "celsius",
    windUnit: "kmh",
    pressureUnit: "hPa",
    precipitationUnit: "mm",
    timeFormat: "24h",
    dateFormat: "MM/DD/YYYY",
    language: "en"
  },
  display: {
    animations: true,
    reduceMotion: false,
    fontSize: "medium",
    refreshInterval: 300000
  },
  notifications: {
    enabled: true,
    sound: true,
    desktop: false,
    alerts: {
      extreme: true,
      severe: true,
      moderate: true,
      minor: false
    }
  },
  location: {
    defaultLocation: "Chennai, Tamil Nadu",
    useGeolocation: true,
    saveRecent: true,
    recentCount: 10,
    favorites: []
  },
  advanced: {
    cacheTimeout: 300,
    debug: false,
    offlineMode: false
  }
};

function mergeSettings(defaults: AppSettings, custom: Partial<AppSettings>): AppSettings {
  return {
    ...defaults,
    ...custom,
    general: { ...defaults.general, ...custom.general },
    display: { ...defaults.display, ...custom.display },
    notifications: {
      ...defaults.notifications,
      ...custom.notifications,
      alerts: { ...defaults.notifications.alerts, ...custom.notifications?.alerts }
    },
    location: { ...defaults.location, ...custom.location },
    advanced: { ...defaults.advanced, ...custom.advanced }
  };
}

export const settingsStorage = {
  get(): AppSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? mergeSettings(defaultSettings, JSON.parse(saved) as Partial<AppSettings>) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  set(settings: AppSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  reset() {
    localStorage.removeItem(SETTINGS_KEY);
    return defaultSettings;
  }
};
