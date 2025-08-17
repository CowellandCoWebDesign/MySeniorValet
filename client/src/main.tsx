import { createRoot } from "react-dom/client";
import SimpleApp from "./SimpleApp";
import "./index.css";

// Bypass HMR completely
// @ts-ignore
if (typeof import.meta.hot !== 'undefined') {
  import.meta.hot.decline();
}

const root = document.getElementById("root");
if (root) {
  // Using SimpleApp - a working React component that bypasses HMR issues
  createRoot(root).render(<SimpleApp />);
} else {
  console.error("Root element not found!");
}
