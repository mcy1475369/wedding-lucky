import React, { useState, useEffect } from 'react';
import { Lock, Settings } from 'lucide-react';
import LotteryPage from './pages/LotteryPage';
import AdminPanel from './pages/AdminPanel';
import * as LotteryService from './services/lotteryService';
import { LotterySettings, Winner } from './types';
import Button from './components/Button';

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  
  // Central Data State
  const [settings, setSettings] = useState<LotterySettings>(LotteryService.getSettings());
  const [winners, setWinners] = useState<Winner[]>(LotteryService.getWinners());

  // Function to refresh data from Service (local storage)
  const refreshData = () => {
    setSettings(LotteryService.getSettings());
    setWinners(LotteryService.getWinners());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAdminMode(true);
      setShowLogin(false);
      setPassword('');
    } else {
      alert('密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-50 via-white to-wedding-100 text-gray-800 font-sans selection:bg-wedding-200">
      
      {/* Admin Toggle (Hidden in corner or specific button) */}
      {!isAdminMode && (
        <div className="fixed bottom-4 right-4 z-50">
          <button 
            onClick={() => setShowLogin(true)}
            className="p-2 bg-white/50 hover:bg-white rounded-full text-wedding-300 hover:text-wedding-600 transition-colors"
            title="管理员登录"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">管理员验证</h3>
              <button onClick={() => setShowLogin(false)} className="text-gray-400 hover:text-gray-600">
                 ✕
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-500 outline-none"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full justify-center">
                <Lock className="w-4 h-4 mr-2" /> 登录
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* View Switching */}
      {isAdminMode ? (
        <AdminPanel 
          onLogout={() => setIsAdminMode(false)} 
          onRequestSync={refreshData}
        />
      ) : (
        <LotteryPage 
          settings={settings}
          winners={winners}
          onDrawComplete={refreshData}
        />
      )}
    </div>
  );
};

export default App;