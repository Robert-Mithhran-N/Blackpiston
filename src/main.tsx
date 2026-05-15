import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 40px; background: red; color: white; font-size: 24px;">ERROR: Root element not found!</div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("❌ Error during render:", error);
    document.body.innerHTML = `<div style="padding: 40px; background: red; color: white; font-size: 20px;">
      <h1>RENDER ERROR</h1>
      <pre>${error}</pre>
    </div>`;
  }
}
