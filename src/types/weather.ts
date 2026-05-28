export type TemperatureUnit = "celsius" | "fahrenheit";
export type WindUnit = "kmh" | "mph";
export type WeatherSource = "openweather" | "tomorrowio" | "default";
export type AlertSeverity = "extreme" | "severe" | "moderate" | "minor";

export type CurrentWeather = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  uvIndex: number;
  visibility: number;
  cloudCover: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
};

export type ForecastDay = {
  day: string;
  date: string;
  temp: number;
  tempMin: number;
  icon: string;
  condition: string;
  precipChance: number;
  humidity: number;
  wind: number;
  uv: number;
  sunrise?: string;
  sunset?: string;
};

export type HourlyPoint = {
  time: string;
  isoTime: string;
  temp: number;
  icon: string;
  condition: string;
  precip: number;
  wind: number;
  humidity: number;
  cloudCover: number;
};

export type SolarData = {
  sunrise: string;
  sunset: string;
  firstLight?: string;
  lastLight?: string;
  moonrise?: string;
  moonset?: string;
  moonIllumination: number;
  moonPhase: string;
};

export type WeatherKpis = {
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  uvIndex: number;
  aqi: number;
  visibility: number;
  dewPoint: number;
  cloudCover: number;
  precipitation: number;
  gusts: number;
};

export type WeatherData = {
  current: CurrentWeather;
  forecast: ForecastDay[];
  hourly: HourlyPoint[];
  solar: SolarData;
  kpis: WeatherKpis;
  coords: { lat: number; lon: number };
  locationName: string;
  metadata: {
    source: WeatherSource;
    timestamp: number;
    location: string;
    responseTime?: number;
    isFallback?: boolean;
  };
};

export type LocationSuggestion = {
  name: string;
  country?: string;
  state?: string;
  lat: number;
  lon: number;
  displayName: string;
  type: "city" | "popular" | "coordinates" | "history" | "current";
  confidence: number;
};

export type WeatherAlert = {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  icon: string;
  timestamp: string;
  expires: string;
  acknowledged?: boolean;
  actions?: string[];
};

export type AppSettings = {
  general: {
    temperatureUnit: TemperatureUnit;
    windUnit: WindUnit;
    pressureUnit: "hPa";
    precipitationUnit: "mm";
    timeFormat: "12h" | "24h";
    dateFormat: string;
    language: "en";
  };
  display: {
    animations: boolean;
    reduceMotion: boolean;
    fontSize: "small" | "medium" | "large";
    refreshInterval: number;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    alerts: Record<AlertSeverity, boolean>;
  };
  location: {
    defaultLocation: string;
    useGeolocation: boolean;
    saveRecent: boolean;
    recentCount: number;
    favorites: string[];
  };
  advanced: {
    cacheTimeout: number;
    debug: boolean;
    offlineMode: boolean;
  };
};
