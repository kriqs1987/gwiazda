import React from 'react';
import { GemShopItem, SelectedItem } from '../types';
import GemShopItemComponent from './GemShopItem';

interface GemShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GemShopItem[];
  gems: number;
  onBuy: (id: string) => void;
  onSelect: (id: string) => void;
  selectedItem: SelectedItem | null;
}

const GemShopModal: React.FC<GemShopModalProps> = ({ isOpen, onClose, items, gems, onBuy, onSelect, selectedItem }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border-2 border-yellow-500 rounded-lg shadow-2xl p-6 w-full max-w-lg relative animate-fade-in-down"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <h2 className="text-3xl font-bold text-yellow-300 text-center mb-4 drop-shadow-lg">Gem Shop</h2>
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-3xl font-bold leading-none p-2"
          aria-label="Close gem shop"
        >
          &times;
        </button>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-gray-700">
          {items.map(item => (
            <GemShopItemComponent
              key={item.id}
              item={item}
              gems={gems}
              onBuy={onBuy}
              onSelect={() => onSelect(item.id)}
              isSelected={selectedItem?.type === 'gem-shop' && selectedItem.id === item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GemShopModal;