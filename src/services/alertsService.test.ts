import { describe, expect, it } from "vitest";
import { generateWeatherAlerts } from "@/services/alertsService";
import type { WeatherData } from "@/types/weather";

const baseWeather: WeatherData = {
  current: {
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
  },
  forecast: [
    {
      day: "Today",
      date: "2026-05-28",
      temp: 30,
      tempMin: 24,
      icon: "⛅",
      condition: "Partly Cloudy",
      precipChance: 15,
      humidity: 72,
      wind: 12,
      uv: 6
    }
  ],
  hourly: [],
  solar: {
    sunrise: "6:40 AM",
    sunset: "5:15 PM",
    moonIllumination: 32,
    moonPhase: "Waxing Crescent"
  },
  kpis: {
    humidity: 72,
    windSpeed: 12,
    windDirection: "NW",
    pressure: 1012,
    uvIndex: 6,
    aqi: 42,
    visibility: 10,
    dewPoint: 21,
    cloudCover: 45,
    precipitation: 1.2,
    gusts: 18
  },
  coords: { lat: 13.0827, lon: 80.2707 },
  locationName: "Chennai",
  metadata: {
    source: "default",
    timestamp: Date.now(),
    location: "Chennai"
  }
};

describe("alertsService", () => {
  it("creates heat and UV alerts from risky weather", () => {
    const alerts = generateWeatherAlerts({
      ...baseWeather,
      current: { ...baseWeather.current, temperature: 39 },
      kpis: { ...baseWeather.kpis, uvIndex: 9 }
    });

    expect(alerts.map((alert) => alert.id)).toEqual(expect.arrayContaining(["heat", "uv"]));
  });

  it("does not create alerts for normal fallback conditions", () => {
    expect(generateWeatherAlerts(baseWeather)).toHaveLength(0);
  });
});
