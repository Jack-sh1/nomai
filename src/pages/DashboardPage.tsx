import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  LayoutList, 
  User, 
  Flame, 
  TrendingUp, 
  ChevronRight,
  Plus,
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserMenu from '../components/UserMenu';
import { showToast } from '../utils/toast';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * 首页核心目的：一眼看清「今日还能吃多少」，通过视觉压力（剩余热量）引导用户记录行为。
 * 第一眼想看到：当前热量进度圆环、还剩多少额度、三大营养素是否失衡。
 */

import { usePersonalizedKcal } from '../hooks/usePersonalizedKcal';

import TopBar from '../components/TopBar';
import VoiceMode from '../components/VoiceMode';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const { 
    consumed, 
    baseTarget, 
    dynamicTarget, 
    remaining, 
    remainingPercent,
    insight, 
    statusColor,
    loading, 
    history,
    refresh
  } = usePersonalizedKcal();

  // 颜色映射配置
  const colorMap = {
    emerald: {
      ring: 'stroke-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100/50 dark:border-emerald-500/10'
    },
    amber: {
      ring: 'stroke-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100/50 dark:border-amber-500/10'
    },
    rose: {
      ring: 'stroke-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-900/10',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100/50 dark:border-rose-500/10'
    }
  };

  const activeTheme = colorMap[statusColor];

  const progress = Math.min(consumed / dynamicTarget, 1);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <TopBar onRefresh={refresh} isLoading={loading} />
      
      {/* 语音模式浮动按钮 */}
      <VoiceMode />

      {!isOnline && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-amber-50 dark:bg-amber-900/20 px-6 py-2 flex items-center gap-3 text-amber-700 dark:text-amber-400 text-sm border-b border-amber-100 dark:border-amber-900/30"
        >
          <WifiOff size={16} />
          <span>网络已断开，部分功能可能无法使用</span>
        </motion.div>
      )}

      {loading && consumed === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <main className="flex-1 px-6 pb-24">
          {/* 1. 核心进度环 */}
        <motion.section 
          layout
          className={`relative p-8 rounded-[40px] overflow-hidden transition-colors duration-500 ${activeTheme.bg}`}
        >
          <div className="relative z-10 flex flex-col items-center">
            {/* 动态圆环 */}
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                {/* 底环 */}
                <circle
                  cx="104"
                  cy="104"
                  r="92"
                  className="stroke-slate-200 dark:stroke-slate-800 fill-none opacity-50"
                  strokeWidth="14"
                />
                {/* 进度环 */}
                <motion.circle
                  cx="104"
                  cy="104"
                  r="92"
                  className={`fill-none transition-colors duration-500 ${activeTheme.ring}`}
                  strokeWidth="14"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  key={consumed}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-black text-slate-900 dark:text-white tabular-nums"
                >
                  {consumed}
                </motion.span>
                <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase mt-1">
                  目标 {dynamicTarget} kcal
                </span>
              </div>
            </div>

            <div className="mt-8 text-center w-full">
              <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                {remaining >= 0 ? '还剩 ' : '已超 '} 
                <span className={`transition-colors duration-500 ${activeTheme.text}`}>
                  {Math.abs(remaining)}
                </span> kcal
              </p>
              
              {/* AI 智能文案 - 淡入动画 */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={insight}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-4 px-5 py-3 rounded-2xl border transition-colors duration-500 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm ${activeTheme.border}`}
                >
                  <p className={`text-sm font-medium leading-relaxed ${activeTheme.text}`}>
                    “ {insight} ”
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* 动态背景光效 */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2] 
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className={`absolute top-[-20%] right-[-10%] w-56 h-56 rounded-full blur-3xl transition-colors duration-500 ${statusColor === 'emerald' ? 'bg-emerald-400/20' : statusColor === 'amber' ? 'bg-amber-400/20' : 'bg-rose-400/20'}`} 
          />
        </motion.section>

        {/* 3. 三大宏营养区域 */}
        {/* 这里暂用 mock，后续可从 hook 扩展 */}
        <section className="grid grid-cols-1 gap-4">
          <MacroRow label="蛋白质" current={85} target={150} color="bg-emerald-500" />
          <MacroRow label="碳水" current={120} target={250} color="bg-amber-500" />
          <MacroRow label="脂肪" current={42} target={70} color="bg-rose-500" />
        </section>

        {/* 4. 最近趋势小模块 */}
        <section className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              最近趋势
            </h3>
            <button 
              onClick={() => navigate('/trend')}
              className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center"
            >
              查看详情 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-end justify-between h-24 gap-2 px-2">
            {/* 使用真实历史数据填充趋势图，不足 7 天补 0 */}
            {Array.from({ length: 7 }).map((_, i) => {
              const val = history[i] || 0;
              const height = Math.min((val / (baseTarget * 1.5)) * 100, 100);
              const isToday = i === history.length;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className={`w-full rounded-t-lg ${val > baseTarget ? 'bg-rose-400' : 'bg-emerald-500'} ${val === 0 ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {['一', '二', '三', '四', '五', '六', '日'][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      )}

      {/* 5. 底部固定操作区 */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-4 max-w-md mx-auto">
          <button 
            onClick={() => navigate('/camera-scan')}
            className="flex-[2] py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Camera className="w-6 h-6" />
            扫食物
          </button>
          <button 
            onClick={() => navigate('/meal-plan')}
            className="flex-1 py-5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-3xl font-bold text-lg flex items-center justify-center active:scale-95 transition-all"
          >
            <LayoutList className="w-6 h-6" />
          </button>
        </div>
        <div className="h-safe pb-2" />
      </footer>
    </div>
  );
};

// 子组件：宏营养行
const MacroRow: React.FC<{ label: string; current: number; target: number; color: string }> = ({ 
  label, current, target, color 
}) => {
  const percent = Math.min(100, (current / target) * 100);
  
  return (
    <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl">
      <div className="flex justify-between items-end mb-3">
        <div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{current}g</span>
            <span className="text-xs text-slate-400 font-bold">/ {target}g</span>
          </div>
        </div>
        <span className="text-sm font-black text-slate-600 dark:text-slate-400">{Math.round(percent)}%</span>
      </div>
      <div className="w-full h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
