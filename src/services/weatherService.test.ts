// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { weatherService } from "@/services/weatherService";

describe("weatherService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    weatherService.clearCache();
  });

  it("returns default weather when API keys are not configured", async () => {
    weatherService.clearCache();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const data = await weatherService.getWeather("Chennai, Tamil Nadu");

    expect(data.metadata.source).toBe("default");
    expect(data.current.temperature).toBeGreaterThan(0);
    expect(data.forecast).toHaveLength(7);
    expect(data.hourly).toHaveLength(24);
  });
});
