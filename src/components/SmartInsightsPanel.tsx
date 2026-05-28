import {
  CalendarClock,
  Droplets,
  Leaf,
  ShieldAlert,
  Sparkles,
  SunMedium,
  ThermometerSun,
  Umbrella,
  Wind,
  type LucideIcon
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Progress } from "@/components/ui/progress";
import { clamp } from "@/lib/utils";
import { temperature, windSpeed } from "@/services/unitConverter";
import type { HourlyPoint, TemperatureUnit, WeatherData, WindUnit } from "@/types/weather";

type Insight = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone: "sky" | "emerald" | "amber" | "rose" | "violet";
  progress?: number;
};

export function SmartInsightsPanel({
  data,
  unit,
  windUnit
}: {
  data: WeatherData;
  unit: TemperatureUnit;
  windUnit: WindUnit;
}) {
  const score = comfortScore(data);
  const temp = temperature(data.current.temperature, unit);
  const bestWindow = getBestWindow(data.hourly);
  const nextRain = getNextRain(data.hourly);
  const pack = packingAdvice(data);
  const risk = riskSignal(data);
  const watch = watchOutSignal(data, nextRain, windUnit);
  const insights: Insight[] = [
    {
      icon: CalendarClock,
      label: "Go Outside",
      value: bestWindow.label,
      detail: bestWindow.detail,
      tone: "emerald",
      progress: bestWindow.score
    },
    {
      icon: pack.icon,
      label: "Carry",
      value: pack.value,
      detail: pack.detail,
      tone: pack.tone
    },
    {
      icon: watch.icon,
      label: "Watch Out",
      value: watch.value,
      detail: watch.detail,
      tone: watch.tone,
      progress: watch.progress
    }
  ];

  return (
    <section className="section-card p-4 sm:p-5">
      <SectionHeader
        eyebrow="New"
        title="Smart Weather Insights"
        meta="Actionable planning signals generated from the current forecast."
        action={
          <span className={`rounded-full border px-3 py-1.5 text-xs ${risk.className}`}>
            {risk.label}
          </span>
        }
      />

      <div className="grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400">Comfort Score</p>
              <p className="mt-1 text-3xl font-semibold text-white sm:text-4xl">{score}</p>
            </div>
            <div
              className="grid size-16 place-items-center rounded-full sm:size-20"
              style={{ background: `conic-gradient(#34d399 ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)` }}
            >
              <div className="grid size-11 place-items-center rounded-full bg-slate-950/90 text-xs font-semibold text-white sm:size-14 sm:text-sm">
                {score}%
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-300">{scoreSummary(score, data.current.condition)}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <MiniSignal icon={ThermometerSun} label="Temp" value={`${temp.value}\u00b0${temp.unit}`} />
            <MiniSignal icon={Droplets} label="Humidity" value={`${data.kpis.humidity}%`} />
            <MiniSignal icon={Leaf} label="AQI" value={`${data.kpis.aqi}`} />
            <MiniSignal icon={ShieldAlert} label="Risk" value={risk.short} />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {insights.map((insight) => (
            <InsightTile key={insight.label} insight={insight} />
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightTile({ insight }: { insight: Insight }) {
  const Icon = insight.icon;
  return (
    <div className={`rounded-2xl border p-3 ${toneClass(insight.tone)}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">{insight.label}</p>
          <p className="mt-1 truncate text-base font-semibold text-white">{insight.value}</p>
        </div>
        <span className="rounded-xl bg-white/[0.08] p-2">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="line-clamp-2 min-h-8 text-xs leading-4 text-slate-400">{insight.detail}</p>
      {typeof insight.progress === "number" && (
        <Progress value={insight.progress} className="mt-3 h-1.5 bg-white/10" indicatorClassName="bg-gradient-to-r from-sky-300 to-emerald-300" />
      )}
    </div>
  );
}

function MiniSignal({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/[0.35] p-3">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Icon className="size-4 text-sky-200" /> {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function comfortScore(data: WeatherData) {
  const { current, kpis } = data;
  const tempPenalty = Math.abs(current.feelsLike - 24) * 2.2;
  const humidityPenalty = Math.max(0, kpis.humidity - 65) * 0.45 + Math.max(0, 35 - kpis.humidity) * 0.35;
  const rainPenalty = Math.min(30, kpis.precipitation * 4 + (data.forecast[0]?.precipChance ?? 0) * 0.16);
  const windPenalty = Math.max(0, kpis.gusts - 24) * 0.6;
  const airPenalty = Math.max(0, kpis.aqi - 50) * 0.14;
  const uvPenalty = Math.max(0, kpis.uvIndex - 6) * 2.2;
  return Math.round(clamp(100 - tempPenalty - humidityPenalty - rainPenalty - windPenalty - airPenalty - uvPenalty, 18, 98));
}

function getBestWindow(hourly: HourlyPoint[]) {
  const candidates = hourly.slice(0, 12);
  if (!candidates.length) return { label: "Next 2h", detail: "Hourly data is still settling.", score: 60 };

  let bestIndex = 0;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let index = 0; index < candidates.length; index += 1) {
    const hour = candidates[index];
    const score = hour.precip * 1.2 + hour.wind * 0.8 + Math.abs(hour.temp - 25) * 1.6 + hour.humidity * 0.18;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  const start = candidates[bestIndex];
  const end = candidates[Math.min(candidates.length - 1, bestIndex + 2)];
  const quality = Math.round(clamp(100 - bestScore, 20, 96));
  return {
    label: `${start.time} - ${end.time}`,
    detail: `${start.precip}% rain, ${start.wind} km/h wind, ${start.condition.toLowerCase()}.`,
    score: quality
  };
}

function getNextRain(hourly: HourlyPoint[]) {
  return hourly.find((hour) => hour.precip >= 50);
}

function packingAdvice(data: WeatherData): { icon: LucideIcon; value: string; detail: string; tone: Insight["tone"] } {
  const rainRisk = Math.max(data.forecast[0]?.precipChance ?? 0, ...data.hourly.slice(0, 8).map((hour) => hour.precip));
  if (rainRisk >= 50 || data.kpis.precipitation > 2) {
    return { icon: Umbrella, value: "Umbrella", detail: `${rainRisk}% rain risk in the near forecast.`, tone: "sky" };
  }
  if (data.kpis.uvIndex >= 7) {
    return { icon: SunMedium, value: "Sunscreen", detail: `UV ${data.kpis.uvIndex} needs daytime protection.`, tone: "amber" };
  }
  if (data.kpis.gusts > 35) {
    return { icon: Wind, value: "Secure Gear", detail: "Gusts may bother loose items outdoors.", tone: "rose" };
  }
  return { icon: Sparkles, value: "Light Kit", detail: "No special carry item is urgent right now.", tone: "emerald" };
}

function watchOutSignal(
  data: WeatherData,
  nextRain: HourlyPoint | undefined,
  windUnit: WindUnit
): { icon: LucideIcon; value: string; detail: string; tone: Insight["tone"]; progress: number } {
  if (nextRain) {
    return {
      icon: Droplets,
      value: "Rain",
      detail: `${nextRain.precip}% chance around ${nextRain.time}.`,
      tone: "sky",
      progress: nextRain.precip
    };
  }
  if (data.kpis.uvIndex >= 8) {
    return {
      icon: SunMedium,
      value: "UV",
      detail: `UV ${data.kpis.uvIndex}; shade and sunscreen help.`,
      tone: "amber",
      progress: data.kpis.uvIndex * 10
    };
  }
  if (data.kpis.gusts > 35) {
    const gusts = windSpeed(data.kpis.gusts, windUnit);
    return {
      icon: Wind,
      value: "Gusts",
      detail: `Gusts near ${gusts.value} ${gusts.unit}.`,
      tone: "rose",
      progress: clamp(data.kpis.gusts * 1.6, 0, 100)
    };
  }
  return {
    icon: ShieldAlert,
    value: "Low",
    detail: "No major near-term weather threat.",
    tone: "emerald",
    progress: 82
  };
}

function riskSignal(data: WeatherData) {
  const rain = data.forecast[0]?.precipChance ?? 0;
  if (rain >= 75 || data.kpis.gusts > 50 || data.kpis.aqi > 140) {
    return { label: "Elevated Risk", short: "High", className: "border-rose-400/20 bg-rose-500/10 text-rose-100" };
  }
  if (rain >= 45 || data.kpis.uvIndex >= 8 || data.current.visibility < 6) {
    return { label: "Watch Conditions", short: "Med", className: "border-amber-400/20 bg-amber-500/10 text-amber-100" };
  }
  return { label: "Low Risk", short: "Low", className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100" };
}

function scoreSummary(score: number, condition: string) {
  if (score >= 82) return `${condition} conditions are friendly for most outdoor plans.`;
  if (score >= 62) return `${condition} conditions are usable, with a few things to watch.`;
  return `${condition} conditions need a more careful plan today.`;
}

function toneClass(tone: Insight["tone"]) {
  const tones = {
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-100",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-100",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-100",
    violet: "border-violet-400/20 bg-violet-500/10 text-violet-100"
  };
  return tones[tone];
}
