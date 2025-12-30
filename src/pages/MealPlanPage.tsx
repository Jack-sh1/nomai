import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCcw, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Clock, 
  RotateCw,
  X,
  Plus,
  ArrowRightLeft,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 核心用户价值：将复杂的「吃什么、吃多少、怎么换」一键简化为极具个性化且动态可调的智能方案，让健康饮食不再有决策负担。
 */

// --- 类型定义 ---
interface Macro {
  protein: number;
  carbs: number;
  fat: number;
}

interface Dish {
  id: string;
  name: string;
  amount: string;
  calories: number;
  macros: Macro;
}

interface Meal {
  id: string;
  type: string;
  time: string;
  dishes: Dish[];
}

interface UserProfile {
  weight: number;
  targetCalories: number;
  targetMacros: Macro; // 比例，如 { protein: 0.35, carbs: 0.4, fat: 0.25 }
}

// --- Mock 数据 ---
const MOCK_USER: UserProfile = {
  weight: 68,
  targetCalories: 1850,
  targetMacros: { protein: 0.35, carbs: 0.4, fat: 0.25 }
};

const INITIAL_MEALS: Meal[] = [
  {
    id: 'm1',
    type: '早餐',
    time: '08:00',
    dishes: [
      { id: 'd1', name: '香煎鸡胸肉片', amount: '100g', calories: 165, macros: { protein: 31, carbs: 0, fat: 3.6 } },
      { id: 'd2', name: '全麦吐司', amount: '2片', calories: 150, macros: { protein: 6, carbs: 24, fat: 2 } },
      { id: 'd3', name: '美式咖啡', amount: '1杯', calories: 5, macros: { protein: 0, carbs: 0, fat: 0 } }
    ]
  },
  {
    id: 'm2',
    type: '午餐',
    time: '12:30',
    dishes: [
      { id: 'd4', name: '清蒸三文鱼', amount: '150g', calories: 310, macros: { protein: 30, carbs: 0, fat: 20 } },
      { id: 'd5', name: '水煮西兰花', amount: '200g', calories: 70, macros: { protein: 5, carbs: 14, fat: 1 } },
      { id: 'd6', name: '糙米饭', amount: '120g', calories: 135, macros: { protein: 3, carbs: 28, fat: 1 } }
    ]
  },
  {
    id: 'm3',
    type: '晚餐',
    time: '19:00',
    dishes: [
      { id: 'd7', name: '虾仁豆腐煲', amount: '250g', calories: 240, macros: { protein: 28, carbs: 10, fat: 8 } },
      { id: 'd8', name: '清炒时蔬', amount: '200g', calories: 90, macros: { protein: 3, carbs: 8, fat: 6 } }
    ]
  }
];

const REPLACEMENT_OPTIONS: Record<string, Dish[]> = {
  'd1': [
    { id: 'r1', name: '水煮蛋 (2个)', amount: '110g', calories: 155, macros: { protein: 13, carbs: 1.2, fat: 10 } },
    { id: 'r2', name: '希腊酸奶', amount: '150g', calories: 140, macros: { protein: 15, carbs: 6, fat: 6 } }
  ],
  'd4': [
    { id: 'r3', name: '煎鳕鱼排', amount: '180g', calories: 290, macros: { protein: 32, carbs: 0, fat: 12 } },
    { id: 'r4', name: '慢炖牛肉 (少油)', amount: '150g', calories: 330, macros: { protein: 35, carbs: 0, fat: 18 } }
  ]
};

