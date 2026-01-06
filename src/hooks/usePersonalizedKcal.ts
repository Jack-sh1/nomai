import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface KcalStats {
  consumed: number;
  baseTarget: number;
  dynamicTarget: number;
  remaining: number;
  remainingPercent: number;
  exerciseBurned: number; // Mocked for now
  insight: string;
  statusColor: 'emerald' | 'amber' | 'rose';
  loading: boolean;
  history: number[];
}

export const usePersonalizedKcal = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<KcalStats>({
    consumed: 0,
    baseTarget: 2450,
    dynamicTarget: 2450,
    remaining: 2450,
    remainingPercent: 100,
    exerciseBurned: 0,
    insight: '正在同步你的代谢习惯...',
    statusColor: 'emerald',
    loading: true,
    history: [],
  });

  // 1. 定义数据拉取逻辑 (useCallback)
  // 核心：所有 Hooks 必须在顶层，不能有条件 return
  const fetchData = useCallback(async () => {
    // 即使没有 user，我们也需要保持 Hook 顺序，所以不能在这里 return Hook
    // 逻辑内的早 return 是允许的，因为它不影响 Hooks 的调用顺序
    if (!user) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    setStats(prev => ({ ...prev, loading: true }));
    try {
      // 获取基础目标
      const { data: profile } = await supabase
        .from('profiles')
        .select('manual_calorie_target')
        .eq('id', user.id)
        .single();

      const baseTarget = profile?.manual_calorie_target || 2100;

      // 获取今日摄入
      const today = new Date().toISOString().split('T')[0];
      const { data: todayRecords } = await supabase
        .from('nutrition_records')
        .select('calories')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      const consumed = todayRecords?.reduce((sum, r) => sum + (r.calories || 0), 0) || 0;

      // 获取历史平均 (7天)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: historyRecords } = await supabase
        .from('nutrition_records')
        .select('calories, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .lt('created_at', `${today}T00:00:00`);

      const historyMap: Record<string, number> = {};
      historyRecords?.forEach(r => {
        const date = r.created_at.split('T')[0];
        historyMap[date] = (historyMap[date] || 0) + (r.calories || 0);
      });
      const historyValues = Object.values(historyMap);
      const avgHistory = historyValues.length > 0 
        ? historyValues.reduce((a, b) => a + b, 0) / historyValues.length 
        : baseTarget;

      // 运动消耗 Mock
      const mockExerciseBurned = 350;
      
      // 动态目标计算
      let trendAdjustment = 0;
      if (historyValues.length >= 3) {
        trendAdjustment = avgHistory < baseTarget 
          ? (baseTarget - avgHistory) * 0.3 
          : (baseTarget - avgHistory) * 0.5;
      }
      
      const dynamicTarget = Math.round(baseTarget + trendAdjustment + mockExerciseBurned);
      const remaining = dynamicTarget - consumed;
      const remainingPercent = (remaining / dynamicTarget) * 100;

      // 状态颜色
      let statusColor: 'emerald' | 'amber' | 'rose' = 'emerald';
      if (remainingPercent < 30) statusColor = 'rose';
      else if (remainingPercent < 60) statusColor = 'amber';

      // 智能文案
      const hour = new Date().getHours();
      let insight = '保持当前节奏，你做得很好！';
      if (hour >= 22 && remaining > 400) insight = '夜深了且额度充足，建议摄入少量低卡高蛋白零食以助眠。';
      else if (remaining < 100 && remaining >= 0) insight = '今日目标即将达成！可以来杯无糖茶放松一下。';
      else if (remaining < 0) insight = '今日能量已满负荷，建议增加 20 分钟快走。';
      else if (mockExerciseBurned > 300) insight = `今日运动消耗了 ${mockExerciseBurned}kcal，额度已自动上调。`;

      setStats({
        consumed,
        baseTarget,
        dynamicTarget,
        remaining,
        remainingPercent,
        exerciseBurned: mockExerciseBurned,
        insight,
        statusColor,
        loading: false,
        history: historyValues,
      });
    } catch (error) {
      console.error('Kcal calculation error:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  // 2. 自动触发初始加载 (useEffect)
  // 必须始终调用，依赖项稳定
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...stats, refresh: fetchData };
};
