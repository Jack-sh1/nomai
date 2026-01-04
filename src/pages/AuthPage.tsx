import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCcw,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 错误文案本地化映射
 */
const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': '邮箱格式不正确或链接已失效',
  'User already registered': '该邮箱已注册，请直接使用 Magic Link 登录',
  'Email rate limit exceeded': '发送太频繁了，请稍等 60 秒再试',
  'Database error saving new user': '系统繁忙，请稍后再试',
  'default': '操作失败，请检查网络或联系支持'
};

const getFriendlyError = (message?: string) => {
  if (!message) return ERROR_MAP.default;
  for (const key in ERROR_MAP) {
    if (message.includes(key)) return ERROR_MAP[key];
  }
  return ERROR_MAP.default;
};

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 1. 处理倒计时
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // 2. 核心：监听 Auth 状态并处理 Onboarding 逻辑
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        try {
          // 查询用户的 profiles 信息
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_onboarded')
            .eq('id', session.user.id)
            .single();

          if (profileError || !profile?.is_onboarded) {
            // 如果没有 profile 或者未完成 onboarding，强制跳转到 settings
            navigate('/settings');
          } else {
            // 已完成用户跳转到 dashboard
            navigate('/dashboard');
          }
        } catch (err) {
          // 容错处理：即使 profile 查询失败也跳转到 settings 以防万一
          navigate('/settings');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // 3. 发送 Magic Link
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('请输入正确的邮箱地址');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // 自动注册新用户
          emailRedirectTo: window.location.origin + '/dashboard',
        }
      });

      if (error) throw error;

      setSent(true);
      setCountdown(60);
    } catch (err: any) {
      setError(getFriendlyError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col p-6 transition-colors duration-500">
      {/* 顶部 Branding */}
      <div className="mt-16 mb-12 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-6"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">NomAi</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">智能营养，丝滑开启</p>
      </div>

      {/* 主体卡片 */}
      <motion.div 
        layout
        className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
      >
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleMagicLink} 
              className="space-y-6"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">邮箱地址</label>
                  <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">无密码登录</span>
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-bold text-slate-800 dark:text-white placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-bold border border-rose-100 dark:border-rose-500/20"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-3xl font-black text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    发送魔法链接
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">已发送！</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-4">
                请检查您的邮箱 <span className="text-emerald-500 font-bold">{email}</span><br />
                点击邮件中的链接即可完成登录
              </p>
              
              <div className="mt-8 space-y-4">
                <button 
                  onClick={() => countdown === 0 && handleMagicLink({ preventDefault: () => {} } as any)}
                  disabled={countdown > 0 || loading}
                  className="flex items-center justify-center gap-2 mx-auto text-sm font-black text-emerald-500 disabled:text-slate-400 transition-colors"
                >
                  <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {countdown > 0 ? `${countdown}秒后可重发` : '没收到？重新发送'}
                </button>
                <button 
                  onClick={() => setSent(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  修改邮箱地址
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 安全提示 */}
      <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Supabase 安全加密</span>
      </div>

      {/* 底部信息 */}
      <p className="mt-auto py-8 text-center text-[10px] text-slate-400 font-medium leading-relaxed px-10">
        如果您是新用户，点击链接后将自动为您创建账号并进入 <span className="text-emerald-500 font-bold">资料完善</span> 流程。
      </p>
    </div>
  );
};

export default AuthPage;
