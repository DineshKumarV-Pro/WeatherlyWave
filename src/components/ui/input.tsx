import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-slate-950/[0.45] px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/40 focus:bg-slate-950/70",
        className
      )}
      {...props}
    />
  );
}

export { Input };
