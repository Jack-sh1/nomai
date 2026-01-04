import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Image as ImageIcon, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2,
  Zap,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 界面核心感受目标：通过全屏沉浸式的视觉反馈和动效，让原本枯燥的「数据输入」变成一种充满黑科技感的「捕获」体验。
 */

type ScanStatus = 'idle' | 'capturing' | 'analyzing' | 'success' | 'error';

const CameraScanPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);

  // 1. 初始化相机
  useEffect(() => {
    async function setupCamera() {
      try {
        const constraints = {
          video: { 
            facingMode: 'environment', // 优先后置摄像头
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Camera error:", err);
        setErrorMsg("无法访问相机，请检查权限设置");
        setStatus('error');
      }
    }

    if (status === 'idle') {
      setupCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. 模拟拍照与分析
  const handleCapture = () => {
    if (!videoRef.current) return;
    
    setStatus('capturing');
    
    // 简单的截屏逻辑
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    setCapturedImg(canvas.toDataURL('image/jpeg'));

    // 停止预览流
    stream?.getTracks().forEach(track => track.stop());

    // 进入分析状态
    setTimeout(() => {
      setStatus('analyzing');
      
      // 随机成功或失败
      const isSuccess = Math.random() > 0.2;
      setTimeout(() => {
        if (isSuccess) {
          setStatus('success');
          // 2秒后自动跳转到结果页
          setTimeout(() => navigate('/scan-result'), 2000);
        } else {
          setStatus('error');
          setErrorMsg("没认出来哦，请换个角度试试");
        }
      }, 3500);
    }, 500);
  };

  const handleRetry = () => {
    window.location.reload(); // 简单粗暴重置
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black overflow-hidden select-none">
      {/* 1. 相机预览/捕获画面 */}
      <div className="absolute inset-0 z-0">
        {capturedImg ? (
          <img src={capturedImg} alt="captured" className="w-full h-full object-cover" />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* 蒙层与扫描框 */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* 四周暗色遮罩 */}
            <div className="absolute inset-0 bg-black/40" style={{ clipPath: 'polygon(0% 0%, 0% 100%, 10% 100%, 10% 20%, 90% 20%, 90% 80%, 10% 80%, 10% 100%, 100% 100%, 100% 0%)' }} />
            
            {/* 扫描框 */}
            <div className="relative w-72 h-72 border-2 border-white/20 rounded-[40px] overflow-hidden">
              {/* 四个角 */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-[40px]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-[40px]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-[40px]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-[40px]" />
              
              {/* 扫描线 */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.8)]"
              />
            </div>
            
            <p className="mt-8 text-white/80 font-bold text-lg animate-pulse">对准食物，保持稳定</p>
          </div>
        )}

        {/* 分析中蒙层 */}
        {status === 'analyzing' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
              />
              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-emerald-400 fill-current animate-pulse" />
            </div>
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-2xl font-black text-white tracking-widest"
            >
              AI 正在识别...
            </motion.h3>
            <p className="mt-2 text-emerald-400/80 font-bold text-sm">正在拆解宏量营养素</p>
          </div>
        )}
      </div>

      {/* 2. 顶部控制栏 */}
      <header className="relative z-10 flex items-center justify-between p-6 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/10 backdrop-blur-md rounded-2xl active:scale-90 transition-all"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-white text-xs font-black uppercase tracking-widest">AI Scanner Active</span>
        </div>
        <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl active:scale-90 transition-all">
          <ImageIcon className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* 3. 底部操作区 */}
      <footer className="relative z-10 mt-auto p-10 flex flex-col items-center bg-gradient-to-t from-black/80 to-transparent">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.button
              key="capture-btn"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={handleCapture}
              className="group relative w-20 h-20 flex items-center justify-center"
            >
              <div className="absolute inset-0 border-4 border-white rounded-full group-active:scale-90 transition-transform" />
              <div className="w-16 h-16 bg-white rounded-full shadow-lg group-active:scale-95 transition-transform" />
            </motion.button>
          )}

          {status === 'success' && (
            <motion.div
              key="success-card"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full bg-emerald-500 rounded-[32px] p-6 flex items-center justify-between shadow-2xl shadow-emerald-500/40"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-black text-xl">识别成功！</h4>
                  <p className="text-white/80 text-sm font-bold">发现：牛油果吐司...</p>
                </div>
              </div>
              <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error-card"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full flex flex-col gap-4"
            >
              <div className="bg-rose-500 rounded-[32px] p-6 flex items-center gap-4 shadow-2xl shadow-rose-500/40">
                <AlertCircle className="w-8 h-8 text-white" />
                <p className="text-white font-bold">{errorMsg}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleRetry}
                  className="flex-1 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" /> 重试
                </button>
                <button className="flex-1 py-4 bg-white text-black rounded-2xl font-bold">
                  手动搜索
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-safe pb-4" />
      </footer>
    </div>
  );
};

export default CameraScanPage;
