import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  clearScreen: false,

  build: {
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
      },
      mangle: true,
      format: { comments: false },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },

  server: {
