import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster, useToasterStore, toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

import AuthPage from './pages/AuthPage';
import ScanResultPage from './pages/ScanResultPage';
import MealPlanPage from './pages/MealPlanPage';
import DashboardPage from './pages/DashboardPage';
import CameraScanPage from './pages/CameraScanPage';
import SettingsPage from './pages/SettingsPage';
import TrendDetailPage from './pages/TrendDetailPage';
import KcalDetailPage from './pages/KcalDetailPage';
import MacroDetailPage from './pages/MacroDetailPage';

// 路由保护组件
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireOnboarding?: boolean }> = ({ 
  children, 
  requireOnboarding = true 
}) => {
  const { session, loading, isOnboarded } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. 未登录 -> 跳 /auth
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // 2. 已登录但未完成 onboarding -> 跳 /settings (除非当前就在 /settings)
  if (requireOnboarding && !isOnboarded) {
    return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { session, isOnboarded } = useAuth();

  return (
    <Routes>
      {/* 公开/半公开路由 */}
      <Route 
        path="/auth" 
        element={!session ? <AuthPage /> : <Navigate to={isOnboarded ? "/dashboard" : "/settings"} replace />} 
      />

      {/* 强制引导路由 (登录即可访问) */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute requireOnboarding={false}>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />

      {/* 完全保护路由 (登录且完成 onboarding) */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/scan-result" element={<ProtectedRoute><ScanResultPage /></ProtectedRoute>} />
      <Route path="/meal-plan" element={<ProtectedRoute><MealPlanPage /></ProtectedRoute>} />
      <Route path="/camera-scan" element={<ProtectedRoute><CameraScanPage /></ProtectedRoute>} />
      <Route path="/trend" element={<ProtectedRoute><TrendDetailPage /></ProtectedRoute>} />
      <Route path="/kcal-detail" element={<ProtectedRoute><KcalDetailPage /></ProtectedRoute>} />
      <Route path="/macro-detail/:type" element={<ProtectedRoute><MacroDetailPage /></ProtectedRoute>} />

      {/* 默认路由 */}
      <Route 
        path="/" 
        element={<Navigate to={session ? (isOnboarded ? "/dashboard" : "/settings") : "/auth"} replace />} 
      />
    </Routes>
  );
}

function App() {
  const { toasts } = useToasterStore();
  // 启用全局网络状态监听
  useNetworkStatus();

  // 限制同时显示的 Toast 数量为 3 个
  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= 3)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  return (
    <GlobalErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <Toaster 
            position="bottom-center" 
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '20px',
                background: '#1e293b',
                color: '#fff',
                fontSize: '14px',
                padding: '12px 20px',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}

export default App;
