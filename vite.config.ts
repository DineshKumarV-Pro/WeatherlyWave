import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.png"],
      manifest: {
        name: "WeatherlyWave",
        short_name: "WeatherWave",
        description: "Advanced weather intelligence with real-time updates",
        start_url: "/",
        display: "standalone",
        background_color: "#0b1120",
        theme_color: "#0b1120",
        orientation: "portrait",
        icons: [
          {
            src: "/logo.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/logo.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,json}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "openweather-api",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 30 },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/api\.tomorrow\.io\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "tomorrowio-api",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
