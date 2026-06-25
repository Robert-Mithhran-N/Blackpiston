import { useState, useRef, useCallback } from 'react';

export function useMouseParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0, xPct: 0, yPct: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Position of cursor relative to card center
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;
    
    // Percentage from center: ranges from -0.5 to 0.5
    const xPct = x / width;
    const yPct = y / height;
    
    // Maximum tilt: ±6 degrees
    const maxTilt = 6;
    const rotateX = -yPct * maxTilt * 2; // multiply by 2 to reach max tilt at boundaries
    const rotateY = xPct * maxTilt * 2;
    
    // Clamp values to maximum tilt
    const clampedX = Math.max(-maxTilt, Math.min(maxTilt, rotateX));
    const clampedY = Math.max(-maxTilt, Math.min(maxTilt, rotateY));

    setCoords({
      rotateX: clampedX,
      rotateY: clampedY,
      xPct,
      yPct
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setCoords({ rotateX: 0, rotateY: 0, xPct: 0, yPct: 0 });
  }, []);

  return {
    containerRef,
    rotateX: coords.rotateX,
    rotateY: coords.rotateY,
    xPct: coords.xPct,
    yPct: coords.yPct,
    isHovered,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  };
}
