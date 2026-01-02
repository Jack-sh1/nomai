import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isOnboarded: boolean;
  checkOnboardingStatus: (currentUser?: User | null) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  
  const isInitialized = useRef(false);
  const loadingTimeoutRef = useRef<any>(null);

  const log = (msg: string, data?: any) => {
    console.log(`[${new Date().toLocaleTimeString()}] [Auth] ${msg}`, data || '');
  };

  const checkOnboardingStatus = async (currentUser?: User | null): Promise<boolean> => {
    const targetUser = currentUser || user || (await supabase.auth.getUser()).data.user;
    if (!targetUser) {
      log('CheckOnboarding: ❌ No user found, setting false');
      setIsOnboarded(false);
      return false;
    }

    try {
      log('CheckOnboarding: 🔍 Querying profiles for', targetUser.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_onboarded')
        .eq('id', targetUser.id)
        .maybeSingle();

      // 处理表不存在或查询错误
      if (error) {
        if (error.code === 'PGRST204' || error.code === 'PGRST205') {
          log('CheckOnboarding: ⚠️ Table "profiles" might not exist or empty. Please run SQL.');
        }
        throw error;
      }

      if (!data) {
        log('CheckOnboarding: 🆕 Profile missing, auto-creating default...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: targetUser.id, is_onboarded: false }]);
        
        if (insertError) throw insertError;
        setIsOnboarded(false);
        return false;
      }

      log('CheckOnboarding: ✅ Success', { isOnboarded: data.is_onboarded });
      setIsOnboarded(data.is_onboarded);
      return data.is_onboarded;
    } catch (err) {
      log('CheckOnboarding: 💥 ERROR occurred', err);
      setIsOnboarded(false);
      return false;
    } finally {
      // 无论成功失败，确保结束 loading
      setLoading(false);
    }
  };

  const handleSession = async (currentSession: Session | null, event?: string) => {
    log(`HandleSession: ⚡ Event=${event || 'INITIAL'}`, { uid: currentSession?.user?.id });
    
    setSession(currentSession);
    setUser(currentSession?.user ?? null);

    if (currentSession?.user) {
      await checkOnboardingStatus(currentSession.user);
    } else {
      setIsOnboarded(false);
      setLoading(false);
    }

    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
  };

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    log('🚀 Initializing AuthProvider...');

    // 监听网络恢复事件，自动重试 session 刷新
    const handleReconnect = () => {
      log('🌐 Network reconnected, retrying session check...');
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        handleSession(s, 'RECONNECTED');
      });
    };
    window.addEventListener('network-reconnected', handleReconnect);

    // 8秒超时保护：防止数据库查询挂起导致页面永久转圈
    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        log('⏰ Auth timeout reached, forcing loading false');
        setLoading(false);
      }
    }, 8000);

    // 获取初始 Session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      handleSession(s, 'INITIAL_FETCH');
    }).catch(err => {
      log('💥 INITIAL_FETCH ERROR', err);
      // 如果是网络错误，我们依赖网络监听器重试，但这里需要关闭 loading
      setLoading(false);
    });

    // 监听 Auth 状态变更
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      handleSession(s, _event);
    });

    return () => {
      subscription.unsubscribe();
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      window.removeEventListener('network-reconnected', handleReconnect);
    };
  }, []);

  const signOut = async () => {
    log('🚪 Signing out...');
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-center">
          <p className="text-emerald-600 dark:text-emerald-400 font-black text-lg animate-pulse mb-1">
            正在准备方案...
          </p>
          <p className="text-slate-400 text-xs">同步加密身份信息中</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, isOnboarded, checkOnboardingStatus, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
