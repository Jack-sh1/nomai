import toast, { type ToastOptions, type Renderable, type ValueOrFunction } from 'react-hot-toast';

/**
 * 核心价值总结：
 * react-hot-toast 提供了非阻塞、轻量级、高度可定制的通知体验，
 * 相比原生 alert，它不会打断用户操作流，支持动画、深色模式及 Promise 状态联动，
 * 是现代移动端 App 提升“高级感”和“反馈即时性”的必备利器。
 */

// 默认配置
const defaultOptions: ToastOptions = {
  style: {
    borderRadius: '16px',
    background: '#fff',
    color: '#1e293b',
    fontWeight: 500,
    fontSize: '14px',
    padding: '12px 20px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

// 深色模式检测并返回样式
const getDynamicStyle = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    ...defaultOptions.style,
    background: isDark ? '#0f172a' : '#fff',
    color: isDark ? '#f1f5f9' : '#1e293b',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
  };
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...options,
      style: getDynamicStyle(),
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    });
  },

  error: (message: string = '操作失败，请重试', options?: ToastOptions) => {
    return toast.error(message, {
      ...options,
      style: getDynamicStyle(),
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
      duration: 5000,
    });
  },

  loading: (message: string = '处理中...', options?: ToastOptions) => {
    return toast.loading(message, {
      ...options,
      style: getDynamicStyle(),
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * 封装 Promise 联动
   * @param promise 异步操作
   * @param messages 状态消息
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: Renderable;
      success: ValueOrFunction<Renderable, T>;
      error: ValueOrFunction<Renderable, any>;
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      messages,
      {
        ...options,
        style: getDynamicStyle(),
      }
    );
  },
};

export default showToast;
