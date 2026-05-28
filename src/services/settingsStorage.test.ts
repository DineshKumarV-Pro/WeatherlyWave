// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { defaultSettings, settingsStorage } from "@/services/settingsStorage";

describe("settingsStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when no settings are stored", () => {
    expect(settingsStorage.get().location.defaultLocation).toBe("Chennai, Tamil Nadu");
  });

  it("persists and merges stored settings", () => {
    settingsStorage.set({
      ...defaultSettings,
      general: { ...defaultSettings.general, temperatureUnit: "fahrenheit" }
    });

    expect(settingsStorage.get().general.temperatureUnit).toBe("fahrenheit");
    expect(settingsStorage.get().notifications.alerts.extreme).toBe(true);
  });
});
