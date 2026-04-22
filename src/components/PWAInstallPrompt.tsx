import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);

    // Listen for install prompt (Android/Desktop)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Only show banner if user hasn't dismissed it recently
      const dismissed = localStorage.getItem("pwa-banner-dismissed");
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If iOS and not installed, show banner after delay
    if (isiOS) {
      const dismissed = localStorage.getItem("pwa-banner-dismissed");
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    }

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-in slide-in-from-bottom duration-500">
        <div className="mx-auto max-w-lg p-3">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                <Smartphone className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">Install BlackPiston Garage</h3>
                <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">
                  Get the full app experience — faster loading, offline access & instant updates.
                </p>

                <div className="mt-3 flex items-center gap-2">
                  {isIOS ? (
                    <button
                      onClick={() => setShowIOSGuide(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black transition-all hover:bg-zinc-200 active:scale-95"
                    >
                      <Download className="h-3.5 w-3.5" />
                      How to Install
                    </button>
                  ) : (
                    <button
                      onClick={handleInstall}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black transition-all hover:bg-zinc-200 active:scale-95"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Install App
                    </button>
                  )}
                  <button
                    onClick={handleDismiss}
                    className="rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:text-white"
                  >
                    Not now
                  </button>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={handleDismiss}
                className="shrink-0 rounded-full p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg animate-in slide-in-from-bottom duration-300">
            <div className="rounded-t-3xl bg-zinc-900 border-t border-white/10 p-6">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />
              <h3 className="text-lg font-bold text-white mb-4">Install on iPhone / iPad</h3>
              <ol className="space-y-4 text-sm text-zinc-300">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">1</span>
                  <span>Tap the <strong className="text-white">Share</strong> button (box with arrow) at the bottom of Safari</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">2</span>
                  <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">3</span>
                  <span>Tap <strong className="text-white">"Add"</strong> in the top-right corner</span>
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
