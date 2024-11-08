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
        display: "fullscreen",
        background_color: "#f3f4f6",
        theme_color: "#111827",
        icons: [
          {
            src: "images/icon.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }: { request: Request }) =>
              request.destination === "document",
            handler: "NetworkFirst", // HTML 문서를 네트워크에서 먼저 시도하고, 실패 시 캐시된 파일을 사용
            options: {
              cacheName: "html-cache",
              // networkTimeoutSeconds: 5, // 네트워크 응답이 5초 내로 없으면 캐시 사용
              // expiration: {
              //   maxEntries: 10, // 최대 10개의 HTML 파일을 캐시에 저장
              // },
            },
          },
          {
            urlPattern: ({ request }: { request: Request }) =>
              ["style", "script", "worker"].includes(request.destination),
            handler: "StaleWhileRevalidate", // CSS, JS 파일들은 네트워크와 캐시 둘 다 시도해서 최신을 유지
            options: {
              cacheName: "assets-cache",
              // expiration: {
              //   maxEntries: 50,
              // },
            },
          },
          {
            urlPattern: ({ request }: { request: Request }) =>
              request.destination === "image",
            handler: "CacheFirst", // 이미지 파일은 캐시에서 먼저 시도
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30일 동안 캐시 유지
              },
            },
          },
        ],
      },
    }),
  ],
});
