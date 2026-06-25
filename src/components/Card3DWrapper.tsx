import React from 'react';
import { useFloatingAnimation } from '@/hooks/useFloatingAnimation';
import { useMouseParallax } from '@/hooks/useMouseParallax';

interface Card3DWrapperProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  seed?: number;
}

export const Card3DWrapper: React.FC<Card3DWrapperProps> = ({
  children,
  onClick,
  className = "",
  seed
}) => {
  const floatStyle = useFloatingAnimation(seed);
  const {
    containerRef,
    rotateX,
    rotateY,
    isHovered,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  } = useMouseParallax();

  // Handle responsiveness in JS
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    // Media Query for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', motionListener);

    // Responsive screen detection
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      mediaQuery.removeEventListener('change', motionListener);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Determine active hover state (disabled on mobile)
  const isInteractiveHover = isHovered && deviceType !== 'mobile';

  // Determine transform styles dynamically
  const getTransform = () => {
    if (reduceMotion) return 'none';
    
    if (isInteractiveHover) {
      if (deviceType === 'tablet') {
        // Tablet: Reduce movement and tilt by half
        return `perspective(1000px) translateY(-8px) translateZ(8px) rotateX(${rotateX * 0.5}deg) rotateY(${rotateY * 0.5}deg) scale(1.015)`;
      }
      // Desktop: Full floating + hover + parallax (Lift: 12-18px, Tilt: Max ±6°)
      return `perspective(1000px) translateY(-14px) translateZ(16px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.025)`;
    }
    
    return 'none';
  };

  const getShadow = () => {
    if (reduceMotion) return 'none';

    if (isInteractiveHover) {
      if (deviceType === 'tablet') {
        return '0 15px 30px -10px rgba(0, 0, 0, 0.6), 0 0 15px 1px rgba(249, 115, 22, 0.12)';
      }
      // Desktop: Deeper shadow + soft orange ambient glow matching BlackPiston brand
      return '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 25px 2px rgba(249, 115, 22, 0.18)';
    }
    
    // Float shadow: Soft dynamic shadow
    return '0 10px 25px -10px rgba(0, 0, 0, 0.5)';
  };

  const borderStyle = isInteractiveHover
    ? 'border-orange-500/40 bg-zinc-950/90' 
    : 'border-white/5 bg-zinc-950/70';

  // Hover states should transition smoothly, floating transition should handle phase changes
  const transitionStyle = isInteractiveHover
    ? 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease, border-color 0.3s ease'
    : 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.6s ease, border-color 0.6s ease';

  const transformStyle = {
    transform: getTransform(),
    boxShadow: getShadow(),
    transition: transitionStyle,
    willChange: 'transform',
    perspective: '1000px',
    transformStyle: 'preserve-3d' as const,
    // Inject floating CSS properties if not hovering and not reduced motion
    ...(!isInteractiveHover && !reduceMotion ? floatStyle : {}),
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={deviceType !== 'mobile' ? handleMouseMove : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className={`relative rounded-xl border transition-all overflow-hidden ${borderStyle} ${
        !isInteractiveHover && !reduceMotion ? 'animate-premium-float' : ''
      } ${className} group`}
    >
      {/* Light Reflection glow overlay that follows the mouse (Desktop only) */}
      {isInteractiveHover && deviceType === 'desktop' && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle at calc(50% + ${rotateY * 20}px) calc(50% - ${rotateX * 20}px), rgba(249, 115, 22, 0.08) 0%, transparent 65%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};
