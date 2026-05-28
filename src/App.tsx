import { Activity, CloudSun } from "lucide-react";
import { useMemo, useState } from "react";
import { AlertsPanel } from "@/components/AlertsPanel";
import { CurrentWeatherCard } from "@/components/CurrentWeatherCard";
import { Footer } from "@/components/Footer";
import { ForecastCard } from "@/components/ForecastCard";
import { Header } from "@/components/Header";
import { HourlyForecast } from "@/components/HourlyForecast";
import { KpiGrid } from "@/components/KpiGrid";
import { LoaderOverlay } from "@/components/LoaderOverlay";
import { MobileSectionTabs, type MobileSection } from "@/components/MobileSectionTabs";
import { RefreshingOverlay } from "@/components/RefreshingOverlay";
import { SolarLunarCard } from "@/components/SolarLunarCard";
import { SmartInsightsPanel } from "@/components/SmartInsightsPanel";
import { TodaySummaryStrip } from "@/components/TodaySummaryStrip";
import { ToastViewport } from "@/components/ui/toaster";
import { WeatherActionDock } from "@/components/WeatherActionDock";
import { useWeatherApp } from "@/hooks/useWeatherApp";
import type { CurrentWeather } from "@/types/weather";

export default function App() {
  const [mobileSection, setMobileSection] = useState<MobileSection>("forecast");
  const {
    state,
    loadWeather,
    refresh,
    setUnit,
    updateSettings,
    resetSettings,
    useCurrentLocation,
    acknowledgeAlert,
    acknowledgeAllAlerts
  } = useWeatherApp();

  const data = state.weatherData;
  const weatherTheme = useMemo(() => (data ? getWeatherTheme(data.current) : "weather-cloudy"), [data]);

  return (
    <div className={`weather-shell ${weatherTheme}`}>
      <LoaderOverlay active={state.isLoading && !data} location={state.currentLocation} />
      <RefreshingOverlay active={state.isLoading && Boolean(data)} />
      <ToastViewport />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[1720px] flex-col px-3 py-3 sm:px-5 lg:px-6 lg:py-5">
        <Header
          state={state}
          onSearch={loadWeather}
          onRefresh={refresh}
          onUseCurrentLocation={useCurrentLocation}
          onUnitChange={setUnit}
          onSettingsChange={updateSettings}
          onResetSettings={resetSettings}
        />

        {state.error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {state.error}
          </div>
        )}

        {data ? (
          <div className="flex flex-1 flex-col gap-4 lg:gap-5">
            <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] xl:grid-cols-[minmax(0,1.48fr)_minmax(390px,0.52fr)]">
              <CurrentWeatherCard
                data={data.current}
                unit={state.unit}
                locationName={data.locationName}
                onUnitChange={setUnit}
              />

              <aside className="hidden min-w-0 flex-col gap-4 lg:flex">
                <AlertsPanel alerts={state.alerts} onAcknowledge={acknowledgeAlert} onAcknowledgeAll={acknowledgeAllAlerts} />
                <ForecastCard forecast={data.forecast} unit={state.unit} />
              </aside>
            </section>

            <TodaySummaryStrip data={data} unit={state.unit} />

            <section className="lg:hidden">
              <MobileSectionTabs value={mobileSection} onChange={setMobileSection} />
              {mobileSection === "insights" && (
                <div className="space-y-4">
                  <SmartInsightsPanel data={data} unit={state.unit} windUnit={state.settings.general.windUnit} />
                  <WeatherActionDock data={data} unit={state.unit} onSearch={loadWeather} />
                </div>
              )}
              {mobileSection === "forecast" && (
                <div className="space-y-4">
                  <AlertsPanel alerts={state.alerts} onAcknowledge={acknowledgeAlert} onAcknowledgeAll={acknowledgeAllAlerts} />
                  <ForecastCard forecast={data.forecast} unit={state.unit} />
                </div>
              )}
              {mobileSection === "metrics" && (
                <KpiGrid kpis={data.kpis} unit={state.unit} windUnit={state.settings.general.windUnit} />
              )}
              {mobileSection === "hourly" && <HourlyForecast hourly={data.hourly} unit={state.unit} />}
              {mobileSection === "astronomy" && <SolarLunarCard solar={data.solar} />}
            </section>

            <section className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,1.18fr)_minmax(340px,0.82fr)] xl:grid-cols-[minmax(0,1.28fr)_minmax(390px,0.72fr)]">
              <div className="min-w-0 space-y-4">
                <KpiGrid kpis={data.kpis} unit={state.unit} windUnit={state.settings.general.windUnit} />
                <HourlyForecast hourly={data.hourly} unit={state.unit} />
              </div>
              <div className="space-y-4">
                <SmartInsightsPanel data={data} unit={state.unit} windUnit={state.settings.general.windUnit} />
                <WeatherActionDock data={data} unit={state.unit} onSearch={loadWeather} />
                <SolarLunarCard solar={data.solar} />
              </div>
            </section>

            <Footer data={data} lastUpdated={state.lastUpdated} />
          </div>
        ) : (
          <section className="hero-surface flex min-h-[420px] items-center justify-center p-8 text-center">
            <div>
              <CloudSun className="mx-auto mb-4 size-14 text-blue-300" />
              <h2 className="text-xl font-semibold text-white">Preparing WeatherlyWave</h2>
              <p className="mt-2 text-sm text-gray-400">Loading the dashboard and weather intelligence.</p>
              <Activity className="mx-auto mt-6 size-5 animate-spin text-blue-300" />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function getWeatherTheme(current: CurrentWeather) {
  const key = `${current.condition} ${current.icon}`.toLowerCase();
  const hour = new Date().getHours();
  if (current.temperature >= 35) return "weather-heat";
  if (key.includes("storm") || key.includes("thunder")) return "weather-storm";
  if (key.includes("rain") || key.includes("drizzle") || key.includes("snow")) return "weather-rain";
  if (key.includes("night") || hour < 6 || hour >= 19) return "weather-night";
  if (key.includes("cloud") || key.includes("fog") || key.includes("mist")) return "weather-cloudy";
  return "weather-clear";
}
