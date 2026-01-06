import React from 'react';
import { motion } from 'framer-motion';
import { Flame, RotateCw, Utensils } from 'lucide-react';
import type { Dish } from '../types/meal';

interface FoodCardProps {
  dish: Dish;
  onExpand: () => void;
  onReplace: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ dish, onExpand, onReplace }) => {
  return (
    <motion.div 
      layoutId={`card-${dish.id}`}
      onClick={onExpand}
      whileTap={{ scale: 0.98 }}
      className="group relative p-5 bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start gap-4">
        {/* Left: Icon/Image & Info */}
        <div className="flex-1 flex items-start gap-4">
          {/* Placeholder Image/Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-300 dark:text-slate-600">
            <Utensils className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="font-black text-slate-800 dark:text-white text-lg truncate leading-tight">
                {dish.name}
              </h4>
              <span className="shrink-0 text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                {dish.amount}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-400 uppercase tracking-tighter">
              <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-300">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" /> 
                {Math.round(dish.calories)} kcal
              </span>
              <span className="whitespace-nowrap">P: {dish.macros.protein}g</span>
              <span className="whitespace-nowrap">C: {dish.macros.carbs}g</span>
              <span className="whitespace-nowrap">F: {dish.macros.fat}g</span>
            </div>
          </div>
        </div>

        {/* Right: Replace Button */}
        <motion.button 
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onReplace();
          }}
          className="shrink-0 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-400 hover:text-emerald-500 transition-colors"
        >
          <RotateCw className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FoodCard;
