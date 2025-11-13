import React from 'react';
import { Generator } from '../types';

interface GeneratorItemProps {
  generator: Generator;
  stardust: number;
  cost: number;
  onBuy: (id: number) => void;
  totalSps: number;
  onSelect: (id: number) => void;
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

const GeneratorItem: React.FC<GeneratorItemProps> = ({ generator, stardust, cost, onBuy, onSelect, isSelected }) => {
  const canAfford = stardust >= cost;

  return (
    <div 
      onClick={() => onSelect(generator.id)}
      className={`
      flex items-center justify-between p-3 rounded-lg w-full cursor-pointer
      bg-gray-800 bg-opacity-50 border 
      ${isSelected ? 'border-purple-400 ring-1 ring-purple-500' : 'border-gray-700'}
      transition-all duration-300
      ${canAfford ? 'hover:bg-purple-800 hover:border-purple-600' : 'opacity-60'}
    `}>
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{generator.icon}</div>
        <div>
          <h3 className="font-bold text-lg">{generator.name}</h3>
          <p className="text-xs text-gray-400">+{generator.sps.toLocaleString()} SPS</p>
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">{generator.count}</span>
          <button
            onClick={(e) => {
                e.stopPropagation();
                onBuy(generator.id);
            }}
            disabled={!canAfford}
            className={`
                px-4 py-2 rounded-md text-sm font-semibold
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500
                ${canAfford ? 'bg-purple-600 hover:bg-purple-500 cursor-pointer' : 'bg-gray-600 cursor-not-allowed'}
            `}
          >
            Buy {formatNumber(cost)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratorItem;
