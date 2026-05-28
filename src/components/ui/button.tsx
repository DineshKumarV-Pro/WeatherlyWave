import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-sky-400 text-slate-950 hover:bg-sky-300",
        secondary: "bg-white/10 text-white hover:bg-white/[0.15]",
        ghost: "text-slate-300 hover:bg-white/10 hover:text-white",
        outline: "border border-white/10 bg-white/[0.05] text-white hover:bg-white/10",
        danger: "bg-red-500/20 text-red-200 hover:bg-red-500/30",
        icon: "bg-white/[0.05] text-slate-300 hover:bg-white/10 hover:text-white"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button };
