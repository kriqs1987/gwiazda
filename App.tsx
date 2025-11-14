import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Generator, FloatingText as FloatingTextType, ResearchUpgrade, GemShopItem as GemShopItemType, SelectedItem as SelectedItemType } from './types';
import { 
    INITIAL_GENERATORS, 
    COST_MULTIPLIER, 
    UPGRADE_COST_MULTIPLIER, 
    UPGRADE_SPS_MULTIPLIER,
    INITIAL_CLICK_LEVEL, 
    CLICK_UPGRADE_BASE_COST, 
    CLICK_UPGRADE_COST_MULTIPLIER, 
    CLICK_POWER_PER_LEVEL,
    INITIAL_RESEARCH_UPGRADES,
    INITIAL_GEM_SHOP_ITEMS,
} from './constants';
import GeneratorItem from './components/GeneratorItem';
import ClickerArea from './components/ClickerArea';
import UpgradeItem from './components/UpgradeItem';
import ClickUpgradeItem from './components/ClickUpgradeItem';
import DetailsPanel from './components/DetailsPanel';
import ResearchItem from './components/ResearchItem';
import GemShopModal from './components/GemShopModal';

const SAVE_GAME_KEY = 'cosmicMinerIdleSave_v4'; // Incremented version to prevent loading old, incompatible saves

