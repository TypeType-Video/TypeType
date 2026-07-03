import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_DEV_PROXY_TARGET ?? "http://localhost:8080";

  return {
    plugins: [
      TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    server: {
      allowedHosts: true,
      proxy: {
        "/api": {
          target: apiTarget,
          rewrite: (path) => path.replace(/^\/api/, ""),
          ws: true,
        },
        "/youtube-session/browser": {
          target: apiTarget,
          ws: true,
        },
        "/proxy": {
          target: apiTarget,
        },
        "/streams/hls-manifest": {
          target: apiTarget,
        },
        "/streams/manifest": {
          target: apiTarget,
        },
        "/sabr": {
          target: apiTarget,
          ws: true,
        },
      },
    },
  };
});
