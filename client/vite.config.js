import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Make sure this import exists

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // This line is required
  ],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://72.61.241.138:5051",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
});
