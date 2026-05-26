import { useState, useCallback } from "react";
import SplashScreen from "./SplashScreen";

/**
 * StartupLoader shows the premium splash screen as an overlay on first load.
 * 
 * Key design decisions:
 * - The app (children) renders IMMEDIATELY in the background — no blocking.
 * - The splash sits on top as a z-index overlay and fades out after ~3.5s.
 * - No health-check gating — React Query handles per-request loading states.
 * - The splash only shows once per page load (not on in-app navigation).
 */
const StartupLoader = ({ children }: { children: React.ReactNode }) => {
  // Check sessionStorage so the splash only shows once per browser session
  // (not again on back/forward navigation or React re-renders)
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return false;
    const alreadyShown = sessionStorage.getItem("bp-splash-shown");
    if (alreadyShown) return false;
    return true;
  });

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem("bp-splash-shown", "1");
  }, []);

  return (
    <>
      {/* App content always renders — never blocked */}
      {children}

      {/* Splash sits ON TOP as a fixed overlay, then fades away */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
    </>
  );
};

export default StartupLoader;
