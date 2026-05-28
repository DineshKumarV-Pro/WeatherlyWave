import { ChevronDown, CloudRain, Droplets, Wind } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { Progress } from "@/components/ui/progress";
import { cn, formatShortDate } from "@/lib/utils";
import { temperature } from "@/services/unitConverter";
import type { ForecastDay, TemperatureUnit } from "@/types/weather";

export function ForecastCard({ forecast, unit }: { forecast: ForecastDay[]; unit: TemperatureUnit }) {
  const [expandedDay, setExpandedDay] = useState(-1);
  const divisor = forecast.length || 1;
  const avgHigh = temperature(Math.round(forecast.reduce((sum, day) => sum + day.temp, 0) / divisor), unit);
  const avgLow = temperature(Math.round(forecast.reduce((sum, day) => sum + day.tempMin, 0) / divisor), unit);
  const totalRain = forecast.reduce((sum, day) => sum + day.precipChance * 0.1, 0).toFixed(1);

  return (
    <section className="section-card p-4 sm:p-5">
      <SectionHeader
        eyebrow="Outlook"
        title="7-Day Forecast"
        meta={`Avg ${avgHigh.value}\u00b0 / ${avgLow.value}\u00b0 ${avgHigh.unit} | ${totalRain}mm rain`}
      />

      <div className="space-y-2">
        {forecast.map((day, index) => {
          const temp = temperature(day.temp, unit);
          const low = temperature(day.tempMin, unit);
          const expanded = expandedDay === index;
          return (
            <button
              key={day.date}
              type="button"
              className={cn(
                "group w-full overflow-hidden rounded-xl border border-transparent text-left transition",
                expanded ? "border-sky-400/20 bg-white/[0.07]" : "hover:border-white/10 hover:bg-white/[0.04]"
              )}
              onClick={() => setExpandedDay(expanded ? -1 : index)}
            >
              <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2.5 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn("text-2xl transition group-hover:scale-110", index === 0 && "drop-shadow-lg")}>{day.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={index === 0 ? "font-semibold text-white" : "font-medium text-slate-200"}>{day.day}</span>
                      <span className="hidden text-xs text-slate-500 sm:inline">{formatShortDate(new Date(day.date))}</span>
                    </div>
                    <p className="truncate text-xs text-slate-400">{day.condition}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-white">
                    {temp.value}
                    {"\u00b0"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {" "}
                    / {low.value}
                    {"\u00b0"}
                  </span>
                </div>

                <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:w-32">
                  <Progress value={day.precipChance} className="h-1.5 flex-1 bg-white/10" indicatorClassName={precipColor(day.precipChance)} />
                  <span className="min-w-9 text-right text-xs text-sky-300">{day.precipChance}%</span>
                  <ChevronDown className={cn("size-4 text-slate-500 transition", expanded && "rotate-180 text-white")} />
                </div>
              </div>

              {expanded && (
                <div className="mx-3 mb-3 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/[0.15] p-3 text-xs text-slate-300 sm:grid-cols-4">
                  <span className="flex items-center gap-2">
                    <CloudRain className="size-4 text-blue-300" /> Rain {day.precipChance}%
                  </span>
                  <span className="flex items-center gap-2">
                    <Droplets className="size-4 text-cyan-200" /> {day.humidity}%
                  </span>
                  <span className="flex items-center gap-2">
                    <Wind className="size-4 text-emerald-200" /> {day.wind} km/h
                  </span>
                  <span>UV {day.uv}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function precipColor(chance: number) {
  if (chance >= 70) return "bg-rose-500";
  if (chance >= 50) return "bg-orange-500";
  if (chance >= 30) return "bg-amber-500";
  if (chance >= 10) return "bg-sky-500";
  return "bg-slate-500";
}
