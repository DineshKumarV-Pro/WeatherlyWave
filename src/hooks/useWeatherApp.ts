import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { generateWeatherAlerts } from "@/services/alertsService";
import { addSearchHistory } from "@/services/historyStorage";
import { searchService } from "@/services/searchService";
import { defaultSettings, settingsStorage } from "@/services/settingsStorage";
import { weatherService } from "@/services/weatherService";
import type { AppSettings, TemperatureUnit, WeatherAlert, WeatherData } from "@/types/weather";

export type WeatherAppState = {
  currentLocation: string;
  weatherData: WeatherData | null;
  unit: TemperatureUnit;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  alerts: WeatherAlert[];
  settings: AppSettings;
};

export function useWeatherApp() {
  const [state, setState] = useState<WeatherAppState>(() => {
    const settings = typeof window === "undefined" ? defaultSettings : settingsStorage.get();
    return {
      currentLocation: settings.location.defaultLocation,
      weatherData: null,
      unit: settings.general.temperatureUnit,
      isLoading: true,
      error: null,
      lastUpdated: null,
      alerts: [],
      settings
    };
  });
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<Set<string>>(() => new Set());
  const initialLoadStarted = useRef(false);

  const loadWeather = useCallback(async (location: string, silent = false) => {
    const cleanLocation = location.trim();
    if (!cleanLocation) {
      toast.warning("Please enter a location");
      return;
    }

    if (!silent) {
      setState((current) => ({ ...current, isLoading: true, error: null, currentLocation: cleanLocation }));
    } else {
      setState((current) => ({ ...current, isLoading: true, error: null }));
      await delay(350);
    }

    try {
      const data = await weatherService.getWeather(cleanLocation);
      const alerts = generateWeatherAlerts(data).map((alert) => ({
        ...alert,
        acknowledged: acknowledgedAlertIds.has(alert.id)
      }));

      setState((current) => ({
        ...current,
        currentLocation: cleanLocation,
        weatherData: data,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        alerts
      }));

      addSearchHistory({
        name: data.locationName,
        displayName: data.locationName,
        lat: data.coords.lat,
        lon: data.coords.lon
      });

      if (data.metadata.source === "default") {
        toast.warning("Live weather is unavailable, showing sample conditions");
      } else if (!silent) {
        toast.success(`Updated ${data.locationName}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Weather update failed";
      setState((current) => ({ ...current, isLoading: false, error: message }));
      toast.error(message);
    }
  }, [acknowledgedAlertIds]);

  const refresh = useCallback(() => {
    toast.info("Refreshing weather data");
    return loadWeather(state.currentLocation, true);
  }, [loadWeather, state.currentLocation]);

  const setUnit = useCallback((unit: TemperatureUnit) => {
    setState((current) => {
      const nextSettings: AppSettings = {
        ...current.settings,
        general: {
          ...current.settings.general,
          temperatureUnit: unit
        }
      };
      settingsStorage.set(nextSettings);
      return { ...current, unit, settings: nextSettings };
    });
    toast.info(`Switched to \u00b0${unit === "celsius" ? "C" : "F"}`);
  }, []);

  const updateSettings = useCallback((settings: AppSettings) => {
    settingsStorage.set(settings);
    setState((current) => ({
      ...current,
      settings,
      unit: settings.general.temperatureUnit
    }));
  }, []);

  const resetSettings = useCallback(() => {
    const settings = settingsStorage.reset();
    setState((current) => ({
      ...current,
      settings,
      unit: settings.general.temperatureUnit
    }));
    toast.success("Settings reset");
  }, []);

  const useCurrentLocation = useCallback(async () => {
    toast.info("Detecting your location");

    try {
      const position = await getBrowserPosition();
      const { latitude, longitude } = position.coords;
      await loadWeather(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      toast.success("Using your device location");
      return;
    } catch (error) {
      toast.warning(`${getGeolocationMessage(error)} Trying approximate location...`);
    }

    try {
      const approximate = await searchService.getApproximateLocation();
      if (!approximate) {
        toast.error("Could not detect an approximate location. Please search for your city.");
        return;
      }

      await loadWeather(`${approximate.lat.toFixed(4)}, ${approximate.lon.toFixed(4)}`);
      toast.success(`Using approximate location: ${approximate.displayName || approximate.name}`);
    } catch {
      toast.error("Could not detect your location. Please allow location permission or search manually.");
    }
  }, [loadWeather]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAcknowledgedAlertIds((current) => new Set([...current, id]));
    setState((current) => ({
      ...current,
      alerts: current.alerts.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert))
    }));
  }, []);

  const acknowledgeAllAlerts = useCallback(() => {
    setAcknowledgedAlertIds((current) => new Set([...current, ...state.alerts.map((alert) => alert.id)]));
    setState((current) => ({
      ...current,
      alerts: current.alerts.map((alert) => ({ ...alert, acknowledged: true }))
    }));
  }, [state.alerts]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.toggle("reduce-motion", state.settings.display.reduceMotion);
    document.documentElement.style.fontSize =
      state.settings.display.fontSize === "small" ? "14px" : state.settings.display.fontSize === "large" ? "18px" : "16px";
    document.documentElement.style.setProperty("--animation-duration", state.settings.display.reduceMotion ? "0s" : "0.25s");
  }, [state.settings.display.fontSize, state.settings.display.reduceMotion]);

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    void loadWeather(state.currentLocation);
  }, [loadWeather, state.currentLocation]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!state.lastUpdated) return;
      if (Date.now() - state.lastUpdated.getTime() >= state.settings.display.refreshInterval) {
        void loadWeather(state.currentLocation, true);
      }
    }, 60000);
    return () => window.clearInterval(interval);
  }, [loadWeather, state.currentLocation, state.lastUpdated, state.settings.display.refreshInterval]);

  return useMemo(
    () => ({
      state,
      loadWeather,
      refresh,
      setUnit,
      updateSettings,
      resetSettings,
      useCurrentLocation,
      acknowledgeAlert,
      acknowledgeAllAlerts
    }),
    [
      state,
      loadWeather,
      refresh,
      setUnit,
      updateSettings,
      resetSettings,
      useCurrentLocation,
      acknowledgeAlert,
      acknowledgeAllAlerts
    ]
  );
}

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!window.isSecureContext) {
      reject(new Error("Browser location needs HTTPS or localhost."));
      return;
    }

    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5 * 60 * 1000
    });
  });
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getGeolocationMessage(error: unknown) {
  if (isGeolocationError(error)) {
    if (error.code === 1) return "Location permission was blocked.";
    if (error.code === 2) return "Device location is unavailable.";
    if (error.code === 3) return "Location detection timed out.";
  }

  return error instanceof Error ? error.message : "Could not access your exact location.";
}

function isGeolocationError(error: unknown): error is { code: number; message?: string } {
  return typeof error === "object" && error !== null && "code" in error && typeof (error as { code: unknown }).code === "number";
}
