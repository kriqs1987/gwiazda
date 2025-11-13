import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Generator, FloatingText as FloatingTextType, ResearchUpgrade } from './types';
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
    RESEARCH_POINTS_PER_SECOND
} from './constants';
import GeneratorItem from './components/GeneratorItem';
import ClickerArea from './components/ClickerArea';
import UpgradeItem from './components/UpgradeItem';
import ClickUpgradeItem from './components/ClickUpgradeItem';
import DetailsPanel from './components/DetailsPanel';
import ResearchItem from './components/ResearchItem';

const SAVE_GAME_KEY = 'cosmicMinerIdleSave';

const formatNumberBrief = (num: number): string => {
  if (num < 1000) return num.toFixed(1);
  const suffixes = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi'];
  const i = Math.floor(Math.log10(num) / 3);
  if (i >= suffixes.length) return num.toExponential(2);
  const shortNum = (num / Math.pow(1000, i)).toFixed(2);
  return shortNum + suffixes[i];
};

const loadGameState = (): { 
    initialStardust: number; 
    initialGenerators: Generator[]; 
    offlineGains: number; 
    initialClickLevel: number; 
    initialResearchPoints: number;
    initialResearchUpgrades: ResearchUpgrade[];
} => {
  try {
    const savedGame = localStorage.getItem(SAVE_GAME_KEY);
    if (!savedGame) {
      return { 
          initialStardust: 0, 
          initialGenerators: INITIAL_GENERATORS, 
          offlineGains: 0, 
          initialClickLevel: INITIAL_CLICK_LEVEL,
          initialResearchPoints: 0,
          initialResearchUpgrades: INITIAL_RESEARCH_UPGRADES,
      };
    }

    const savedState = JSON.parse(savedGame);

    const loadedGenerators = INITIAL_GENERATORS.map(initialGen => {
      const savedGen = savedState.generators?.find((g: Generator) => g.id === initialGen.id);
      return savedGen ? { ...initialGen, ...savedGen } : initialGen;
    });

    let loadedStardust = savedState.stardust || 0;
    const lastSaveTimestamp = savedState.lastSaveTimestamp || Date.now();
    const timeOfflineInSeconds = (Date.now() - lastSaveTimestamp) / 1000;
    
    const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
    const effectiveOfflineTime = Math.min(timeOfflineInSeconds, MAX_OFFLINE_SECONDS);
    
    let offlineGains = 0;
    if (timeOfflineInSeconds > 10) {
      const offlineSps = loadedGenerators.reduce((total, gen) => {
        const levelMultiplier = Math.pow(UPGRADE_SPS_MULTIPLIER, gen.level - 1);
        return total + gen.count * gen.sps * levelMultiplier;
      }, 0);
      offlineGains = offlineSps * effectiveOfflineTime;
      loadedStardust += offlineGains;
    }

    const loadedResearchUpgrades = INITIAL_RESEARCH_UPGRADES.map(initialRes => {
        const savedRes = savedState.researchUpgrades?.find((r: ResearchUpgrade) => r.id === initialRes.id);
        return savedRes ? { ...initialRes, isPurchased: savedRes.isPurchased } : initialRes;
    });

    let loadedResearchPoints = savedState.researchPoints || 0;
    const offlineResearchGains = RESEARCH_POINTS_PER_SECOND * effectiveOfflineTime;
    loadedResearchPoints += offlineResearchGains;
    
    const loadedClickLevel = savedState.clickLevel || INITIAL_CLICK_LEVEL;

    return { 
        initialStardust: loadedStardust, 
        initialGenerators: loadedGenerators, 
        offlineGains, 
        initialClickLevel: loadedClickLevel,
        initialResearchPoints: loadedResearchPoints,
        initialResearchUpgrades: loadedResearchUpgrades,
    };
  } catch (error) {
    console.error("Failed to load or parse saved game. Resetting state.", error);
    localStorage.removeItem(SAVE_GAME_KEY);
    return { 
        initialStardust: 0, 
        initialGenerators: INITIAL_GENERATORS, 
        offlineGains: 0, 
        initialClickLevel: INITIAL_CLICK_LEVEL,
        initialResearchPoints: 0,
        initialResearchUpgrades: INITIAL_RESEARCH_UPGRADES,
    };
  }
};


