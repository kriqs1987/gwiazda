import React from 'react';

interface ClickConversionItemProps {
  stardust: number;
  cost: number;
  onTrade: () => void;
  onSelect: () => void;
  isSelected: boolean;
  gemsPurchased: number;
}

const formatNumber = (num: number): string => {
    if (num < 1000) return num.toLocaleString(undefined, {maximumFractionDigits: 1});
    const suffixes = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi'];
    const i = Math.floor(Math.log10(num) / 3);
    if (i >= suffixes.length) return num.toExponential(2);
    const shortNum = (num / Math.pow(1000, i)).toFixed(2);
    return shortNum + suffixes[i];
};

const ClickConversionItem: React.FC<ClickConversionItemProps> = ({ stardust, cost, onTrade, onSelect, isSelected, gemsPurchased }) => {
  const canAfford = stardust >= cost;

  return (
    <div 
      onClick={onSelect}
      className={`
      flex items-center justify-between p-3 rounded-lg w-full cursor-pointer
      bg-gray-800 bg-opacity-50 border 
      ${isSelected ? 'border-yellow-400 ring-1 ring-yellow-500' : 'border-gray-700'}
      transition-all duration-300
      ${canAfford ? 'hover:bg-yellow-800 hover:border-yellow-600' : ''}
    `}>
      <div className="flex items-center space-x-4">
        <div className="text-3xl">🔄</div>
        <div>
          <h3 className="font-bold text-lg text-yellow-200">Stardust to Gem</h3>
          <p className="text-xs text-gray-400">
            Convert Stardust into precious Gems.
          </p>
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={(e) => {
              e.stopPropagation();
              onTrade();
          }}
          disabled={!canAfford}
          className={`
              px-4 py-2 rounded-md text-sm font-semibold w-32
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500
              ${canAfford ? 'bg-yellow-600 hover:bg-yellow-500 cursor-pointer' : 'bg-gray-600 cursor-not-allowed'}
          `}
        >
          <div className="text-center">
            <span className="font-bold">Trade for 1 💎</span>
            <span className="block text-xs text-gray-300">
              Cost: {formatNumber(cost)} ✨
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ClickConversionItem;
