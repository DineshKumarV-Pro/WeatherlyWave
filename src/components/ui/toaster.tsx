import { Toaster as SonnerToaster } from "sonner";

export function ToastViewport() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "rgba(15, 23, 42, 0.92)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#f8fafc",
          backdropFilter: "blur(12px)"
        }
      }}
    />
  );
}
