import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

// Bypass HMR to prevent React rendering issues
// @ts-ignore
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // Do nothing - prevent HMR from causing React issues
  });
}

// Remove server-injected community SEO tags (marked with data-ssr-meta) before
// React mounts: Helmet / useSEO emit their own tags, and leaving the server's
// copies in place would create duplicate descriptions / canonicals / OG tags.
// (The server-injected <title> is intentionally NOT marked — Helmet updates the
// existing single title tag in place, so exactly one <title> ever exists.)
document.querySelectorAll("[data-ssr-meta]").forEach((el) => el.remove());

const root = document.getElementById("root");
if (root) {
  // Loading the REAL MySeniorValet application
  createRoot(root).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
} else {
  console.error("Root element not found!");
}
