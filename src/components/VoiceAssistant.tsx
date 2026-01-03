import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, Zap, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import { usePersonalizedKcal } from '../hooks/usePersonalizedKcal';
import { useTranslation } from 'react-i18next';
import * as tf from '@tensorflow/tfjs';
import * as speechCommands from '@tensorflow-models/speech-commands';

// Web Speech API Extension
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceAssistant: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { remaining } = usePersonalizedKcal();
  
  // State
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<'offline' | 'online' | 'ai'>('offline');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const remainingRef = useRef(remaining);
  const recognizerRef = useRef<speechCommands.SpeechCommandRecognizer | null>(null);

  // Sync ref
  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  // 1. Initialize TensorFlow.js Offline Model (Lazy Load)
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Create recognizer (using default 'BROWSER_FFT' model)
        const recognizer = speechCommands.create('BROWSER_FFT');
        await recognizer.ensureModelLoaded();
        recognizerRef.current = recognizer;
        console.log('TF.js Speech Model Loaded');
        
        // Note: Default model only knows: "zero" to "nine", "up", "down", "left", "right", "go", "stop", "yes", "no"
        // For custom wake word "Hi Nomi", we typically need transfer learning.
        // Here we simulate wake word detection via Web Speech API for better accuracy without custom training data.
      } catch (err) {
        console.error('Failed to load TF model:', err);
      }
    };
    
    // Lazy load to not block UI
    setTimeout(loadModel, 2000);
  }, []);

  // 2. Initialize Web Speech API (Online/Hybrid)
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true; // Continuous listening for wake word
    recognition.interimResults = true;
    recognition.lang = i18n.language || 'zh-CN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      // Auto restart if supposed to be listening (Always-on mock)
      if (mode !== 'offline') setIsListening(false);
    };
    recognition.onerror = (e: any) => console.error('Speech error:', e.error);

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const text = lastResult[0].transcript.toLowerCase().trim();
      
      if (lastResult.isFinal) {
        setTranscript(text);
        handleCommand(text);
      }
    };

    recognitionRef.current = recognition;
  }, [i18n.language, mode]);

  // 3. Command Handler (Offline Priority -> AI Fallback)
  const handleCommand = async (text: string) => {
    console.log('Detected:', text);
    
    // --- Phase 1: Wake Word Detection ---
    const wakeWords = ['hi nomi', 'hey nomi', '嘿 nomi', 'hello nomi', 'know me'];
    const isWakeWord = wakeWords.some(w => text.includes(w));

    if (isWakeWord) {
      triggerWakeUp();
      return;
    }

    // --- Phase 2: Offline/Simple Commands ---
    // Using Regex for fast matching (simulating offline logic)
    if (text.match(/scan|food|camera|拍|扫/i)) {
      speak(t('scan_action'));
      navigate('/scan');
      return;
    }
    
    if (text.match(/menu|plan|meal|eat|餐单|吃什么/i)) {
      speak(t('meal_plan_action'));
      navigate('/meal-plan');
      return;
    }

    if (text.match(/kcal|calories|left|remaining|热量|多少/i)) {
      const val = remainingRef.current;
      const msg = val >= 0 
        ? t('remaining_kcal', { count: val })
        : t('over_kcal', { count: Math.abs(val) });
      speak(msg);
      return;
    }

    // --- Phase 3: AI Conversation Mode (OpenAI Fallback) ---
    // If command not recognized, treat as natural language query
    if (text.length > 2) {
      await fetchAIResponse(text);
    }
  };

  // 4. OpenAI Realtime API Simulation (Chat Completions)
  const fetchAIResponse = async (input: string) => {
    setMode('ai');
    setAiResponse(t('processing'));
    
    try {
      // In a real app, this would be a WebSocket to wss://api.openai.com/v1/realtime
      // or a fetch to your backend proxy.
      // Simulating network delay and response:
      
      console.log('Sending to AI:', input);
      
      // Mock Response for demo purposes (since we don't have a real backend key here)
      // Replace this with: const response = await fetch('/api/chat', { ... })
      await new Promise(r => setTimeout(r, 1500)); 
      
      let reply = '';
      if (input.includes('火锅') || input.includes('hotpot')) {
        reply = i18n.language === 'zh-CN' 
          ? '吃火锅没关系，关键是控制蘸料和汤底。建议今晚多喝水，明天早餐吃清淡点，比如燕麦或全麦面包。'
          : 'Hotpot is delicious! Just watch the dipping sauce. Drink more water tonight and have a light breakfast tomorrow.';
      } else {
        reply = i18n.language === 'zh-CN'
          ? `我听到了"${input}"。作为你的 AI 助手，建议你保持平衡饮食，多吃蔬菜哦。`
          : `I heard "${input}". As your AI assistant, I recommend keeping a balanced diet with plenty of vegetables.`;
      }

      setAiResponse(reply);
      speak(reply);
      
    } catch (err) {
      speak(t('ai_fallback'));
    } finally {
      setMode('online');
    }
  };

  // Helper: TTS
  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = i18n.language;
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
  };

  // Helper: Wake Up
  const triggerWakeUp = () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setMode('online');
    speak(t('ai_intro'));
  };

  // Helper: Toggle Mic
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // iOS Safari requires user interaction to unlock audio context
      speak(' '); 
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        showToast.success(t('listening'));
      } catch (e) {
        showToast.error(t('error_mic'));
      }
    }
  };

  // Helper: Switch Language
  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
    i18n.changeLanguage(newLang);
    // Restart recognition with new lang
    if (isListening) {
      recognitionRef.current?.stop();
      setTimeout(() => recognitionRef.current?.start(), 100);
    }
    showToast.success(`Switched to ${newLang}`);
  };

  if (!recognitionRef.current && !('webkitSpeechRecognition' in window)) return null;

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3 items-end">
        
        {/* Language Switcher */}
        {isListening && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={toggleLanguage}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700"
          >
            <Globe size={18} />
          </motion.button>
        )}

        {/* Main Mic Button */}
        <motion.button
          onClick={toggleListening}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${
            isListening 
              ? mode === 'ai' 
                ? 'bg-purple-600 shadow-purple-500/50' // AI Mode
                : 'bg-emerald-500 shadow-emerald-500/50' // Listening Mode
              : 'bg-slate-800 dark:bg-white shadow-lg' // Idle
          }`}
        >
          {isListening ? (
            mode === 'ai' ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                <Zap className="text-white w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <Mic className="text-white w-7 h-7" />
              </motion.div>
            )
          ) : (
            <MicOff className="text-white dark:text-slate-900 w-6 h-6" />
          )}
        </motion.button>
      </div>

      {/* AI Response Bubble */}
      <AnimatePresence>
        {isListening && (transcript || aiResponse) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-44 right-6 left-6 z-40"
          >
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm ml-auto">
              <div className="flex items-center gap-2 mb-2">
                {mode === 'ai' ? (
                  <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">AI Thinking</span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Listening</span>
                )}
                <span className="text-xs text-slate-400 ml-auto">{i18n.language}</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {aiResponse || transcript || t('listening')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening Ripple Effect */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`fixed bottom-24 right-6 z-30 w-14 h-14 rounded-full pointer-events-none ${
              mode === 'ai' ? 'bg-purple-500/30' : 'bg-emerald-500/30'
            }`}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
