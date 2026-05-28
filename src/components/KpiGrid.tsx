import {
  Cloud,
  Droplets,
  Eye,
  Gauge,
  Leaf,
  Navigation,
  Sun,
  ThermometerSun,
  Umbrella,
  Wind,
  type LucideIcon
} from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { temperature, windSpeed } from "@/services/unitConverter";
import type { TemperatureUnit, WeatherKpis, WindUnit } from "@/types/weather";

type KpiItem = {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  icon: LucideIcon;
  color: string;
  progress: number;
  detail: string;
};

export function KpiGrid({
  kpis,
  unit,
  windUnit
}: {
  kpis: WeatherKpis;
  unit: TemperatureUnit;
  windUnit: WindUnit;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const dew = temperature(kpis.dewPoint, unit);
  const wind = windSpeed(kpis.windSpeed, windUnit);
  const gusts = windSpeed(kpis.gusts, windUnit);
  const items: KpiItem[] = [
    {
      id: "humidity",
      label: "Humidity",
      value: `${kpis.humidity}%`,
      icon: Droplets,
      color: "text-sky-300",
      progress: kpis.humidity,
      detail: `Dew point ${dew.value}\u00b0${dew.unit} | ${comfortLevel(kpis.humidity)}`
    },
    {
      id: "wind",
      label: "Wind",
      value: `${wind.value}`,
      suffix: wind.unit,
      icon: Wind,
      color: "text-cyan-300",
      progress: Math.min(kpis.windSpeed * 2, 100),
      detail: `Direction ${kpis.windDirection} | gusts ${gusts.value} ${gusts.unit}`
    },
    {
      id: "pressure",
      label: "Pressure",
      value: `${kpis.pressure}`,
      suffix: "hPa",
      icon: Gauge,
      color: "text-violet-300",
      progress: Math.min(100, Math.max(0, (kpis.pressure - 960) / 1.1)),
      detail: pressureText(kpis.pressure)
    },
    {
      id: "uv",
      label: "UV Index",
      value: `${kpis.uvIndex}`,
      icon: Sun,
      color: "text-amber-300",
      progress: kpis.uvIndex * 10,
      detail: uvAdvice(kpis.uvIndex)
    },
    {
      id: "aqi",
      label: "Air Quality",
      value: `${kpis.aqi}`,
      icon: Leaf,
      color: "text-emerald-300",
      progress: Math.min(kpis.aqi / 2, 100),
      detail: aqiLabel(kpis.aqi)
    },
    {
      id: "visibility",
      label: "Visibility",
      value: `${kpis.visibility}`,
      suffix: "km",
      icon: Eye,
      color: "text-sky-200",
      progress: Math.min(kpis.visibility * 10, 100),
      detail: kpis.visibility > 8 ? "Excellent viewing range" : "Reduced visibility"
    },
    {
      id: "dew",
      label: "Dew Point",
      value: `${dew.value}\u00b0`,
      suffix: dew.unit,
      icon: ThermometerSun,
      color: "text-blue-100",
      progress: Math.min(Math.max((kpis.dewPoint / 30) * 100, 0), 100),
      detail: kpis.dewPoint > 20 ? "Humid air mass" : "Comfortable moisture"
    },
    {
      id: "clouds",
      label: "Clouds",
      value: `${kpis.cloudCover}%`,
      icon: Cloud,
      color: "text-slate-300",
      progress: kpis.cloudCover,
      detail: kpis.cloudCover > 70 ? "Mostly overcast" : "Broken cloud cover"
    },
    {
      id: "rain",
      label: "Rain",
      value: `${kpis.precipitation}`,
      suffix: "mm",
      icon: Umbrella,
      color: "text-blue-300",
      progress: Math.min(kpis.precipitation * 16, 100),
      detail: kpis.precipitation > 5 ? "Rain gear recommended" : "Low accumulation"
    },
    {
      id: "gusts",
      label: "Gusts",
      value: `${gusts.value}`,
      suffix: gusts.unit,
      icon: Navigation,
      color: "text-cyan-300",
      progress: Math.min(kpis.gusts * 1.5, 100),
      detail: kpis.gusts > 50 ? "Strong gust potential" : "Moderate gusts"
    }
  ];

  return (
    <section className="section-card p-4 sm:p-5">
      <SectionHeader eyebrow="Dashboard" title="Weather Metrics" meta="Tap a tile for the expanded signal." />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const isExpanded = expanded === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setExpanded(isExpanded ? null : item.id)}
              className={cn(
                "metric-surface group min-h-[142px] p-3 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.08]",
                isExpanded && "border-sky-400/30 bg-white/[0.08]"
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    {item.suffix && <p className="text-[10px] font-medium text-slate-500">{item.suffix}</p>}
                  </div>
                </div>
                <span className={cn("rounded-xl bg-white/[0.07] p-2", item.color)}>
                  <Icon className="size-5" />
                </span>
              </div>
              <Progress value={item.progress} className="h-1.5 bg-white/10" indicatorClassName="bg-gradient-to-r from-sky-400 to-emerald-300" />
              <p className="mt-3 line-clamp-2 text-[11px] leading-4 text-slate-500">{isExpanded ? item.detail : shortDetail(item.detail)}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function shortDetail(detail: string) {
  return detail.split("|")[0].trim();
}

function comfortLevel(humidity: number) {
  if (humidity > 80) return "muggy";
  if (humidity < 35) return "dry";
  return "comfortable";
}

function pressureText(pressure: number) {
  if (pressure > 1020) return "High pressure | stable weather";
  if (pressure < 1000) return "Low pressure | unsettled weather";
  return "Normal pressure | steady conditions";
}

function uvAdvice(uv: number) {
  if (uv >= 8) return "Very high | sunscreen essential";
  if (uv >= 6) return "High | limit midday exposure";
  return "Moderate | normal protection";
}

function aqiLabel(aqi: number) {
  if (aqi <= 50) return "Good | clean air";
  if (aqi <= 100) return "Moderate | acceptable";
  return "Poor | sensitive groups take care";
}
