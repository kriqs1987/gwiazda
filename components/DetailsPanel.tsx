import React from 'react';
import { Generator, ResearchUpgrade, SelectedItem, GemShopItem } from '../types';
import { UPGRADE_SPS_MULTIPLIER, CLICK_POWER_PER_LEVEL } from '../constants';

interface DetailsPanelProps {
    selectedItem: SelectedItem | null;
    generators: Generator[];
    researchUpgrades: ResearchUpgrade[];
    gemShopItems: GemShopItem[];
    clickLevel: number;
    stardustPerSecond: number;
    clickValue: number;
    calculateCost: (generator: Generator) => number;
    calculateUpgradeCost: (generator: Generator) => number;
    calculateClickUpgradeCost: () => number;
}

const formatNumber = (num: number): string => {
    if (num < 1000) return num.toLocaleString(undefined, {maximumFractionDigits: 1});
    const suffixes = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi'];
    const i = Math.floor(Math.log10(num) / 3);
    if (i >= suffixes.length) return num.toExponential(2);
    const shortNum = (num / Math.pow(1000, i)).toFixed(2);
    return shortNum + suffixes[i];
};

const DetailsPanel: React.FC<DetailsPanelProps> = ({ 
    selectedItem, 
    generators, 
    clickLevel, 
    researchUpgrades, 
    gemShopItems,
    stardustPerSecond,
    clickValue,
    calculateCost, 
    calculateUpgradeCost, 
    calculateClickUpgradeCost 
}) => {

    if (!selectedItem) {
        return (
            <div className="h-48 flex items-center justify-center text-gray-500 border-t border-purple-500 border-opacity-50 p-4">
                <p>Select an item above to see details</p>
            </div>
        );
    }

    const renderContent = () => {
        const { type, id } = selectedItem;

        if (type === 'clicker') {
            const cost = calculateClickUpgradeCost();
            const currentPower = 1 + (clickLevel - 1) * CLICK_POWER_PER_LEVEL;
            const nextPower = currentPower + CLICK_POWER_PER_LEVEL;
            return (
                <div className="space-y-1 text-left">
                    <p className="font-bold text-green-300 text-base">Upgrade: Manual Amplifier 🖱️</p>
                    <p className="text-gray-300 italic text-sm">"Increases the energy output of each manual interaction with the cosmic aether."</p>
                    <hr className="border-gray-600 my-1"/>
                    <p>Current Level: <span className="font-semibold text-white">{clickLevel}</span></p>
                    <p>Stardust/click: <span className="font-semibold text-white">{currentPower.toFixed(1)}</span></p>
                    <p className="text-green-400">Next Level: <span className="font-semibold">{nextPower.toFixed(1)} Stardust/click</span></p>
                    <p>Upgrade Cost: <span className="font-semibold text-white">{formatNumber(cost)} Stardust</span></p>
                </div>
            );
        }

        if (type === 'research') {
            const research = researchUpgrades.find(r => r.id === id);
            if (!research) return null;
            let bonusText = '';
            switch(research.effect.type) {
                case 'GLOBAL_SPS_MULTIPLIER': bonusText = `+${((research.effect.value - 1) * 100).toFixed(0)}% to all Stardust generation.`; break;
                case 'CLICK_POWER_MULTIPLIER': bonusText = `+${((research.effect.value - 1) * 100).toFixed(0)}% to click power.`; break;
                case 'GENERATOR_SPS_MULTIPLIER': bonusText = `+${((research.effect.value - 1) * 100).toFixed(0)}% to a specific generator's output.`; break;
            }
            return (
                <div className="space-y-1 text-left">
                    <p className="font-bold text-cyan-300 text-base">Research: {research.name} {research.icon}</p>
                    <p className="text-gray-300 italic text-sm">"{research.description}"</p>
                    <hr className="border-gray-600 my-1"/>
                    <p>Effect: <span className="font-semibold text-white">{bonusText}</span></p>
                    <p>Cost: <span className="font-semibold text-white">{formatNumber(research.cost)} Research Points</span></p>
                    {research.isPurchased && <p className="text-green-400 mt-2 text-sm">This research has been completed.</p>}
                </div>
            );
        }

        if (type === 'gem-shop') {
            const item = gemShopItems.find(i => i.id === id);
            if (!item) return null;
            let effectText = '';
            switch(item.effect.type) {
                case 'PERMANENT_SPS_BOOST': effectText = `Permanently boosts all SPS by ${((item.effect.value - 1) * 100).toFixed(0)}%.`; break;
                case 'PERMANENT_CLICK_BOOST': effectText = `Permanently boosts click power by ${((item.effect.value - 1) * 100).toFixed(0)}%.`; break;
                case 'INSTANT_STARDUST': effectText = `Instantly gain ${item.effect.value / 3600} hour(s) of Stardust production (${formatNumber(stardustPerSecond * item.effect.value)} Stardust).`; break;
                case 'INSTANT_CLICKS': effectText = `Instantly gain Stardust from ${item.effect.value} clicks (${formatNumber(clickValue * item.effect.value)} Stardust).`; break;
            }
            return (
                <div className="space-y-1 text-left">
                    <p className="font-bold text-yellow-300 text-base">{item.name} {item.icon}</p>
                    <p className="text-gray-300 italic text-sm">"{item.description}"</p>
                    <hr className="border-gray-600 my-1"/>
                    <p>Effect: <span className="font-semibold text-white">{effectText}</span></p>
                    <p>Cost: <span className="font-semibold text-white">{item.cost} Gems 💎</span></p>
                    {item.isPurchased && <p className="text-green-400 mt-2 text-sm">This permanent upgrade has been purchased.</p>}
                </div>
            );
        }
        
        const generator = generators.find(g => g.id === id);
        if (!generator) return null;

        if (type === 'generator') {
            const cost = calculateCost(generator);
            const totalSps = generator.count * generator.sps * Math.pow(UPGRADE_SPS_MULTIPLIER, generator.level - 1);
            return (
                <div className="space-y-1 text-left">
                    <p className="font-bold text-purple-300 text-base">{generator.name} {generator.icon}</p>
                    <p className="text-gray-300 italic text-sm">"{generator.description}"</p>
                    <hr className="border-gray-600 my-1"/>
                    <p>Owned: <span className="font-semibold text-white">{generator.count}</span></p>
                    <p>Total SPS: <span className="font-semibold text-white">{formatNumber(totalSps)}</span></p>
                    <p>Next Cost: <span className="font-semibold text-white">{formatNumber(cost)} Stardust</span></p>
                </div>
            );
        } else if (type === 'sps-upgrade') {
            const cost = calculateUpgradeCost(generator);
            const currentBonus = (Math.pow(UPGRADE_SPS_MULTIPLIER, generator.level - 1) - 1) * 100;
            const nextBonus = (Math.pow(UPGRADE_SPS_MULTIPLIER, generator.level) - 1) * 100;
            return (
                <div className="space-y-1 text-left">
                    <p className="font-bold text-green-300 text-base">SPS Upgrade: {generator.name} {generator.icon}</p>
                    <hr className="border-gray-600 my-1"/>
                    <p>Current Level: <span className="font-semibold text-white">{generator.level}</span></p>
                    <p>Current SPS Bonus: <span className="font-semibold text-white">+{currentBonus.toFixed(0)}%</span></p>
                    <p className="text-green-400">Next Level: <span className="font-semibold">+{nextBonus.toFixed(0)}% SPS Bonus</span></p>
                    <p>Upgrade Cost: <span className="font-semibold text-white">{formatNumber(cost)} Stardust</span></p>
                </div>
            );
        }
    };

    return (
        <div className="h-48 flex-shrink-0 p-4 border-t border-purple-500 border-opacity-50 bg-black bg-opacity-20 text-sm">
            {renderContent()}
        </div>
    );
};

export default DetailsPanel;