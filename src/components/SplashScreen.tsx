import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "bp_splash_seen";
const FALLBACK_TIMEOUT = 5000; // Max time before auto-dismiss (ms)

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"playing" | "fading" | "done">("playing");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleDismiss = useCallback(() => {
    if (phase !== "playing") return;
    setPhase("fading");

    // Mark as seen
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}

    // Wait for fade animation to complete
    setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 600);
  }, [phase, onComplete]);

  useEffect(() => {
    // Fallback timeout in case video fails to load or play
    fallbackTimerRef.current = setTimeout(() => {
      handleDismiss();
    }, FALLBACK_TIMEOUT);

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [handleDismiss]);

  const handleVideoEnd = () => {
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    // Small delay after video ends for a polished feel
    setTimeout(() => handleDismiss(), 200);
  };

  const handleVideoError = () => {
    // If video fails, dismiss immediately
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    handleDismiss();
  };

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-[600ms] ease-out ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
      style={{ willChange: "opacity" }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        className="w-full h-full object-contain"
        style={{ maxWidth: "100vw", maxHeight: "100vh" }}
      />

      {/* Subtle vignette overlay for premium feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Skip Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-6 right-6 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase
          text-white/60 hover:text-white border border-white/20 hover:border-white/40
          bg-white/5 hover:bg-white/10 backdrop-blur-sm
          transition-all duration-300 z-10"
      >
        Skip
      </button>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
};

/**
 * Check if the splash has already been shown this session.
 */
export function shouldShowSplash(): boolean {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false; // If localStorage is blocked, skip splash
  }
}

/**
 * Reset splash state (for testing/dev purposes).
 */
export function resetSplash(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export default SplashScreen;
