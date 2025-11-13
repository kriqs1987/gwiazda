import React from 'react';
import { Generator, ResearchUpgrade } from '../types';
import { UPGRADE_SPS_MULTIPLIER, CLICK_POWER_PER_LEVEL } from '../constants';

interface DetailsPanelProps {
    selectedItem: Generator | ResearchUpgrade | 'clicker' | null;
    activeTab: 'buy' | 'upgrades' | 'research';
    stardust: number;
    clickLevel: number;
    calculateCost: (generator: Generator) => number;
    calculateUpgradeCost: (generator: Generator) => number;
    calculateClickUpgradeCost: () => number;
}

const formatNumber = (num: number): string => {
    if (num < 1000) return num.toLocaleString();
    const suffixes = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi'];
    const i = Math.floor(Math.log10(num) / 3);
    if (i >= suffixes.length) return num.toExponential(2);
    const shortNum = (num / Math.pow(1000, i)).toFixed(2);
    return shortNum + suffixes[i];
};

const formatNumberDetailed = (num: number): string => {
    if (num === 0) return '0.00';
    if (num < 0.1) return num.toFixed(3);
    if (num < 10) return num.toFixed(2);
    return formatNumber(num);
};

const DetailsPanel: React.FC<DetailsPanelProps> = ({ selectedItem, activeTab, clickLevel, calculateCost, calculateUpgradeCost, calculateClickUpgradeCost }) => {

    if (!selectedItem) {
        return (
            <div className="h-48 flex items-center justify-center text-gray-500 border-t border-purple-500 border-opacity-50 p-4">
                <p>Click an item above to see details</p>
            </div>
        );
    }

    const renderContent = () => {
        if (selectedItem === 'clicker') {
            const cost = calculateClickUpgradeCost();
            const currentPower = 1 + (clickLevel - 1) * CLICK_POWER_PER_LEVEL;
            const nextPower = currentPower + CLICK_POWER_PER_LEVEL;

            return (
                <div className="space-y-1 text-left">
                    <p className="font-bold text-green-300 text-base">Upgrade: Manual Amplifier 🖱️</p>
                    <p className="text-gray-300 italic text-sm">"Boosts the energy output of each manual interaction with the cosmic ether."</p>
                    <hr className="border-gray-600 my-1"/>
                    <p>Current Level: <span className="font-semibold text-white">{clickLevel}</span></p>
                    <p>Current Stardust/Click: <span className="font-semibold text-white">{currentPower}</span></p>
                    <p className="text-green-400">Next Level {clickLevel + 1}: <span className="font-semibold">{nextPower} Stardust/Click</span></p>
                    <p>Upgrade Cost: <span className="font-semibold text-white">{formatNumber(cost)}</span></p>
                </div>
            );
        }

        if (typeof selectedItem === 'object' && 'isPurchased' in selectedItem) {
            const research = selectedItem as ResearchUpgrade;
            let bonusText = '';
            switch(research.effect.type) {
                case 'GLOBAL_SPS_MULTIPLIER':
                    bonusText = `+${((research.effect.value - 1) * 100).toFixed(0)}% to all Stardust generation.`;
                    break;
                case 'CLICK_POWER_MULTIPLIER':
                    bonusText = `+${((research.effect.value - 1) * 100).toFixed(0)}% to click power.`;
                    break;
                case 'GENERATOR_SPS_MULTIPLIER':
                    bonusText = `+${((research.effect.value - 1) * 100).toFixed(0)}% to a specific generator's output.`;
                    break;
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

        const generator = selectedItem as Generator;
        if (activeTab === 'buy') {
            const cost = calculateCost(generator);
            const totalSps = generator.count * generator.sps * Math.pow(UPGRADE_SPS_MULTIPLIER, generator.level - 1);
            return (
                <div className="space-y-1 text-left">
                    <p className="font-bold text-purple-300 text-base">{generator.name} {generator.icon}</p>
                    <p className="text-gray-300 italic text-sm">"{generator.description}"</p>
                    <hr className="border-gray-600 my-1"/>
                    <p>Owned: <span className="font-semibold text-white">{generator.count}</span></p>
                    <p>Base SPS/unit: <span className="font-semibold text-white">{generator.sps}</span></p>
                    <p>Total SPS: <span className="font-semibold text-white">{formatNumberDetailed(totalSps)}</span></p>
                    <p>Next Cost: <span className="font-semibold text-white">{formatNumber(cost)}</span></p>
                </div>
            );
        } else { // 'upgrades' tab
            const cost = calculateUpgradeCost(generator);
            const currentBonus = (Math.pow(UPGRADE_SPS_MULTIPLIER, generator.level - 1) - 1) * 100;
            const nextBonus = (Math.pow(UPGRADE_SPS_MULTIPLIER, generator.level) - 1) * 100;
            const isOwned = generator.count > 0;

            return (
                <div className="space-y-1 text-left">
                    <p className="font-bold text-green-300 text-base">Upgrade: {generator.name} {generator.icon}</p>
                    <hr className="border-gray-600 my-1"/>
                    <p>Current Level: <span className="font-semibold text-white">{generator.level}</span></p>
                    <p>Current SPS Bonus: <span className="font-semibold text-white">+{currentBonus.toFixed(0)}%</span></p>
                    <p className="text-green-400">Next Level {generator.level + 1}: <span className="font-semibold">+{nextBonus.toFixed(0)}% SPS Bonus</span></p>
                    <p>Upgrade Cost: <span className="font-semibold text-white">{formatNumber(cost)}</span></p>
                    {!isOwned && <p className="text-yellow-400 mt-2 text-sm">You must own at least one to upgrade it.</p>}
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