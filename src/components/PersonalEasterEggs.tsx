import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Award, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { subDays, format, parseISO } from 'date-fns';

interface PersonalEasterEggsProps {
  remaining: number;
}

const PersonalEasterEggs: React.FC<PersonalEasterEggsProps> = ({ remaining }) => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [closedTips, setClosedTips] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nomai_closed_tips');
      if (!saved) return [];
      const { date, tips } = JSON.parse(saved);
      if (date !== new Date().toDateString()) return []; // 新的一天重置
      return tips;
    } catch {
      return [];
    }
  });

  // 保存关闭状态
  const closeTip = (id: string) => {
    setClosedTips(prev => {
      const newTips = [...prev, id];
      localStorage.setItem('nomai_closed_tips', JSON.stringify({
        date: new Date().toDateString(),
        tips: newTips
      }));
      return newTips;
    });
  };

  // 1. 计算连续记录天数
  useEffect(() => {
    if (!user) return;

    const checkStreak = async () => {
      // 获取最近 7 天的记录（足够判断3天streak）
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      
      const { data, error } = await supabase
        .from('nutrition_records')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false });

      if (error || !data) return;

      // 简单的连续天数计算
      const uniqueDates = new Set(
        data.map(r => format(parseISO(r.created_at), 'yyyy-MM-dd'))
      );
      
      let currentStreak = 0;
      const today = new Date();
      
      // 检查今天是否记录
      if (uniqueDates.has(format(today, 'yyyy-MM-dd'))) {
        currentStreak++;
      } else {
        // 如果今天没记录，但昨天有，也算streak延续中（显示"已连续x天"）
        // 这里简化逻辑：只看最近连续的天数
      }

      // 回溯检查前几天
      for (let i = 1; i <= 7; i++) {
        const date = subDays(today, i);
        if (uniqueDates.has(format(date, 'yyyy-MM-dd'))) {
          currentStreak++;
        } else {
          // 如果今天没记，允许断一天？或者严格连续？
          // 这里采用严格连续逻辑：只要有一天断了就停
          // 但为了让用户更容易获得成就感，通常允许今天还没记的情况下，看昨天的streak
          if (i === 1 && currentStreak === 0) continue; // 今天没记，跳过检查昨天
          break;
        }
      }
      
      setStreak(currentStreak);
    };

    checkStreak();
  }, [user]);

  // 2. 条件判断
  const activeEgg = useMemo(() => {
    const hour = new Date().getHours();
    
    // 优先级 1: 深夜关怀 (22:00后 + 剩余 > 800)
    if (hour >= 22 && remaining > 800 && !closedTips.includes('night_snack')) {
      return {
        id: 'night_snack',
        icon: <Moon className="w-4 h-4 text-indigo-500" />,
        text: '深夜了？试试低卡高蛋白零食助眠～',
        style: 'bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl p-3 text-sm shadow-md flex items-center gap-3',
        type: 'card'
      };
    }

    // 优先级 2: 连续打卡 (Streak >= 3)
    // 放在这里显示或者单独显示，为了不重叠，这里做互斥
    if (streak >= 3 && !closedTips.includes('streak_badge')) {
      return {
        id: 'streak_badge',
        icon: <Award className="w-4 h-4 text-amber-600" />,
        text: `连续打卡 ${streak} 天！坚持就是胜利～`,
        style: 'bg-amber-100/80 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-lg px-3 py-1 text-xs font-medium shadow flex items-center gap-2',
        type: 'badge'
      };
    }

    // 优先级 3: 剩余热量大 (剩余 > 1000)
    if (remaining > 1000 && !closedTips.includes('high_remaining')) {
      return {
        id: 'high_remaining',
        icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
        text: '剩余空间好大！奖励自己一顿美味吧～',
        style: 'bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full px-4 py-2 text-sm shadow-sm flex items-center gap-2',
        type: 'bubble'
      };
    }

    return null;
  }, [remaining, streak, closedTips]);

  if (!activeEgg) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={activeEgg.id}
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex justify-center mt-4 mb-2"
      >
        <div className={`relative ${activeEgg.style}`}>
          {activeEgg.icon}
          <span>{activeEgg.text}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              closeTip(activeEgg.id);
            }}
            className="ml-2 p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3 opacity-50" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PersonalEasterEggs;
