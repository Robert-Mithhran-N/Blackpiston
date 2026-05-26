import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isMobile: boolean;
  installApp: () => Promise<boolean>;
  showIOSGuide: boolean;
  setShowIOSGuide: (show: boolean) => void;
  showMobileBanner: boolean;
  setShowMobileBanner: (show: boolean) => void;
  dismissMobileBanner: () => void;
  
  // PWA Update Management properties
  offlineReady: boolean;
  needRefresh: boolean;
  setOfflineReady: (val: boolean) => void;
  setNeedRefresh: (val: boolean) => void;
  updateApp: () => Promise<void>;
  appVersion: string;
  latestVersion: string;
  isCheckingForUpdates: boolean;
  checkForUpdates: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}

// Debounce interval to prevent rapid-fire update checks (e.g., focus + visibilitychange firing together)
const UPDATE_CHECK_DEBOUNCE_MS = 3000;
// Interval for periodic background update checks
const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function PWAProvider({ children }: { children: React.ReactNode }) {
  // PWA Install states
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showMobileBanner, setShowMobileBanner] = useState(false);

  // App version tracking
  const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";
  const currentBuildId = import.meta.env.VITE_BUILD_ID || "";
  const [latestVersion, setLatestVersion] = useState<string>(appVersion);
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  
  // Use refs for mutable state that event handlers and intervals need to access
  // This avoids the stale closure problem where handlers capture old state values
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const isCheckingRef = useRef(false);
  const lastCheckTimeRef = useRef(0);

  // 1. Initialize vite-plugin-pwa Service Worker hook
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log("[PWA] Service Worker registered:", swUrl);
      if (r) {
        swRegistrationRef.current = r;
        // Initial update check on register
        r.update().catch((err) => console.error("[PWA] Initial SW update check failed:", err));
      }
    },
    onRegisterError(error) {
      console.error("[PWA] Service Worker registration error:", error);
    },
  });

  // 2. Fetch and compare deployed version.json using buildId
  const checkForUpdates = useCallback(async () => {
    // Debounce: skip if we checked recently
    const now = Date.now();
    if (now - lastCheckTimeRef.current < UPDATE_CHECK_DEBOUNCE_MS) {
      return;
    }
    
    // Prevent concurrent checks
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    lastCheckTimeRef.current = now;
    setIsCheckingForUpdates(true);
    
    try {
      console.log("[PWA Update] Fetching deployed version.json...");
      const response = await fetch(`/version.json?_=${now}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[PWA Update] Current buildId: ${currentBuildId}, Deployed buildId: ${data.buildId}, Version: ${data.version}`);
        
        // Compare buildId — if it differs, a new version has been deployed
        const hasNewBuild = data.buildId && currentBuildId && data.buildId !== currentBuildId;
        // Also compare version string as a fallback
        const hasNewVersion = data.version && data.version !== appVersion;
        
        if (hasNewBuild || hasNewVersion) {
          setLatestVersion(data.version || appVersion);
          console.warn("[PWA Update] New deployment detected! Triggering SW update check.");
          
          const reg = swRegistrationRef.current;
          if (reg) {
            try {
              await reg.update();
            } catch (err) {
              console.error("[PWA Update] SW update() failed:", err);
            }
          }
          
          // If no SW registration available or the SW update didn't trigger needRefresh,
          // force the prompt after a short delay to give the SW time to respond
          setTimeout(() => {
            setNeedRefresh(true);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("[PWA Update] Failed to check for deployed version:", error);
    } finally {
      isCheckingRef.current = false;
      setIsCheckingForUpdates(false);
    }
  }, [appVersion, currentBuildId, setNeedRefresh]);

  // 3. Listen for SW controllerchange — auto-reload when new SW takes control
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleControllerChange = () => {
      console.log("[PWA] New service worker activated — reloading page...");
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  // 4. Proactive update triggers (focus, visibility change, online, periodic intervals)
  useEffect(() => {
    // Initial check after a short delay (let the app render first)
    const initialTimeout = setTimeout(() => checkForUpdates(), 5000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        checkForUpdates();
        const reg = swRegistrationRef.current;
        if (reg) {
          reg.update().catch((err) => console.error("[PWA] Focus/visibility SW update failed:", err));
        }
      }
    };

    const handleOnline = () => {
      console.log("[PWA] Connection restored. Checking for updates...");
      checkForUpdates();
      const reg = swRegistrationRef.current;
      if (reg) {
        reg.update().catch((err) => console.error("[PWA] Online SW update failed:", err));
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("online", handleOnline);

    // Periodic check
    const interval = setInterval(() => {
      checkForUpdates();
      const reg = swRegistrationRef.current;
      if (reg) {
        reg.update().catch((err) => console.error("[PWA] Periodic SW update failed:", err));
      }
    }, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("online", handleOnline);
      clearInterval(interval);
    };
  }, [checkForUpdates]);

  // 5. PWA Installation Event Listeners
  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    const ua = navigator.userAgent;
    const isiOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    setIsIOS(isiOSDevice);
    setIsMobile(isMobileDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      if (isMobileDevice && !isiOSDevice) {
        checkAndShowMobileBanner();
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPromptEvent(null);
      setShowMobileBanner(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    if (isiOSDevice && !isInstalled) {
      checkAndShowMobileBanner();
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  function checkAndShowMobileBanner() {
    const dismissed = localStorage.getItem("pwa-mobile-dismissed");
    if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
      setTimeout(() => setShowMobileBanner(true), 3000);
    }
  }

  function dismissMobileBanner() {
    setShowMobileBanner(false);
    localStorage.setItem("pwa-mobile-dismissed", Date.now().toString());
  }

  async function installApp(): Promise<boolean> {
    if (isIOS) {
      setShowIOSGuide(true);
      return false;
    }

    if (!installPromptEvent) return false;

    await installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPromptEvent(null);
      setShowMobileBanner(false);
      return true;
    }
    
    return false;
  }

  // 6. Update execution — trigger skipWaiting and let controllerchange handle reload
  // DO NOT clear caches here — Workbox's cleanupOutdatedCaches handles that automatically.
  // Clearing caches before the new SW activates would leave a gap with no cached assets.
  const updateApp = useCallback(async () => {
    console.warn("[PWA Update] Starting application update...");
    try {
      // Tell the waiting service worker to skipWaiting and take control
      // The controllerchange listener (above) will auto-reload the page
      await updateServiceWorker(true);
    } catch (error) {
      console.error("[PWA Update] updateServiceWorker failed:", error);
      // Fallback: force reload if SW update mechanism fails
      window.location.reload();
    }
  }, [updateServiceWorker]);

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        isMobile,
        installApp,
        showIOSGuide,
        setShowIOSGuide,
        showMobileBanner,
        setShowMobileBanner,
        dismissMobileBanner,
        
        // PWA Updates
        offlineReady,
        needRefresh,
        setOfflineReady,
        setNeedRefresh,
        updateApp,
        appVersion,
        latestVersion,
        isCheckingForUpdates,
        checkForUpdates,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}
