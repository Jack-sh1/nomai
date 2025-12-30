import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  BookmarkPlus, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  Utensils,
  Coffee,
  Apple,
  Moon,
  Replace,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 页面核心目的：展示 AI 生成的一日餐单建议，允许用户替换菜品并保存方案。
 */

interface FoodItem {
  id: string;
  name: string;
  amount: string;
}

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2';
  title: string;
  calories: number;
  macros: { protein: number; carbs: number; fat: number };
  foods: FoodItem[];
  image: string;
}

const MOCK_MEAL_PLAN: Meal[] = [
  {
    id: '1',
    type: 'breakfast',
    title: '高蛋白能量早餐',
    calories: 420,
    macros: { protein: 25, carbs: 40, fat: 12 },
    foods: [
      { id: 'f1', name: '全麦面包', amount: '2 片' },
      { id: 'f2', name: '水煮蛋', amount: '2 个' },
      { id: 'f3', name: '无糖希腊酸奶', amount: '150g' },
      { id: 'f4', name: '蓝莓', amount: '10 颗' }
    ],
    image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=400&auto=format&fit=crop'
  },
  {
    id: '2',
    type: 'snack1',
    title: '上午加餐',
    calories: 120,
    macros: { protein: 2, carbs: 25, fat: 1 },
    foods: [
      { id: 'f5', name: '苹果', amount: '1 个' },
      { id: 'f6', name: '杏仁', amount: '5 颗' }
    ],
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&auto=format&fit=crop'
  },
  {
    id: '3',
    type: 'lunch',
    title: '低脂鸡肉能量碗',
    calories: 580,
    macros: { protein: 45, carbs: 60, fat: 15 },
    foods: [
      { id: 'f7', name: '煎鸡胸肉', amount: '150g' },
      { id: 'f8', name: '糙米饭', amount: '100g' },
      { id: 'f9', name: '西兰花', amount: '100g' },
      { id: 'f10', name: '鳄梨', amount: '1/4 个' }
    ],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop'
  },
  {
    id: '4',
    type: 'snack2',
    title: '运动前补给',
    calories: 150,
    macros: { protein: 15, carbs: 20, fat: 3 },
    foods: [
      { id: 'f11', name: '蛋白粉', amount: '1 勺' },
      { id: 'f12', name: '香蕉', amount: '1/2 根' }
    ],
    image: 'https://images.unsplash.com/photo-1532704792142-3e792040087b?w=400&auto=format&fit=crop'
  },
  {
    id: '5',
    type: 'dinner',
    title: '轻盈海鲜时蔬',
    calories: 380,
    macros: { protein: 35, carbs: 30, fat: 10 },
    foods: [
      { id: 'f13', name: '清蒸鳕鱼', amount: '150g' },
      { id: 'f14', name: '芦笋', amount: '8 根' },
      { id: 'f15', name: '圣女果', amount: '6 颗' }
    ],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop'
  }
];

const MealPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(true);
  const [mealPlan, setMealPlan] = useState<Meal[]>(MOCK_MEAL_PLAN);
  const [replacingMealId, setReplacingMealId] = useState<string | null>(null);

  // 模拟 AI 生成逻辑
  const generatePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2500);
  };

  useEffect(() => {
    generatePlan();
  }, []);

  const totalCalories = mealPlan.reduce((acc, meal) => acc + meal.calories, 0);

  return (
    <div className="flex flex-col min-h-screen bg-emerald-50/30 dark:bg-slate-950 transition-colors duration-300">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 flex items-center justify-between p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-emerald-500 fill-current" />
            AI 智能餐单
          </h1>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Today's Optimized Plan</p>
        </div>
        <button 
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm active:scale-95 transition-all text-emerald-600"
          onClick={generatePlan}
        >
          <RefreshCw className={`w-6 h-6 ${isGenerating ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* 主要内容区 */}
      <main className="flex-1 px-6 pt-4 pb-40">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative mb-8">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
                />
                <Sparkles className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">正在为您定制方案...</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">AI 正在根据您的目标和饮食偏好计算最优营养配比</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* 总热量概览卡片 */}
              <div className="p-6 bg-emerald-500 rounded-3xl text-white shadow-lg shadow-emerald-500/20">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold opacity-80 uppercase tracking-wider">全天预计摄入</span>
                  <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">Balanced</div>
                </div>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-5xl font-black">{totalCalories}</span>
                  <span className="text-xl font-bold mb-1 opacity-80">kcal</span>
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
                  <MacroMini label="蛋白质" value="122g" />
                  <MacroMini label="碳水" value="185g" />
                  <MacroMini label="脂肪" value="45g" />
                </div>
              </div>

              {/* 餐单列表 */}
              <div className="space-y-6">
                {mealPlan.map((meal, index) => (
                  <MealCard 
                    key={meal.id} 
                    meal={meal} 
                    index={index} 
                    onReplace={() => setReplacingMealId(meal.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部固定操作区 */}
      {!isGenerating && (
        <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <button 
            className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            onClick={() => navigate('/dashboard')}
          >
            <CheckCircle2 className="w-6 h-6" />
            直接记录整天餐单
          </button>
          <div className="flex gap-3">
            <button 
              className="flex-1 py-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm border border-slate-200 dark:border-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
              onClick={generatePlan}
            >
              <RefreshCw className="w-4 h-4" />
              重新生成
            </button>
            <button className="flex-1 py-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm border border-slate-200 dark:border-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2">
              <BookmarkPlus className="w-4 h-4" />
              保存模板
            </button>
          </div>
          <div className="h-safe pb-2" />
        </footer>
      )}

      {/* 替换菜品弹窗 (简单实现) */}
      <AnimatePresence>
        {replacingMealId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setReplacingMealId(null)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[40px] p-8 pb-12 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">更换方案</h3>
                <button 
                  onClick={() => setReplacingMealId(null)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <button 
                    key={i}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-4 text-left active:scale-[0.98] transition-all border-2 border-transparent hover:border-emerald-500"
                    onClick={() => setReplacingMealId(null)}
                  >
                    <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden">
                      <img src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=${i}`} alt="alt" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800 dark:text-white mb-1">可选方案 {i}: 减脂沙拉</div>
                      <div className="text-xs text-slate-500 flex gap-3">
                        <span>420 kcal</span>
                        <span className="text-emerald-500">蛋白质 +15%</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// 子组件：宏量营养素微缩展示
const MacroMini: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[10px] font-bold text-white/60 uppercase tracking-tighter mb-0.5">{label}</div>
    <div className="text-sm font-black">{value}</div>
  </div>
);

// 子组件：单餐卡片
const MealCard: React.FC<{ meal: Meal; index: number; onReplace: () => void }> = ({ meal, index, onReplace }) => {
  const Icon = {
    breakfast: Coffee,
    lunch: Utensils,
    dinner: Moon,
    snack1: Apple,
    snack2: Apple,
  }[meal.type];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800"
    >
      <div className="relative h-40 overflow-hidden">
        <img src={meal.image} alt={meal.title} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-sm">
          <Icon className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
          {meal.type}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">{meal.title}</h3>
            <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3 h-3 mr-1" />
              {meal.calories} kcal
            </div>
          </div>
          <button 
            onClick={onReplace}
            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-emerald-500 active:scale-90 transition-all"
          >
            <Replace className="w-5 h-5" />
          </button>
        </div>

        <ul className="space-y-2 mb-6">
          {meal.foods.map(food => (
            <li key={food.id} className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{food.name}</span>
              <span className="text-slate-400 tabular-nums">{food.amount}</span>
            </li>
          ))}
        </ul>

        {/* 宏量进度条 */}
        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
          <div className="bg-orange-500" style={{ width: '30%' }} />
          <div className="bg-blue-500" style={{ width: '50%' }} />
          <div className="bg-yellow-500" style={{ width: '20%' }} />
        </div>
      </div>
    </motion.div>
  );
};

export default MealPlanPage;
