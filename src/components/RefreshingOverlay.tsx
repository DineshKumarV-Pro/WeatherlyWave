import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RefreshingOverlay({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-x-3 top-24 z-40 mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-950/78 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:top-28">
      <div className="mb-3 flex items-center gap-2 text-sm text-white">
        <Loader2 className="size-4 animate-spin text-sky-300" />
        Updating weather
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Skeleton className="h-2" />
        <Skeleton className="h-2" />
        <Skeleton className="h-2" />
        <Skeleton className="h-2" />
      </div>
    </div>
  );
}
