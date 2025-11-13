
import React, { useEffect, useState } from 'react';

interface FloatingTextProps {
  text: string;
  x: number;
  y: number;
  onAnimationEnd: () => void;
}

const FloatingText: React.FC<FloatingTextProps> = ({ text, x, y, onAnimationEnd }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)',
    color: '#c4b5fd', // A light purple
    fontWeight: 'bold',
    fontSize: '1.5rem',
    pointerEvents: 'none',
    userSelect: 'none',
    opacity: 1,
    transition: 'transform 1s ease-out, opacity 1s ease-out',
    zIndex: 9999,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setStyle(prevStyle => ({
        ...prevStyle,
        transform: 'translate(-50%, -150%)',
        opacity: 0,
      }));
    }, 10);

    const animationEndTimer = setTimeout(onAnimationEnd, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(animationEndTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div style={style}>{text}</div>;
};

export default FloatingText;
