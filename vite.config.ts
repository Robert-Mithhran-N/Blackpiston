import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";

// Custom Vite plugin to generate public/version.json on every build
// Uses a unique buildId (timestamp) that changes on EVERY build/deploy,
// so the frontend can reliably detect when a new version is available.
const generateVersionJson = () => {
  return {
    name: "generate-version-json",
    buildStart() {
      const version = process.env.VITE_APP_VERSION || "1.0.0";
      const buildId = Date.now().toString(36); // Unique per-build identifier
      const content = JSON.stringify({ version, buildId, timestamp: Date.now() }, null, 2);
      const publicDir = path.resolve(__dirname, "public");
      
      // Ensure the directory exists
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // Write the file
      fs.writeFileSync(path.join(publicDir, "version.json"), content);
      
      // Also inject the buildId as an env variable so the frontend knows its own build ID
      process.env.VITE_BUILD_ID = buildId;
      
      console.log(`[PWA Version] version=${version} buildId=${buildId}`);
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5000,
    strictPort: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png", "pwa-icon-192.png", "pwa-icon-512.png", "pwa-icon-maskable.png"],
      manifest: {
        id: "/",
        scope: "/",
        name: "BlackPiston Garage",
        short_name: "BlackPiston",
        description: "Premium automotive parts & garage services — your one-stop shop for everything automotive.",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        orientation: "portrait-primary",
        categories: ["shopping", "automotive"],
        icons: [
          {
            src: "/pwa-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-icon-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Cache pages and assets for fast loading
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,woff,ttf}"],
        // Never precache version.json — it must always be fetched fresh
        globIgnores: ["**/version.json"],
        // SPA fallback for client-side routing
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/version\.json/, /^\/sitemap\.xml/],
        // Runtime caching
        runtimeCaching: [
          {
            // version.json must ALWAYS come from the network (never cached)
            urlPattern: /\/version\.json$/,
            handler: "NetworkOnly",
          },
          {
            // sitemap.xml must ALWAYS come from the network (never cached)
            urlPattern: /\/sitemap\.xml$/,
            handler: "NetworkOnly",
          },
          {
            // Do not cache sensitive API routes or live data
            urlPattern: /^https?:\/\/.*\/api\/(auth|checkout|payments|admin|orders|user\/orders|appointments|services|messages|users|settings|wishlist).*/i,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "cloudinary-image-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:woff2?|ttf|eot)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "font-cache",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
        // Clean up outdated pre-cached assets automatically
        cleanupOutdatedCaches: true,
        // Claim clients immediately after the new service worker activates
        clientsClaim: true,
      },
      devOptions: {
        enabled: true, // Enable in dev mode for testing
      },
    }),
    generateVersionJson(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "lucide-react"
          ],
          utils: ["axios", "date-fns", "zod", "clsx", "tailwind-merge"],
          chart: ["recharts"],
          form: ["react-hook-form", "@hookform/resolvers"],
          query: ["@tanstack/react-query"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
