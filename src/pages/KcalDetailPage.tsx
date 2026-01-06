import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Loader2, CalendarX, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface NutritionRecord {
  id: string;
  food_name: string;
  amount: string; // e.g. "100g" or "1个"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

const KcalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [records, setRecords] = useState<NutritionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTodayRecords = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      try {
        const { data, error } = await supabase
          .from('nutrition_records')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecords(data || []);
      } catch (err) {
        console.error('Error fetching records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayRecords();
  }, [user]);

  // 计算总和
  const totals = useMemo(() => {
    return records.reduce(
      (acc, curr) => ({
        calories: acc.calories + (curr.calories || 0),
        protein: acc.protein + (curr.protein || 0),
        carbs: acc.carbs + (curr.carbs || 0),
        fat: acc.fat + (curr.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [records]);

  // 基础目标 (简单 Mock 或从 Context 获取，这里简单 Mock)
  const TARGET_KCAL = 2100;
  const remaining = TARGET_KCAL - totals.calories;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      {/* 顶部导航 */}
      <header className="px-6 py-6 flex items-center gap-4 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-black text-slate-800 dark:text-white">今日热量分解</h1>
      </header>

      <main className="flex-1 px-6 pb-12">
        {/* 1. 顶部总览卡片 */}
        <section className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-[32px]">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">今日已摄入</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-emerald-500 tabular-nums">{totals.calories}</span>
                <span className="text-sm font-bold text-slate-400">/ {TARGET_KCAL} kcal</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">剩余额度</p>
              <span className={`text-xl font-black tabular-nums ${remaining >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-500'}`}>
                {remaining}
              </span>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totals.calories / TARGET_KCAL) * 100, 100)}%` }}
              className={`h-full rounded-full ${remaining >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
          </div>

          {/* 宏量营养素小结 */}
          <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>P: {totals.protein.toFixed(1)}g</span>
            <span>C: {totals.carbs.toFixed(1)}g</span>
            <span>F: {totals.fat.toFixed(1)}g</span>
          </div>
        </section>

        {/* 2. 详细记录列表 */}
        <h2 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          摄入明细
        </h2>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
            <p className="text-sm font-bold">正在加载记录...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <CalendarX className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">今天还没有记录哦～</h3>
            <p className="text-slate-400 text-sm mb-6">保持记录习惯是达成目标的第一步！</p>
            <button 
              onClick={() => navigate('/camera-scan')}
              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              去扫食物
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record, index) => (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-white mb-0.5">
                      {record.food_name || '未命名食物'}
                    </h3>
                    <p className="text-xs font-bold text-slate-400">
                      {new Date(record.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })} · {record.amount}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {record.calories}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">kcal</span>
                  </div>
                </div>

                {/* 宏量营养条 */}
                <div className="flex gap-2 mt-3">
                  <MacroBadge label="P" value={record.protein} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" />
                  <MacroBadge label="C" value={record.carbs} color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" />
                  <MacroBadge label="F" value={record.fat} color="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const MacroBadge: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 ${color}`}>
    <span>{label}</span>
    <span>{value}g</span>
  </div>
);

export default KcalDetailPage;
