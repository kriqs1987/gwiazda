import React from 'react';
import { Generator } from '../types';
import { UPGRADE_SPS_MULTIPLIER } from '../constants';

interface UpgradeItemProps {
  generator: Generator;
  stardust: number;
  cost: number;
  onUpgrade: (id: number) => void;
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

const UpgradeItem: React.FC<UpgradeItemProps> = ({ generator, stardust, cost, onUpgrade, onSelect, isSelected }) => {
  const isOwned = generator.count > 0;
  const canAfford = stardust >= cost;
  const canUpgrade = canAfford && isOwned;
  
  const currentBonus = (Math.pow(UPGRADE_SPS_MULTIPLIER, generator.level - 1) - 1) * 100;

  return (
    <div 
      onClick={() => onSelect(generator.id)}
      className={`
      flex items-center justify-between p-3 rounded-lg w-full cursor-pointer
      bg-gray-800 bg-opacity-50 border
      ${isSelected ? 'border-green-400 ring-1 ring-green-500' : 'border-gray-700'}
      transition-all duration-300
      ${!isOwned ? 'opacity-50' : ''}
      ${canUpgrade ? 'hover:bg-purple-800 hover:border-purple-600' : ''}
    `}>
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{generator.icon}</div>
        <div>
          <h3 className="font-bold text-lg">{generator.name}</h3>
          <p className="text-xs text-purple-300">
            Level {generator.level} (+{currentBonus.toFixed(0)}% SPS)
          </p>
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={(e) => {
              e.stopPropagation();
              onUpgrade(generator.id);
          }}
          disabled={!canUpgrade}
          className={`
              px-4 py-2 rounded-md text-sm font-semibold w-32
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500
              ${canUpgrade ? 'bg-green-600 hover:bg-green-500 cursor-pointer' : 'bg-gray-600 cursor-not-allowed'}
          `}
        >
          {!isOwned ? (
            <span className="text-xs">Buy First</span>
          ) : (
            <div className="text-center">
              <span className="font-bold">Upgrade</span>
              <span className="block text-xs text-gray-300">
                Cost: {formatNumber(cost)}
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default UpgradeItem;
