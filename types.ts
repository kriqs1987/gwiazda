export interface Generator {
  id: number;
  name: string;
  description: string;
  count: number;
  level: number; // Production level
  baseCost: number;
  baseUpgradeCost: number; // Production upgrade cost
  sps: number; // Stardust Per Second
  icon: string;
}

export interface FloatingText {
    id: number;
    text: string;
    x: number;
    y: number;
}

export interface ResearchUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number; // Research points
  isPurchased: boolean;
  icon: string;
  effect: {
    type: 'GLOBAL_SPS_MULTIPLIER' | 'CLICK_POWER_MULTIPLIER' | 'GENERATOR_SPS_MULTIPLIER';
    value: number;
    generatorId?: number; // Only for GENERATOR_SPS_MULTIPLIER
  };
}

export interface GemShopItem {
  id: string;
  name: string;
  description: string;
  cost: number; // Gems
  isPurchased: boolean;
  icon: string;
  effect: {
    type: 'PERMANENT_SPS_BOOST' | 'PERMANENT_CLICK_BOOST' | 'INSTANT_STARDUST' | 'INSTANT_CLICKS';
    value: number; // Multiplier or absolute value
  };
}

export type SelectedItem = 
  | { type: 'generator'; id: number }
  | { type: 'sps-upgrade'; id: number }
  | { type: 'clicker'; id: 'clicker' }
  | { type: 'research'; id: string }
  | { type: 'gem-shop'; id: string };