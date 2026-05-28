import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { temperature } from "@/services/unitConverter";
import type { HourlyPoint, TemperatureUnit } from "@/types/weather";

type HourlyView = "temp" | "precip" | "wind" | "humidity";

export function HourlyForecast({ hourly, unit }: { hourly: HourlyPoint[]; unit: TemperatureUnit }) {
  const [view, setView] = useState<HourlyView>("temp");
  const scrollRef = useRef<HTMLDivElement>(null);
  const next24 = hourly.slice(0, 24);
  const chartData = next24.map((hour, index) => ({
    name: index === 0 ? "Now" : hour.time,
    temp: temperature(hour.temp, unit).value,
    precip: hour.precip,
    wind: hour.wind,
    humidity: hour.humidity
  }));
  const chartMeta = metaFor(view, unit);
  const tempValues = next24.map((hour) => temperature(hour.temp, unit).value);
  const maxTemp = tempValues.length ? Math.max(...tempValues) : 0;
  const minTemp = tempValues.length ? Math.min(...tempValues) : 0;
  const avgWind = next24.length ? Math.round(next24.reduce((sum, hour) => sum + hour.wind, 0) / next24.length) : 0;
  const modeSummary = summaryFor(view, next24, unit);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section className="section-card p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <SectionHeader eyebrow="Analysis" title="24-Hour Timeline" meta="Switch modes to compare temperature, rain, wind, and humidity." className="mb-0" />
        <Tabs<HourlyView>
          value={view}
          onChange={setView}
          className="w-full flex-wrap sm:w-auto"
          options={[
            { value: "temp", label: "Temp" },
            { value: "precip", label: "Rain" },
            { value: "wind", label: "Wind" },
            { value: "humidity", label: "Humidity" }
          ]}
        />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {modeSummary.map((item) => (
          <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {next24.map((hour, index) => {
            const temp = temperature(hour.temp, unit);
            return (
              <div
                key={`${hour.isoTime}-${index}`}
                className={`min-w-[78px] rounded-xl border p-3 text-center transition sm:min-w-[92px] ${
                  index === 0
                    ? "border-sky-400/30 bg-sky-500/[0.15] shadow-lg shadow-sky-950/20"
                    : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"
                }`}
              >
                <p className={index === 0 ? "mb-2 text-xs font-medium text-sky-300" : "mb-2 text-xs text-slate-400"}>
                  {index === 0 ? "NOW" : hour.time}
                </p>
                <p className="text-xl font-bold text-white">
                  {temp.value}
                  {"\u00b0"}
                </p>
                <span className="my-2 block text-3xl">{hour.icon}</span>
                <p className="text-xs text-slate-400">{hourDetail(hour, view)}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full ${barColor(view)}`} style={{ width: `${barValue(hour, view)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <Button
          variant="secondary"
          size="icon-sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/80 shadow-lg"
          onClick={() => scrollBy(-320)}
          aria-label="Scroll hourly forecast left"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/80 shadow-lg"
          onClick={() => scrollBy(320)}
          aria-label="Scroll hourly forecast right"
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="mt-2 h-64 border-t border-white/10 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartMeta.color} stopOpacity={0.45} />
                <stop offset="95%" stopColor={chartMeta.color} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <RechartsTooltip
              contentStyle={{
                background: "linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.96))",
                border: "1px solid rgba(125,211,252,0.24)",
                borderRadius: 14,
                color: "#fff",
                boxShadow: "0 18px 46px rgba(0,0,0,0.35)",
                padding: "10px 12px"
              }}
              labelStyle={{ color: "#bae6fd" }}
              itemStyle={{ color: chartMeta.color, fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey={view}
              name={chartMeta.label}
              stroke={chartMeta.color}
              fill="url(#hourlyGradient)"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-left sm:grid-cols-4">
        <Summary label="Max Temp" value={`${maxTemp}\u00b0`} />
        <Summary label="Min Temp" value={`${minTemp}\u00b0`} />
        <Summary label="Total Rain" value={`${next24.reduce((sum, hour) => sum + hour.precip, 0)}%`} />
        <Summary label="Avg Wind" value={`${avgWind} km/h`} />
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <span className="text-xs text-slate-400">{label}</span>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function hourDetail(hour: HourlyPoint, view: HourlyView) {
  if (view === "precip") return `${hour.precip}% rain`;
  if (view === "wind") return `${hour.wind} km/h`;
  if (view === "humidity") return `${hour.humidity}% humidity`;
  return `${hour.precip}% rain`;
}

function barValue(hour: HourlyPoint, view: HourlyView) {
  if (view === "precip") return hour.precip;
  if (view === "wind") return Math.min(hour.wind * 3, 100);
  if (view === "humidity") return hour.humidity;
  return Math.min(Math.max((hour.temp / 45) * 100, 0), 100);
}

function barColor(view: HourlyView) {
  if (view === "precip") return "bg-emerald-500";
  if (view === "wind") return "bg-cyan-500";
  if (view === "humidity") return "bg-violet-500";
  return "bg-orange-500";
}

function metaFor(view: HourlyView, unit: TemperatureUnit) {
  if (view === "precip") return { color: "#10b981", label: "Rain chance (%)" };
  if (view === "wind") return { color: "#06b6d4", label: "Wind speed (km/h)" };
  if (view === "humidity") return { color: "#8b5cf6", label: "Humidity (%)" };
  return { color: "#f97316", label: `Temperature (\u00b0${unit === "celsius" ? "C" : "F"})` };
}

function summaryFor(view: HourlyView, hours: HourlyPoint[], unit: TemperatureUnit) {
  if (!hours.length) {
    return [
      { label: "Now", value: "--" },
      { label: "Peak", value: "--" },
      { label: "Average", value: "--" }
    ];
  }

  if (view === "precip") {
    const peak = Math.max(...hours.map((hour) => hour.precip));
    const next = hours.find((hour) => hour.precip >= 50);
    return [
      { label: "Next", value: next ? next.time : "Low" },
      { label: "Peak", value: `${peak}%` },
      { label: "Total", value: `${hours.reduce((sum, hour) => sum + hour.precip, 0)}%` }
    ];
  }

  if (view === "wind") {
    const peak = Math.max(...hours.map((hour) => hour.wind));
    const average = Math.round(hours.reduce((sum, hour) => sum + hour.wind, 0) / hours.length);
    return [
      { label: "Now", value: `${hours[0].wind} km/h` },
      { label: "Peak", value: `${peak} km/h` },
      { label: "Average", value: `${average} km/h` }
    ];
  }

  if (view === "humidity") {
    const peak = Math.max(...hours.map((hour) => hour.humidity));
    const average = Math.round(hours.reduce((sum, hour) => sum + hour.humidity, 0) / hours.length);
    return [
      { label: "Now", value: `${hours[0].humidity}%` },
      { label: "Peak", value: `${peak}%` },
      { label: "Average", value: `${average}%` }
    ];
  }

  const temps = hours.map((hour) => temperature(hour.temp, unit).value);
  return [
    { label: "Now", value: `${temps[0]}\u00b0` },
    { label: "High", value: `${Math.max(...temps)}\u00b0` },
    { label: "Low", value: `${Math.min(...temps)}\u00b0` }
  ];
}
