// Minimal test to check if React renders
import { createRoot } from "react-dom/client";

const TestApp = () => {
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#00ff00', 
      color: '#000',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      ✅ REACT IS WORKING! If you see this, React is rendering correctly.
      <br />
      <br />
      Time: {new Date().toLocaleTimeString()}
    </div>
  );
};

const root = document.getElementById("root");
if (root) {
  console.log("✅ Root element found");
  createRoot(root).render(<TestApp />);
} else {
  console.error("❌ Root element NOT found");
  document.body.innerHTML = '<h1 style="color: red;">ERROR: Root element not found!</h1>';
}
