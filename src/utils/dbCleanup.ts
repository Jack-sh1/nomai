import Dexie from 'dexie';
import { showToast } from './toast';

/**
 * 核心价值总结：
 * 清理 IndexedDB 是保护用户隐私及防止多账号数据污染的最后一道防线。
 * 对于 AI 营养 App 而言，本地可能缓存了大量的饮食图片、历史记录及模型参数，
 * 彻底物理删除数据库能确保“人走数清”，避免敏感健康数据残留在设备中。
 */

const DB_PREFIX = 'nomai-';

/**
 * 登出时清理所有本地数据库的工具函数
 */
export const clearLocalDBOnLogout = async (): Promise<void> => {
  console.group('🧹 [Database Cleanup] Starting...');
  const startTime = Date.now();

  try {
    // 1. 处理 Dexie 数据库 (如果项目中已定义)
    // Dexie.getDatabaseNames() 允许我们获取所有数据库名
    if (typeof Dexie !== 'undefined') {
      const dbNames = await Dexie.getDatabaseNames();
      const nomaiDbs = dbNames.filter(name => name.startsWith(DB_PREFIX) || name === 'NomAIDatabase');
      
      if (nomaiDbs.length > 0) {
        console.log(`[Dexie] Found ${nomaiDbs.length} databases to delete:`, nomaiDbs);
        await Promise.all(nomaiDbs.map(name => {
          console.log(`[Dexie] Deleting database: ${name}`);
          return new Dexie(name).delete();
        }));
      }
    }

    // 2. 处理原生 IndexedDB Fallback (针对非 Dexie 创建或特定命名的库)
    // 某些浏览器支持 webkitGetDatabaseNames，但它不是标准
    if (window.indexedDB && 'databases' in window.indexedDB) {
      // @ts-ignore - databases() is a modern standard but TS might not have it in all versions
      const dbs = await window.indexedDB.databases();
      const toDelete = dbs
        .filter((db: any) => db.name && (db.name.startsWith(DB_PREFIX) || db.name.includes('NomAI')))
        .map((db: any) => db.name);

      if (toDelete.length > 0) {
        console.log(`[IndexedDB] Cleaning up native databases:`, toDelete);
        toDelete.forEach((name: string) => {
          const req = window.indexedDB.deleteDatabase(name);
          req.onsuccess = () => console.log(`[IndexedDB] ✅ Deleted: ${name}`);
          req.onerror = () => console.warn(`[IndexedDB] ❌ Failed to delete: ${name}`);
        });
      }
    }

    // 3. 未来扩展占位
    // // 未来：清理 localforage 实例
    // if (window.localStorage.getItem('localforage-instance')) { /* ... */ }
    
    // // 未来：清理 idb-keyval (通常只有一个默认数据库 'keyval-store')
    // // await deleteDB('keyval-store');

    // 4. 清理 Cache Storage (通常用于 Service Worker 缓存图片等)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      if (cacheNames.length > 0) {
        console.log(`[CacheStorage] Found ${cacheNames.length} caches to clear`);
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('[CacheStorage] ✅ All caches deleted');
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Database Cleanup] ✨ All clear! (took ${duration}ms)`);
    console.groupEnd();

  } catch (error: any) {
    console.error('[Database Cleanup] 💥 Critical error during cleanup:', error);
    console.groupEnd();
    
    // 非阻塞式报错提示
    showToast.error('清理部分本地缓存失败，但不影响您的账户退出安全');
  }
};

export default clearLocalDBOnLogout;
