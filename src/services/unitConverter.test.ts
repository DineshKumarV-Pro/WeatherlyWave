import { describe, expect, it } from "vitest";
import { temperature, windSpeed } from "@/services/unitConverter";

describe("unitConverter", () => {
  it("converts Celsius to Fahrenheit", () => {
    expect(temperature(30, "fahrenheit")).toEqual({ value: 86, unit: "F" });
  });

  it("keeps Celsius values rounded", () => {
    expect(temperature(27.4, "celsius")).toEqual({ value: 27, unit: "C" });
  });

  it("converts km/h to mph", () => {
    expect(windSpeed(16, "mph")).toEqual({ value: 10, unit: "mph" });
  });
});
