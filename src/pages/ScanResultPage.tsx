import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  RotateCcw, 
  Plus, 
  Minus, 
  Flame, 
  Beef, 
  Wheat, 
  Droplets,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 页面核心目的：展示 AI 识别食物后的营养成分预览，允许用户微调份量并确认记录。
 * 用户主要操作：查看识别结果、调整克数/份量、确认添加、重新拍摄。
 */

// 模拟识别结果
const MOCK_RESULT = {
  name: '经典牛油果吐司',
  calories: 450,
  macros: {
    protein: 12,
    carbs: 45,
    fat: 25
  },
  servingSize: 200, // 克
  image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop'
};

const ScanResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState(MOCK_RESULT.servingSize);
  const [error, setError] = useState<string | null>(null);

  // 模拟 AI 识别过程
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAdjustWeight = (delta: number) => {
    setWeight(prev => Math.max(0, prev + delta));
  };

  const calculateNutrient = (baseValue: number) => {
    return Math.round((baseValue * weight) / MOCK_RESULT.servingSize);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50 dark:bg-slate-950 p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 className="w-16 h-16 text-emerald-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">AI 正在识别食物...</h2>
        <p className="text-slate-500 dark:text-slate-400">正在分析图像中的成分与分量</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">识别结果</h1>
        <button 
          className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl active:scale-95 transition-all"
          onClick={() => window.location.reload()}
        >
          <RotateCcw className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </button>
      </header>

      {/* 主要内容区 */}
      <main className="flex-1 px-6 pb-32">
        {/* 食物图片预览 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full h-64 mb-8 rounded-3xl overflow-hidden shadow-xl shadow-emerald-500/10"
        >
          <img 
            src={MOCK_RESULT.image} 
            alt={MOCK_RESULT.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              AI 已识别
            </span>
          </div>
        </motion.div>

        {/* 食物名称 & 热量 */}
        <section className="mb-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                {MOCK_RESULT.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">推测重量: {weight}g</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-emerald-500 mb-1">
                <Flame className="w-5 h-5 mr-1 fill-current" />
                <span className="text-4xl font-black">{calculateNutrient(MOCK_RESULT.calories)}</span>
              </div>
              <span className="text-slate-400 text-sm font-bold uppercase tracking-tighter">kcal</span>
            </div>
          </div>

          {/* 宏量营养素卡片 */}
          <div className="grid grid-cols-3 gap-4">
            <NutrientCard 
              label="蛋白质" 
              value={calculateNutrient(MOCK_RESULT.macros.protein)} 
              unit="g" 
              icon={<Beef className="w-5 h-5" />}
              color="bg-orange-500"
              bgColor="bg-orange-50 dark:bg-orange-950/20"
              textColor="text-orange-600 dark:text-orange-400"
            />
            <NutrientCard 
              label="碳水" 
              value={calculateNutrient(MOCK_RESULT.macros.carbs)} 
              unit="g" 
              icon={<Wheat className="w-5 h-5" />}
              color="bg-blue-500"
              bgColor="bg-blue-50 dark:bg-blue-950/20"
              textColor="text-blue-600 dark:text-blue-400"
            />
            <NutrientCard 
              label="脂肪" 
              value={calculateNutrient(MOCK_RESULT.macros.fat)} 
              unit="g" 
              icon={<Droplets className="w-5 h-5" />}
              color="bg-yellow-500"
              bgColor="bg-yellow-50 dark:bg-yellow-950/20"
              textColor="text-yellow-600 dark:text-yellow-400"
            />
          </div>
        </section>

        {/* 分量微调 */}
        <section className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl mb-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
            分量微调 <span className="ml-2 text-sm font-normal text-slate-400">(克)</span>
          </h3>
          <div className="flex items-center justify-between">
            <AdjustButton icon={<Minus />} onClick={() => handleAdjustWeight(-10)} />
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {weight}
            </span>
            <AdjustButton icon={<Plus />} onClick={() => handleAdjustWeight(10)} />
          </div>
          <div className="flex gap-2 mt-4">
            {[100, 200, 300, 500].map(val => (
              <button
                key={val}
                onClick={() => setWeight(val)}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                  weight === val 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {val}g
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* 底部固定操作区 */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-slate-950 via-white dark:via-slate-950 to-transparent">
        <button 
          onClick={() => {
            // 这里执行记录逻辑
            navigate('/dashboard');
          }}
          className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black text-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Check className="w-7 h-7 stroke-[3px]" />
          确认记录
        </button>
        {/* 安全区域占位 */}
        <div className="h-safe pb-4" />
      </footer>
    </div>
  );
};

// 子组件：营养素卡片
const NutrientCard: React.FC<{
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  textColor: string;
}> = ({ label, value, unit, icon, color, bgColor, textColor }) => (
  <div className={`flex flex-col items-center p-4 ${bgColor} rounded-3xl transition-transform active:scale-95`}>
    <div className={`p-2 rounded-2xl bg-white dark:bg-slate-800 shadow-sm mb-3 ${textColor}`}>
      {icon}
    </div>
    <div className="text-center">
      <span className="block text-xl font-black text-slate-900 dark:text-white tabular-nums">
        {value}
        <span className="text-xs font-bold ml-0.5">{unit}</span>
      </span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    {/* 进度条装饰 */}
    <div className="w-full h-1.5 bg-white/50 dark:bg-slate-800/50 rounded-full mt-3 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '60%' }} // 模拟进度
        className={`h-full ${color}`} 
      />
    </div>
  </div>
);

// 子组件：调整按钮
const AdjustButton: React.FC<{
  icon: React.ReactElement;
  onClick: () => void;
}> = ({ icon, onClick }) => (
  <button 
    onClick={onClick}
    className="p-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-sm active:bg-slate-100 dark:active:bg-slate-700 active:scale-90 transition-all"
  >
    {React.cloneElement(icon, { className: "w-6 h-6 stroke-[3px]" } as any)}
  </button>
);

export default ScanResultPage;
