import React from 'react';
import FloatingText from './FloatingText';
import { FloatingText as FloatingTextType } from '../types';

interface ClickerAreaProps {
  stardust: number;
  stardustPerSecond: number;
  researchPoints: number;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  floatingTexts: FloatingTextType[];
  removeFloatingText: (id: number) => void;
}

const formatNumber = (num: number): string => {
  if (num < 1000) return num.toFixed(1);
  const suffixes = ['', 'k', 'M', 'B', 'T'];
  const i = Math.floor(Math.log10(num) / 3);
  const shortNum = (num / Math.pow(1000, i)).toFixed(2);
  return shortNum + suffixes[i];
};

const ClickerArea: React.FC<ClickerAreaProps> = ({ stardust, stardustPerSecond, researchPoints, onClick, floatingTexts, removeFloatingText }) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full select-none">
      {floatingTexts.map(text => (
        <FloatingText
          key={text.id}
          text={text.text}
          x={text.x}
          y={text.y}
          onAnimationEnd={() => removeFloatingText(text.id)}
        />
      ))}

      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter drop-shadow-lg">
          {Math.floor(stardust).toLocaleString()}
        </h1>
        <p className="text-purple-300 text-lg md:text-xl">Stardust</p>
        <p className="text-sm text-gray-400 mt-1">{formatNumber(stardustPerSecond)} per second</p>
        
        <div className="mt-6">
          <h2 className="text-3xl font-bold tracking-tight text-cyan-300 drop-shadow-lg">
              {researchPoints.toFixed(2)}
          </h2>
          <p className="text-sm text-cyan-400">Research Points</p>
        </div>
      </div>

      <button
        onClick={onClick}
        className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-purple-600 to-indigo-800 focus:outline-none transition-transform duration-150 ease-in-out active:scale-95 shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center"
      >
        <div className="w-full h-full rounded-full bg-center bg-cover animate-pulse-slow" style={{ backgroundImage: 'url(https://picsum.photos/id/1015/256/256)', filter: 'brightness(0.8)' }}>
        </div>
        <p className="absolute text-6xl md:text-8xl select-none opacity-50">✨</p>
      </button>
    </div>
  );
};

export default ClickerArea;