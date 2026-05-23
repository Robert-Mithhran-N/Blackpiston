import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showMobileBanner, setShowMobileBanner] = useState(false);

  useEffect(() => {
    // 1. Detect if currently installed
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    // 2. Detect OS and device type
    const ua = navigator.userAgent;
    const isiOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    setIsIOS(isiOSDevice);
    setIsMobile(isMobileDevice);

    // 3. Listen for Android/Desktop install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      // If it's mobile, we handle the banner logic
      if (isMobileDevice && !isiOSDevice) {
        checkAndShowMobileBanner();
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPromptEvent(null);
      setShowMobileBanner(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 5. iOS Custom Banner Logic (Since iOS doesn't fire beforeinstallprompt)
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
      // Wait 3 seconds before showing the mobile banner
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

    // Show the native prompt
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
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};
