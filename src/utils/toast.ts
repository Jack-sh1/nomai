import toast, { type ToastOptions, type Renderable, type ValueOrFunction } from 'react-hot-toast';

/**
 * 核心价值总结：
 * 限制 Toast 数量（Limit: 3）是移动端用户体验的关键。
 * 过多的通知堆叠会遮挡操作界面，产生“垃圾信息”焦虑；
 * 保持简洁、及时的反馈能让 App 显得专业、有序且响应迅速。
 */

// 基础圆角与阴影配置
const baseStyle = {
  borderRadius: '20px',
  padding: '12px 24px',
  fontSize: '15px',
  fontWeight: '600',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// 获取动态样式（适配深色模式）
const getDynamicStyle = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    ...baseStyle,
    background: isDark ? '#1e293b' : '#ffffff', // slate-800 : white
    color: isDark ? '#f8fafc' : '#1e293b',      // slate-50 : slate-800
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
  };
};

/**
 * 封装 Toast 工具类
 */
export const showToast = {
  /**
   * 成功提示
   */
  success: (message: string, options?: ToastOptions) => {
    // 触发成功时，通常意味着之前的加载已完成，清除所有 loading
    toast.dismiss(); 
    return toast.success(message, {
      ...options,
      style: getDynamicStyle(),
    });
  },

  /**
   * 错误提示
   */
  error: (message: string = '操作失败，请重试', options?: ToastOptions) => {
    toast.dismiss();
    return toast.error(message, {
      ...options,
      duration: 5000,
      style: getDynamicStyle(),
    });
  },

  /**
   * 加载中提示
   */
  loading: (message: string = '处理中...', options?: ToastOptions) => {
    // 开启新加载前，清除旧的加载状态，避免重复堆叠
    toast.dismiss(); 
    return toast.loading(message, {
      ...options,
      style: getDynamicStyle(),
    });
  },

  /**
   * 异步操作联动（最推荐用法）
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
        success: {
          duration: 3000,
          ...options?.success,
        },
        error: {
          duration: 5000,
          ...options?.error,
        },
      }
    );
  },

  /**
   * 手动清除
   */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

export default showToast;
