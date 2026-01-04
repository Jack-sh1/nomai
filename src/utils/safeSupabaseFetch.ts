import { PostgrestError } from '@supabase/supabase-js';

// Supabase 网络请求重试工具
// 使用指数退避算法

interface FetchOptions {
  retries?: number;
  retryDelay?: number;
}

export const safeSupabaseFetch = async <T>(
  fetcher: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: PostgrestError | null }> => {
  const { retries = 3, retryDelay = 1000 } = options;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      if (!navigator.onLine) {
        throw new Error('OFFLINE');
      }

      const { data, error } = await fetcher();

      if (error) {
        // 如果是 PGRST 错误 (PostgREST Error)，通常是 SQL 问题，不重试
        if (error.code.startsWith('PGRST')) {
          return { data, error };
        }
        // 如果是 5xx (服务器错误) 或 连接重置，抛出以触发重试
        throw error;
      }

      return { data, error: null };
    } catch (err: any) {
      attempt++;
      console.warn(`[SafeSupabase] Attempt ${attempt} failed:`, err.message || err);

      if (attempt > retries) {
        // 最后一次尝试也失败
        return { 
          data: null, 
          error: { 
            message: err.message || 'Network request failed', 
            code: 'NETWORK_ERROR', 
            details: '', 
            hint: '',
            name: 'PostgrestError' 
          } 
        };
      }

      // 指数退避：1s, 2s, 4s...
      const delay = retryDelay * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return { data: null, error: null };
};
