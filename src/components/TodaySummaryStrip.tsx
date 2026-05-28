import { Droplets, Leaf, Sparkles, SunMedium, ThermometerSun } from "lucide-react";
import type { ReactNode } from "react";
import { temperature } from "@/services/unitConverter";
import type { TemperatureUnit, WeatherData } from "@/types/weather";

export function TodaySummaryStrip({ data, unit }: { data: WeatherData; unit: TemperatureUnit }) {
  const feels = temperature(data.current.feelsLike, unit);
  const nextRain = data.hourly.slice(0, 10).find((hour) => hour.precip >= 50);
  const bestWindow = getBestWindow(data);
  const uvTone = data.kpis.uvIndex >= 8 ? "text-amber-200" : "text-emerald-200";
  const aqiTone = data.kpis.aqi > 100 ? "text-rose-200" : data.kpis.aqi > 60 ? "text-amber-200" : "text-emerald-200";

  return (
    <section className="section-card grid gap-2 p-3 sm:grid-cols-5 sm:p-4">
      <SummaryChip icon={<ThermometerSun />} label="Feels" value={`${feels.value}\u00b0${feels.unit}`} />
      <SummaryChip icon={<Droplets />} label="Rain Next" value={nextRain ? nextRain.time : "Low"} />
      <SummaryChip icon={<Sparkles />} label="Best Out" value={bestWindow} />
      <SummaryChip icon={<SunMedium />} label="UV Risk" value={`${data.kpis.uvIndex}`} valueClassName={uvTone} />
      <SummaryChip icon={<Leaf />} label="Air" value={aqiLabel(data.kpis.aqi)} valueClassName={aqiTone} />
    </section>
  );
}

function SummaryChip({
  icon,
  label,
  value,
  valueClassName = "text-white"
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <span className="rounded-lg bg-white/[0.08] p-2 text-sky-200 [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className={`truncate text-sm font-semibold ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}

function getBestWindow(data: WeatherData) {
  const candidates = data.hourly.slice(0, 10);
  if (!candidates.length) return "Soon";
  const best = candidates.reduce((winner, hour) => {
    const score = hour.precip * 1.4 + hour.wind + Math.abs(hour.temp - 25) * 1.5;
    const winnerScore = winner.precip * 1.4 + winner.wind + Math.abs(winner.temp - 25) * 1.5;
    return score < winnerScore ? hour : winner;
  }, candidates[0]);
  return best.time === "Now" ? "Now" : best.time;
}

function aqiLabel(aqi: number) {
  if (aqi > 100) return "Poor";
  if (aqi > 60) return "Okay";
  return "Good";
}
