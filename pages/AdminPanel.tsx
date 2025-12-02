import React, { useState, useEffect } from 'react';
import { Settings, Save, Trash2, LogOut, Check, X } from 'lucide-react';
import { LotterySettings, Winner, PrizeTier } from '../types';
import * as LotteryService from '../services/lotteryService';
import Button from '../components/Button';

interface AdminPanelProps {
  onLogout: () => void;
  onRequestSync: () => void; // Trigger parent to reload data
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onRequestSync }) => {
  const [settings, setSettings] = useState<LotterySettings>(LotteryService.getSettings());
  const [winners, setWinners] = useState<Winner[]>(LotteryService.getWinners());
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    setWinners(LotteryService.getWinners());
  }, []);

  const handleSaveSettings = () => {
    LotteryService.saveSettings(settings);
    setSaveMessage('设置已保存 successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
    onRequestSync();
  };

  const handleClearHistory = () => {
    if (confirm('确定要清空所有中奖记录吗？此操作不可撤销。')) {
      LotteryService.clearData();
      setWinners([]);
      onRequestSync();
    }
  };

  const updatePrizeConfig = (tier: PrizeTier, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [tier]: {
          ...prev.config[tier],
          [field]: value
        }
      }
    }));
  };

  const updateRange = (tier: PrizeTier, type: 'start' | 'end', value: string) => {
    const num = parseInt(value) || 0;
    setSettings(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [tier]: {
          ...prev.config[tier],
          poolRange: {
            ...prev.config[tier].poolRange,
            [type]: num
          }
        }
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      <div className="flex justify-between items-center mb-8 border-b border-wedding-200 pb-4">
        <h2 className="text-3xl font-serif text-wedding-900">后台管理系统</h2>
        <Button variant="ghost" onClick={onLogout} className="text-gray-600">
          <LogOut className="w-4 h-4 mr-2" /> 退出登录
        </Button>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'settings' 
              ? 'bg-wedding-100 text-wedding-900 ring-2 ring-wedding-300' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          抽奖设置
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'history' 
              ? 'bg-wedding-100 text-wedding-900 ring-2 ring-wedding-300' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          中奖记录 ({winners.length})
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Global Settings */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-xl font-bold text-wedding-800 mb-4">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">婚礼标题</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({...settings, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-wedding-500 focus:border-wedding-500"
                />
              </div>
            </div>
          </div>

          {/* Prize Configs */}
          <div className="grid grid-cols-1 gap-6">
            {[PrizeTier.FIRST, PrizeTier.SECOND, PrizeTier.THIRD].map((tier) => {
              const config = settings.config[tier];
              return (
                <div key={tier} className="glass-panel p-6 rounded-xl border-l-4 border-wedding-400">
                  <h3 className="text-lg font-bold text-wedding-800 mb-4 flex items-center">
                    {config.label} 设置
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">奖项名称</label>
                      <input
                        type="text"
                        value={config.label}
                        onChange={(e) => updatePrizeConfig(tier, 'label', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">中奖人数限制</label>
                      <input
                        type="number"
                        min="1"
                        value={config.count}
                        onChange={(e) => updatePrizeConfig(tier, 'count', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex space-x-2">
                       <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">起始号</label>
                          <input
                            type="number"
                            min="1"
                            value={config.poolRange.start}
                            onChange={(e) => updateRange(tier, 'start', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                       </div>
                       <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">结束号</label>
                          <input
                            type="number"
                            min="1"
                            value={config.poolRange.end}
                            onChange={(e) => updateRange(tier, 'end', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
             {saveMessage && <span className="text-green-600 font-medium flex items-center"><Check className="w-4 h-4 mr-1"/>{saveMessage}</span>}
             <div className="flex-1"></div>
             <Button onClick={handleSaveSettings} size="lg">
               <Save className="w-4 h-4 mr-2" /> 保存所有设置
             </Button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-panel p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-wedding-800">中奖记录详情</h3>
            <Button variant="danger" size="sm" onClick={handleClearHistory}>
              <Trash2 className="w-4 h-4 mr-2" /> 清空所有记录
            </Button>
          </div>

          {winners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无中奖记录</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-wedding-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">奖项</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">中奖号码</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {winners.sort((a,b) => b.timestamp - a.timestamp).map((w) => {
                    const tierLabel = settings.config[w.tier].label;
                    return (
                      <tr key={w.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tierLabel}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-wedding-700 font-bold text-lg">{w.number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(w.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;