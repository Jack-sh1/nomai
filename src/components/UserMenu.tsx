import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, Mail, Settings, Users, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { showToast } from '../utils/toast';
import { clearLocalDBOnLogout } from '../utils/dbCleanup';

interface UserMenuProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ open, onClose, className }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭监听
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open, onClose]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.clear();
      sessionStorage.clear();
      await clearLocalDBOnLogout();

      showToast.success('已安全退出登录');
      navigate('/auth', { replace: true });
    } catch (err: any) {
      console.error('Logout error:', err);
      showToast.error(`退出失败: ${err.message}`);
    } finally {
      setIsLoggingOut(false);
      setShowConfirm(false);
      onClose();
    }
  };

  if (!user) return null;

  return (
    <div className={`absolute right-0 top-full mt-2 z-50 ${className || ''}`} ref={menuRef}>
      {/* 1. 下拉菜单面板 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: { type: 'spring', damping: 20, stiffness: 300 }
            }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            style={{ transformOrigin: 'top right' }}
            className="w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 overflow-hidden pointer-events-auto"
          >
            {/* 账户信息 */}
            <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 mx-3 rounded-xl border border-slate-100 dark:border-slate-800/50 mb-2">
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
                <Mail size={12} />
                <span className="text-[10px] font-black uppercase tracking-wider">当前账号</span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {user?.email}
              </p>
            </div>

            <div className="px-2 space-y-0.5">
              <button
                disabled
                className="flex items-center w-full gap-3 px-4 py-3 text-sm text-slate-400 dark:text-slate-600 cursor-not-allowed rounded-xl transition-colors group relative"
              >
                <Users size={18} />
                <span className="font-medium">切换账号</span>
                <span className="ml-auto text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">开发中</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/settings');
                }}
                className="flex items-center w-full gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all group"
              >
                <Settings size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <span className="font-medium">个人设置与目标</span>
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-4" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
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

      {/* 2. 退出确认模态框 - z-100 */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setShowConfirm(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm pointer-events-auto"
            />
            
            {/* 弹窗主体 - 移动端半屏弹出 / 桌面端居中 */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { type: 'spring', damping: 25, stiffness: 300 }
              }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-8 pb-10 sm:pb-8 z-[101] pointer-events-auto"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  确定退出登录吗？
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                  退出后档案会安全保留，下次登录可继续使用。
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
