import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  LayoutList, 
  TrendingUp, 
  ChevronRight,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary'; // Import ErrorBoundary

/**
 * 首页核心目的：一眼看清「今日还能吃多少」，通过视觉压力（剩余热量）引导用户记录行为。
 * 第一眼想看到：当前热量进度圆环、还剩多少额度、三大营养素是否失衡。
 */

import { usePersonalizedKcal } from '../hooks/usePersonalizedKcal';

import TopBar from '../components/TopBar';
import VoiceMode from '../components/VoiceMode'; // Correct Import

import RemainingKcalRing from '../components/RemainingKcalRing';

import BottomActions from '../components/BottomActions';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const { 
    consumed, 
    baseTarget, 
    dynamicTarget, 
    remaining, 
    insight, 
    statusColor,
    loading, 
    history,
    refresh
  } = usePersonalizedKcal();

  // 颜色映射配置已移至 RemainingKcalRing 组件

  const progress = Math.min(consumed / dynamicTarget, 1);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <TopBar onRefresh={refresh} isLoading={loading} />
      
      {/* 语音模式浮动按钮 - 增加错误边界保护 */}
      <GlobalErrorBoundary>
        <VoiceMode />
      </GlobalErrorBoundary>

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
          <RemainingKcalRing
            consumed={consumed}
            dynamicTarget={dynamicTarget}
            remaining={remaining}
            insight={insight}
            statusColor={statusColor}
          />

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
      <BottomActions />
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
