import type { WeatherAlert, WeatherData } from "@/types/weather";

export function generateWeatherAlerts(data: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const now = new Date();

  if (data.current.temperature >= 38) {
    alerts.push(createAlert("heat", "Extreme heat", "High temperature may cause heat stress. Stay hydrated and avoid direct sun.", "severe", "🔥", now, 6));
  }

  if (data.current.windSpeed >= 45 || data.kpis.gusts >= 60) {
    alerts.push(createAlert("wind", "Strong winds", "Secure loose outdoor items and use caution while travelling.", "moderate", "💨", now, 5));
  }

  if (data.kpis.uvIndex >= 8) {
    alerts.push(createAlert("uv", "Very high UV", "Use sunscreen, sunglasses, and shade during peak daylight.", "moderate", "☀️", now, 8));
  }

  if (data.kpis.precipitation >= 8 || data.forecast[0]?.precipChance >= 70) {
    alerts.push(createAlert("rain", "Heavy rain possible", "Expect wet roads and lower visibility in the next few hours.", "minor", "🌧️", now, 4));
  }

  return alerts;
}

function createAlert(
  id: string,
  title: string,
  description: string,
  severity: WeatherAlert["severity"],
  icon: string,
  now: Date,
  hours: number
): WeatherAlert {
  return {
    id,
    title,
    description,
    severity,
    icon,
    timestamp: now.toISOString(),
    expires: new Date(now.getTime() + hours * 3600000).toISOString(),
    actions: ["View details", "Share", "Remind me"]
  };
}
