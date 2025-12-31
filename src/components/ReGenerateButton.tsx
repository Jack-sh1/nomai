import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Meal, Dish } from '../types/meal';
import { MOCK_FOOD_DATABASE } from '../data/mockFood';

interface ReGenerateButtonProps {
  onSuccess: (newMeals: Meal[]) => void;
}

/**
 * 核心价值：通过丝滑的加载反馈和“盲盒式”的重新生成体验，减少用户对健康餐单单调性的抵触感。
 */
const ReGenerateButton: React.FC<ReGenerateButtonProps> = ({ onSuccess }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // 模拟 AI 生成逻辑
  const handleRegenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    
    // 模拟网络延迟和 AI 计算过程 (3-5秒)
    const delay = Math.floor(Math.random() * 2000) + 3000;
    
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 模拟 5% 的失败率
          if (Math.random() < 0.05) {
            reject(new Error('Network busy'));
          } else {
            resolve(true);
          }
        }, delay);
      });

      // 随机打乱并挑选食物
      const getRandomDishes = (count: number): Dish[] => {
        const shuffled = [...MOCK_FOOD_DATABASE].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };

      const newMeals: Meal[] = [
        {
          id: `m1-${Date.now()}`,
          type: '早餐',
          time: '08:00',
          dishes: getRandomDishes(3)
        },
        {
          id: `m2-${Date.now()}`,
          type: '午餐',
          time: '12:30',
          dishes: getRandomDishes(3)
        },
        {
          id: `m3-${Date.now()}`,
          type: '晚餐',
          time: '19:00',
          dishes: getRandomDishes(2)
        }
      ];

      onSuccess(newMeals);
      toast.success('AI 已为你重新生成了今日餐单！', {
        icon: '✨',
        style: {
          background: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #bbf7d0',
        }
      });
    } catch (error) {
      toast.error('生成失败，请检查网络后重试', {
        style: {
          background: '#fef2f2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isGenerating}
      onClick={handleRegenerate}
      className={`
        w-full py-4 rounded-[28px] font-bold text-sm transition-all duration-300
        flex items-center justify-center gap-2 border-2
        ${isGenerating 
          ? 'bg-orange-50/50 border-orange-200 text-orange-300 cursor-not-allowed' 
          : 'bg-white dark:bg-slate-900 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30'
        }
      `}
    >
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>生成中...</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <RotateCw className="w-5 h-5" />
            <span>重新生成一套</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ReGenerateButton;