const loadGameState = (): { 
    initialStardust: number;
    initialResearchPoints: number;
    initialGems: number; 
    initialGenerators: Generator[]; 
    initialClickLevel: number; 
    initialResearchUpgrades: ResearchUpgrade[];
    initialGemShopItems: GemShopItemType[];
} => {
  try {
    const savedGame = localStorage.getItem(SAVE_GAME_KEY);
    if (!savedGame) {
      return { 
          initialStardust: 0, 
          initialResearchPoints: 0,
          initialGems: 20, // Starting gems
          initialGenerators: INITIAL_GENERATORS, 
          initialClickLevel: INITIAL_CLICK_LEVEL,
          initialResearchUpgrades: INITIAL_RESEARCH_UPGRADES,
          initialGemShopItems: INITIAL_GEM_SHOP_ITEMS,
      };
    }

    const savedState = JSON.parse(savedGame);

    const lastSaveTimestamp = savedState.lastSaveTimestamp || Date.now();
    const timeOfflineInSeconds = (Date.now() - lastSaveTimestamp) / 1000;
    
    const MAX_OFFLINE_SECONDS = 8 * 60 * 60; // 8 hours
    const effectiveOfflineTime = Math.min(timeOfflineInSeconds, MAX_OFFLINE_SECONDS);

    const loadedResearchUpgrades = INITIAL_RESEARCH_UPGRADES.map(initialRes => {
      const savedRes = savedState.researchUpgrades?.find((r: ResearchUpgrade) => r.id === initialRes.id);
      return savedRes ? { ...initialRes, isPurchased: savedRes.isPurchased } : initialRes;
    });

    const loadedGemShopItems = INITIAL_GEM_SHOP_ITEMS.map(initialItem => {
        const savedItem = savedState.gemShopItems?.find((i: GemShopItemType) => i.id === initialItem.id);
        if (initialItem.effect.type.startsWith('INSTANT_')) {
            return initialItem; // Consumables are always available
        }
        return savedItem ? { ...initialItem, isPurchased: savedItem.isPurchased } : initialItem;
    });

    const researchBonuses = loadedResearchUpgrades.reduce((bonuses, upgrade) => {
        if (upgrade.isPurchased) {
            switch (upgrade.effect.type) {
                case 'GLOBAL_SPS_MULTIPLIER':
                    bonuses.globalSpsMultiplier *= upgrade.effect.value;
                    break;
                case 'GENERATOR_SPS_MULTIPLIER':
                    if (upgrade.effect.generatorId) {
                        bonuses.generatorSpsMultipliers[upgrade.effect.generatorId] =
                            (bonuses.generatorSpsMultipliers[upgrade.effect.generatorId] || 1) * upgrade.effect.value;
                    }
                    break;
            }
        }
        return bonuses;
    }, { globalSpsMultiplier: 1, generatorSpsMultipliers: {} as { [key: number]: number } });
    
    // Apply permanent gem shop bonuses for offline calculation
    const gemSpsBonus = loadedGemShopItems
        .filter(item => item.isPurchased && item.effect.type === 'PERMANENT_SPS_BOOST')
        .reduce((total, item) => total * item.effect.value, 1);
    researchBonuses.globalSpsMultiplier *= gemSpsBonus;


    let totalOfflineSps = 0;
    const loadedGenerators = INITIAL_GENERATORS.map(initialGen => {
      const savedGen = savedState.generators?.find((g: Generator) => g.id === initialGen.id);
      const finalGen = {
        ...initialGen,
        count: savedGen?.count ?? 0,
        level: savedGen?.level ?? 1,
      };

      if (timeOfflineInSeconds > 10 && finalGen.count > 0) {
        const levelMultiplier = Math.pow(UPGRADE_SPS_MULTIPLIER, finalGen.level - 1);
        const researchMultiplier = researchBonuses.generatorSpsMultipliers[finalGen.id] || 1;
        const spsForThisGen = finalGen.count * finalGen.sps * levelMultiplier * researchMultiplier;
        totalOfflineSps += spsForThisGen;
      }
      return finalGen;
    });

    const offlineStardustGains = (totalOfflineSps * researchBonuses.globalSpsMultiplier) * effectiveOfflineTime;
    const totalStardust = (savedState.stardust || 0) + offlineStardustGains;
    
    let offlineResearchPointsGains = 0;
    if (totalOfflineSps > 0) {
        offlineResearchPointsGains = Math.floor(effectiveOfflineTime);
    }
    
    const loadedClickLevel = savedState.clickLevel || INITIAL_CLICK_LEVEL;
    const loadedResearchPoints = (savedState.researchPoints || 0) + offlineResearchPointsGains;
    const loadedGems = savedState.gems ?? 20; // Give gems to players from old saves

    return { 
        initialStardust: totalStardust, 
        initialResearchPoints: loadedResearchPoints,
        initialGems: loadedGems,
        initialGenerators: loadedGenerators, 
        initialClickLevel: loadedClickLevel,
        initialResearchUpgrades: loadedResearchUpgrades,
        initialGemShopItems: loadedGemShopItems,
    };
  } catch (error) {
    console.error("Failed to load or parse saved game. Resetting state.", error);
    localStorage.removeItem(SAVE_GAME_KEY);
    return { 
        initialStardust: 0, 
        initialResearchPoints: 0,
        initialGems: 20,
        initialGenerators: INITIAL_GENERATORS, 
        initialClickLevel: INITIAL_CLICK_LEVEL,
        initialResearchUpgrades: INITIAL_RESEARCH_UPGRADES,
        initialGemShopItems: INITIAL_GEM_SHOP_ITEMS,
    };
  }
};

