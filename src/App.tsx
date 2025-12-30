import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

import AuthPage from './pages/AuthPage';
import ScanResultPage from './pages/ScanResultPage';
import MealPlanPage from './pages/MealPlanPage';
import DashboardPage from './pages/DashboardPage';
import CameraScanPage from './pages/CameraScanPage';
import SettingsPage from './pages/SettingsPage';
import TrendDetailPage from './pages/TrendDetailPage';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. 监听 Auth 状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 公共路由 */}
        <Route 
          path="/auth" 
          element={!session ? <AuthPage /> : <Navigate to="/dashboard" replace />} 
        />

        {/* 受保护路由 */}
        <Route 
          path="/dashboard" 
          element={session ? <DashboardPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/scan-result" 
          element={session ? <ScanResultPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/meal-plan" 
          element={session ? <MealPlanPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/camera-scan" 
          element={session ? <CameraScanPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/settings" 
          element={session ? <SettingsPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/trend" 
          element={session ? <TrendDetailPage /> : <Navigate to="/auth" replace />} 
        />

        {/* 默认路由 */}
        <Route 
          path="/" 
          element={<Navigate to={session ? "/dashboard" : "/auth"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
