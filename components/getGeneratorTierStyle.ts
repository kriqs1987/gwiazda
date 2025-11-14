import React from 'react';

export const getGeneratorTierStyle = (level: number): React.CSSProperties => {
  if (level >= 50) {
    return {
      filter: 'drop-shadow(0 0 8px #a855f7) drop-shadow(0 0 3px #fde047)',
    };
  }
  if (level >= 25) {
    return {
      filter: 'drop-shadow(0 0 6px #e5e7eb)',
      color: '#e5e7eb',
    };
  }
  if (level >= 10) {
    return {
      filter: 'drop-shadow(0 0 5px #d97706)',
      color: '#fcd34d',
    };
  }
  return {};
};
