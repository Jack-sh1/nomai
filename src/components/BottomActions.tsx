import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Camera, Utensils } from 'lucide-react';

const BottomActions: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  
  // 滚动检测
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 100) {
      setIsScrolledDown(true);
    } else if (latest < previous) {
      setIsScrolledDown(false);
    }
  });

  // 智能气泡逻辑
  useEffect(() => {
    const checkTimeAndShowBubble = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const timeValue = hour * 60 + minute;
      
      // 饭点区间: 12:00(720) - 13:30(810) 或 18:00(1080) - 19:30(1170)
      const isLunchTime = timeValue >= 720 && timeValue <= 810;
      const isDinnerTime = timeValue >= 1080 && timeValue <= 1170;
      
      if (isLunchTime || isDinnerTime) {
        const lastShown = localStorage.getItem('nomai_bubble_date');
        const today = now.toDateString();
        
        if (lastShown !== today) {
          setShowBubble(true);
          // 这里的 localStorage 设置可以放在点击或关闭时，或者只显示一次
          // 为了演示效果，我们暂不立即写入，或者写入
          localStorage.setItem('nomai_bubble_date', today);
        }
      }
    };
    
    checkTimeAndShowBubble();
  }, []);

  // 长按逻辑
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DURATION = 800; // 800ms 触发长按 (稍微长一点以免误触)

  const handlePointerDown = () => {
    setIsLongPressing(true);
    timerRef.current = setTimeout(() => {
      // 触发长按
      if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
      navigate('/scan-video'); // 跳转视频流页面
      setIsLongPressing(false);
    }, LONG_PRESS_DURATION);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // 如果还在长按状态（说明没到时间就松手了），视为短按
    if (isLongPressing) {
      if (navigator.vibrate) navigator.vibrate(50);
      navigate('/camera-scan'); // 跳转拍照页面
    }
    setIsLongPressing(false);
  };

  return (
    <>
      {/* 底部固定容器 */}
      <motion.footer
        initial={false}
        animate={{
          y: isScrolledDown ? 100 : 0,
          opacity: isScrolledDown ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 pb-safe"
      >
        <div className="flex items-center justify-center gap-8 py-4 px-6 relative">
          
          {/* 2. 查看餐单 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/meal-plan')}
            className="px-8 py-4 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm tracking-wide bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            查看餐单
          </motion.button>

          {/* 1. 扫食物 (主按钮) */}
          <div className="relative">
            {/* 智能气泡 */}
            <AnimatePresence>
              {showBubble && !isScrolledDown && (
                <motion.button
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -10, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => navigate('/camera-scan')}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xl whitespace-nowrap flex items-center gap-2 z-50"
                >
                  <Utensils className="w-3 h-3" />
                  <span>饭点到了！拍一下？</span>
                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 dark:bg-white rotate-45 rounded-[2px]" />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative w-20 h-20 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 z-10"
            >
              <Camera className="w-9 h-9 stroke-[2.5px]" />
              
              {/* 长按进度环 */}
              <svg className="absolute inset-[-4px] w-[88px] h-[88px] -rotate-90 pointer-events-none">
                <motion.circle
                  cx="44"
                  cy="44"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-emerald-300"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isLongPressing ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: "linear" }} // 对应 LONG_PRESS_DURATION
                />
              </svg>
            </motion.button>
          </div>
        </div>
        {/* 底部垫片 */}
        <div className="h-2 w-full" /> 
      </motion.footer>

      {/* 悬浮球 (FAB) - 滚动时显示 */}
      <AnimatePresence>
        {isScrolledDown && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(50);
              navigate('/camera-scan');
            }}
            className="fixed bottom-8 right-8 z-30 w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/40"
          >
            <Camera className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomActions;
