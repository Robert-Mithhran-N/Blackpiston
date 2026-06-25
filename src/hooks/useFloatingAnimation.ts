import { useState, useEffect } from 'react';

export interface FloatingStyle {
  '--float-x'?: string;
  '--float-y'?: string;
  '--float-z'?: string;
  '--float-rx'?: string;
  '--float-ry'?: string;
  '--float-rz'?: string;
  '--float-scale'?: string;
  '--float-duration'?: string;
  '--float-delay'?: string;
}

export function useFloatingAnimation(seed?: number) {
  const [style, setStyle] = useState<FloatingStyle & React.CSSProperties>({});

  useEffect(() => {
    // Generate values matching specification:
    // Floating distance: 6–14px
    const xDist = (6 + Math.random() * 8) * (Math.random() > 0.5 ? 1 : -1);
    const yDist = (6 + Math.random() * 8) * (Math.random() > 0.5 ? 1 : -1);
    // Slight translateZ: 1-3px for perspective
    const zDist = (1 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1);
    
    // Rotation: 1–3°
    const rxDeg = (1 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1);
    const ryDeg = (1 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1);
    const rzDeg = (0.5 + Math.random() * 1.5) * (Math.random() > 0.5 ? 1 : -1);
    
    // Duration: 8–16 seconds
    const duration = 8 + Math.random() * 8;
    
    // Random delay: 0–6 seconds (negative to start in random phase immediately)
    const delay = Math.random() * 6;
    
    // Scale: 0.98–1.02
    const scale = 0.98 + Math.random() * 0.04;

    setStyle({
      '--float-x': `${xDist}px`,
      '--float-y': `${yDist}px`,
      '--float-z': `${zDist}px`,
      '--float-rx': `${rxDeg}deg`,
      '--float-ry': `${ryDeg}deg`,
      '--float-rz': `${rzDeg}deg`,
      '--float-scale': `${scale}`,
      '--float-duration': `${duration}s`,
      '--float-delay': `-${delay}s`,
    } as any);
  }, [seed]);

  return style;
}
