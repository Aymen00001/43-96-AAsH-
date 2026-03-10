import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ['**/*.txt'],
  build: {
    rollupOptions: {
      external: ['pdfmake/build/vf_fonts'],
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://four3-96-aasg.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
