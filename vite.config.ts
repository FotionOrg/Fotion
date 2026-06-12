import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    proxy: {
      "/aw-api": {
        target: "http://localhost:5600",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aw-api/, "/api"),
      },
    },
  },
});
