export interface Generator {
  id: number;
  name: string;
  description: string;
  count: number;
  level: number;
  baseCost: number;
  baseUpgradeCost: number;
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
