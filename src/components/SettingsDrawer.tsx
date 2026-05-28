import { RotateCcw, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup } from "@/components/ui/toggle-group";
import type { AppSettings, TemperatureUnit, WindUnit } from "@/types/weather";

export function SettingsDrawer({
  open,
  settings,
  onOpenChange,
  onSave,
  onReset
}: {
  open: boolean;
  settings: AppSettings;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: AppSettings) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function save() {
    onSave(draft);
    onOpenChange(false);
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/[0.65] backdrop-blur-sm"
        aria-label="Close settings"
        onClick={() => onOpenChange(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="fixed bottom-0 left-0 right-0 mx-auto max-h-[85vh] max-w-3xl overflow-hidden rounded-t-2xl border border-white/10 bg-slate-950/95 p-4 text-white shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-white/20" />
        <div className="overflow-y-auto px-1 pb-4">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200/70">Preferences</p>
              <h2 id="settings-title" className="mt-1 text-xl font-semibold">
                Settings
              </h2>
              <p className="mt-1 text-sm text-slate-400">Weather units, motion, and refresh preferences.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SettingBlock title="Temperature">
              <ToggleGroup<TemperatureUnit>
                value={draft.general.temperatureUnit}
                options={[
                  { value: "celsius", label: "\u00b0C" },
                  { value: "fahrenheit", label: "\u00b0F" }
                ]}
                onChange={(temperatureUnit) =>
                  setDraft((current) => ({
                    ...current,
                    general: { ...current.general, temperatureUnit }
                  }))
                }
              />
            </SettingBlock>

            <SettingBlock title="Wind">
              <ToggleGroup<WindUnit>
                value={draft.general.windUnit}
                options={[
                  { value: "kmh", label: "km/h" },
                  { value: "mph", label: "mph" }
                ]}
                onChange={(windUnit) =>
                  setDraft((current) => ({
                    ...current,
                    general: { ...current.general, windUnit }
                  }))
                }
              />
            </SettingBlock>

            <SettingBlock title="Font Size">
              <ToggleGroup<AppSettings["display"]["fontSize"]>
                value={draft.display.fontSize}
                options={[
                  { value: "small", label: "Small" },
                  { value: "medium", label: "Medium" },
                  { value: "large", label: "Large" }
                ]}
                onChange={(fontSize) =>
                  setDraft((current) => ({
                    ...current,
                    display: { ...current.display, fontSize }
                  }))
                }
              />
            </SettingBlock>

            <SettingBlock title="Motion">
              <ToggleGroup<"on" | "reduced">
                value={draft.display.reduceMotion ? "reduced" : "on"}
                options={[
                  { value: "on", label: "On" },
                  { value: "reduced", label: "Reduced" }
                ]}
                onChange={(motion) =>
                  setDraft((current) => ({
                    ...current,
                    display: { ...current.display, reduceMotion: motion === "reduced" }
                  }))
                }
              />
            </SettingBlock>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <label className="text-sm font-medium text-white" htmlFor="refresh-interval">
              Refresh interval
            </label>
            <input
              id="refresh-interval"
              className="mt-3 w-full accent-sky-400"
              type="range"
              min={180000}
              max={1800000}
              step={60000}
              value={draft.display.refreshInterval}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  display: { ...current.display, refreshInterval: Number(event.target.value) }
                }))
              }
            />
            <p className="mt-2 text-xs text-slate-400">{Math.round(draft.display.refreshInterval / 60000)} minutes</p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onReset}>
              <RotateCcw /> Reset
            </Button>
            <Button onClick={save}>
              <Save /> Save Settings
            </Button>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}

function SettingBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <p className="mb-3 text-sm font-medium text-white">{title}</p>
      {children}
    </div>
  );
}
