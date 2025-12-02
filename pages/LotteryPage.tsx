import React, { useState } from 'react';
import { Trophy, Gift, Star, Search, Crown } from 'lucide-react';
import RollingNumber from '../components/RollingNumber';
import Button from '../components/Button';
import { PrizeTier, LotterySettings, Winner } from '../types';
import * as LotteryService from '../services/lotteryService';

interface LotteryPageProps {
  settings: LotterySettings;
  winners: Winner[];
  onDrawComplete: () => void; // Trigger refresh
}

const LotteryPage: React.FC<LotteryPageProps> = ({ settings, winners, onDrawComplete }) => {
  const [currentTier, setCurrentTier] = useState<PrizeTier>(PrizeTier.THIRD);
  const [isRolling, setIsRolling] = useState(false);
  const [drawnResult, setDrawnResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{msg: string, found: boolean} | null>(null);

  // Computed state
  const tierConfig = settings.config[currentTier];
  const tierWinners = winners.filter(w => w.tier === currentTier);
  const remainingCount = Math.max(0, tierConfig.count - tierWinners.length);
  
  // If pool is empty or limit reached, disable start
  const isDrawDisabled = remainingCount === 0 && !isRolling;

  // Handle Start/Stop
  const handleToggleDraw = () => {
    if (isRolling) {
      // STOP
      const result = LotteryService.drawNumber(currentTier);
      if (result) {
        setDrawnResult(result.number);
        setIsRolling(false);
        // We do NOT call onDrawComplete yet, wait for animation to finish in RollingNumber
      } else {
        alert("号池已空或发生错误！");
        setIsRolling(false);
      }
    } else {
      // START
      if (remainingCount > 0) {
        setDrawnResult(null);
        setIsRolling(true);
      }
    }
  };

  const handleAnimationComplete = () => {
     // Animation finished showing the result
     // Now we sync the data to show it in the list
     onDrawComplete();
  };

  const handleSearch = () => {
    if(!searchQuery) return;
    const winner = winners.find(w => w.number === searchQuery);
    if (winner) {
      const tierName = settings.config[winner.tier].label;
      setSearchResult({ found: true, msg: `恭喜！号码 ${searchQuery} 获得了 ${tierName}！` });
    } else {
      setSearchResult({ found: false, msg: `很遗憾，号码 ${searchQuery} 尚未中奖或未参与。` });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-4 text-center z-10 relative">
        <h1 className="text-4xl md:text-6xl font-serif text-wedding-900 mb-2 drop-shadow-sm">
          {settings.title}
        </h1>
        <p className="text-wedding-600 font-sans tracking-widest text-lg uppercase">Wedding Lottery</p>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start px-4 pb-12 gap-8 max-w-7xl mx-auto w-full">
        
        {/* Main Lottery Area */}
        <div className="w-full max-w-4xl glass-panel rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col items-center min-h-[400px]">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-wedding-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-wedding-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

          {/* Tier Selection */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 z-10">
            {[PrizeTier.THIRD, PrizeTier.SECOND, PrizeTier.FIRST].map((tier) => {
              const cfg = settings.config[tier];
              const isActive = currentTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => !isRolling && setCurrentTier(tier)}
                  disabled={isRolling}
                  className={`
                    px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105
                    ${isActive 
                      ? 'bg-wedding-600 text-white shadow-lg ring-2 ring-wedding-300 ring-offset-2' 
                      : 'bg-white text-wedding-800 border border-wedding-200 hover:bg-wedding-50'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {tier === PrizeTier.FIRST && <Crown className="inline w-4 h-4 mr-1 mb-1"/>}
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Rolling Display */}
          <div className="flex-grow flex flex-col items-center justify-center w-full mb-8">
             <div className="text-wedding-500 font-medium mb-2 uppercase tracking-wide">
               {isRolling ? '正在抽奖...' : (drawnResult ? '祝贺中奖！' : '等待抽奖')}
             </div>
             
             <RollingNumber 
                isRolling={isRolling} 
                targetNumber={drawnResult} 
                onAnimationComplete={handleAnimationComplete}
             />

             {/* Status Info */}
             <div className="mt-4 text-gray-500 font-medium">
               剩余名额: <span className="text-2xl text-wedding-700 font-bold mx-1">{remainingCount}</span> / {tierConfig.count}
             </div>
          </div>

          {/* Control Button */}
          <div className="z-10">
            <Button 
              size="lg" 
              onClick={handleToggleDraw}
              disabled={isDrawDisabled}
              className={`text-xl px-12 py-4 shadow-xl ${isRolling ? 'bg-wedding-800 hover:bg-wedding-900' : ''}`}
            >
              {isRolling ? '停止' : (remainingCount === 0 ? '本轮已结束' : '开始抽奖')}
            </Button>
          </div>
        </div>

        {/* Content Grid: Winners & Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          
          {/* Winners List (Luck List) */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-md max-h-[500px] overflow-hidden flex flex-col">
            <h3 className="text-2xl font-serif text-wedding-900 mb-4 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-wedding-500" />
              幸运榜
            </h3>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
               {/* Group by Tier */}
               {[PrizeTier.FIRST, PrizeTier.SECOND, PrizeTier.THIRD].map(tier => {
                 const tConfig = settings.config[tier];
                 const tWinners = winners.filter(w => w.tier === tier).sort((a,b) => b.timestamp - a.timestamp);
                 
                 if (tWinners.length === 0) return null;

                 return (
                   <div key={tier} className="mb-6 last:mb-0">
                     <h4 className="text-lg font-bold text-wedding-700 mb-3 border-b border-wedding-100 pb-1 flex items-center">
                       {tier === PrizeTier.FIRST ? <Crown className="w-4 h-4 mr-2"/> : <Gift className="w-4 h-4 mr-2"/>}
                       {tConfig.label} 
                       <span className="ml-2 text-sm font-normal text-gray-400">({tWinners.length}位)</span>
                     </h4>
                     <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                       {tWinners.map(w => (
                         <div key={w.id} className="bg-white border border-wedding-100 rounded-lg py-2 text-center text-wedding-800 font-bold shadow-sm animate-in zoom-in duration-300">
                           {w.number}
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               })}
               {winners.length === 0 && (
                 <div className="text-center text-gray-400 py-10 italic">
                   暂无中奖名单，大奖即将揭晓...
                 </div>
               )}
            </div>
          </div>

          {/* Check Status */}
          <div className="glass-panel rounded-2xl p-6 shadow-md h-fit">
            <h3 className="text-xl font-serif text-wedding-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-wedding-500" />
              中奖查询
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="请输入您的票号 (001-999)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-wedding-200 focus:ring-2 focus:ring-wedding-400 focus:border-transparent outline-none transition-shadow"
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
              <Button onClick={handleSearch} className="w-full">
                查询
              </Button>

              {searchResult && (
                <div className={`mt-4 p-4 rounded-xl text-center text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
                  searchResult.found ? 'bg-wedding-50 text-wedding-800 border border-wedding-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}>
                  {searchResult.msg}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-wedding-300 text-sm font-light">
        © {new Date().getFullYear()} MaoMao & XinXin. All rights reserved.
      </footer>
    </div>
  );
};

export default LotteryPage;