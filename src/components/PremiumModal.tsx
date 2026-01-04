import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, ShieldCheck, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../utils/toast';
import { useAuth } from '../contexts/AuthContext';
import { safeSupabaseFetch } from '../utils/safeSupabaseFetch'; // Move import to top

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleAlipay = async (plan: 'monthly' | 'lifetime') => {
    setLoading(true);
    try {
      // 模拟后端生成支付宝支付链接
      // 实际开发中：const { data } = await axios.post('/api/create-alipay-order', { plan, userId: user?.id });
      // const payUrl = data.url;
      
      console.log(`Creating Alipay order for plan: ${plan}`);
      
      // 模拟跳转支付宝支付页（沙箱环境）
      // 这里我们演示“支付成功”的回调逻辑
      setTimeout(async () => {
        if (user) {
            try {
              // 使用 Upsert 以防行不存在 (Robust Fallback)
              const { error } = await safeSupabaseFetch(async () => 
                await supabase
                  .from('profiles')
                  .upsert(
                    { 
                      id: user.id, 
                      is_premium: true,
                      updated_at: new Date().toISOString()
                    }, 
                    { onConflict: 'id' }
                  )
              );

            if (error) throw error;
            
            showToast.success('高级版已开通！');
            if (onSuccess) onSuccess();
            onClose();
          } catch (err: any) {
            console.error('Update failed:', err);
            // 友好的错误提示，指导用户刷新
            if (err.code === 'NETWORK_ERROR') {
              showToast.error('网络连接失败，请检查网络或重试');
            } else if (err.message?.includes('column')) {
              showToast.error('系统升级中，请刷新页面重试');
            } else {
              showToast.error('开通失败，请联系客服');
            }
          }
        }
      }, 1500);

    } catch (error: any) {
      showToast.error('支付发起失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            {/* Header with Gradient */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Crown size={120} />
              </div>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
                NomAi <span className="bg-white text-emerald-600 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">Pro</span>
              </h2>
              <p className="text-emerald-50 font-medium">解锁所有 AI 语音高级能力</p>
            </div>

            {/* Features List */}
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <FeatureRow icon={<ShieldCheck size={14} className="text-emerald-500" />} text="OpenAI 顶级 TTS 音色库" />
                <FeatureRow icon={<ShieldCheck size={14} className="text-emerald-500" />} text="情绪感知与实时波形" />
                <FeatureRow icon={<ShieldCheck size={14} className="text-emerald-500" />} text="自定义专属唤醒词" />
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button 
                  onClick={() => handleAlipay('monthly')}
                  disabled={loading}
                  className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 transition-all group text-left relative"
                >
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">订阅制</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">¥9.9<span className="text-sm font-normal text-slate-400">/月</span></div>
                </button>

                <button 
                  onClick={() => handleAlipay('lifetime')}
                  disabled={loading}
                  className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">限时优惠</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">永久买断</div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">¥99</div>
                </button>
              </div>

              <button
                onClick={() => handleAlipay('lifetime')}
                disabled={loading}
                className="w-full py-4 bg-[#1677FF] hover:bg-[#166fe5] text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard size={20} />
                    支付宝立即开通
                  </>
                )}
              </button>
              
              <p className="text-center text-xs text-slate-400">
                支付即代表同意《用户协议》与《隐私政策》
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const FeatureRow = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center gap-3">
    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
      {/* 简单的图标容器，不尝试克隆并注入 props，避免类型错误 */}
      {icon}
    </div>
    <span className="text-slate-600 dark:text-slate-300 font-medium">{text}</span>
  </div>
);

export default PremiumModal;
