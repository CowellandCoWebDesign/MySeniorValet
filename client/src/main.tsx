import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// FORCE CACHE BUST - Development Mode
console.log("🔥 CACHE BUST ACTIVE - " + Date.now());
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
