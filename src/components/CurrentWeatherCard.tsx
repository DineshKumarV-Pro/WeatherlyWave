import { ArrowDown, ArrowUp, CloudSun, Droplets, Gauge, MapPin, ThermometerSun, Wind } from "lucide-react";
import type { ReactNode } from "react";
import { temperature, windSpeed } from "@/services/unitConverter";
import type { CurrentWeather, TemperatureUnit } from "@/types/weather";

export function CurrentWeatherCard({
  data,
  unit,
  locationName,
  onUnitChange
}: {
  data: CurrentWeather;
  unit: TemperatureUnit;
  locationName: string;
  onUnitChange: (unit: TemperatureUnit) => void;
}) {
  const temp = temperature(data.temperature, unit);
  const feelsLike = temperature(data.feelsLike, unit);
  const high = temperature(data.high, unit);
  const low = temperature(data.low, unit);
  const wind = windSpeed(data.windSpeed, "kmh");
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
  const atmosphere = getAtmosphere(data);

  return (
    <section className="hero-surface relative min-h-[340px] overflow-hidden p-4 sm:min-h-[410px] sm:p-6 lg:min-h-[500px] xl:min-h-[520px]">
      <HeroAtmosphere type={atmosphere} />
      <div className="weather-band -right-52 top-8 opacity-30" />
      <div className="weather-band right-0 top-32 opacity-20 [animation-direction:alternate-reverse]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/[0.45] to-transparent" />

      <div className="relative z-10 flex h-full min-h-[308px] flex-col justify-between gap-5 sm:min-h-[362px] sm:gap-7 lg:min-h-[448px]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-200/70">Live now</p>
            <h2 className="mt-1 text-2xl font-semibold text-white sm:mt-2 sm:text-4xl lg:text-5xl">{weekday}</h2>
            <p className="mt-2 hidden max-w-xl text-sm text-slate-300 sm:block sm:text-base">{conditionDetails(data.condition)}</p>
          </div>
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-slate-950/[0.45] px-3 py-2 text-sm text-white shadow-2xl shadow-black/20">
            <MapPin className="size-4 shrink-0 text-sky-300" />
            <span className="truncate">{locationName}</span>
          </span>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <div className="flex items-end gap-4">
              <button
                type="button"
                className="group text-left"
                onClick={() => onUnitChange(unit === "celsius" ? "fahrenheit" : "celsius")}
                aria-label="Toggle temperature unit"
              >
                <span className="inline-flex items-start leading-none">
                  <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-[4.4rem] font-semibold text-transparent drop-shadow-2xl sm:text-[7rem] lg:text-[8rem] xl:text-[8.8rem]">
                    {temp.value}
                  </span>
                  <span className="mt-2 text-3xl font-semibold text-slate-300 sm:mt-4 sm:text-4xl">{"\u00b0"}</span>
                </span>
                <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-400 sm:text-sm">
                  {temp.unit} / tap to switch
                </span>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <WeatherPill icon={<ArrowUp />} label="High" value={`${high.value}\u00b0${high.unit}`} tone="red" />
              <WeatherPill icon={<ArrowDown />} label="Low" value={`${low.value}\u00b0${low.unit}`} tone="blue" />
              <WeatherPill icon={<ThermometerSun />} label="Feels" value={`${feelsLike.value}\u00b0${feelsLike.unit}`} tone="amber" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3 sm:p-4 sm:justify-end lg:w-64 lg:flex-col lg:items-end lg:bg-transparent lg:p-0">
            <span className="text-5xl drop-shadow-2xl transition group-hover:scale-105 sm:text-7xl lg:text-8xl">{data.icon}</span>
            <div className="text-right">
              <p className="text-xl font-semibold text-white sm:text-2xl lg:text-3xl">{data.condition}</p>
              <p className="mt-1 text-sm text-slate-400">Cloud cover {data.cloudCover}%</p>
            </div>
          </div>
        </div>

        <div className="hidden grid-cols-2 gap-2 sm:grid sm:grid-cols-4">
          <HeroMetric icon={<Droplets />} label="Humidity" value={`${data.humidity}%`} detail={comfortLevel(data.humidity)} />
          <HeroMetric icon={<Wind />} label="Wind" value={`${wind.value} ${wind.unit}`} detail={data.windDirection} />
          <HeroMetric icon={<Gauge />} label="Pressure" value={`${data.pressure} hPa`} detail={pressureTone(data.pressure)} />
          <HeroMetric icon={<CloudSun />} label="Visibility" value={`${data.visibility} km`} detail={visibilityText(data.visibility)} />
        </div>
      </div>
    </section>
  );
}

