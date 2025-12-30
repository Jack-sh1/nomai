import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronLeft, 
  User, 
  Target, 
  Zap, 
  Heart, 
  Info,
  Check,
  RotateCcw,
  Flame,
  Scale,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WeightInput from '../components/WeightInput';
import UserMenu from '../components/UserMenu';

// --- Types ---
type Gender = 'male' | 'female' | 'other';
type FitnessGoal = 'lose' | 'maintain' | 'gain';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';

interface UserProfile {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  goal: FitnessGoal;
  activity: ActivityLevel;
  dietPreferences: string[];
  allergies: string[];
  manualCalorieTarget: number | null;
}

// --- Constants ---
const DIET_OPTIONS = [
  '少油低脂', '高蛋白', '低碳水', '素食', '纯素', '不吃乳制品', '生酮', '地中海饮食'
];

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.9,
};

// --- Sub-components ---

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
    </div>
    <div className="space-y-6">{children}</div>
  </div>
);

const OptionGroup: React.FC<{
  label: string;
  options: { label: string; value: string }[];
  currentValue: string;
  onChange: (val: any) => void;
}> = ({ label, options, currentValue, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">{label}</label>
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`py-3 px-2 rounded-2xl text-sm font-semibold transition-all ${
            currentValue === opt.value
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const NumberInput: React.FC<{
  label: string;
  value: number;
  unit: string;
  onChange: (val: number) => void;
  min: number;
  max: number;
}> = ({ label, value, unit, onChange, min, max }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</label>
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 px-3">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-16 bg-transparent border-none text-right font-black text-lg text-slate-800 dark:text-slate-100 focus:ring-0 p-2"
      />
      <span className="text-sm font-bold text-slate-400">{unit}</span>
    </div>
  </div>
);

const MultiSelectTags: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}> = ({ label, options, selected, onChange }) => {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selected.includes(opt)
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main Page Component ---

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, checkOnboardingStatus } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initial State (can be fetched from Supabase in useEffect)
  const [profile, setProfile] = useState<UserProfile>({
    gender: 'male',
    age: 28,
    height: 175,
    weight: 70,
    goal: 'lose',
    activity: 'moderate',
    dietPreferences: ['高蛋白', '少油低脂'],
    allergies: [],
    manualCalorieTarget: null,
  });

  // Fetch initial profile if exists
  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data && !error) {
        setProfile({
          gender: data.gender || 'male',
          age: data.age || 28,
          height: data.height || 175,
          weight: data.weight || 70,
          goal: data.goal || 'lose',
          activity: data.activity || 'moderate',
          dietPreferences: data.diet_preferences || [],
          allergies: data.allergies || [],
          manualCalorieTarget: data.manual_calorie_target || null,
        });
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      console.error('[Settings] No user session found during save');
      return;
    }
    
    setIsSaving(true);
    // 1. 构造完整 Payload，确保包含 is_onboarded: true
    const payload = {
      id: user.id,
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      goal: profile.goal,
      activity: profile.activity,
      diet_preferences: profile.dietPreferences,
      allergies: profile.allergies,
      is_onboarded: true, // 核心：必须显式设为 true
      updated_at: new Date().toISOString(),
    };

    console.log('[Settings] 🚀 Starting save profile...', { uid: user.id, payload });

    try {
      // 2. 使用 upsert 确保记录存在即更新，不存在即插入
      const { data, error, status } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('[Settings] ❌ Upsert Error:', { code: error.code, message: error.message, details: error.details });
        throw error;
      }

      console.log('[Settings] ✅ Save response success:', { status, data });

      // 3. 强制刷新 AuthContext 中的 onboarding 状态
      // 这里传递 user 确保 checkOnboardingStatus 内部不会因为异步 session 延迟而拿到 null
      console.log('[Settings] 🔄 Refreshing global onboarding status...');
      const isNowOnboarded = await checkOnboardingStatus(user);
      
      if (!isNowOnboarded) {
        console.warn('[Settings] ⚠️ checkOnboardingStatus returned false after successful save! Retrying in 500ms...');
        await new Promise(resolve => setTimeout(resolve, 500));
        await checkOnboardingStatus(user);
      }

      setShowToast(true);
      
      // 4. 延迟跳转：给数据库副本同步和状态更新留出一点点喘息时间（500ms）
      setTimeout(() => {
        setShowToast(false);
        console.log('[Settings] 🏁 Navigating to dashboard...');
        navigate('/dashboard', { replace: true });
      }, 800);

    } catch (err: any) {
      console.error('[Settings] 💥 Critical Save Error:', err);
      alert(`保存资料失败: ${err.message || '网络异常'}\n请检查是否已运行 profiles 表的 SQL 修复脚本。`);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate Recommendation
  const recommendedCalories = useMemo(() => {
    const { weight, height, age, gender, activity, goal } = profile;
    // Mifflin-St Jeor Formula
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') bmr += 5;
    else if (gender === 'female') bmr -= 161;
    else bmr -= 78; // average for other

    let tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
    
    // Goal Adjustment
    if (goal === 'lose') tdee -= 500;
    else if (goal === 'gain') tdee += 300;
    
    return Math.round(tdee);
  }, [profile]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-50/80 dark:bg-black/80 backdrop-blur-xl px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-slate-900 dark:text-white">完善你的资料</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">让 AI 为你定制精准的减脂/增肌方案</p>
        </div>
        <UserMenu />
      </header>

      <main className="max-w-md mx-auto px-4 mt-4 space-y-4">
        {/* Section 1: Basic Info */}
        <SectionCard title="基础身体数据" icon={<User className="w-5 h-5" />}>
          <OptionGroup
            label="性别"
            options={[
              { label: '男', value: 'male' },
              { label: '女', value: 'female' },
              { label: '其他', value: 'other' },
            ]}
            currentValue={profile.gender}
            onChange={(val) => setProfile({ ...profile, gender: val })}
          />
          <div className="space-y-4 pt-2">
            <NumberInput
              label="年龄"
              value={profile.age}
              unit="岁"
              min={18}
              max={80}
              onChange={(val) => setProfile({ ...profile, age: val })}
            />
            <NumberInput
              label="身高"
              value={profile.height}
              unit="cm"
              min={100}
              max={250}
              onChange={(val) => setProfile({ ...profile, height: val })}
            />
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 ml-1">体重</label>
              <WeightInput
                value={profile.weight}
                onChange={(val) => setProfile({ ...profile, weight: val })}
              />
            </div>
          </div>
        </SectionCard>

        {/* Section 2: Goals & Activity */}
        <SectionCard title="健身目标与活跃度" icon={<Target className="w-5 h-5" />}>
          <OptionGroup
            label="当前目标"
            options={[
              { label: '减脂', value: 'lose' },
              { label: '维持', value: 'maintain' },
              { label: '增肌', value: 'gain' },
            ]}
            currentValue={profile.goal}
            onChange={(val) => setProfile({ ...profile, goal: val })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">活动水平</label>
            <div className="space-y-2">
              {[
                { id: 'sedentary', title: '久坐', desc: '办公室工作，极少运动' },
                { id: 'light', title: '轻度', desc: '每周 1-3 次轻微运动' },
                { id: 'moderate', title: '中等', desc: '每周 3-5 次中等运动' },
                { id: 'high', title: '高强度', desc: '每周 6-7 次高强度运动' },
                { id: 'very_high', title: '极高', desc: '运动员/体力劳动者' },
              ].map((act) => (
                <button
                  key={act.id}
                  onClick={() => setProfile({ ...profile, activity: act.id as ActivityLevel })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    profile.activity === act.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5'
                      : 'border-transparent bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  <div className="text-left">
                    <p className={`font-bold ${profile.activity === act.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {act.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{act.desc}</p>
                  </div>
                  {profile.activity === act.id && <Check className="w-5 h-5 text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Section 3: Dietary Preferences */}
        <SectionCard title="饮食习惯" icon={<Heart className="w-5 h-5" />}>
          <MultiSelectTags
            label="饮食偏好"
            options={DIET_OPTIONS}
            selected={profile.dietPreferences}
            onChange={(val) => setProfile({ ...profile, dietPreferences: val })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">忌口 / 过敏 (选填)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="例如：香菜、花生、海鲜..."
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = e.currentTarget.value.trim();
                    if (val && !profile.allergies.includes(val)) {
                      setProfile({ ...profile, allergies: [...profile.allergies, val] });
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>
            {profile.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.allergies.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">
                    {tag}
                    <button onClick={() => setProfile({ ...profile, allergies: profile.allergies.filter(t => t !== tag) })}>
                      <RotateCcw className="w-3 h-3 rotate-45" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Section 4: AI Recommendation */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 fill-white" />
            <h2 className="text-lg font-bold">AI 智能推荐目标</h2>
          </div>
          <div className="flex items-end gap-3 mb-6">
            <div className="flex-1">
              <p className="text-emerald-50 text-xs mb-1 uppercase tracking-wider font-bold opacity-80">每日推荐摄入量</p>
              <div className="flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={recommendedCalories}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-5xl font-black tabular-nums"
                  >
                    {profile.manualCalorieTarget || recommendedCalories}
                  </motion.span>
                </AnimatePresence>
                <span className="text-lg font-bold opacity-80">kcal</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-300" />
              <div className="text-xs">
                <p className="font-bold">高精度计算</p>
                <p className="opacity-70">基于 MSJ 公式</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-emerald-50 leading-relaxed bg-white/10 p-3 rounded-xl border border-white/10">
            <Info className="w-4 h-4 inline mr-1 mb-1" />
            系统已自动根据你的基础代谢 (BMR) 与活跃度系数计算出该数值。你可以手动微调，但建议初期按此目标执行。
          </p>
        </div>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-30">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black text-lg shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving ? '正在保存...' : '保存并使用'}
            {!isSaving && <Check className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-3 text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-slate-800 transition-colors"
          >
            稍后填写，先随便看看
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl"
          >
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">资料保存成功！AI 已为你更新方案</span>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomScrollHint />
    </div>
  );
};

const BottomScrollHint: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      // 如果距离底部小于 200px，隐藏提示
      if (scrollHeight - scrollTop - clientHeight < 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // 初始检查一次
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed bottom-32 left-0 right-0 flex justify-center pointer-events-none transition-all duration-500 z-10 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white/50 dark:bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
          继续往下设置
        </span>
        <div className="animate-bounce duration-1000">
          <ChevronDown className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
