import { useEffect, useState, useRef } from "react";

const logo = "https://res.cloudinary.com/dp890nvg2/image/upload/f_auto,q_auto/v1/blackpiston/assets/logo";

// Floating particle component
const Particle = ({ delay, x, y, size, duration }: { delay: number; x: number; y: number; size: number; duration: number }) => (
  <div
    className="splash-particle"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

interface SplashScreenProps {
  onComplete: () => void;
  /** Minimum display time in ms (default: 3500) */
  minDisplayTime?: number;
}

const SplashScreen = ({ onComplete, minDisplayTime = 3500 }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"active" | "fading">("active");
  const startTimeRef = useRef(Date.now());
  const hasCompletedRef = useRef(false);

  // Generate random particles once
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: 1.5 + Math.random() * 1.5,
      x: 20 + Math.random() * 60,
      y: 30 + Math.random() * 40,
      size: 1 + Math.random() * 3,
      duration: 2 + Math.random() * 3,
    }))
  ).current;

  useEffect(() => {
    // Start fade-out after minimum display time
    const fadeTimer = setTimeout(() => {
      setPhase("fading");
    }, minDisplayTime);

    // Complete after fade-out finishes
    const completeTimer = setTimeout(() => {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete();
      }
    }, minDisplayTime + 800); // 800ms fade-out duration

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [minDisplayTime, onComplete]);

  return (
    <div
      className={`splash-screen ${phase === "fading" ? "splash-fade-out" : ""}`}
      aria-hidden="true"
    >
      {/* Animated background layers */}
      <div className="splash-bg-gradient" />
      <div className="splash-vignette" />

      {/* Central glow */}
      <div className="splash-center-glow" />
      <div className="splash-center-glow-secondary" />

      {/* Floating particles */}
      <div className="splash-particles-container">
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </div>

      {/* Logo reveal */}
      <div className="splash-logo-container">
        <div className="splash-logo-wrapper">
          <img
            src={logo}
            alt="BlackPiston Garage"
            className="splash-logo-image"
            draggable={false}
          />
          {/* Metallic shine sweep */}
          <div className="splash-shine" />
        </div>
      </div>

      {/* Brand text */}
      <div className="splash-brand-text">
        <span className="splash-brand-title">BLACKPISTON</span>
        <span className="splash-brand-subtitle">GARAGE</span>
      </div>

      {/* Bottom tagline */}
      <div className="splash-tagline">
        <div className="splash-tagline-line" />
        <span className="splash-tagline-text">PREMIUM MOTORCYCLE GEAR</span>
        <div className="splash-tagline-line" />
      </div>
    </div>
  );
};

export default SplashScreen;