function App() {
  const [{ initialStardust, initialGenerators, offlineGains, initialClickLevel, initialResearchPoints, initialResearchUpgrades }] = useState(loadGameState);

  const [stardust, setStardust] = useState<number>(initialStardust);
  const [generators, setGenerators] = useState<Generator[]>(initialGenerators);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextType[]>([]);
  const [clickLevel, setClickLevel] = useState<number>(initialClickLevel);
  const [researchPoints, setResearchPoints] = useState<number>(initialResearchPoints);
  const [researchUpgrades, setResearchUpgrades] = useState<ResearchUpgrade[]>(initialResearchUpgrades);
  const [activeTab, setActiveTab] = useState<'buy' | 'upgrades' | 'research'>('buy');
  const [showOfflineGains, setShowOfflineGains] = useState(offlineGains > 1);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | string | null>(null);

  const researchBonuses = useMemo(() => {
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
    return bonuses;
  }, [researchUpgrades]);

  const selectedItem = useMemo(() => {
    if (selectedItemId === null) return null;
    if (selectedItemId === 'clicker') return 'clicker';
    if (typeof selectedItemId === 'number') {
        return generators.find(g => g.id === selectedItemId) || null;
    }
    return researchUpgrades.find(r => r.id === selectedItemId) || null;
  }, [selectedItemId, generators, researchUpgrades]);

  const handleSelectItem = useCallback((itemId: number | string) => {
    setSelectedItemId(itemId);
  }, []);

  const clickValue = useMemo(() => {
    const baseClickValue = 1 + (clickLevel - 1) * CLICK_POWER_PER_LEVEL;
    return baseClickValue * researchBonuses.clickPowerMultiplier;
  }, [clickLevel, researchBonuses]);

  const saveGame = useCallback(() => {
    const gameState = {
      stardust,
      generators,
      clickLevel,
      researchPoints,
      researchUpgrades,
      lastSaveTimestamp: Date.now(),
    };
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
  }, [stardust, generators, clickLevel, researchPoints, researchUpgrades]);

  // Autosave every 15 seconds
  useEffect(() => {
    const saveInterval = setInterval(saveGame, 15000);
    return () => clearInterval(saveInterval);
  }, [saveGame]);
  
  const handleManualSave = () => {
    saveGame();
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  const handleManualLoad = () => {
    window.location.reload();
  };

  const stardustPerSecond = useMemo(() => {
    const baseSps = generators.reduce((total, gen) => {
      const levelMultiplier = Math.pow(UPGRADE_SPS_MULTIPLIER, gen.level - 1);
      const researchMultiplier = researchBonuses.generatorSpsMultipliers[gen.id] || 1;
      return total + gen.count * gen.sps * levelMultiplier * researchMultiplier;
    }, 0);
    return baseSps * researchBonuses.globalSpsMultiplier;
  }, [generators, researchBonuses]);

  useEffect(() => {
    const gameTick = setInterval(() => {
      setStardust(prev => prev + stardustPerSecond / 10);
      setResearchPoints(prev => prev + RESEARCH_POINTS_PER_SECOND / 10);
    }, 100);

    return () => clearInterval(gameTick);
  }, [stardustPerSecond]);
  
  const calculateCost = useCallback((generator: Generator): number => {
    return Math.ceil(generator.baseCost * Math.pow(COST_MULTIPLIER, generator.count));
  }, []);

  const calculateUpgradeCost = useCallback((generator: Generator): number => {
    return Math.ceil(generator.baseUpgradeCost * Math.pow(UPGRADE_COST_MULTIPLIER, generator.level - 1));
  }, []);

  const calculateClickUpgradeCost = useCallback(() => {
    return Math.ceil(CLICK_UPGRADE_BASE_COST * Math.pow(CLICK_UPGRADE_COST_MULTIPLIER, clickLevel - 1));
  }, [clickLevel]);


  const handleStardustClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
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
      setGenerators(prevGenerators =>
        prevGenerators.map(g =>
          g.id === generatorId ? { ...g, count: g.count + 1 } : g
        )
      );
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
      setGenerators(prevGenerators =>
        prevGenerators.map(g =>
          g.id === generatorId ? { ...g, level: g.level + 1 } : g
        )
      );
    }
  };

  const handleBuyResearch = (researchId: string) => {
    const research = researchUpgrades.find(r => r.id === researchId);
    if (!research || research.isPurchased) return;

    if (researchPoints >= research.cost) {
        setResearchPoints(prev => prev - research.cost);
        setResearchUpgrades(prev => 
            prev.map(r => r.id === researchId ? { ...r, isPurchased: true } : r)
        );
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
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white font-sans antialiased">
      {showOfflineGains && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 bg-opacity-90 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-4 animate-fade-in-down">
          <span>
            Welcome back! You earned <strong className="font-bold">{formatNumberBrief(offlineGains)}</strong> Stardust while away! ✨
          </span>
          <button onClick={() => setShowOfflineGains(false)} className="font-bold text-xl leading-none hover:text-gray-200 transition-colors">&times;</button>
        </div>
      )}
      {showSaveMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 bg-opacity-90 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
          <span>Game Saved! 💾</span>
        </div>
      )}

      <div className="w-full md:w-2/3 flex flex-col items-center justify-center p-4">
        <ClickerArea
          stardust={stardust}
          stardustPerSecond={stardustPerSecond}
          researchPoints={researchPoints}
          onClick={handleStardustClick}
          floatingTexts={floatingTexts}
          removeFloatingText={removeFloatingText}
        />
      </div>

      <aside className="w-full md:w-1/3 h-full bg-black bg-opacity-30 backdrop-blur-sm border-l border-purple-500 border-opacity-50 flex flex-col">
        <h2 className="text-3xl font-bold text-center p-4 shadow-lg">
          Cosmic HQ
        </h2>
        <div className="flex border-b border-t border-purple-500 border-opacity-50">
            <button onClick={() => setActiveTab('buy')} className={tabButtonStyle('buy')}>
                Buy
            </button>
            <button onClick={() => setActiveTab('upgrades')} className={tabButtonStyle('upgrades')}>
                Upgrade
            </button>
            <button onClick={() => setActiveTab('research')} className={tabButtonStyle('research')}>
                Research
            </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {activeTab === 'buy' && generators.map(gen => {
            const totalSps = gen.count * gen.sps * Math.pow(UPGRADE_SPS_MULTIPLIER, gen.level - 1);
            return (
              <GeneratorItem
                key={gen.id}
                generator={gen}
                stardust={stardust}
                cost={calculateCost(gen)}
                onBuy={handleBuyGenerator}
                totalSps={totalSps}
                onSelect={() => handleSelectItem(gen.id)}
                isSelected={selectedItemId === gen.id}
              />
            )
          })}
          {activeTab === 'upgrades' && (
            <>
              <ClickUpgradeItem
                level={clickLevel}
                stardust={stardust}
                cost={calculateClickUpgradeCost()}
                onUpgrade={handleUpgradeClicker}
                currentPower={clickValue}
                onSelect={() => handleSelectItem('clicker')}
                isSelected={selectedItemId === 'clicker'}
                />
              {generators.map(gen => (
                <UpgradeItem
                  key={gen.id}
                  generator={gen}
                  stardust={stardust}
                  cost={calculateUpgradeCost(gen)}
                  onUpgrade={handleUpgradeGenerator}
                  onSelect={() => handleSelectItem(gen.id)}
                  isSelected={selectedItemId === gen.id}
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
                onSelect={() => handleSelectItem(res.id)}
                isSelected={selectedItemId === res.id}
              />
          ))}
        </div>
        <DetailsPanel
            selectedItem={selectedItem}
            activeTab={activeTab}
            stardust={stardust}
            clickLevel={clickLevel}
            calculateCost={calculateCost}
            calculateUpgradeCost={calculateUpgradeCost}
            calculateClickUpgradeCost={calculateClickUpgradeCost}
        />
         <div className="flex-shrink-0 p-2 border-t border-purple-500 border-opacity-50 bg-black bg-opacity-20 flex space-x-2">
            <button 
                onClick={handleManualSave}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
                Save Game
            </button>
            <button
                onClick={handleManualLoad}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
                Load Game
            </button>
        </div>
      </aside>
    </div>
  );
}

export default App;