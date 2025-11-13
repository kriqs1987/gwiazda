import { Generator, ResearchUpgrade } from './types';

export const INITIAL_GENERATORS: Generator[] = [
  {
    id: 1,
    name: 'Stardust Probe',
    description: 'Automated probe that collects space dust.',
    count: 0,
    level: 1,
    baseCost: 15,
    baseUpgradeCost: 75,
    sps: 0.1,
    icon: '🛰️',
  },
  {
    id: 2,
    name: 'Asteroid Miner',
    description: 'Drills into asteroids for valuable resources.',
    count: 0,
    level: 1,
    baseCost: 100,
    baseUpgradeCost: 500,
    sps: 1,
    icon: '⛏️',
  },
  {
    id: 3,
    name: 'Nebula Harvester',
    description: 'Gathers gas and particles from nebulae.',
    count: 0,
    level: 1,
    baseCost: 1100,
    baseUpgradeCost: 6000,
    sps: 8,
    icon: '💨',
  },
  {
    id: 4,
    name: 'Comet Catcher',
    description: 'Intercepts and mines icy comets.',
    count: 0,
    level: 1,
    baseCost: 12000,
    baseUpgradeCost: 65000,
    sps: 47,
    icon: '☄️',
  },
  {
    id: 5,
    name: 'Dyson Swarm Bot',
    description: 'A small bot that collects solar energy.',
    count: 0,
    level: 1,
    baseCost: 130000,
    baseUpgradeCost: 700000,
    sps: 260,
    icon: '🤖',
  },
];

export const COST_MULTIPLIER = 1.15;
export const UPGRADE_COST_MULTIPLIER = 1.8;
export const UPGRADE_SPS_MULTIPLIER = 1.15; // Each level multiplies SPS by 1.15

// Click Upgrade Constants
export const INITIAL_CLICK_LEVEL = 1;
export const CLICK_UPGRADE_BASE_COST = 50;
export const CLICK_UPGRADE_COST_MULTIPLIER = 2.5;
export const CLICK_POWER_PER_LEVEL = 1;

// Research Constants
export const RESEARCH_POINTS_PER_SECOND = 0.1; // 1 every 10 seconds

export const INITIAL_RESEARCH_UPGRADES: ResearchUpgrade[] = [
  {
    id: 'res_global_sps_1',
    name: 'Advanced Processing',
    description: 'Improves the efficiency of all stardust collection methods.',
    cost: 10,
    isPurchased: false,
    icon: '🔬',
    effect: {
      type: 'GLOBAL_SPS_MULTIPLIER',
      value: 1.2, // +20%
    }
  },
  {
    id: 'res_click_power_1',
    name: 'Reinforced Exoskeleton',
    description: 'Strengthens your clicking apparatus for double the output.',
    cost: 25,
    isPurchased: false,
    icon: '💪',
    effect: {
      type: 'CLICK_POWER_MULTIPLIER',
      value: 2, // +100%
    }
  },
  {
    id: 'res_probe_sps_1',
    name: 'Optimized Probes',
    description: 'Equips Stardust Probes with better sensors, improving their yield.',
    cost: 50,
    isPurchased: false,
    icon: '📡',
    effect: {
      type: 'GENERATOR_SPS_MULTIPLIER',
      value: 1.5, // +50%
      generatorId: 1, // Stardust Probe
    }
  },
  {
    id: 'res_miner_sps_1',
    name: 'High-Yield Drills',
    description: 'Upgrades Asteroid Miners with more powerful drills.',
    cost: 100,
    isPurchased: false,
    icon: '💎',
    effect: {
      type: 'GENERATOR_SPS_MULTIPLIER',
      value: 1.5, // +50%
      generatorId: 2, // Asteroid Miner
    }
  },
  {
    id: 'res_comet_sps_1',
    name: 'Cometary Mining Lasers',
    description: 'Outfit Comet Catchers with high-intensity lasers, increasing their mining efficiency.',
    cost: 150,
    isPurchased: false,
    icon: '💥',
    effect: {
      type: 'GENERATOR_SPS_MULTIPLIER',
      value: 1.25, // +25%
      generatorId: 4, // Comet Catcher
    }
  }
];