import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  meta,
  action,
  className
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/70">{eyebrow}</p>}
        <h2 className="truncate text-lg font-semibold text-white sm:text-xl">{title}</h2>
        {meta && <p className="mt-1 text-xs text-slate-400">{meta}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
