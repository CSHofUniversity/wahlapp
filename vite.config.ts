import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg"],
      manifest: {
        name: "Wahl-Info & Wahllokalfinder",
        short_name: "Wahl-Info",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb",
        icons: [
          {
            src: "pwaicon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwaicon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/87k3cdtkfe.execute-api\.eu-central-1\.amazonaws\.com\/dev/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 }
            }
          }
        ]
      }
    })
  ]
});
