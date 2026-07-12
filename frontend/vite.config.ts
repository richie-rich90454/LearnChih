import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    plugins: [
        react(),
        visualizer({ open: false, filename: "bundle-stats.html", gzipSize: true }),
        VitePWA({
            registerType: "autoUpdate",
            workbox: {
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true,
                globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2}"],
                runtimeCaching: [
                    {
                        urlPattern: /^https?:\/\/.*\/api\//,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "api-cache",
                            expiration: { maxEntries: 100, maxAgeSeconds: 300 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /^https?:\/\/.*\/ws\//,
                        handler: "NetworkOnly",
                    },
                ],
            },
            manifest: false, // We use our own manifest.webmanifest
            devOptions: { enabled: false },
        }),
    ],
    // Inline critical CSS for above-the-fold rendering is a future enhancement.
    // It requires a custom plugin (e.g. vite-plugin-critical) and a stable CSS
    // strategy; deferred for now. cssCodeSplit is set explicitly below.
    build: {
        modulePreload: { polyfill: true },
        cssCodeSplit: true,
        sourcemap: true,
        rolldownOptions: {
            output: {
                // Vite 8 (rolldown) requires manualChunks to be a function, not an
                // object. We assign well-known vendor packages to dedicated chunks by
                // inspecting each module's path. Paths are normalised to forward
                // slashes so matching works on Windows and POSIX.
                manualChunks: (id: string) => {
                    const normalized = id.replace(/\\/g, "/");

                    // --- App code splitting (improves caching and reduces
                    // initial bundle size by separating stores, hooks, and API
                    // modules into their own chunks that can be fetched in
                    // parallel with HTTP/2). ---
                    if (normalized.includes("/src/store/")) {
                        return "app-stores";
                    }
                    if (normalized.includes("/src/hooks/")) {
                        return "app-hooks";
                    }
                    if (normalized.includes("/src/api/")) {
                        return "app-api";
                    }

                    // --- Vendor splitting ---
                    if (!normalized.includes("/node_modules/")) {
                        return undefined;
                    }
                    if (
                        normalized.includes("/react-router") ||
                        normalized.includes("/@remix-run/router") ||
                        normalized.includes("/react/") ||
                        normalized.includes("/react-dom/") ||
                        normalized.includes("/scheduler/")
                    ) {
                        return "react-vendor";
                    }
                    // Split Fluent UI icons from core components — icons
                    // are large but tree-shakeable; keeping them separate
                    // allows the component chunk to be smaller.
                    if (normalized.includes("/@fluentui/react-icons")) {
                        return "fluent-icons";
                    }
                    if (normalized.includes("/@fluentui/")) {
                        return "fluent-vendor";
                    }
                    if (normalized.includes("/@tanstack/")) {
                        return "query-vendor";
                    }
                    if (
                        normalized.includes("/gsap") ||
                        normalized.includes("/@gsap")
                    ) {
                        return "gsap-vendor";
                    }
                    if (
                        normalized.includes("/i18next") ||
                        normalized.includes("/react-i18next")
                    ) {
                        return "i18n-vendor";
                    }
                    if (normalized.includes("/zustand")) {
                        return "state-vendor";
                    }
                    if (normalized.includes("/react-helmet-async")) {
                        return "seo-vendor";
                    }
                    if (normalized.includes("/axios")) {
                        return "http-vendor";
                    }
                    if (normalized.includes("/zod")) {
                        return "validation-vendor";
                    }
                    return undefined;
                },
            },
        },
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:38517",
                changeOrigin: true,
            },
            "/ws": {
                target: "http://localhost:38517",
                changeOrigin: true,
                ws: true,
            },
        },
    },
});
