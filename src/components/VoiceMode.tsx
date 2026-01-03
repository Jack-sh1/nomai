import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import { usePersonalizedKcal } from '../hooks/usePersonalizedKcal';

// Web Speech API 类型定义扩展
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceModeProps {
  // 可选：传入父级状态用于直接读取
}

const VoiceMode: React.FC<VoiceModeProps> = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const { remaining, consumed } = usePersonalizedKcal();
  
  // 避免闭包陷阱，使用 ref 存储最新值
  const remainingRef = useRef(remaining);
  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  // 初始化 Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Browser does not support Speech Recognition');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false; // 默认单次识别，唤醒后改为 true 或多次启动
    recognition.interimResults = false;
    recognition.lang = 'zh-CN'; // 默认中文，可混合识别英文单词

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        showToast.error('请允许麦克风权限以使用语音模式');
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Heard:', transcript);
      handleCommand(transcript);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 语音合成（说话）
  const speak = (text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) return;
    
    // 停止之前的播报
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // 稍微高一点，更有活力
    
    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  };

  // 核心指令处理
  const handleCommand = (text: string) => {
    setIsProcessing(true);

    // 1. 唤醒词检测
    if (text.includes('hi') && (text.includes('nomi') || text.includes('know me') || text.includes('no me'))) {
      triggerWakeUp();
      return;
    }
    if (text.includes('嘿') && (text.includes('糯米') || text.includes('nomi'))) {
      triggerWakeUp();
      return;
    }

    // 2. 功能指令 (在唤醒状态下或直接点击监听时)
    if (text.includes('扫') || text.includes('拍')) {
      speak('好的，打开相机', () => navigate('/scan'));
    } 
    else if (text.includes('餐单') || text.includes('吃什么')) {
      speak('正在为您查看今日餐单', () => navigate('/meal-plan'));
    } 
    else if (text.includes('多少') && (text.includes('热量') || text.includes('卡') || text.includes('kcal'))) {
      const val = remainingRef.current;
      if (val >= 0) {
        speak(`你今天还剩 ${val} 千卡额度，加油！`);
      } else {
        speak(`哎呀，今天已经超标 ${Math.abs(val)} 千卡了，注意控制哦。`);
      }
    }
    else if (text.includes('早安')) {
      speak('早安！今天也要吃得健康哦。');
    }
    else if (text.includes('晚安')) {
      speak('晚安，祝你做个好梦。');
    }
    else {
      // 未识别指令，但如果是唤醒词后的连续对话，可以提示
      // 这里简单处理：不做响应或震动提示失败
      // speak('抱歉，我没听清，请再说一遍'); 
    }
    
    setIsProcessing(false);
  };

  const triggerWakeUp = () => {
    // 振动反馈
    if (navigator.vibrate) navigator.vibrate(200);
    
    speak('我在呢', () => {
      // 语音回复结束后，重新启动监听以接收指令（如果是 continuous=false 模式）
      try {
        recognitionRef.current?.start();
      } catch (e) {
        // ignore if already started
      }
    });
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        speak(' ', () => {}); // iOS Safari hack: 必须用户交互触发一次播放，后续才能自动播放
        recognitionRef.current?.start();
        showToast.success('语音监听已开启，试着说 "Hi Nomi"');
      } catch (e) {
        showToast.error('无法启动麦克风');
      }
    }
  };

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null; // 浏览器不支持时不渲染
  }

  return (
    <>
      <motion.button
        onClick={toggleListening}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
          isListening 
            ? 'bg-amber-500 shadow-amber-500/40' 
            : 'bg-emerald-500 shadow-emerald-500/40'
        }`}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Mic className="text-white w-7 h-7" />
          </motion.div>
        ) : (
          <MicOff className="text-white/80 w-6 h-6" />
        )}
      </motion.button>

      {/* 监听时的波纹动画效果 */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="fixed bottom-24 right-6 z-30 w-14 h-14 rounded-full bg-emerald-500/30 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceMode;
