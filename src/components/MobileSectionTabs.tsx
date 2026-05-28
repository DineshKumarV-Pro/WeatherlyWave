import { BarChart3, CalendarDays, Clock3, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileSection = "insights" | "forecast" | "metrics" | "hourly" | "astronomy";

const sections: Array<{ id: MobileSection; label: string; icon: typeof CalendarDays }> = [
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "forecast", label: "Forecast", icon: CalendarDays },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "hourly", label: "Hourly", icon: Clock3 },
  { id: "astronomy", label: "Astro", icon: Moon }
];

export function MobileSectionTabs({
  value,
  onChange
}: {
  value: MobileSection;
  onChange: (value: MobileSection) => void;
}) {
  return (
    <nav className="sticky top-2 z-30 -mx-1 mb-4 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/78 p-1 shadow-2xl shadow-black/25 backdrop-blur-xl [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = value === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={cn(
                "flex min-h-12 min-w-[84px] flex-col items-center justify-center gap-1 rounded-xl px-3 text-[11px] font-medium transition",
                active ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
