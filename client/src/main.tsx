import { createRoot } from "react-dom/client";
import App from "./App";
import TestApp from "./TestApp";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

// Development cache management
if (import.meta.env.DEV) {
  console.log("🔥 DEV MODE ACTIVE - " + Date.now());
}

const root = document.getElementById("root");
if (root) {
  // Temporarily render TestApp to verify React is working
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('test') === 'true';
  
  createRoot(root).render(
    <ErrorBoundary>
      {testMode ? <TestApp /> : <App />}
    </ErrorBoundary>
  );
} else {
  console.error("Root element not found!");
}
