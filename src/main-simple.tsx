import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

console.log("🔍 SIMPLE TEST: Starting...");

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found!");
  document.body.innerHTML = '<div style="padding: 40px; background: red; color: white; font-size: 24px;">ERROR: Root element not found!</div>';
} else {
  console.log("✅ Root element found");
  
  try {
    const root = createRoot(rootElement);
    console.log("✅ React root created");
    
    root.render(
      <StrictMode>
        <div style={{
          minHeight: "100vh",
          background: "#0F1113",
          color: "#F6F6F6",
          padding: "40px",
          fontFamily: "system-ui"
        }}>
          <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
            ✅ React is Working!
          </h1>
          <p style={{ fontSize: "24px", marginBottom: "10px" }}>
            If you see this, React is rendering correctly.
          </p>
          <p style={{ fontSize: "18px", color: "#FF6A00" }}>
            BlackPiston Garage - Debug Mode
          </p>
          <div style={{ marginTop: "40px", padding: "20px", background: "#1B1F23", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>System Status:</h2>
            <ul style={{ fontSize: "16px", lineHeight: "1.8" }}>
              <li>✅ React 18 loaded</li>
              <li>✅ Vite dev server running</li>
              <li>✅ CSS styles applied</li>
              <li>✅ Root element rendering</li>
            </ul>
          </div>
        </div>
      </StrictMode>
    );
    
    console.log("✅ Simple render successful");
  } catch (error) {
    console.error("❌ Render error:", error);
    document.body.innerHTML = `<div style="padding: 40px; background: red; color: white; font-size: 20px;">
      <h1>RENDER ERROR</h1>
      <pre>${error}</pre>
    </div>`;
  }
}
