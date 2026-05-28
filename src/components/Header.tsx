import { CalendarDays, Clock3, LocateFixed, RefreshCw, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchBox } from "@/components/SearchBox";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { formatFullDate, formatTime } from "@/lib/utils";
import type { WeatherAppState } from "@/hooks/useWeatherApp";
import type { AppSettings, TemperatureUnit } from "@/types/weather";

type HeaderProps = {
  state: WeatherAppState;
  onSearch: (location: string) => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
  onUseCurrentLocation: () => void | Promise<void>;
  onUnitChange: (unit: TemperatureUnit) => void;
  onSettingsChange: (settings: AppSettings) => void;
  onResetSettings: () => void;
};

export function Header({
  state,
  onSearch,
  onRefresh,
  onUseCurrentLocation,
  onUnitChange,
  onSettingsChange,
  onResetSettings
}: HeaderProps) {
  const [now, setNow] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const weatherQuality = getWeatherQuality(state.weatherData);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="panel-surface sticky top-3 z-40 mb-4 flex flex-col gap-2 p-2.5 shadow-2xl shadow-black/20 sm:gap-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src="/logo.png"
          alt="WeatherlyWave"
          className="size-10 shrink-0 rounded-xl shadow-2xl shadow-sky-500/20 transition hover:rotate-3 hover:scale-105 sm:size-12"
        />
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate bg-gradient-to-r from-white via-sky-200 to-emerald-200 bg-clip-text text-lg font-bold text-transparent sm:text-2xl">
              Weatherly<span className="text-blue-400">Wave</span>
            </h1>
            {weatherQuality && (
              <span className="hidden shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200 sm:inline-flex">
                {weatherQuality}
              </span>
            )}
          </div>
          <div className="mt-1 hidden flex-wrap items-center gap-2 text-[11px] text-slate-400 sm:flex sm:text-xs">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" /> {formatFullDate(state.lastUpdated || now)}
            </span>
            <span className="size-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1">
              <Clock3 className="size-3.5" /> {formatTime(now, state.settings.general.timeFormat === "12h")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full min-w-0 items-center gap-2 lg:w-auto">
        <SearchBox value={state.currentLocation} onSearch={onSearch} />
        <div className="flex shrink-0 items-center justify-start gap-1 rounded-xl border border-white/10 bg-slate-950/50 p-1 backdrop-blur-sm">
          <Tooltip label="Use my location">
            <Button variant="icon" size="icon" onClick={onUseCurrentLocation} aria-label="Use my location">
              <LocateFixed />
            </Button>
          </Tooltip>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUnitChange(state.unit === "celsius" ? "fahrenheit" : "celsius")}
            aria-label="Toggle temperature unit"
          >
            {"\u00b0"}
            {state.unit === "celsius" ? "C" : "F"}
          </Button>
          <Tooltip label="Settings">
            <Button variant="icon" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
              <Settings />
            </Button>
          </Tooltip>
          <Tooltip label="Refresh data">
            <Button variant="default" size="icon" onClick={onRefresh} aria-label="Refresh weather">
              <RefreshCw className={state.isLoading ? "animate-spin" : ""} />
            </Button>
          </Tooltip>
        </div>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        settings={state.settings}
        onOpenChange={setSettingsOpen}
        onSave={onSettingsChange}
        onReset={onResetSettings}
      />
    </header>
  );
}

function getWeatherQuality(data: WeatherAppState["weatherData"]) {
  if (!data) return "";
  const { temperature, humidity } = data.current;
  if (temperature > 24 && temperature < 31 && humidity < 70) return "Excellent";
  if (temperature > 35 || humidity > 80) return "Fair";
  return "Good";
}
