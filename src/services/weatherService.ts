import { average, clamp, degreesToDirection, formatTime, toDateInput } from "@/lib/utils";
import type {
  CurrentWeather,
  ForecastDay,
  HourlyPoint,
  SolarData,
  WeatherData,
  WeatherKpis,
  WeatherSource
} from "@/types/weather";

type CacheEntry = {
  data: WeatherData;
  timestamp: number;
};

type GeoResult = {
  lat: number;
  lon: number;
  name: string;
  country?: string;
  state?: string;
};

type OpenWeatherPayload = {
  current: OpenWeatherCurrent;
  forecast: { list: OpenWeatherForecastItem[] };
  airPollution?: { list?: Array<{ main?: { aqi?: number } }> };
  locationName: string;
  coords: GeoResult;
};

type OpenWeatherCurrent = {
  dt?: number;
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: Array<{ id?: number; icon?: string; description?: string }>;
  wind?: { speed?: number; deg?: number; gust?: number };
  visibility?: number;
  clouds?: { all?: number };
  sys?: { sunrise?: number; sunset?: number };
};

type OpenWeatherForecastItem = {
  dt: number;
  dt_txt?: string;
  main?: {
    temp?: number;
    temp_min?: number;
    temp_max?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: Array<{ id?: number; icon?: string; description?: string }>;
  wind?: { speed?: number; deg?: number; gust?: number };
  clouds?: { all?: number };
  pop?: number;
  rain?: { "3h"?: number };
  snow?: { "3h"?: number };
};

type TomorrowPayload = {
  data?: {
    timelines?: {
      current?: Array<{ time?: string; values?: TomorrowValues }>;
      hourly?: Array<{ time?: string; values?: TomorrowValues }>;
      daily?: Array<{ time?: string; values?: TomorrowValues }>;
    };
  };
};

type TomorrowValues = {
  temperature?: number;
  temperatureApparent?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  windGust?: number;
  pressureSeaLevel?: number;
  uvIndex?: number;
  visibility?: number;
  cloudCover?: number;
  weatherCode?: number;
  precipitationProbability?: number;
  precipitationIntensity?: number;
  dewPoint?: number;
  sunriseTime?: string;
  sunsetTime?: string;
  moonPhase?: number;
};

const CACHE_TIMEOUT = 30 * 60 * 1000;
const weatherCache = new Map<string, CacheEntry>();

const env = import.meta.env;

export const weatherService = {
  async getWeather(location: string): Promise<WeatherData> {
    const cacheKey = location.trim().toLowerCase();
    const start = Date.now();
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TIMEOUT) {
      return cached.data;
    }

    const errors: Error[] = [];
    const providers: Array<WeatherSource> = ["openweather", "tomorrowio"];

    for (const provider of providers) {
      try {
        const raw = provider === "openweather" ? await fetchOpenWeather(location) : await fetchTomorrowio(location);
        const data = normalizeWeather(raw, provider, location, start);
        weatherCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    }

    const fallback = getDefaultWeatherData(location, start);
    weatherCache.set(cacheKey, { data: fallback, timestamp: Date.now() });
    return fallback;
  },

  clearCache() {
    weatherCache.clear();
  }
};

async function fetchOpenWeather(location: string): Promise<OpenWeatherPayload> {
  const apiKey = env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error("OpenWeather API key is missing");

  const coords = await geocodeOpenWeather(location, apiKey);
  const params = `lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${apiKey}`;
  const [current, forecast, airPollution] = await Promise.all([
    fetchJson<OpenWeatherCurrent>(`https://api.openweathermap.org/data/2.5/weather?${params}`),
    fetchJson<{ list: OpenWeatherForecastItem[] }>(`https://api.openweathermap.org/data/2.5/forecast?${params}`),
    fetchJson<{ list?: Array<{ main?: { aqi?: number } }> }>(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}`
    ).catch(() => undefined)
  ]);

  return {
    current,
    forecast,
    airPollution,
    locationName: [coords.name, coords.state, coords.country].filter(Boolean).join(", "),
    coords
  };
}

async function geocodeOpenWeather(location: string, apiKey: string): Promise<GeoResult> {
  const coordinateMatch = parseCoordinates(location);
  if (coordinateMatch) {
    const reverse = await fetchJson<Array<{ name?: string; country?: string; state?: string }>>(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${coordinateMatch.lat}&lon=${coordinateMatch.lon}&limit=1&appid=${apiKey}`
    ).catch(() => []);
    const first = reverse[0];
    return {
      ...coordinateMatch,
      name: first?.name || `${coordinateMatch.lat.toFixed(4)}, ${coordinateMatch.lon.toFixed(4)}`,
      country: first?.country,
      state: first?.state
    };
  }

  const results = await fetchJson<Array<{ lat?: number; lon?: number; name?: string; country?: string; state?: string }>>(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
  );
  const first = results[0];
  if (!first?.lat || !first.lon) throw new Error("Location not found");
  return {
    lat: first.lat,
    lon: first.lon,
    name: first.name || location,
    country: first.country,
    state: first.state
  };
}

async function fetchTomorrowio(location: string): Promise<TomorrowPayload> {
  const apiKey = env.VITE_TOMORROWIO_API_KEY;
  if (!apiKey) throw new Error("Tomorrow.io API key is missing");

  const fields = [
    "temperature",
    "temperatureApparent",
    "humidity",
    "windSpeed",
    "windDirection",
    "windGust",
    "pressureSeaLevel",
    "uvIndex",
    "visibility",
    "cloudCover",
    "weatherCode",
    "precipitationProbability",
    "precipitationIntensity",
    "dewPoint",
    "sunriseTime",
    "sunsetTime",
    "moonPhase"
  ].join(",");
  const coordinates = parseCoordinates(location);
  const locationParam = coordinates ? `${coordinates.lat},${coordinates.lon}` : encodeURIComponent(location.split(",")[0].trim());

  return fetchJson<TomorrowPayload>(
    `https://api.tomorrow.io/v4/timelines?location=${locationParam}&fields=${fields}&timesteps=current,1h,1d&units=metric&apikey=${apiKey}`
  );
}

async function fetchJson<T>(url: string, attempt = 1): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      const message = await response
        .json()
        .then((body: { message?: string }) => body.message)
        .catch(() => undefined);
      throw new Error(message || `HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (attempt < 3) {
      await new Promise((resolve) => window.setTimeout(resolve, attempt * 600));
      return fetchJson<T>(url, attempt + 1);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function normalizeWeather(raw: OpenWeatherPayload | TomorrowPayload, source: WeatherSource, location: string, start: number): WeatherData {
  if (source === "openweather") {
    return normalizeOpenWeather(raw as OpenWeatherPayload, location, start);
  }
  return normalizeTomorrowio(raw as TomorrowPayload, location, start);
}

function normalizeOpenWeather(payload: OpenWeatherPayload, location: string, start: number): WeatherData {
  const current = payload.current;
  const forecastList = payload.forecast.list || [];
  const forecast = normalizeOpenWeatherForecast(forecastList);
  const hourly = normalizeOpenWeatherHourly(forecastList);
  const currentTemp = Math.round(current.main?.temp ?? 27);
  const high = forecast[0]?.temp ?? currentTemp;
  const low = forecast[0]?.tempMin ?? currentTemp - 3;
  const windSpeedKmh = Math.round((current.wind?.speed ?? 3.3) * 3.6);

  const currentWeather: CurrentWeather = {
    temperature: currentTemp,
    feelsLike: Math.round(current.main?.feels_like ?? currentTemp),
    humidity: Math.round(current.main?.humidity ?? 72),
    windSpeed: windSpeedKmh,
    windDirection: degreesToDirection(current.wind?.deg ?? 315),
    pressure: Math.round(current.main?.pressure ?? 1012),
    uvIndex: estimateUvIndex(current.clouds?.all ?? 45),
    visibility: Number(((current.visibility ?? 10000) / 1000).toFixed(1)),
    cloudCover: Math.round(current.clouds?.all ?? 45),
    condition: mapOpenWeatherCondition(current.weather?.[0]?.id ?? 801),
    icon: mapOpenWeatherIcon(current.weather?.[0]?.icon ?? "02d"),
    high,
    low
  };

  const kpis: WeatherKpis = {
    humidity: currentWeather.humidity,
    windSpeed: currentWeather.windSpeed,
    windDirection: currentWeather.windDirection,
    pressure: currentWeather.pressure,
    uvIndex: currentWeather.uvIndex,
    aqi: convertAQI(payload.airPollution?.list?.[0]?.main?.aqi ?? 2),
    visibility: currentWeather.visibility,
    dewPoint: Math.round(currentTemp - (100 - currentWeather.humidity) / 5),
    cloudCover: currentWeather.cloudCover,
    precipitation: calculatePrecipitation(forecastList),
    gusts: Math.round((current.wind?.gust ? current.wind.gust * 3.6 : currentWeather.windSpeed * 1.5) || 18)
  };

  return {
    current: currentWeather,
    forecast,
    hourly,
    solar: getSolarData(current.sys),
    kpis,
    coords: { lat: payload.coords.lat, lon: payload.coords.lon },
    locationName: payload.locationName || location,
    metadata: {
      source: "openweather",
      timestamp: Date.now(),
      location,
      responseTime: Date.now() - start
    }
  };
}

function normalizeOpenWeatherForecast(list: OpenWeatherForecastItem[]): ForecastDay[] {
  const grouped = new Map<string, OpenWeatherForecastItem[]>();

  for (const item of list) {
    const date = toDateInput(item.dt);
    const key = date.toISOString().slice(0, 10);
    grouped.set(key, [...(grouped.get(key) || []), item]);
  }

  const days = Array.from(grouped.entries())
    .slice(0, 7)
    .map(([key, items], index) => {
      const temps = items.map((item) => item.main?.temp ?? 27);
      const minTemps = items.map((item) => item.main?.temp_min ?? item.main?.temp ?? 24);
      const maxTemps = items.map((item) => item.main?.temp_max ?? item.main?.temp ?? 29);
      const representative = items[Math.floor(items.length / 2)] || items[0];
      const date = new Date(`${key}T12:00:00`);
      return {
        day: index === 0 ? "Today" : new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
        date: key,
        temp: Math.round(Math.max(...maxTemps, average(temps))),
        tempMin: Math.round(Math.min(...minTemps, average(minTemps))),
        icon: mapOpenWeatherIcon(representative?.weather?.[0]?.icon ?? "02d"),
        condition: mapOpenWeatherCondition(representative?.weather?.[0]?.id ?? 801),
        precipChance: clamp(Math.round(Math.max(...items.map((item) => (item.pop ?? 0) * 100))), 0, 100),
        humidity: Math.round(average(items.map((item) => item.main?.humidity ?? 65))),
        wind: Math.round(average(items.map((item) => (item.wind?.speed ?? 3) * 3.6))),
        uv: estimateUvIndex(average(items.map((item) => item.clouds?.all ?? 45))),
        sunrise: "6:40 AM",
        sunset: "5:15 PM"
      } satisfies ForecastDay;
    });

  return days.length ? days : getDefaultForecast();
}

function normalizeOpenWeatherHourly(list: OpenWeatherForecastItem[]): HourlyPoint[] {
  const hourly = list.slice(0, 24).map((item, index) => {
    const date = toDateInput(item.dt);
    return {
      time: index === 0 ? "Now" : formatTime(date),
      isoTime: date.toISOString(),
      temp: Math.round(item.main?.temp ?? 27),
      icon: mapOpenWeatherIcon(item.weather?.[0]?.icon ?? "02d"),
      condition: mapOpenWeatherCondition(item.weather?.[0]?.id ?? 801),
      precip: clamp(Math.round((item.pop ?? 0) * 100), 0, 100),
      wind: Math.round((item.wind?.speed ?? 3) * 3.6),
      humidity: Math.round(item.main?.humidity ?? 65),
      cloudCover: Math.round(item.clouds?.all ?? 45)
    } satisfies HourlyPoint;
  });

  return hourly.length ? hourly : getDefaultHourly();
}

function normalizeTomorrowio(payload: TomorrowPayload, location: string, start: number): WeatherData {
  const timelines = payload.data?.timelines;
  const current = timelines?.current?.[0]?.values ?? {};
  const hourly = normalizeTomorrowioHourly(timelines?.hourly ?? []);
  const forecast = normalizeTomorrowioForecast(timelines?.daily ?? []);
  const temp = Math.round(current.temperature ?? 27);
  const windSpeed = Math.round(current.windSpeed ?? 12);
  const condition = mapTomorrowCondition(current.weatherCode);

  const currentWeather: CurrentWeather = {
    temperature: temp,
    feelsLike: Math.round(current.temperatureApparent ?? temp),
    humidity: Math.round(current.humidity ?? 72),
    windSpeed,
    windDirection: degreesToDirection(current.windDirection ?? 315),
    pressure: Math.round(current.pressureSeaLevel ?? 1012),
    uvIndex: Math.round(current.uvIndex ?? 6),
    visibility: Math.round(current.visibility ?? 10),
    cloudCover: Math.round(current.cloudCover ?? 45),
    condition: condition.label,
    icon: condition.icon,
    high: forecast[0]?.temp ?? temp + 2,
    low: forecast[0]?.tempMin ?? temp - 4
  };

  return {
    current: currentWeather,
    forecast,
    hourly,
    solar: {
      sunrise: current.sunriseTime ? formatTime(new Date(current.sunriseTime), true) : "6:40 AM",
      sunset: current.sunsetTime ? formatTime(new Date(current.sunsetTime), true) : "5:15 PM",
      firstLight: "6:15 AM",
      lastLight: "5:40 PM",
      moonrise: "11:22 PM",
      moonset: "12:46 PM",
      moonIllumination: Math.round((current.moonPhase ?? 0.32) * 100),
      moonPhase: "Waxing Crescent"
    },
    kpis: {
      humidity: currentWeather.humidity,
      windSpeed,
      windDirection: currentWeather.windDirection,
      pressure: currentWeather.pressure,
      uvIndex: currentWeather.uvIndex,
      aqi: 42,
      visibility: currentWeather.visibility,
      dewPoint: Math.round(current.dewPoint ?? temp - 7),
      cloudCover: currentWeather.cloudCover,
      precipitation: Number(current.precipitationIntensity?.toFixed(1) ?? 0),
      gusts: Math.round(current.windGust ?? windSpeed * 1.5)
    },
    coords: parseCoordinates(location) || { lat: 13.0827, lon: 80.2707 },
    locationName: location,
    metadata: {
      source: "tomorrowio",
      timestamp: Date.now(),
      location,
      responseTime: Date.now() - start
    }
  };
}

function normalizeTomorrowioForecast(days: Array<{ time?: string; values?: TomorrowValues }>): ForecastDay[] {
  const forecast = days.slice(0, 7).map((day, index) => {
    const values = day.values ?? {};
    const date = day.time ? new Date(day.time) : new Date(Date.now() + index * 86400000);
    const condition = mapTomorrowCondition(values.weatherCode);
    const temp = Math.round(values.temperature ?? 27);
    return {
      day: index === 0 ? "Today" : new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      date: date.toISOString().slice(0, 10),
      temp,
      tempMin: temp - 4,
      icon: condition.icon,
      condition: condition.label,
      precipChance: Math.round(values.precipitationProbability ?? 15),
      humidity: Math.round(values.humidity ?? 65),
      wind: Math.round(values.windSpeed ?? 12),
      uv: Math.round(values.uvIndex ?? 6),
      sunrise: values.sunriseTime ? formatTime(new Date(values.sunriseTime), true) : "6:40 AM",
      sunset: values.sunsetTime ? formatTime(new Date(values.sunsetTime), true) : "5:15 PM"
    } satisfies ForecastDay;
  });
  return forecast.length ? forecast : getDefaultForecast();
}

function normalizeTomorrowioHourly(hours: Array<{ time?: string; values?: TomorrowValues }>): HourlyPoint[] {
  const hourly = hours.slice(0, 24).map((hour, index) => {
    const values = hour.values ?? {};
    const date = hour.time ? new Date(hour.time) : new Date(Date.now() + index * 3600000);
    const condition = mapTomorrowCondition(values.weatherCode);
    return {
      time: index === 0 ? "Now" : formatTime(date),
      isoTime: date.toISOString(),
      temp: Math.round(values.temperature ?? 27),
      icon: condition.icon,
      condition: condition.label,
      precip: Math.round(values.precipitationProbability ?? 15),
      wind: Math.round(values.windSpeed ?? 12),
      humidity: Math.round(values.humidity ?? 65),
      cloudCover: Math.round(values.cloudCover ?? 45)
    } satisfies HourlyPoint;
  });
  return hourly.length ? hourly : getDefaultHourly();
}

function getSolarData(sys?: { sunrise?: number; sunset?: number }): SolarData {
  const sunrise = sys?.sunrise ? formatTime(toDateInput(sys.sunrise), true) : "6:40 AM";
  const sunset = sys?.sunset ? formatTime(toDateInput(sys.sunset), true) : "5:15 PM";
  return {
    sunrise,
    sunset,
    firstLight: "6:15 AM",
    lastLight: "5:40 PM",
    moonrise: "11:22 PM",
    moonset: "12:46 PM",
    moonIllumination: 32,
    moonPhase: "Waxing Crescent"
  };
}

function getDefaultWeatherData(location: string, start = Date.now()): WeatherData {
  const current: CurrentWeather = {
    temperature: 27,
    feelsLike: 29,
    humidity: 72,
    windSpeed: 12,
    windDirection: "NW",
    pressure: 1012,
    uvIndex: 6,
    visibility: 10,
    cloudCover: 45,
    condition: "Partly Cloudy",
    icon: "⛅",
    high: 30,
    low: 24
  };

  return {
    current,
    forecast: getDefaultForecast(),
    hourly: getDefaultHourly(),
    solar: getSolarData(),
    kpis: {
      humidity: current.humidity,
      windSpeed: current.windSpeed,
      windDirection: current.windDirection,
      pressure: current.pressure,
      uvIndex: current.uvIndex,
      aqi: 42,
      visibility: current.visibility,
      dewPoint: 21,
      cloudCover: current.cloudCover,
      precipitation: 1.2,
      gusts: 18
    },
    coords: parseCoordinates(location) || { lat: 13.0827, lon: 80.2707 },
    locationName: location,
    metadata: {
      source: "default",
      timestamp: Date.now(),
      location,
      responseTime: Date.now() - start,
      isFallback: true
    }
  };
}

function getDefaultForecast(): ForecastDay[] {
  const icons = ["⛅", "☀️", "🌧️", "⛅", "☁️", "🌤️", "🌦️"];
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      day: index === 0 ? "Today" : new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      date: date.toISOString().slice(0, 10),
      temp: 30 - (index % 3),
      tempMin: 24 - (index % 2),
      icon: icons[index],
      condition: index === 2 ? "Rainy" : "Partly Cloudy",
      precipChance: [15, 8, 62, 22, 35, 12, 44][index],
      humidity: 65 + index,
      wind: 10 + index,
      uv: 6,
      sunrise: "6:40 AM",
      sunset: "5:15 PM"
    };
  });
}

function getDefaultHourly(): HourlyPoint[] {
  return Array.from({ length: 24 }, (_, index) => {
    const date = new Date(Date.now() + index * 3600000);
    const isNight = date.getHours() < 6 || date.getHours() > 18;
    return {
      time: index === 0 ? "Now" : formatTime(date),
      isoTime: date.toISOString(),
      temp: Math.round(27 + Math.sin(index / 3) * 4),
      icon: isNight ? "🌙" : index % 4 === 0 ? "🌤️" : "⛅",
      condition: isNight ? "Clear Night" : "Partly Cloudy",
      precip: clamp(index % 5 === 0 ? 45 : 12 + index, 0, 100),
      wind: 9 + (index % 8),
      humidity: 62 + (index % 12),
      cloudCover: 35 + (index % 30)
    };
  });
}

function parseCoordinates(location: string) {
  const parts = location.split(",").map((part) => part.trim());
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lon = Number(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

function calculatePrecipitation(items: OpenWeatherForecastItem[]) {
  const amount = items.slice(0, 8).reduce((sum, item) => sum + (item.rain?.["3h"] ?? item.snow?.["3h"] ?? 0), 0);
  return Number(amount.toFixed(1));
}

function estimateUvIndex(cloudCover: number) {
  return clamp(Math.round(9 - cloudCover / 18), 1, 10);
}

function convertAQI(aqi: number) {
  const mapping: Record<number, number> = {
    1: 25,
    2: 50,
    3: 75,
    4: 125,
    5: 175
  };
  return mapping[aqi] ?? 50;
}

function mapOpenWeatherCondition(conditionId: number) {
  if (conditionId >= 200 && conditionId < 300) return "Storm";
  if (conditionId >= 300 && conditionId < 600) return "Rainy";
  if (conditionId >= 600 && conditionId < 700) return "Snowy";
  if (conditionId >= 700 && conditionId < 800) return "Foggy";
  if (conditionId === 800) return "Sunny";
  if (conditionId === 801) return "Partly Cloudy";
  return "Cloudy";
}

function mapOpenWeatherIcon(iconCode: string) {
  const night = iconCode.endsWith("n");
  const code = iconCode.slice(0, 2);
  if (night && code === "01") return "🌙";
  const icons: Record<string, string> = {
    "01": "☀️",
    "02": "🌤️",
    "03": "⛅",
    "04": "☁️",
    "09": "🌧️",
    "10": "🌦️",
    "11": "⛈️",
    "13": "❄️",
    "50": "🌫️"
  };
  return icons[code] || "⛅";
}

function mapTomorrowCondition(code = 1100) {
  if ([1000].includes(code)) return { label: "Sunny", icon: "☀️" };
  if ([1100, 1101].includes(code)) return { label: "Partly Cloudy", icon: "🌤️" };
  if ([1102, 1001].includes(code)) return { label: "Cloudy", icon: "☁️" };
  if (code >= 4000 && code < 5000) return { label: "Rainy", icon: "🌧️" };
  if (code >= 5000 && code < 6000) return { label: "Snowy", icon: "❄️" };
  if (code >= 8000) return { label: "Storm", icon: "⛈️" };
  if (code >= 2000 && code < 3000) return { label: "Foggy", icon: "🌫️" };
  return { label: "Partly Cloudy", icon: "⛅" };
}
