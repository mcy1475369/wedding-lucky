import React, { useState, useEffect, useCallback } from 'react';
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
  const canStart = remainingCount > 0 && !isRolling;

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
      if (remainingCount <= 0) {
        alert("该奖项名额已满！");
        return;
      }
      const can = LotteryService.canDraw(currentTier);
      if (!can) {
        alert("无法抽奖：可能是号池已空。");
        return;
      }
      setDrawnResult(null);
      setIsRolling(true);
    }
  };

  const handleAnimationComplete = () => {
    onDrawComplete(); // Sync data up
  };

  // Search logic
  const handleCheckTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    // Pad input
    const query = searchQuery.padStart(3, '0');
    const myWin = winners.find(w => w.number === query);
    
    if (myWin) {
      const label = settings.config[myWin.tier].label;
      setSearchResult({ msg: `恭喜！号码 ${query} 获得了 ${label}！`, found: true });
    } else {
      setSearchResult({ msg: `很遗憾，号码 ${query} 尚未中奖或未参与。`, found: false });
    }
  };

  const TierIcon = {
    [PrizeTier.FIRST]: Crown,
    [PrizeTier.SECOND]: Star,
    [PrizeTier.THIRD]: Gift,
  }[currentTier];

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Header */}
      <header className="w-full text-center py-8">
        <h1 className="text-4xl md:text-5xl font-serif text-wedding-900 font-bold drop-shadow-sm mb-2">
          {settings.title}
        </h1>
        <p className="text-wedding-700 italic font-serif">Wedding Ceremony Lottery</p>
      </header>

      {/* Main Stage */}
      <main className="flex-1 w-full max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        
        {/* Left: Winners List */}
        <div className="lg:col-span-3 order-3 lg:order-1">
          <div className="glass-panel h-full rounded-2xl p-6 flex flex-col shadow-lg border-t-4 border-wedding-300">
            <h3 className="text-xl font-bold text-wedding-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-wedding-500" />
              光荣榜
            </h3>
            <div className="flex-1 overflow-y-auto max-h-[400px] lg:max-h-none space-y-4 pr-2 custom-scrollbar">
              {[PrizeTier.FIRST, PrizeTier.SECOND, PrizeTier.THIRD].map(tier => {
                const wins = winners.filter(w => w.tier === tier).sort((a,b) => b.timestamp - a.timestamp);
                if (wins.length === 0) return null;
                
                return (
                  <div key={tier} className="mb-4">
                     <h4 className="text-sm font-bold text-gray-500 uppercase mb-2 border-b border-gray-200 pb-1">
                       {settings.config[tier].label}
                     </h4>
                     <div className="grid grid-cols-3 gap-2">
                        {wins.map(w => (
                          <span key={w.id} className="bg-wedding-50 text-wedding-900 font-bold px-2 py-1 rounded text-center text-sm shadow-sm border border-wedding-100">
                            {w.number}
                          </span>
                        ))}
                     </div>
                  </div>
                );
              })}
              {winners.length === 0 && <p className="text-gray-400 text-sm italic">等待开奖...</p>}
            </div>
            
            {/* User Check Area */}
            <div className="mt-6 pt-6 border-t border-wedding-200">
               <h4 className="text-sm font-bold text-gray-600 mb-2">查询我的结果</h4>
               <form onSubmit={handleCheckTicket} className="flex gap-2">
                 <input 
                    type="number" 
                    placeholder="票号" 
                    className="flex-1 p-2 rounded-lg border border-gray-300 text-sm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                 />
                 <button type="submit" className="bg-wedding-500 text-white p-2 rounded-lg hover:bg-wedding-600">
                   <Search className="w-4 h-4" />
                 </button>
               </form>
               {searchResult && (
                 <div className={`mt-2 text-sm p-2 rounded ${searchResult.found ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                   {searchResult.msg}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Center: Draw Stage */}
        <div className="lg:col-span-9 order-1 lg:order-2 flex flex-col">
          {/* Controls - Tabs */}
          <div className="flex justify-center space-x-2 md:space-x-4 mb-8">
            {[PrizeTier.THIRD, PrizeTier.SECOND, PrizeTier.FIRST].map((tier) => (
              <button
                key={tier}
                disabled={isRolling}
                onClick={() => setCurrentTier(tier)}
                className={`px-6 py-3 rounded-full font-serif font-bold text-lg transition-all transform hover:scale-105 ${
                  currentTier === tier
                  ? 'bg-wedding-600 text-white shadow-lg ring-4 ring-wedding-200'
                  : 'bg-white text-gray-500 hover:bg-wedding-50 shadow-sm opacity-80'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {settings.config[tier].label}
              </button>
            ))}
          </div>

          {/* Main Visual */}
          <div className="flex-1 glass-panel rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
             
             {/* Status Badge */}
             <div className="absolute top-6 left-6 flex items-center space-x-2">
                <span className={`h-3 w-3 rounded-full ${isRolling ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                <span className="text-gray-500 font-medium uppercase tracking-wide text-sm">
                  {isRolling ? '抽奖中...' : remainingCount === 0 ? '已结束' : '待开始'}
                </span>
             </div>

             <div className="absolute top-6 right-6 text-wedding-900 font-medium">
               剩余名额: <span className="text-2xl font-bold">{remainingCount}</span>
             </div>

             <div className="mb-6 flex flex-col items-center">
                <TierIcon className={`w-12 h-12 md:w-16 md:h-16 text-wedding-400 mb-2 ${isRolling ? 'animate-bounce' : ''}`} />
                <h2 className="text-3xl md:text-4xl font-serif text-wedding-900">{tierConfig.label}</h2>
             </div>

             <RollingNumber 
                isRolling={isRolling} 
                targetNumber={drawnResult} 
                onAnimationComplete={handleAnimationComplete}
             />

             <div className="mt-10">
               <Button 
                 onClick={handleToggleDraw} 
                 size="lg"
                 className={`min-w-[200px] text-xl py-4 shadow-xl border-b-4 ${isRolling 
                   ? 'bg-red-500 hover:bg-red-600 border-red-700 text-white' 
                   : 'bg-wedding-600 hover:bg-wedding-700 border-wedding-800 text-white'
                 }`}
                 disabled={(!isRolling && remainingCount <= 0)}
               >
                 {isRolling ? '停止 STOP' : remainingCount <= 0 ? '该奖项已抽完' : '开始 START'}
               </Button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LotteryPage;