import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

console.log("🚀 main.tsx loaded");
console.log("📦 App imported:", App);
console.log("🛡️ ErrorBoundary imported:", ErrorBoundary);

const rootElement = document.getElementById("root");
console.log("🎯 Root element:", rootElement);

if (!rootElement) {
  console.error("❌ CRITICAL: Root element not found!");
  document.body.innerHTML = '<div style="padding: 40px; background: red; color: white; font-size: 24px;">ERROR: Root element not found!</div>';
} else {
  console.log("✅ Root element found, creating React root...");
  try {
    const root = createRoot(rootElement);
    console.log("✅ React root created, rendering...");
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.log("✅ Render called successfully");
  } catch (error) {
    console.error("❌ Error during render:", error);
    document.body.innerHTML = `<div style="padding: 40px; background: red; color: white; font-size: 20px;">
      <h1>RENDER ERROR</h1>
      <pre>${error}</pre>
    </div>`;
  }
}
