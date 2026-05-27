import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: "lightningcss",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["lucide-react", "class-variance-authority", "clsx", "tailwind-merge"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: ["recharts", "react-day-picker", "embla-carousel-react", "vaul", "cmdk", "react-resizable-panels"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    middlewareMode: false,
  },
})
