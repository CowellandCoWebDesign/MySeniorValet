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
