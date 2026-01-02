import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import UserMenu from './UserMenu';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onRefresh, isLoading }) => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '深夜好';
    if (hour < 12) return '早安';
    if (hour < 18) return '下午好';
    return '晚安';
  };

  const formatDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      weekday: 'short' 
    };
    return now.toLocaleDateString('zh-CN', options);
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
      {/* 左侧：问候 + 日期 */}
      <div className="flex flex-col">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
          {formatDate()}
        </p>
        <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
          {getTimeGreeting()}，<span className="opacity-80">NomAi</span>
        </h1>
      </div>

      {/* 右侧：刷新按钮 + 头像 */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRefresh}
          disabled={isLoading}
          className={`p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shadow-sm border border-slate-100 dark:border-slate-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="刷新数据"
        >
          <RefreshCw size={18} className={`${isLoading ? 'animate-spin' : 'transition-transform duration-500 hover:rotate-180'}`} />
        </motion.button>
        
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white shadow-sm font-bold text-lg cursor-pointer relative z-20"
          >
            {user?.email?.[0].toUpperCase() || 'U'}
          </motion.button>
          
          <UserMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
