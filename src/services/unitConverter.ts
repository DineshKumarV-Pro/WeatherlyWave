import type { TemperatureUnit, WindUnit } from "@/types/weather";

export function temperature(value: number, unit: TemperatureUnit) {
  if (unit === "fahrenheit") {
    return { value: Math.round((value * 9) / 5 + 32), unit: "F" as const };
  }
  return { value: Math.round(value), unit: "C" as const };
}

export function windSpeed(value: number, unit: WindUnit) {
  if (unit === "mph") {
    return { value: Math.round(value * 0.621371), unit: "mph" as const };
  }
  return { value: Math.round(value), unit: "km/h" as const };
}

export function pressure(value: number) {
  return `${Math.round(value)} hPa`;
}
