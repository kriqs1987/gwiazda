import React from 'react';
import { GemShopItem } from '../types';

interface GemShopItemProps {
  item: GemShopItem;
  gems: number;
  onBuy: (id: string) => void;
  onSelect: () => void;
  isSelected: boolean;
}

const GemShopItemComponent: React.FC<GemShopItemProps> = ({ item, gems, onBuy, onSelect, isSelected }) => {
  const canAfford = gems >= item.cost;
  const canBuy = canAfford && !item.isPurchased;

  return (
    <div 
      onClick={onSelect}
      className={`
        flex items-center justify-between p-3 rounded-lg w-full cursor-pointer
        bg-gray-800 bg-opacity-50 border 
        ${isSelected ? 'border-yellow-400 ring-1 ring-yellow-500' : 'border-gray-700'}
        transition-all duration-300
        ${item.isPurchased ? 'opacity-50' : ''}
        ${canBuy ? 'hover:bg-yellow-800 hover:border-yellow-600' : ''}
      `}
    >
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{item.icon}</div>
        <div>
          <h3 className="font-bold text-lg text-yellow-200">{item.name}</h3>
          <p className="text-xs text-gray-400">{item.description}</p>
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={(e) => {
              e.stopPropagation();
              onBuy(item.id);
          }}
          disabled={!canBuy}
          className={`
            px-4 py-2 rounded-md text-sm font-semibold w-32
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500
            ${item.isPurchased ? 'bg-gray-700' : canBuy ? 'bg-yellow-600 hover:bg-yellow-500 cursor-pointer' : 'bg-gray-600 cursor-not-allowed'}
          `}
        >
          {item.isPurchased ? (
            <span className="font-bold">Purchased</span>
          ) : (
            <div className="text-center">
              <span className="font-bold">Buy</span>
              <span className="block text-xs text-gray-300">
                {item.cost} Gems 💎
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default GemShopItemComponent;