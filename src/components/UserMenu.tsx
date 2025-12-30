import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, Mail, Settings, Users, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      // 1. 执行 Supabase 登出
      await signOut();
      
      // 2. 清除所有本地存储，确保隐私安全
      localStorage.clear();
      // 针对 Supabase 的特定 token 进行二次清理（双重保险）
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // 未来：如果使用了本地数据库，在此处清理
      // if (window.indexedDB) {
      //   // // 未来：if (dexieDB) dexieDB.delete()
      // }

      // 3. UI 反馈与跳转
      setShowConfirm(false);
      setIsOpen(false);
      toast.success('已安全退出登录', {
        icon: '👋',
        style: {
          borderRadius: '16px',
          background: '#10b981',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
      
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 500);
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || '退出失败，请检查网络后重试');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* 1. 头像按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:ring-4 hover:ring-emerald-50 dark:hover:ring-emerald-900/20 transition-all duration-300 border border-emerald-200 dark:border-emerald-800 shadow-sm"
      >
        <UserIcon size={20} />
      </motion.button>

      {/* 2. 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, transformOrigin: 'top right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-50 overflow-hidden"
          >
            {/* 用户信息卡片 */}
            <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 mx-3 rounded-2xl border border-slate-50 dark:border-slate-800/50 mb-2">
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1.5">
                <Mail size={12} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">当前登录账号</span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {user?.email}
              </p>
            </div>

            <div className="px-2 space-y-1">
              {/* 多账号管理（开发中占位） */}
              <div className="relative group">
                <button
                  disabled
                  title="功能开发中"
                  className="flex items-center w-full gap-3 px-4 py-3 text-sm text-slate-400 dark:text-slate-600 cursor-not-allowed rounded-xl transition-colors"
                >
                  <Users size={18} />
                  <span className="font-medium">切换账号</span>
                  <span className="ml-auto text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">开发中</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center w-full gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all group"
              >
                <Settings size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <span className="font-medium">个人设置与目标</span>
              </button>

              <div className="h-px bg-slate-50 dark:bg-slate-800 my-1 mx-4" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowConfirm(true);
                }}
                className="flex items-center w-full gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all group"
              >
                <LogOut size={18} className="text-red-400 group-hover:text-red-500 transition-colors" />
                <span className="font-bold">退出登录</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 登出确认弹窗 (Modal) */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setShowConfirm(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* 弹窗主体 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  确定退出登录吗？
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                  退出后档案会保留，下次登录可直接使用。
                </p>

                <div className="flex flex-col w-full gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-2xl font-black text-lg shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoggingOut ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogOut size={20} />
                        确认退出
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirm(false)}
                    disabled={isLoggingOut}
                    className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold transition-all"
                  >
                    取消
                  </motion.button>
                </div>
              </div>

              {/* 右上角关闭按钮 */}
              {!isLoggingOut && (
                <button
                  onClick={() => setShowConfirm(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
