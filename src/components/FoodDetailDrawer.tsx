import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Trash2, Check, Minus, Plus, AlertCircle, ChevronDown } from 'lucide-react';
import type { Dish } from '../types/meal';

interface FoodDetailDrawerProps {
  dish: Dish | null;
  onClose: () => void;
  onUpdate: (updatedDish: Dish) => void;
  onDelete: (dishId: string) => void;
}

const FoodDetailDrawer: React.FC<FoodDetailDrawerProps> = ({ 
  dish, 
  onClose, 
  onUpdate, 
  onDelete 
}) => {
  // Local state for editing
  const [amountNum, setAmountNum] = useState<number>(0);
  const [unit, setUnit] = useState<string>('g');
  const [isDeleting, setIsDeleting] = useState(false);

  // Parse initial amount when dish opens
  useEffect(() => {
    if (dish) {
      const match = dish.amount.match(/(\d+)(\D+)?/);
      if (match) {
        setAmountNum(parseInt(match[1], 10));
        setUnit(match[2] || 'g');
      } else {
        setAmountNum(1); // Default fallback
        setUnit('份');
      }
      setIsDeleting(false);
    }
  }, [dish]);

  // Calculate dynamic values
  const ratio = useMemo(() => {
    if (!dish) return 1;
    const originalMatch = dish.amount.match(/(\d+)/);
    const originalNum = originalMatch ? parseInt(originalMatch[1], 10) : 1;
    return amountNum / (originalNum || 1);
  }, [amountNum, dish]);

  const currentCalories = dish ? Math.round(dish.calories * ratio) : 0;
  const currentMacros = dish ? {
    protein: Math.round(dish.macros.protein * ratio * 10) / 10,
    carbs: Math.round(dish.macros.carbs * ratio * 10) / 10,
    fat: Math.round(dish.macros.fat * ratio * 10) / 10,
  } : { protein: 0, carbs: 0, fat: 0 };

  // Handlers
  const handleSave = () => {
    if (!dish) return;
    const updatedDish: Dish = {
      ...dish,
      amount: `${amountNum}${unit}`,
      calories: currentCalories,
      macros: currentMacros
    };
    onUpdate(updatedDish);
    onClose();
  };

  const handleIncrement = () => setAmountNum(prev => prev + (unit === 'g' ? 10 : 0.5));
  const handleDecrement = () => setAmountNum(prev => Math.max(0, prev - (unit === 'g' ? 10 : 0.5)));

  if (!dish) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[40px] overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight max-w-[80%]">
              {dish.name}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          {/* Big Image Placeholder */}
          <div className="w-full aspect-video bg-emerald-50 dark:bg-slate-800 rounded-[32px] mb-8 flex items-center justify-center relative overflow-hidden group">
            <span className="text-6xl animate-bounce">🥗</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              AI 已识别
            </div>
          </div>

          {/* Nutrition Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Calories (Big) */}
            <div className="col-span-2 p-6 bg-orange-50 dark:bg-orange-900/10 rounded-[32px] border border-orange-100 dark:border-orange-500/20 flex items-center justify-between">
              <div>
                <p className="text-orange-600/70 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">热量 Estimate</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-orange-600 dark:text-orange-500">{currentCalories}</span>
                  <span className="text-sm font-bold text-orange-400">kcal</span>
                </div>
              </div>
              <Flame className="w-10 h-10 text-orange-500 fill-orange-500/20" />
            </div>

            {/* Macros */}
            <MacroCard label="蛋白质" value={currentMacros.protein} unit="g" color="emerald" />
            <MacroCard label="碳水" value={currentMacros.carbs} unit="g" color="amber" />
            <MacroCard label="脂肪" value={currentMacros.fat} unit="g" color="rose" />
            <MacroCard label="微量元素" value="A+" unit="" color="indigo" />
          </div>

          {/* Portion Editor */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-6 mb-8">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              调整份量 Portion Size
            </label>
            <div className="flex items-center justify-between">
              <button 
                onClick={handleDecrement}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-95 active:scale-90 transition-all"
              >
                <Minus className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col items-center">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800 dark:text-white tabular-nums">
                    {amountNum}
                  </span>
                  <span className="text-sm font-bold text-slate-400">{unit}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  ≈ {Math.round(currentCalories)} kcal
                </span>
              </div>

              <button 
                onClick={handleIncrement}
                className="w-12 h-12 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white hover:scale-95 active:scale-90 transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isDeleting ? (
              <>
                <button 
                  onClick={handleSave}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[28px] font-black text-lg shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Check className="w-6 h-6" />
                  确认修改
                </button>
                
                <button 
                  onClick={() => setIsDeleting(true)}
                  className="w-full py-5 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-[28px] font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  删除此餐
                </button>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/10 p-6 rounded-[32px] border border-red-100 dark:border-red-500/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <h3 className="font-bold text-red-700 dark:text-red-400">确定要删除吗？</h3>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsDeleting(false)}
                    className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm shadow-sm"
                  >
                    取消
                  </button>
                  <button 
                    onClick={() => onDelete(dish.id)}
                    className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-500/30"
                  >
                    确认删除
                  </button>
                </div>
              </motion.div>
            )}
          </div>
          
        </div>
      </motion.div>
    </>
  );
};

// Helper Component for Macros
const MacroCard = ({ label, value, unit, color }: { label: string, value: number | string, unit: string, color: string }) => {
  const colorStyles: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  };

  return (
    <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center ${colorStyles[color]}`}>
      <span className="text-[10px] font-bold opacity-60 uppercase mb-1">{label}</span>
      <span className="text-lg font-black tracking-tight">
        {value}<span className="text-xs ml-0.5 opacity-80">{unit}</span>
      </span>
    </div>
  );
};

export default FoodDetailDrawer;
