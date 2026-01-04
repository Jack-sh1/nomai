interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class SafeFetchError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'SafeFetchError';
    this.status = status;
    this.code = code;
  }
}

/**
 * 安全的 Fetch 封装
 * 特性：超时控制、自动重试、网络状态检测、错误统一处理
 */
export const safeFetch = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  const { 
    retries = 3, 
    retryDelay = 1000, 
    timeout = 10000, 
    ...fetchOptions 
  } = options;

  // 1. 网络状态预检查
  if (!navigator.onLine) {
    throw new SafeFetchError('Network offline', 0, 'OFFLINE');
  }

  // 2. 超时控制
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(id);

    // 3. HTTP 错误处理 (4xx, 5xx)
    if (!response.ok) {
      // 4xx 客户端错误通常不重试 (除非特定状态码如 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new SafeFetchError(`HTTP Error ${response.status}`, response.status, 'CLIENT_ERROR');
      }
      // 5xx 或 429 抛出以触发重试
      throw new SafeFetchError(`Server Error ${response.status}`, response.status, 'SERVER_ERROR');
    }

    return response;

  } catch (error: any) {
    clearTimeout(id);

    // 4. 自动重试逻辑
    if (retries > 0) {
      const isRetryable = 
        error.name === 'AbortError' || // 超时
        error.name === 'TypeError' ||  // 网络错误/CORS
        error.code === 'SERVER_ERROR'; // 服务端错误

      if (isRetryable) {
        console.warn(`Fetch failed, retrying... (${retries} left). Reason: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        // 指数退避：下一次延迟翻倍
        return safeFetch(url, { 
          ...options, 
          retries: retries - 1, 
          retryDelay: retryDelay * 2 
        });
      }
    }

    // 5. 错误上报 (Chrome Extension 环境)
    // @ts-ignore - Chrome API type definition might be missing in this web project
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        // @ts-ignore
        chrome.runtime.sendMessage({
          type: 'FETCH_ERROR',
          payload: { url, message: error.message }
        });
      } catch (e) {
        // 忽略发送失败
      }
    }

    throw new SafeFetchError(error.message || 'Fetch failed', 0, 'NETWORK_ERROR');
  }
};
