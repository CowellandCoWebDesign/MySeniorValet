import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Development cache management
if (import.meta.env.DEV) {
  console.log("🔥 DEV MODE ACTIVE - " + Date.now());
}

createRoot(document.getElementById("root")!).render(<App />);
