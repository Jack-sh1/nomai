import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Flame,
  LayoutList,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface DayData {
  date: string;
  displayDate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// --- Mock Data ---
const MOCK_7_DAYS: DayData[] = [
  { date: '2025-12-24', displayDate: '周一', calories: 2150, protein: 140, carbs: 220, fat: 65 },
  { date: '2025-12-25', displayDate: '周二', calories: 1980, protein: 130, carbs: 200, fat: 60 },
  { date: '2025-12-26', displayDate: '周三', calories: 2400, protein: 120, carbs: 310, fat: 85 },
  { date: '2025-12-27', displayDate: '周四', calories: 2050, protein: 155, carbs: 190, fat: 55 },
  { date: '2025-12-28', displayDate: '周五', calories: 2100, protein: 145, carbs: 210, fat: 62 },
  { date: '2025-12-29', displayDate: '周六', calories: 2300, protein: 110, carbs: 280, fat: 80 },
  { date: '2025-12-30', displayDate: '周日', calories: 1850, protein: 160, carbs: 150, fat: 45 },
];

const TARGET_CALORIES = 2100;

// --- Sub-components ---

const StatCard: React.FC<{ label: string; value: string; trend: 'up' | 'down'; color: string }> = ({ label, value, trend, color }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex-1">
    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-1 mb-1">
      <span className={`text-xl font-black ${color}`}>{value}</span>
      <span className="text-[10px] font-bold text-slate-400">avg</span>
    </div>
    <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
      {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {trend === 'up' ? '+12%' : '-5%'}
    </div>
  </div>
);

// --- Main Page Component ---

const TrendDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState<'7' | '30'>('7');

  const data = useMemo(() => MOCK_7_DAYS, []);

  // Calculate Average
  const averages = useMemo(() => {
    const sum = data.reduce((acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      carbs: acc.carbs + curr.carbs,
      fat: acc.fat + curr.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return {
      calories: Math.round(sum.calories / data.length),
      protein: Math.round(sum.protein / data.length),
      carbs: Math.round(sum.carbs / data.length),
      fat: Math.round(sum.fat / data.length),
    };
  }, [data]);

  // SVG Chart Logic
  const chartPoints = useMemo(() => {
    const maxVal = Math.max(...data.map(d => d.calories), TARGET_CALORIES) * 1.1;
    const minVal = Math.min(...data.map(d => d.calories), TARGET_CALORIES) * 0.9;
    const range = maxVal - minVal;
    
    return data.map((d, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 100 - ((d.calories - minVal) / range) * 100,
    }));
  }, [data]);

  const targetLineY = useMemo(() => {
    const maxVal = Math.max(...data.map(d => d.calories), TARGET_CALORIES) * 1.1;
    const minVal = Math.min(...data.map(d => d.calories), TARGET_CALORIES) * 0.9;
    const range = maxVal - minVal;
    return 100 - ((TARGET_CALORIES - minVal) / range) * 100;
  }, [data]);

  const pathD = `M ${chartPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const areaD = `${pathD} L 100,100 L 0,100 Z`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-12">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-50/80 dark:bg-black/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">摄入趋势</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              最近 {range === '7' ? '7' : '30'} 天数据
            </p>
          </div>
        </div>
        <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-2xl">
          <button 
            onClick={() => setRange('7')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${range === '7' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}
          >
            7天
          </button>
          <button 
            onClick={() => setRange('30')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${range === '30' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}
          >
            30天
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {/* 1. Main Chart Card */}
        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">平均每日热量</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{averages.calories}</span>
                <span className="text-xs font-bold text-slate-400">kcal</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${averages.calories <= TARGET_CALORIES ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              <TrendingUp className="w-3 h-3" />
              {averages.calories <= TARGET_CALORIES ? '达成目标' : '略微超出'}
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative h-48 w-full mb-6">
            {/* Target Line */}
            <div 
              className="absolute w-full border-t border-dashed border-slate-200 dark:border-slate-700 z-0"
              style={{ top: `${targetLineY}%` }}
            >
              <span className="absolute -top-5 right-0 text-[10px] font-bold text-slate-400">Target {TARGET_CALORIES}</span>
            </div>

            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d={areaD}
                fill="url(#chartGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              <motion.path
                d={pathD}
                fill="none"
                stroke="rgb(16, 185, 129)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              {/* Data Points */}
              {chartPoints.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="1.5"
                  fill="white"
                  stroke="rgb(16, 185, 129)"
                  strokeWidth="1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                />
              ))}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between mt-4">
              {data.map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-slate-400 w-8 text-center uppercase">{d.displayDate}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Macros Summary */}
        <section className="flex gap-3">
          <StatCard label="蛋白质" value={`${averages.protein}g`} trend="up" color="text-emerald-500" />
          <StatCard label="碳水" value={`${averages.carbs}g`} trend="down" color="text-amber-500" />
          <StatCard label="脂肪" value={`${averages.fat}g`} trend="up" color="text-rose-500" />
        </section>

        {/* 3. Daily Breakdown */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">每日明细</h2>
            <LayoutList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-2">
            {data.slice().reverse().map((day, i) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                    day.calories <= TARGET_CALORIES 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}>
                    {day.displayDate}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{day.date}</p>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{day.calories} kcal</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-6 bg-emerald-500/20 rounded-full overflow-hidden flex flex-col justify-end">
                      <div className="bg-emerald-500 w-full" style={{ height: '70%' }} />
                    </div>
                    <div className="w-1.5 h-6 bg-amber-500/20 rounded-full overflow-hidden flex flex-col justify-end">
                      <div className="bg-amber-500 w-full" style={{ height: '40%' }} />
                    </div>
                    <div className="w-1.5 h-6 bg-rose-500/20 rounded-full overflow-hidden flex flex-col justify-end">
                      <div className="bg-rose-500 w-full" style={{ height: '60%' }} />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. Insight & Footer */}
        <div className="bg-emerald-600 rounded-[32px] p-6 text-white text-center shadow-xl shadow-emerald-500/20">
          <Flame className="w-8 h-8 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-black mb-2">坚持得很棒！</h3>
          <p className="text-emerald-100 text-sm leading-relaxed mb-6">
            最近 7 天你有 5 天达成了热量目标。你的蛋白质摄入稳步提升，这非常有利于保持肌肉。
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/')}
              className="flex-1 py-4 bg-white text-emerald-600 rounded-2xl font-black text-sm active:scale-95 transition-all"
            >
              返回首页
            </button>
            <button 
              onClick={() => navigate('/meal-plan')}
              className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm border border-emerald-400/30 active:scale-95 transition-all"
            >
              生成新餐单
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrendDetailPage;