// --- 组件开始 ---
const MealPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<Meal[]>(INITIAL_MEALS);
  const [replacingDish, setReplacingDish] = useState<{ mealId: string, dishId: string } | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (replacingDish) {
      setIsCalculating(true);
      const timer = setTimeout(() => setIsCalculating(false), 5500); // 模拟 AI 计算 5.5 秒
      return () => clearTimeout(timer);
    }
  }, [replacingDish]);

  useEffect(() => {
    // 模拟初始加载
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 计算当前总览
  const totals = useMemo(() => {
    let cal = 0, p = 0, c = 0, f = 0;
    meals.forEach(m => m.dishes.forEach(d => {
      cal += d.calories;
      p += d.macros.protein;
      c += d.macros.carbs;
      f += d.macros.fat;
    }));
    return { calories: cal, protein: p, carbs: c, fat: f };
  }, [meals]);

  const handleReplace = (mealId: string, dishId: string, newDish: Dish) => {
    setIsReplacing(true);
    setTimeout(() => {
      setMeals(prev => prev.map(m => {
        if (m.id !== mealId) return m;
        return {
          ...m,
          dishes: m.dishes.map(d => d.id === dishId ? newDish : d)
        };
      }));
      setReplacingDish(null);
      setIsReplacing(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50 dark:bg-slate-950 p-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8 p-6 bg-white dark:bg-slate-900 rounded-[40px] shadow-xl"
        >
          <Sparkles className="w-16 h-16 text-emerald-500" />
        </motion.div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">AI 正在根据您的 68kg 体重计算方案...</h2>
        <p className="text-slate-500 dark:text-slate-400">正在匹配：高蛋白、少油、不吃香菜</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 flex items-center justify-between p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-emerald-100/50 dark:border-slate-800">
        <button onClick={() => navigate(-1)} className="p-3 bg-emerald-50 dark:bg-slate-900 rounded-2xl active:scale-95 transition-all">
          <ArrowLeft className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-800 dark:text-white">今日智能餐单</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target: {MOCK_USER.targetCalories} kcal</p>
        </div>
        <button onClick={() => window.location.reload()} className="p-3 bg-emerald-50 dark:bg-slate-900 rounded-2xl active:scale-95 transition-all">
          <RefreshCcw className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </button>
      </header>

      <main className="flex-1 px-6 pt-6 pb-40 space-y-8">
        {/* 总览卡片 */}
        <section className="p-6 bg-emerald-500 rounded-[40px] text-white shadow-xl shadow-emerald-500/20">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">今日预估达成</p>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  key={totals.calories}
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className="text-5xl font-black"
                >
                  {totals.calories}
                </motion.span>
                <span className="text-lg font-bold opacity-80">kcal</span>
              </div>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur rounded-3xl border border-white/30">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
            <MacroMini label="蛋白质" value={`${totals.protein}g`} percent={Math.round((totals.protein * 4 / totals.calories) * 100)} color="bg-white" />
            <MacroMini label="碳水" value={`${totals.carbs}g`} percent={Math.round((totals.carbs * 4 / totals.calories) * 100)} color="bg-white/70" />
            <MacroMini label="脂肪" value={`${totals.fat}g`} percent={Math.round((totals.fat * 9 / totals.calories) * 100)} color="bg-white/40" />
          </div>
        </section>

        {/* 餐次列表 */}
        <section className="space-y-8">
          {meals.map((meal) => (
            <div key={meal.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  {meal.type}
                </h3>
                <span className="flex items-center gap-1 text-sm font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  {meal.time}
                </span>
              </div>
              <div className="space-y-3">
                {meal.dishes.map((dish) => (
                  <motion.div 
                    layoutId={dish.id}
                    key={dish.id} 
                    className="group p-5 bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-800 dark:text-white text-lg">{dish.name}</h4>
                          <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                            {dish.amount}
                          </span>
                        </div>
                        <div className="flex gap-3 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                          <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" /> {dish.calories} kcal</span>
                          <span>P: {dish.macros.protein}g</span>
                          <span>C: {dish.macros.carbs}g</span>
                          <span>F: {dish.macros.fat}g</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setReplacingDish({ mealId: meal.id, dishId: dish.id })}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-400 hover:text-emerald-500 hover:rotate-180 transition-all duration-500"
                      >
                        <RotateCw className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* 底部操作区 */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[28px] font-black text-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-7 h-7" />
            一键记录整天
          </button>
          <button className="w-full py-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-[28px] font-bold text-sm border border-slate-200 dark:border-slate-800 active:scale-95 transition-all">
            重新生成一套
          </button>
        </div>
        <div className="h-safe pb-2" />
      </footer>

      {/* 替换面板 (Modal) */}
      <AnimatePresence>
        {replacingDish && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => !isReplacing && setReplacingDish(null)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[48px] p-8 pb-12 shadow-2xl min-h-[60vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">AI 智能替换</h3>
                  <p className="text-slate-400 text-sm font-bold">已为您匹配热量相近且不含香菜的选项</p>
                </div>
                <button 
                  disabled={isReplacing || isCalculating}
                  onClick={() => setReplacingDish(null)}
                  className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl active:scale-90 transition-all"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[32px]">
                {isCalculating ? (
                  <FakeReplacementLoading onCancel={() => setReplacingDish(null)} />
                ) : (
                  <div className="space-y-4">
                    {REPLACEMENT_OPTIONS[replacingDish.dishId]?.map((option) => (
                      <button
                        key={option.id}
                        disabled={isReplacing}
                        onClick={() => handleReplace(replacingDish.mealId, replacingDish.dishId, option)}
                        className="w-full group p-5 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-between border-2 border-transparent hover:border-emerald-500 transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl">
                            <ArrowRightLeft className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div className="text-left">
                            <div className="font-black text-slate-800 dark:text-white text-lg leading-tight mb-1">{option.name}</div>
                            <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              <span>{option.calories} kcal</span>
                              <span className="text-emerald-500">P:{option.macros.protein}g</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl shadow-sm text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          {isReplacing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6 stroke-[3px]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 子组件 ---
const MacroMini: React.FC<{ label: string, value: string, percent: number, color: string }> = ({ label, value, percent, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter">{label}</span>
      <span className="text-[10px] font-black">{percent}%</span>
    </div>
    <div className="text-sm font-black mb-1">{value}</div>
    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        className={`h-full ${color}`} 
      />
    </div>
  </div>
);

// --- Fake Progressive Loading ---
const FakeReplacementLoading: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [phase, setPhase] = useState(0); // 0, 1, 2, 3 (reveal)
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1200),
      setTimeout(() => setPhase(2), 2400),
      setTimeout(() => setPhase(3), 4000), // 开始收尾
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const placeholders = [
    { name: "匹配主食...", macros: "240kcal · P:12g" },
    { name: "调整蛋白质...", macros: "180kcal · P:32g" },
    { name: "补充微量元素...", macros: "45kcal · C:8g" },
  ];

  return (
    <div className="space-y-4 py-4 min-h-[400px]">
      {/* AI 状态文本 */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="relative">
          <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
          <div className="absolute inset-0 bg-emerald-500/20 blur-lg animate-ping rounded-full" />
        </div>
        <p className="text-sm font-black text-slate-600 dark:text-slate-300 tracking-tight">
          {phase < 3 ? "AI 正在为你筛选最优方案..." : "正在完成最后配比..."}
          <span className="inline-block w-1 h-3 bg-emerald-500 ml-1 animate-bounce" />
        </p>
      </div>

      {/* 伪造的占位卡片流 */}
      <div className="space-y-3">
        {placeholders.map((item, i) => {
          const isVisible = phase >= i;
          const isRevealing = phase >= 3;

          return (
            <div 
              key={i}
              className={`
                group p-5 rounded-[32px] border-2 transition-all duration-1000 flex items-center justify-between
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                ${isRevealing 
                  ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500/30' 
                  : 'bg-slate-50 dark:bg-slate-800/50 border-transparent'}
              `}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`
                  p-4 rounded-2xl transition-all duration-700
                  ${isRevealing ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-slate-200 dark:bg-slate-700 animate-pulse'}
                `}>
                  <ArrowRightLeft className={`w-5 h-5 ${isRevealing ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                
                <div className="space-y-2 flex-1">
                  <div className={`
                    h-5 font-black transition-all duration-1000
                    ${isRevealing ? 'text-slate-800 dark:text-white blur-0' : 'bg-slate-200 dark:bg-slate-700 w-2/3 rounded-md blur-[4px] opacity-50'}
                  `}>
                    {isRevealing ? item.name.replace('...', '') : "????? · ????"}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`h-3 rounded-full transition-all duration-1000 ${isRevealing ? 'bg-emerald-500/40 w-16' : 'bg-slate-200 dark:bg-slate-700 w-24 opacity-30'}`} />
                    <div className={`h-3 rounded-full transition-all duration-1000 ${isRevealing ? 'bg-orange-500/30 w-12' : 'bg-slate-200 dark:bg-slate-700 w-16 opacity-30'}`} />
                  </div>
                </div>
              </div>

              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700
                ${isRevealing ? 'bg-emerald-500 text-white scale-100' : 'bg-slate-200 dark:bg-slate-700 scale-90 opacity-50'}
              `}>
                {isRevealing ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-8 flex flex-col items-center gap-4">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-[4000ms] ease-out"
            style={{ width: phase >= 3 ? '100%' : `${(phase + 1) * 30}%` }}
          />
        </div>
        <button 
          onClick={onCancel}
          className="px-6 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          取消计算
        </button>
      </div>
    </div>
  );
};

export default MealPlanPage;
