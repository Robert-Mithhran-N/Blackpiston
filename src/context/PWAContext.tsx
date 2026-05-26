import React, { createContext, useContext, useEffect, useState } from "react";
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
  const [latestVersion, setLatestVersion] = useState<string>(appVersion);
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // 1. Initialize vite-plugin-pwa Service Worker hook
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("PWA Service Worker registered successfully:", r);
      if (r) {
        setSwRegistration(r);
        // Initial update check on register
        r.update().catch((err) => console.error("Initial SW update check failed:", err));
      }
    },
    onRegisterError(error) {
      console.error("PWA Service Worker registration error:", error);
    },
  });

  // 2. Fetch and compare deployed version.json
  const checkForUpdates = async () => {
    if (isCheckingForUpdates) return;
    setIsCheckingForUpdates(true);
    try {
      console.log("[PWA Update Checker] Fetching deployed version.json...");
      const response = await fetch(`/version.json?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`[PWA Update Checker] Embedded version: ${appVersion}, Deployed version: ${data.version}`);
        
        if (data.version && data.version !== appVersion) {
          setLatestVersion(data.version);
          console.warn("[PWA Update Checker] Deployment mismatch! Triggering SW update check.");
          
          if (swRegistration) {
            await swRegistration.update();
          } else {
            // If SW is not available, trigger the reload prompt manually
            setNeedRefresh(true);
          }
        }
      }
    } catch (error) {
      console.error("[PWA Update Checker] Failed to check for deployed version:", error);
    } finally {
      setIsCheckingForUpdates(false);
    }
  };

  // 3. Proactive update triggers (focus, visibility change, online, periodic intervals)
  useEffect(() => {
    // Initial check on mount
    checkForUpdates();

    const handleFocusOrVisibility = () => {
      if (document.visibilityState === "visible") {
        checkForUpdates();
        if (swRegistration) {
          swRegistration.update().catch((err) => console.error("SW focus update check failed:", err));
        }
      }
    };

    const handleOnline = () => {
      console.log("[PWA Status] Connection restored. Checking for updates...");
      checkForUpdates();
      if (swRegistration) {
        swRegistration.update().catch((err) => console.error("SW online update check failed:", err));
      }
    };

    window.addEventListener("focus", handleFocusOrVisibility);
    document.addEventListener("visibilitychange", handleFocusOrVisibility);
    window.addEventListener("online", handleOnline);

    // Periodic check every 5 minutes
    const interval = setInterval(() => {
      checkForUpdates();
      if (swRegistration) {
        swRegistration.update().catch((err) => console.error("Periodic SW update check failed:", err));
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("focus", handleFocusOrVisibility);
      document.removeEventListener("visibilitychange", handleFocusOrVisibility);
      window.removeEventListener("online", handleOnline);
      clearInterval(interval);
    };
  }, [swRegistration]);

  // 4. PWA Installation Event Listeners
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

  // 5. Secure Update Execution Flow (Deletes caches, triggers SkipWaiting and reloads page)
  const updateApp = async () => {
    console.warn("[PWA Update Manager] Starting application update...");
    try {
      // Delete all caches to ensure no stale dynamic imports or stylesheet assets are reused
      if ('caches' in window) {
        console.log("[PWA Update Manager] Clearing Cache Storage...");
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => {
            console.log(`[PWA Update Manager] Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        console.log("[PWA Update Manager] Cache Storage cleared successfully.");
      }

      // Clear SessionStorage to refresh transient client state (avoids corrupted session data)
      sessionStorage.clear();
      
    } catch (error) {
      console.error("[PWA Update Manager] Error clearing cache during update:", error);
    } finally {
      // Trigger service worker skip waiting and reload the page
      console.log("[PWA Update Manager] Activating new service worker and reloading client...");
      updateServiceWorker(true);
    }
  };

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
