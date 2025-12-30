import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 调试日志：帮助确认环境变量是否被正确读取
console.log('Supabase Initialization:', {
  url: supabaseUrl ? '✅ 已配置' : '❌ 未配置',
  keyType: supabaseAnonKey?.startsWith('sb_secret') ? '⚠️ Service Role Key (不推荐在前端使用)' : 
           supabaseAnonKey?.startsWith('eyJ') ? '✅ Anon Key' : '❌ 无效或未配置'
});

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
  console.error(
    '❌ Supabase 凭据配置错误！\n' +
    '1. 请确保 .env.local 文件在项目根目录。\n' +
    '2. 变量名必须是 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。\n' +
    '3. 修改后必须【重启终端】运行 pnpm dev。'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