function HeroAtmosphere({ type }: { type: "clear" | "rain" | "storm" | "cloud" | "night" | "heat" }) {
  if (type === "rain") {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-45">
        {Array.from({ length: 18 }, (_, index) => (
          <span
            key={index}
            className="hero-rain-drop"
            style={{ left: `${index * 6 + 2}%`, animationDelay: `${index * -0.22}s`, animationDuration: `${1.2 + (index % 4) * 0.18}s` }}
          />
        ))}
      </div>
    );
  }

  if (type === "storm") {
    return <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(250,204,21,0.16)_31%,transparent_34%)] opacity-60" />;
  }

  if (type === "cloud") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
        <span className="hero-mist top-12" />
        <span className="hero-mist top-44 [animation-delay:-5s]" />
      </div>
    );
  }

  if (type === "night") {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <span className="hero-star left-[18%] top-[18%]" />
        <span className="hero-star left-[72%] top-[16%] [animation-delay:-1s]" />
        <span className="hero-star left-[84%] top-[42%] [animation-delay:-2s]" />
      </div>
    );
  }

  if (type === "heat") {
    return <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(0deg,rgba(251,146,60,0.18),transparent)]" />;
  }

  return <div className="pointer-events-none absolute right-12 top-10 size-32 rounded-full bg-amber-300/15 blur-2xl sm:size-48" />;
}

function getAtmosphere(data: CurrentWeather) {
  const key = `${data.condition} ${data.icon}`.toLowerCase();
  const hour = new Date().getHours();
  if (data.temperature >= 35) return "heat";
  if (key.includes("storm") || key.includes("thunder")) return "storm";
  if (key.includes("rain") || key.includes("drizzle") || key.includes("snow")) return "rain";
  if (key.includes("night") || hour < 6 || hour >= 19) return "night";
  if (key.includes("cloud") || key.includes("fog") || key.includes("mist")) return "cloud";
  return "clear";
}

function WeatherPill({
  icon,
  label,
  value,
  tone
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "red" | "blue" | "amber";
}) {
  const tones = {
    red: "border-rose-400/20 bg-rose-500/10 text-rose-100",
    blue: "border-sky-400/20 bg-sky-500/10 text-sky-100",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-100"
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${tones[tone]}`}>
      <span className="[&_svg]:size-3.5">{icon}</span>
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </span>
  );
}

function HeroMetric({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="metric-surface min-h-[104px] p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-slate-400">
        <span>{label}</span>
        <span className="rounded-lg bg-white/[0.08] p-1.5 text-sky-200 [&_svg]:size-4">{icon}</span>
      </div>
      <p className="text-lg font-semibold text-white sm:text-xl">{value}</p>
      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function conditionDetails(condition: string) {
  const key = condition.toLowerCase();
  if (key.includes("sun")) return "Bright conditions with stronger daytime contrast and higher UV awareness.";
  if (key.includes("rain")) return "Wet intervals may reduce visibility and make travel slower.";
  if (key.includes("storm")) return "Unstable conditions are possible; keep an eye on alerts.";
  if (key.includes("fog")) return "Muted visibility and softer temperature swings are expected.";
  return "Mixed sky cover with comfortable dashboard-ready weather signals.";
}

function comfortLevel(humidity: number) {
  if (humidity > 80) return "muggy";
  if (humidity < 35) return "dry";
  return "comfortable";
}

function pressureTone(pressure: number) {
  if (pressure > 1020) return "stable";
  if (pressure < 1000) return "unsettled";
  return "steady";
}

function visibilityText(visibility: number) {
  return visibility > 8 ? "clear range" : "reduced range";
}