function App() {
  const [{ 
      initialStardust, 
      initialResearchPoints,
      initialGems,
      initialGenerators, 
      initialClickLevel, 
      initialResearchUpgrades,
      initialGemShopItems
    }] = useState(loadGameState);

  const [stardust, setStardust] = useState<number>(initialStardust);
  const [researchPoints, setResearchPoints] = useState<number>(initialResearchPoints);
  const [gems, setGems] = useState<number>(initialGems);

  const [generators, setGenerators] = useState<Generator[]>(initialGenerators);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextType[]>([]);
  const [clickLevel, setClickLevel] = useState<number>(initialClickLevel);
  const [researchUpgrades, setResearchUpgrades] = useState<ResearchUpgrade[]>(initialResearchUpgrades);
  const [gemShopItems, setGemShopItems] = useState<GemShopItemType[]>(initialGemShopItems);

  const [activeTab, setActiveTab] = useState<'buy' | 'upgrades' | 'research'>('buy');
  const [showAutoSaveMessage, setShowAutoSaveMessage] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItemType | null>(null);
  const [isGemShopOpen, setIsGemShopOpen] = useState(false);

  const permanentBonuses = useMemo(() => {
    const bonuses = {
      globalSpsMultiplier: 1,
      clickPowerMultiplier: 1,
      generatorSpsMultipliers: {} as { [key: number]: number },
    };

    researchUpgrades.forEach(upgrade => {
      if (upgrade.isPurchased) {
        switch (upgrade.effect.type) {
          case 'GLOBAL_SPS_MULTIPLIER':
            bonuses.globalSpsMultiplier *= upgrade.effect.value;
            break;
          case 'CLICK_POWER_MULTIPLIER':
            bonuses.clickPowerMultiplier *= upgrade.effect.value;
            break;
          case 'GENERATOR_SPS_MULTIPLIER':
            if (upgrade.effect.generatorId) {
              bonuses.generatorSpsMultipliers[upgrade.effect.generatorId] = 
                (bonuses.generatorSpsMultipliers[upgrade.effect.generatorId] || 1) * upgrade.effect.value;
            }
            break;
        }
      }
    });

    gemShopItems.forEach(item => {
        if(item.isPurchased) {
            if(item.effect.type === 'PERMANENT_SPS_BOOST') {
                bonuses.globalSpsMultiplier *= item.effect.value;
            }
            if(item.effect.type === 'PERMANENT_CLICK_BOOST') {
                bonuses.clickPowerMultiplier *= item.effect.value;
            }
        }
    });

    return bonuses;
  }, [researchUpgrades, gemShopItems]);


  const stardustPerSecond = useMemo(() => {
    const baseSps = generators.reduce((total, gen) => {
      const levelMultiplier = Math.pow(UPGRADE_SPS_MULTIPLIER, gen.level - 1);
      const researchMultiplier = permanentBonuses.generatorSpsMultipliers[gen.id] || 1;
      return total + gen.count * gen.sps * levelMultiplier * researchMultiplier;
    }, 0);
    return baseSps * permanentBonuses.globalSpsMultiplier;
  }, [generators, permanentBonuses]);

  const clickValue = useMemo(() => {
    const baseClickValue = 1 + (clickLevel - 1) * CLICK_POWER_PER_LEVEL;
    return baseClickValue * permanentBonuses.clickPowerMultiplier;
  }, [clickLevel, permanentBonuses]);

  useEffect(() => {
    const gameTick = setInterval(() => {
      setStardust(prev => prev + stardustPerSecond / 10);
    }, 100);

    return () => clearInterval(gameTick);
  }, [stardustPerSecond]);
  
  useEffect(() => {
    const researchPointInterval = setInterval(() => {
      // Award 1 research point every second as long as the player has started generating stardust.
      // This prevents players from idling at the very beginning to farm points.
      if (stardustPerSecond > 0) {
        setResearchPoints(prev => prev + 1);
      }
    }, 1000); // 1 second

    return () => clearInterval(researchPointInterval);
  }, [stardustPerSecond]);

  const saveGame = useCallback(() => {
    try {
      const gameState = {
        stardust,
        researchPoints,
        gems,
        generators,
        clickLevel,
        researchUpgrades,
        gemShopItems,
        lastSaveTimestamp: Date.now(),
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  }, [stardust, researchPoints, gems, generators, clickLevel, researchUpgrades, gemShopItems]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGame();
      setShowAutoSaveMessage(true);
      setTimeout(() => setShowAutoSaveMessage(false), 2000);
    }, 15000);
    return () => clearInterval(saveInterval);
  }, [saveGame]);
  
  const handleManualSave = () => {
    saveGame();
  };

  const handleManualLoad = () => {
    saveGame();
    window.location.reload();
  };

  const calculateCost = useCallback((generator: Generator): number => {
    return Math.ceil(generator.baseCost * Math.pow(COST_MULTIPLIER, generator.count));
  }, []);

  const calculateUpgradeCost = useCallback((generator: Generator): number => {
    return Math.ceil(generator.baseUpgradeCost * Math.pow(UPGRADE_COST_MULTIPLIER, generator.level - 1));
  }, []);
  
  const calculateClickUpgradeCost = useCallback(() => {
    return Math.ceil(CLICK_UPGRADE_BASE_COST * Math.pow(CLICK_UPGRADE_COST_MULTIPLIER, clickLevel - 1));
  }, [clickLevel]);

  const handleMainClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const currentClickValue = clickValue;
    setStardust(prev => prev + currentClickValue);
    const newFloatingText: FloatingTextType = {
        id: Date.now(),
        text: `+${currentClickValue.toFixed(1)}`,
        x: e.clientX,
        y: e.clientY,
    };
    setFloatingTexts(prev => [...prev, newFloatingText]);
  }, [clickValue]);

  const handleBuyGenerator = (generatorId: number) => {
    const generator = generators.find(g => g.id === generatorId);
    if (!generator) return;
    const cost = calculateCost(generator);
    if (stardust >= cost) {
      setStardust(prev => prev - cost);
      setGenerators(prev => prev.map(g => g.id === generatorId ? { ...g, count: g.count + 1 } : g));
    }
  };
  
  const handleUpgradeClicker = () => {
      const cost = calculateClickUpgradeCost();
      if (stardust >= cost) {
          setStardust(prev => prev - cost);
          setClickLevel(prev => prev + 1);
      }
  };

  const handleUpgradeGenerator = (generatorId: number) => {
    const generator = generators.find(g => g.id === generatorId);
    if (!generator || generator.count === 0) return;
    const cost = calculateUpgradeCost(generator);
    if (stardust >= cost) {
      setStardust(prev => prev - cost);
      setGenerators(prev => prev.map(g => g.id === generatorId ? { ...g, level: g.level + 1 } : g));
    }
  };
  
  const handleBuyResearch = (researchId: string) => {
    const research = researchUpgrades.find(r => r.id === researchId);
    if (!research || research.isPurchased || researchPoints < research.cost) return;
    setResearchPoints(prev => prev - research.cost);
    setResearchUpgrades(prev => prev.map(r => r.id === researchId ? { ...r, isPurchased: true } : r));
  };

  const handleBuyGemItem = (itemId: string) => {
    const item = gemShopItems.find(i => i.id === itemId);
    if (!item || gems < item.cost) return;
    if (item.effect.type.startsWith('PERMANENT_') && item.isPurchased) return;

    setGems(prev => prev - item.cost);

    switch(item.effect.type) {
      case 'INSTANT_STARDUST':
        setStardust(prev => prev + stardustPerSecond * item.effect.value);
        break;
      case 'INSTANT_CLICKS':
        setStardust(prev => prev + clickValue * item.effect.value);
        break;
      default: // Permanent items
        setGemShopItems(prev => prev.map(i => i.id === itemId ? { ...i, isPurchased: true } : i));
        break;
    }
  };


  const removeFloatingText = (id: number) => {
    setFloatingTexts(prev => prev.filter(text => text.id !== id));
  };
  
  const tabButtonStyle = (tabName: 'buy' | 'upgrades' | 'research') => `
    flex-1 py-3 text-center font-semibold text-lg transition-colors duration-300
    focus:outline-none
    ${activeTab === tabName 
      ? 'bg-purple-800 bg-opacity-50 text-white border-b-2 border-purple-400' 
      : 'text-gray-400 hover:bg-purple-900 hover:bg-opacity-20'}
  `;

  return (
    <div className="relative flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white font-sans antialiased">
      {showAutoSaveMessage && (
         <div className="absolute top-4 right-4 bg-gray-700 bg-opacity-80 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-down">
            <span>Auto-saved... 💾</span>
        </div>
      )}

      <div className="w-full md:w-2/3 flex flex-col items-center justify-center p-4">
        <ClickerArea
          stardust={stardust}
          stardustPerSecond={stardustPerSecond}
          researchPoints={researchPoints}
          gems={gems}
          onClick={handleMainClick}
          floatingTexts={floatingTexts}
          removeFloatingText={removeFloatingText}
        />
      </div>

      <aside className="w-full md:w-1/3 h-full bg-black bg-opacity-30 backdrop-blur-sm border-l border-purple-500 border-opacity-50 flex flex-col">
        <h2 className="text-3xl font-bold text-center p-4 shadow-lg">Cosmic HQ</h2>
        <div className="flex border-b border-t border-purple-500 border-opacity-50">
            <button onClick={() => setActiveTab('buy')} className={tabButtonStyle('buy')}>Buy</button>
            <button onClick={() => setActiveTab('upgrades')} className={tabButtonStyle('upgrades')}>Upgrade</button>
            <button onClick={() => setActiveTab('research')} className={tabButtonStyle('research')}>Research</button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {activeTab === 'buy' && generators.map(gen => (
            <GeneratorItem
              key={gen.id}
              generator={gen}
              stardust={stardust}
              cost={calculateCost(gen)}
              onBuy={handleBuyGenerator}
              onSelect={() => setSelectedItem({type: 'generator', id: gen.id})}
              isSelected={selectedItem?.type === 'generator' && selectedItem.id === gen.id}
            />
          ))}
          {activeTab === 'upgrades' && (
            <>
              <ClickUpgradeItem
                level={clickLevel}
                stardust={stardust}
                cost={calculateClickUpgradeCost()}
                onUpgrade={handleUpgradeClicker}
                currentPower={clickValue}
                onSelect={() => setSelectedItem({type: 'clicker', id: 'clicker'})}
                isSelected={selectedItem?.type === 'clicker'}
              />
              {generators.map(gen => (
                <UpgradeItem
                  key={gen.id}
                  generator={gen}
                  stardust={stardust}
                  cost={calculateUpgradeCost(gen)}
                  onUpgrade={handleUpgradeGenerator}
                  onSelect={() => setSelectedItem({type: 'sps-upgrade', id: gen.id})}
                  isSelected={selectedItem?.type === 'sps-upgrade' && selectedItem.id === gen.id}
                />
              ))}
            </>
          )}
          {activeTab === 'research' && researchUpgrades.map(res => (
              <ResearchItem
                key={res.id}
                research={res}
                researchPoints={researchPoints}
                onBuy={handleBuyResearch}
                onSelect={() => setSelectedItem({type: 'research', id: res.id})}
                isSelected={selectedItem?.type === 'research' && selectedItem.id === res.id}
              />
          ))}
        </div>
        <DetailsPanel
            selectedItem={selectedItem}
            generators={generators}
            clickLevel={clickLevel}
            calculateCost={calculateCost}
            calculateUpgradeCost={calculateUpgradeCost}
            calculateClickUpgradeCost={calculateClickUpgradeCost}
            researchUpgrades={researchUpgrades}
            gemShopItems={gemShopItems}
            stardustPerSecond={stardustPerSecond}
            clickValue={clickValue}
        />
         <div className="flex-shrink-0 p-2 border-t border-purple-500 border-opacity-50 bg-black bg-opacity-20 flex space-x-2">
            <button onClick={handleManualSave} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors duration-200">Save Game</button>
            <button onClick={handleManualLoad} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors duration-200">Load Game</button>
        </div>
      </aside>
      
      <button 
        onClick={() => setIsGemShopOpen(true)}
        className="fixed bottom-4 left-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-full shadow-lg transition-transform duration-200 transform hover:scale-105"
      >
        Gem Shop 💎
      </button>

      <GemShopModal
        isOpen={isGemShopOpen}
        onClose={() => setIsGemShopOpen(false)}
        items={gemShopItems}
        gems={gems}
        onBuy={handleBuyGemItem}
        onSelect={(id) => setSelectedItem({type: 'gem-shop', id})}
        selectedItem={selectedItem}
      />

    </div>
  );
}

export default App;