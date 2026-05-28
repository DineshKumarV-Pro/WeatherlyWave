import { Bell, Check, ChevronDown, Share2, Timer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WeatherAlert } from "@/types/weather";

export function AlertsPanel({
  alerts,
  onAcknowledge,
  onAcknowledgeAll
}: {
  alerts: WeatherAlert[];
  onAcknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
}) {
  const active = alerts.filter((alert) => !alert.acknowledged && new Date(alert.expires) > new Date());
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!active.length) return null;

  return (
    <section className="section-card p-4 sm:p-5">
      <SectionHeader
        eyebrow="Alerts"
        title="Weather Alerts"
        meta={`${active.length} active signal${active.length === 1 ? "" : "s"}`}
        action={
          <Button variant="ghost" size="sm" onClick={onAcknowledgeAll}>
            Acknowledge All
          </Button>
        }
      />

      <div className="space-y-3">
        {active.map((alert) => {
          const open = expanded === alert.id;
          const colors = severityColors(alert.severity);
          return (
            <article key={alert.id} className={cn("relative overflow-hidden rounded-xl border p-3", colors.surface)}>
              <div className={cn("absolute bottom-0 left-0 top-0 w-1", colors.bar)} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="text-2xl">{alert.icon}</span>
                  <div className="min-w-0">
                    <h3 className={cn("font-semibold", colors.text)}>{alert.title}</h3>
                    <p className={cn("mt-1 text-sm text-slate-300", !open && "line-clamp-2")}>{alert.description}</p>
                    <p className="mt-1 text-xs text-slate-500">Expires {timeUntil(alert.expires)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => setExpanded(open ? null : alert.id)} aria-label="Toggle alert details">
                  <ChevronDown className={open ? "rotate-180 transition" : "transition"} />
                </Button>
              </div>

              {open && (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
                  <p className="font-medium text-white">Recommended actions</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-400">
                    {(alert.actions || ["Monitor conditions"]).map((action) => (
                      <li key={action} className="flex items-center gap-2">
                        <Bell className="size-3 text-sky-300" /> {action}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                    <Button variant="outline" size="sm" onClick={() => onAcknowledge(alert.id)}>
                      <Check /> Acknowledge
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => shareAlert(alert)}>
                      <Share2 /> Share
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setReminder(alert)}>
                      <Timer /> Remind Me
                    </Button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function severityColors(severity: WeatherAlert["severity"]) {
  if (severity === "extreme") return { surface: "border-rose-500/30 bg-rose-500/20", text: "text-rose-100", bar: "bg-rose-500" };
  if (severity === "severe") return { surface: "border-orange-500/30 bg-orange-500/20", text: "text-orange-100", bar: "bg-orange-500" };
  if (severity === "moderate") return { surface: "border-amber-500/30 bg-amber-500/[0.18]", text: "text-amber-100", bar: "bg-amber-500" };
  return { surface: "border-sky-500/30 bg-sky-500/[0.18]", text: "text-sky-100", bar: "bg-sky-500" };
}

function timeUntil(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return "soon";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `in ${hours}h ${minutes}m` : `in ${minutes}m`;
}

async function shareAlert(alert: WeatherAlert) {
  const text = `${alert.title}: ${alert.description}`;
  if (navigator.share) {
    await navigator.share({ title: alert.title, text }).catch(() => undefined);
    return;
  }
  await navigator.clipboard?.writeText(text).catch(() => undefined);
  toast.success("Alert copied");
}

function setReminder(alert: WeatherAlert) {
  const reminders = JSON.parse(localStorage.getItem("weatherpro_reminders") || "[]") as unknown[];
  reminders.push({ alertId: alert.id, title: alert.title, createdAt: new Date().toISOString(), minutes: 30 });
  localStorage.setItem("weatherpro_reminders", JSON.stringify(reminders));
  toast.success("Reminder saved");
}
