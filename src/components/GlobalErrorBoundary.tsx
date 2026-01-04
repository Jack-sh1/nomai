import { Component, type ErrorInfo, type ReactNode } from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * GlobalErrorBoundary
 * 捕获渲染错误及网络请求导致的 Failed to fetch 崩溃。
 * 提供友好的错误界面和重试按钮。
 */
class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // 更新 state，下次渲染将显示降级 UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isNetworkError = 
        this.state.error?.message?.includes('fetch') || 
        this.state.error?.message?.includes('network') ||
        !navigator.onLine;

      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-50 dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 text-center shadow-xl"
          >
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              {isNetworkError ? (
                <WifiOff size={40} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle size={40} className="text-red-500" />
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
              {isNetworkError ? '网络连接似乎中断了' : '应用遇到了点小问题'}
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {isNetworkError 
                ? '请检查您的 Wi-Fi 或蜂窝数据连接，连接恢复后应用将自动尝试重新加载。' 
                : '别担心，这只是暂时的。您可以尝试刷新页面或点击下方按钮重试。'}
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={this.handleRetry}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-3"
            >
              <RefreshCw size={20} />
              重试并加载
            </motion.button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 text-sm font-bold text-slate-400 hover:text-emerald-500 transition-colors"
            >
              返回首页
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
