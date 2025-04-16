import React, { useEffect, useRef, useState } from 'react';

interface FitToScreenProps {
  children: React.ReactNode;
}

const FitToScreen: React.FC<FitToScreenProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const BASE_WIDTH = 1500;
  const BASE_HEIGHT = 1000;

  const updateScale = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scaleX = vw / BASE_WIDTH;
    const scaleY = vh / BASE_HEIGHT;
    setScale(Math.min(scaleX, scaleY));
  };

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: `calc(50% - ${(BASE_HEIGHT * scale) / 2}px)`,
        left: `calc(50% - ${(BASE_WIDTH * scale) / 2}px)`,
      }}
    >
      {children}
    </div>
  );
};

export default FitToScreen;
