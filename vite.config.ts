import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Inject the Google Search Console verification meta tag into the HTML shell
// only when the token is configured (Google's verifier does not execute JS,
// so the tag must be present in the served HTML, not just React-rendered).
function googleSiteVerificationPlugin() {
  return {
    name: "google-site-verification",
    transformIndexHtml(html: string) {
      // loadEnv merges .env* files; actual process env vars take precedence.
      const mode = process.env.NODE_ENV === "production" ? "production" : "development";
      const env = loadEnv(mode, process.cwd(), "VITE_");
      const token =
        process.env.VITE_GOOGLE_SITE_VERIFICATION ||
        env.VITE_GOOGLE_SITE_VERIFICATION;
      if (!token) return html;
      return html.replace(
        "<head>",
        `<head>\n    <meta name="google-site-verification" content="${token}" />`,
      );
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    googleSiteVerificationPlugin(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    cssMinify: "esbuild",
  },
  optimizeDeps: {
    include: [
      "leaflet",
      "react-leaflet",
      "react-leaflet-cluster",
      "leaflet-providers",
      "leaflet.fullscreen",
      "leaflet.locatecontrol",
      "leaflet-control-geocoder",
    ],
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
