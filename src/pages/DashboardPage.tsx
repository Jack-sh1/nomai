import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  LayoutList, 
  User, 
  Flame, 
  TrendingUp, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * 首页核心目的：一眼看清「今日还能吃多少」，通过视觉压力（剩余热量）引导用户记录行为。
 * 第一眼想看到：当前热量进度圆环、还剩多少额度、三大营养素是否失衡。
 */

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock 数据
  const stats = {
    consumed: 1240,
    target: 2100,
    protein: { current: 85, target: 150, color: 'bg-emerald-500' },
    carbs: { current: 120, target: 250, color: 'bg-amber-500' },
    fat: { current: 42, target: 70, color: 'bg-rose-500' }
  };

  const remaining = stats.target - stats.consumed;
  const progress = (stats.consumed / stats.target) * 100;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '午安';
    return '晚安';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* 1. 顶部问候 */}
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest">
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">
            {getTimeGreeting()}，<span className="text-emerald-500">NomAi</span>
          </h1>
        </div>
        <button 
          onClick={() => navigate('/settings')}
          className="p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl active:scale-90 transition-all"
        >
          <User className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
      </header>

      <main className="flex-1 px-6 pb-32 space-y-8">
        {/* 2. 今日热量大卡片 */}
        <section className="relative p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[40px] overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            {/* 简易 SVG 圆环 */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-emerald-100 dark:stroke-emerald-900/30 fill-none"
                  strokeWidth="12"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-emerald-500 fill-none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-slate-900 dark:text-white tabular-nums">
                  {stats.consumed}
                </span>
                <span className="text-slate-400 dark:text-slate-500 font-bold text-sm uppercase">
                  / {stats.target} kcal
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                还剩 <span className="text-emerald-600 dark:text-emerald-400">{remaining}</span> kcal
              </p>
              <p className="text-xs text-slate-400 mt-1">今天已经完成了 {Math.round(progress)}% 的目标</p>
            </div>
          </div>
          
          {/* 背景装饰 */}
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-emerald-200/20 dark:bg-emerald-500/5 rounded-full blur-3xl" />
        </section>

        {/* 3. 三大宏营养区域 */}
        <section className="grid grid-cols-1 gap-4">
          <MacroRow label="蛋白质" current={stats.protein.current} target={stats.protein.target} color="bg-emerald-500" />
          <MacroRow label="碳水" current={stats.carbs.current} target={stats.carbs.target} color="bg-amber-500" />
          <MacroRow label="脂肪" current={stats.fat.current} target={stats.fat.target} color="bg-rose-500" />
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
            {[1800, 2200, 1950, 2400, 2100, 1700, 1240].map((val, i) => {
              const height = (val / 2500) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className={`w-full rounded-t-lg ${i === 6 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>

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
