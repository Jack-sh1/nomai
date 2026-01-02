import { useState, useEffect } from 'react';
import { showToast } from '../utils/toast';

/**
 * useNetworkStatus Hook
 * 监听全局网络连接状态，并自动发送 Toast 提醒。
 * 用于处理 net::ERR_INTERNET_DISCONNECTED 和 Failed to fetch 等网络错误。
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast.success('网络已恢复连接', {
        icon: '🌐',
        duration: 3000,
      });
      // 网络恢复时，可以触发页面数据刷新
      window.dispatchEvent(new CustomEvent('network-reconnected'));
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast.error('网络已断开，请检查您的连接', {
        icon: '📡',
        duration: Infinity, // 持续显示直到恢复
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};
