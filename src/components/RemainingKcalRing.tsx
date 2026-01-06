import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface RemainingKcalRingProps {
  consumed: number;
  dynamicTarget: number;
  remaining: number;
  insight: string;
  statusColor: 'emerald' | 'amber' | 'rose';
}

const RemainingKcalRing: React.FC<RemainingKcalRingProps> = ({
  consumed,
  dynamicTarget,
  remaining,
  insight,
  statusColor,
}) => {
  const navigate = useNavigate();

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
    <motion.section 
      layout
      onClick={() => navigate('/kcal-detail')}
      whileTap={{ scale: 0.95 }}
      className={`relative p-8 rounded-[40px] overflow-hidden transition-all duration-500 cursor-pointer active:shadow-inner ${activeTheme.bg}`}
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
            <div className="flex items-baseline gap-1">
              <motion.span 
                key={consumed}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black text-slate-900 dark:text-white tabular-nums"
              >
                {consumed}
              </motion.span>
              <span className="text-lg font-bold text-slate-400 dark:text-slate-500">
                / {dynamicTarget}
              </span>
            </div>
            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase mt-1">
              kcal
            </span>
          </div>
        </div>

        <div className="mt-8 text-center w-full">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            {remaining >= 0 ? '还剩' : '已超标'}
          </p>
          <p className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            <span className={`transition-colors duration-500 ${activeTheme.text}`}>
              {Math.abs(remaining)}
            </span> 
            <span className="text-lg ml-1 text-slate-400">kcal</span>
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
  );
};

export default RemainingKcalRing;
