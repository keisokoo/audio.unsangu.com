import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      includeAssets: ["images/icon.png"],
      manifest: {
        name: "UNSANGU AUDIO PLAYER",
        short_name: "UAP",
        description: "This is a PWA app built with Vite",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#3e4eb8",
        icons: [
          {
            src: "images/icon.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
