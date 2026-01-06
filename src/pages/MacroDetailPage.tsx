import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Flame, 
  Loader2, 
  CalendarX, 
  TrendingUp,
  Utensils,
  Beef,
  Wheat,
  Droplets
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface NutritionRecord {
  id: string;
  food_name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

type MacroType = 'protein' | 'carbon' | 'fat';

const MacroDetailPage: React.FC = () => {
  const { type } = useParams<{ type: MacroType }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [records, setRecords] = useState<NutritionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 配置映射
  const config = useMemo(() => {
    switch (type) {
      case 'protein':
        return {
          title: '今日蛋白质明细',
          label: '蛋白质',
          unit: 'g',
          dbField: 'protein',
          color: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-500',
          bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
          icon: <Beef className="w-6 h-6" />,
          target: 150 // Mock target
        };
      case 'carbon':
        return {
          title: '今日碳水明细',
          label: '碳水化合物',
          unit: 'g',
          dbField: 'carbs',
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-500',
          bgLight: 'bg-amber-50 dark:bg-amber-900/20',
          icon: <Wheat className="w-6 h-6" />,
          target: 250 // Mock target
        };
      case 'fat':
        return {
          title: '今日脂肪明细',
          label: '脂肪',
          unit: 'g',
          dbField: 'fat',
          color: 'text-rose-600 dark:text-rose-400',
          bgColor: 'bg-rose-500',
          bgLight: 'bg-rose-50 dark:bg-rose-900/20',
          icon: <Droplets className="w-6 h-6" />,
          target: 70 // Mock target
        };
      default:
        return {
          title: '营养明细',
          label: '未知',
          unit: 'g',
          dbField: 'protein',
          color: 'text-slate-600',
          bgColor: 'bg-slate-500',
          bgLight: 'bg-slate-50',
          icon: <Flame className="w-6 h-6" />,
          target: 0
        };
    }
  }, [type]);

  // Fetch Data
  useEffect(() => {
    if (!user || !type) return;

    const fetchRecords = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      try {
        const { data, error } = await supabase
          .from('nutrition_records')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)
          .gt(config.dbField, 0) // Filter where macro > 0
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecords(data || []);
      } catch (err) {
        console.error('Error fetching records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user, type, config.dbField]);

  // Calculate Total
  const totalAmount = useMemo(() => {
    return records.reduce((acc, curr) => {
      // @ts-ignore: dynamic access
      return acc + (curr[config.dbField] || 0);
    }, 0);
  }, [records, config.dbField]);

  const progress = Math.min((totalAmount / config.target) * 100, 100);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-black text-slate-800 dark:text-white">{config.title}</h1>
        <div className="w-12" /> {/* Placeholder for balance */}
      </header>

      <main className="flex-1 px-6 pb-10 space-y-8">
        {/* 1. Summary Card */}
        <section className={`p-8 rounded-[40px] ${config.bgLight} border border-transparent dark:border-white/5`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 opacity-70 ${config.color.split(' ')[0]}`}>
                今日总摄入 Total Intake
              </p>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-5xl font-black tabular-nums ${config.color}`}
                >
                  {Math.round(totalAmount)}
                </motion.span>
                <span className="text-lg font-bold text-slate-400">/ {config.target}{config.unit}</span>
              </div>
            </div>
            <div className={`p-4 rounded-3xl bg-white dark:bg-slate-800 shadow-sm ${config.color}`}>
              {config.icon}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-white dark:bg-slate-800 rounded-full overflow-hidden p-1">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className={`h-full rounded-full ${config.bgColor}`}
            />
          </div>
          <p className="mt-3 text-right text-xs font-bold text-slate-400">
            已达成 {Math.round(progress)}%
          </p>
        </section>

        {/* 2. Future Placeholders */}
        <div className="flex gap-4">
          <button className="flex-1 py-4 px-4 bg-slate-50 dark:bg-slate-900 rounded-[24px] flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <TrendingUp className="w-4 h-4" />
            查看 7 天趋势
          </button>
          <button className="flex-1 py-4 px-4 bg-slate-50 dark:bg-slate-900 rounded-[24px] flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Utensils className="w-4 h-4" />
            推荐补充食物
          </button>
        </div>

        {/* 3. Records List */}
        <section>
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            详细记录
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg">
              {records.length}
            </span>
          </h3>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className={`w-8 h-8 animate-spin mb-4 ${config.color.split(' ')[0]}`} />
              <p className="text-sm font-bold text-slate-400">正在加载明细...</p>
            </div>
          ) : records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 bg-slate-50 dark:bg-slate-900 rounded-[28px] flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                      🥗
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-base mb-0.5">
                        {record.food_name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                          {record.amount}
                        </span>
                        <span>{record.calories} kcal</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xl font-black tabular-nums ${config.color}`}>
                      {/* @ts-ignore */}
                      {record[config.dbField]}
                      <span className="text-xs ml-0.5 opacity-60">g</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {config.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <CalendarX className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold mb-6">今天还没有摄入{config.label}哦</p>
              <button 
                onClick={() => navigate('/camera-scan')}
                className={`px-8 py-3 rounded-full text-white font-bold text-sm shadow-lg active:scale-95 transition-all ${config.bgColor}`}
              >
                去扫食物
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MacroDetailPage;
