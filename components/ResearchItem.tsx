import React from 'react';
import { ResearchUpgrade } from '../types';

interface ResearchItemProps {
  research: ResearchUpgrade;
  researchPoints: number;
  onBuy: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

const formatNumber = (num: number): string => {
    if (num < 1000) return num.toLocaleString();
    const suffixes = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi'];
    const i = Math.floor(Math.log10(num) / 3);
    if (i >= suffixes.length) return num.toExponential(2);
    const shortNum = (num / Math.pow(1000, i)).toFixed(2);
    return shortNum + suffixes[i];
};

const ResearchItem: React.FC<ResearchItemProps> = ({ research, researchPoints, onBuy, onSelect, isSelected }) => {
  const canAfford = researchPoints >= research.cost;
  const canBuy = canAfford && !research.isPurchased;

  return (
    <div 
      onClick={() => onSelect(research.id)}
      className={`
        flex items-center justify-between p-3 rounded-lg w-full cursor-pointer
        bg-gray-800 bg-opacity-50 border 
        ${isSelected ? 'border-cyan-400 ring-1 ring-cyan-500' : 'border-gray-700'}
        transition-all duration-300
        ${research.isPurchased ? 'opacity-50' : ''}
        ${canBuy ? 'hover:bg-cyan-800 hover:border-cyan-600' : ''}
      `}
    >
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{research.icon}</div>
        <div>
          <h3 className="font-bold text-lg text-cyan-200">{research.name}</h3>
          <p className="text-xs text-gray-400">{research.description}</p>
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={(e) => {
              e.stopPropagation();
              onBuy(research.id);
          }}
          disabled={!canBuy}
          className={`
            px-4 py-2 rounded-md text-sm font-semibold w-32
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500
            ${research.isPurchased ? 'bg-gray-700' : canBuy ? 'bg-cyan-600 hover:bg-cyan-500 cursor-pointer' : 'bg-gray-600 cursor-not-allowed'}
          `}
        >
          {research.isPurchased ? (
            <span className="font-bold">Completed</span>
          ) : (
            <div className="text-center">
              <span className="font-bold">Research</span>
              <span className="block text-xs text-gray-300">
                Cost: {formatNumber(research.cost)} RP
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResearchItem;
