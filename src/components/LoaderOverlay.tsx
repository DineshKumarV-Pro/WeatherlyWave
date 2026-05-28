import { CloudSun } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function LoaderOverlay({ active, location }: { active: boolean; location: string }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050914] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.22),transparent_30rem),radial-gradient(circle_at_72%_68%,rgba(16,185,129,0.14),transparent_26rem)]" />
      <div className="hero-surface relative w-full max-w-sm p-8 text-center">
        <div className="relative mx-auto mb-8 size-28">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-b-violet-300 border-t-sky-300 animate-spin" />
          <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-emerald-300 border-t-amber-300 animate-spin [animation-direction:reverse] [animation-duration:2s]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/logo.png" alt="WeatherlyWave" className="size-12 rounded-xl" />
          </div>
        </div>
        <h1 className="animate-shine bg-gradient-to-r from-sky-200 via-white to-emerald-200 bg-[length:200%_auto] bg-clip-text text-2xl font-semibold text-transparent">
          WeatherlyWave
        </h1>
        <p className="mt-2 text-sm text-slate-400">Preparing live weather intelligence</p>
        <Progress
          value={68}
          className="mx-auto mt-8 h-1.5 w-56 bg-white/10"
          indicatorClassName="bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-300"
        />
        <p className="mt-5 text-xs text-slate-500">{location}</p>
        <CloudSun className="mx-auto mt-4 size-5 text-sky-300" />
      </div>
    </div>
  );
}
