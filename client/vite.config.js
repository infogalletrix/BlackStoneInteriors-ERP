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
        target: "http://localhost:5051",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
