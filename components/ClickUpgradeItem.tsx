import React from 'react';

interface ClickUpgradeItemProps {
  level: number;
  stardust: number;
  cost: number;
  currentPower: number;
  onUpgrade: () => void;
  onSelect: () => void;
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

const ClickUpgradeItem: React.FC<ClickUpgradeItemProps> = ({ level, stardust, cost, currentPower, onUpgrade, onSelect, isSelected }) => {
  const canAfford = stardust >= cost;

  return (
    <div 
      onClick={onSelect}
      className={`
      flex items-center justify-between p-3 rounded-lg w-full cursor-pointer
      bg-gray-800 bg-opacity-50 border 
      ${isSelected ? 'border-green-400 ring-1 ring-green-500' : 'border-gray-700'}
      transition-all duration-300
      ${canAfford ? 'hover:bg-green-800 hover:border-green-600' : ''}
    `}>
      <div className="flex items-center space-x-4">
        <div className="text-3xl">🖱️</div>
        <div>
          <h3 className="font-bold text-lg">Manual Amplifier</h3>
          <p className="text-xs text-green-300">
            Level {level} ({currentPower.toFixed(1)}/click)
          </p>
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={(e) => {
              e.stopPropagation();
              onUpgrade();
          }}
          disabled={!canAfford}
          className={`
              px-4 py-2 rounded-md text-sm font-semibold w-32
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500
              ${canAfford ? 'bg-green-600 hover:bg-green-500 cursor-pointer' : 'bg-gray-600 cursor-not-allowed'}
          `}
        >
          <div className="text-center">
            <span className="font-bold">Upgrade</span>
            <span className="block text-xs text-gray-300">
              Cost: {formatNumber(cost)}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ClickUpgradeItem;