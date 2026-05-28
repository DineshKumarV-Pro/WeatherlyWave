import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = {
  value: T;
  label: ReactNode;
};

type TabsProps<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export function Tabs<T extends string>({ value, options, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn("flex rounded-xl border border-white/10 bg-slate-950/40 p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:flex-none",
            value === option.value ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/10 hover:text-white"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
