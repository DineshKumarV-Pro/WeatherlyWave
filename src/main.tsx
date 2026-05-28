import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "@/App";
import { initFirebase } from "@/services/firebase";
import "@/styles/globals.css";

registerSW({ immediate: true });
void initFirebase();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
