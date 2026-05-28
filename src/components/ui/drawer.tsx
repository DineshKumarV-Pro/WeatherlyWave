import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

function Drawer(props: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root {...props} />;
}

function DrawerTrigger(props: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger {...props} />;
}

function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close {...props} />;
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <DrawerPrimitive.Content
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[85vh] max-w-3xl flex-col rounded-t-2xl border border-white/10 bg-slate-950 p-4 text-white shadow-2xl outline-none",
          className
        )}
        {...props}
      >
        <DrawerPrimitive.Title className="sr-only">Panel</DrawerPrimitive.Title>
        <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-white/20" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

export { Drawer, DrawerClose, DrawerContent, DrawerTrigger };
