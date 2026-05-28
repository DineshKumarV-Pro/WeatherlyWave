import { cn } from "@/lib/utils";

type ToggleOption<T extends string> = {
  value: T;
  label: string;
};

export function ToggleGroup<T extends string>({
  value,
  options,
  onChange,
  className
}: {
  value: T;
  options: ToggleOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-xl border border-white/10 bg-slate-950/40 p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition",
            value === option.value ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/10 hover:text-white"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
