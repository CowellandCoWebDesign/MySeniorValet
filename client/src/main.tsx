import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Bypass HMR to prevent React rendering issues
// @ts-ignore
if (typeof import.meta.hot !== 'undefined') {
  import.meta.hot.decline();
}

const root = document.getElementById("root");
if (root) {
  // Loading the REAL MySeniorValet application
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found!");
}
