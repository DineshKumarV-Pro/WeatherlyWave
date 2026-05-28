import { Moon, Sparkles, Sunrise, Sunset } from "lucide-react";
import type { ReactNode } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { Progress } from "@/components/ui/progress";
import type { SolarData } from "@/types/weather";

export function SolarLunarCard({ solar }: { solar: SolarData }) {
  const sun = calculateSunProgress(solar.sunrise, solar.sunset);

  return (
    <section className="section-card p-4 sm:p-5">
      <SectionHeader
        eyebrow="Astronomy"
        title="Solar & Lunar"
        meta={sun.isDay ? "Daylight window is active." : "Night cycle is active."}
        action={
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-slate-300">
            {sun.isDay ? "Day" : "Night"}
          </span>
        }
      />

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-3 flex justify-between text-xs">
          <span className="text-slate-400">Sun Position</span>
          <span className="font-medium text-amber-300">{sun.percent}%</span>
        </div>
        <Progress
          value={sun.percent}
          className="h-2 bg-white/10"
          indicatorClassName="bg-gradient-to-r from-yellow-400 via-orange-400 to-rose-400"
        />
        <div className="mt-3 flex justify-between text-[10px] text-slate-500">
          <span>{solar.sunrise}</span>
          <span className="rounded-full bg-slate-950/60 px-2 text-amber-300">{sun.label}</span>
          <span>{solar.sunset}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniEvent icon={<Sunrise />} label="First Light" value={solar.firstLight || solar.sunrise} tone="blue" />
        <MiniEvent icon={<Sunset />} label="Last Light" value={solar.lastLight || solar.sunset} tone="purple" />
        <MiniEvent icon={<Sparkles />} label="Golden AM" value={`${solar.sunrise} +1h`} tone="yellow" />
        <MiniEvent icon={<Sparkles />} label="Golden PM" value={`-1h ${solar.sunset}`} tone="orange" />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/[0.35] p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-500/10 p-2 text-blue-200">
              <Moon className="size-6" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Moon Phase</p>
              <p className="text-sm font-medium text-white">{solar.moonPhase}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Illumination</p>
            <p className="text-sm font-medium text-white">{solar.moonIllumination}%</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <span>Rise: {solar.moonrise || "11:22 PM"}</span>
          <span>Set: {solar.moonset || "12:46 PM"}</span>
        </div>
      </div>
    </section>
  );
}

function MiniEvent({
  icon,
  label,
  value,
  tone
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "blue" | "purple" | "yellow" | "orange";
}) {
  const tones = {
    blue: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-200",
    purple: "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-200",
    yellow: "from-yellow-500/10 to-orange-500/10 border-yellow-500/20 text-yellow-200",
    orange: "from-orange-500/10 to-red-500/10 border-orange-500/20 text-orange-200"
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-r p-3 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        <span className="[&_svg]:size-4">{icon}</span>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400">{label}</p>
          <p className="truncate text-xs font-medium text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function calculateSunProgress(sunrise: string, sunset: string) {
  const now = new Date();
  const start = parseClockTime(sunrise);
  const end = parseClockTime(sunset);
  const isDay = now >= start && now <= end;
  const percent = Math.round(Math.min(100, Math.max(0, ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)));
  return {
    percent: Number.isFinite(percent) ? percent : 50,
    isDay,
    label: isDay ? `${Math.max(0, Math.round((end.getTime() - now.getTime()) / 3600000))}h left` : "next sunrise"
  };
}

function parseClockTime(value: string) {
  const date = new Date();
  const [time, meridiem] = value.split(" ");
  const [hourRaw, minuteRaw] = time.split(":").map(Number);
  let hour = hourRaw;
  if (meridiem?.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (meridiem?.toUpperCase() === "AM" && hour === 12) hour = 0;
  date.setHours(hour, minuteRaw || 0, 0, 0);
  return date;
}
