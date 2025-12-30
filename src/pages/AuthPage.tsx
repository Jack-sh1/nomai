import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Chrome,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateForm = () => {
    if (!email.includes('@')) return '请输入有效的邮箱地址';
    if (password.length < 6) return '密码长度至少为 6 位';
    if (mode === 'register' && password !== confirmPassword) return '两次输入的密码不一致';
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // 如果开启了邮箱验证，可能需要提示用户检查邮箱
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || '操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google 登录失败');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-slate-950 flex flex-col p-6 transition-colors duration-300">
      {/* Top Decoration */}
      <div className="mt-12 mb-8 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-6"
        >
          <Leaf className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">NomAi</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          {mode === 'login' ? '欢迎回来，开始健康每一天' : '加入我们，开启智能营养之旅'}
        </p>
      </div>

      {/* Main Form Card */}
      <motion.div 
        layout
        className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl shadow-emerald-500/5 border border-emerald-100/50 dark:border-slate-800"
      >
        <form onSubmit={handleAuth} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">邮箱地址</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-medium text-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">登录密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-medium text-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Confirm Password (Register Mode only) */}
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-medium text-slate-800 dark:text-white"
                    required={mode === 'register'}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-bold"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-3xl font-black text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? '立即登录' : '创建账号'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-slate-500 dark:text-slate-400 text-sm font-bold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            {mode === 'login' ? '还没有账号？ 立即注册' : '已有账号？ 直接登录'}
          </button>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4 px-4">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">或者</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Third Party Login */}
      <button 
        onClick={handleGoogleLogin}
        className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center gap-3 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
      >
        <Chrome className="w-5 h-5" />
        Google 一键登录
      </button>

      {/* Footer */}
      <p className="mt-auto py-8 text-center text-[10px] text-slate-400 font-medium leading-relaxed">
        点击登录即表示您同意我们的 <br />
        <span className="underline decoration-slate-300 underline-offset-2">服务条款</span> 和 <span className="underline decoration-slate-300 underline-offset-2">隐私政策</span>
      </p>
    </div>
  );
};

export default AuthPage;
