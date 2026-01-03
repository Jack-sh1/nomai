import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Mail, Settings, Users } from 'lucide-react';
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

  // 点击外部关闭逻辑
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 如果点击的是菜单内部，不处理
      if (menuRef.current && menuRef.current.contains(event.target as Node)) {
        return;
      }
      onClose();
    };

    if (open) {
      // 使用 mousedown 体验更好，且需配合触发源的 stopPropagation
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
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
      showToast.error(`退出失败: ${err.message}`);
    } finally {
      setIsLoggingOut(false);
      setShowConfirm(false);
      onClose();
    }
  };

  if (!user) return null;

  return (
    <>
      <div 
        ref={menuRef}
        className={`absolute right-0 top-full mt-2 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'} ${className || ''}`}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 overflow-hidden"
            >
              {/* 账户信息卡片 */}
              <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 mx-2 rounded-xl mb-2">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
                  <Mail size={12} />
                  <span className="text-[10px] font-black uppercase tracking-wider">当前账号</span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user?.email}</p>
              </div>

              <div className="px-2 space-y-1">
                <button disabled className="flex items-center w-full gap-3 px-4 py-3 text-sm text-slate-400 dark:text-slate-600 cursor-not-allowed rounded-xl">
                  <Users size={18} />
                  <span className="font-medium">切换账号</span>
                  <span className="ml-auto text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">开发中</span>
                </button>

                <button
                  onClick={() => { onClose(); navigate('/settings'); }}
                  className="flex items-center w-full gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all group"
                >
                  <Settings size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <span className="font-semibold">个人设置与目标</span>
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-4" />

                <button
                  onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                  className="flex items-center w-full gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all group"
                >
                  <LogOut size={18} className="text-red-400 group-hover:text-red-500 transition-colors" />
                  <span className="font-bold">退出登录</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 退出确认模态框 */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setShowConfirm(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-8 z-[101]"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">确认退出？</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">退出后将清除本地缓存数据，下次登录需要重新加载。</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? '退出中...' : '确认退出'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserMenu;