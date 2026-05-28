import { formatFullDate, formatTime } from "@/lib/utils";
import type { WeatherData } from "@/types/weather";

export function Footer({ data, lastUpdated }: { data: WeatherData; lastUpdated: Date | null }) {
  const sourceLabel = data.metadata.source === "openweather" ? "OpenWeather" : data.metadata.source === "tomorrowio" ? "Tomorrow.io" : "Sample";
  const updated = lastUpdated ? `${formatTime(lastUpdated)} | ${formatFullDate(lastUpdated)}` : "Just now";

  return (
    <footer className="mt-3 flex flex-wrap justify-center gap-3 border-t border-white/10 pb-2 pt-4 text-center text-xs text-slate-500">
      <span className="font-medium text-slate-400">WeatherlyWave</span>
      <span>updated: {updated}</span>
      <span>source: {sourceLabel}</span>
    </footer>
  );
}
