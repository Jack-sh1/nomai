import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, Zap, Smile, Frown, Meh } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import { usePersonalizedKcal } from '../hooks/usePersonalizedKcal';
import { useTranslation } from 'react-i18next';
import * as speechCommands from '@tensorflow-models/speech-commands';

// Web Speech API Extension
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Context Memory Interface
interface ChatContext {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
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
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'sad' | 'angry'>('neutral');
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const remainingRef = useRef(remaining);
  const recognizerRef = useRef<speechCommands.SpeechCommandRecognizer | null>(null);
  const contextRef = useRef<ChatContext[]>([]);

  // Sync ref
  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  // Load Context from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('nomi_voice_context');
    if (saved) {
      try {
        const parsed: ChatContext[] = JSON.parse(saved);
        // Filter out old context (> 24h)
        const now = Date.now();
        const valid = parsed.filter(c => now - c.timestamp < 24 * 60 * 60 * 1000);
        contextRef.current = valid;
      } catch (e) {
        console.error('Failed to parse voice context');
      }
    }
  }, []);

  // Save Context Helper
  const saveContext = (role: 'user' | 'assistant', content: string) => {
    const newItem: ChatContext = { role, content, timestamp: Date.now() };
    const updated = [...contextRef.current, newItem].slice(-10); // Keep last 10
    contextRef.current = updated;
    localStorage.setItem('nomi_voice_context', JSON.stringify(updated));
  };

  // 1. Initialize TensorFlow.js Offline Model & Emotion Detection (Simulated)
  useEffect(() => {
    const loadModel = async () => {
      try {
        const recognizer = speechCommands.create('BROWSER_FFT');
        await recognizer.ensureModelLoaded();
        recognizerRef.current = recognizer;
        console.log('TF.js Speech Model Loaded');
        // Emotion detection would typically require a separate model trained on prosody features (pitch, energy).
        // For this demo, we'll simulate emotion detection based on keyword analysis in the transcript.
      } catch (err) {
        console.error('Failed to load TF model:', err);
      }
    };
    
    setTimeout(loadModel, 2000);
  }, []);

  // 2. Initialize Web Speech API
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = i18n.language || 'zh-CN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      if (mode !== 'offline') setIsListening(false);
    };
    recognition.onerror = (e: any) => console.error('Speech error:', e.error);

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const text = lastResult[0].transcript.toLowerCase().trim();
      
      if (lastResult.isFinal) {
        setTranscript(text);
        detectEmotion(text); // Simple sentiment analysis
        handleCommand(text);
      }
    };

    recognitionRef.current = recognition;
  }, [i18n.language, mode]);

  // Simple Emotion Analysis (Keyword based fallback)
  const detectEmotion = (text: string) => {
    if (text.match(/tired|sad|bad|累|难过|不开心|烦/i)) {
      setEmotion('sad');
    } else if (text.match(/happy|great|good|开心|棒|爽/i)) {
      setEmotion('happy');
    } else if (text.match(/angry|hate|mad|生气|讨厌/i)) {
      setEmotion('angry');
    } else {
      setEmotion('neutral');
    }
  };

  // 3. Command Handler
  const handleCommand = async (text: string) => {
    console.log('Detected:', text);
    saveContext('user', text);
    
    // Wake Word
    const wakeWords = ['hi nomi', 'hey nomi', '嘿 nomi', 'hello nomi', 'know me'];
    if (wakeWords.some(w => text.includes(w))) {
      triggerWakeUp();
      return;
    }

    // Offline Commands
    if (text.match(/scan|food|camera|拍|扫/i)) {
      const msg = t('scan_action');
      saveContext('assistant', msg);
      speak(msg);
      navigate('/scan');
      return;
    }
    
    if (text.match(/kcal|calories|left|remaining|热量|多少/i)) {
      const val = remainingRef.current;
      const msg = val >= 0 
        ? t('remaining_kcal', { count: val })
        : t('over_kcal', { count: Math.abs(val) });
      saveContext('assistant', msg);
      speak(msg);
      return;
    }

    // AI Fallback
    if (text.length > 2) {
      await fetchAIResponse(text);
    }
  };

  // 4. Advanced AI Response with Context & Emotion
  const fetchAIResponse = async (input: string) => {
    setMode('ai');
    setAiResponse(t('processing'));
    
    try {
      console.log('Sending to AI with Context:', contextRef.current);
      
      // Simulate Context Awareness
      const lastContext = contextRef.current.find(c => c.role === 'assistant' && (c.content.includes('火锅') || c.content.includes('hotpot')));
      
      await new Promise(r => setTimeout(r, 1500)); 
      
      let reply = '';
      
      // Contextual Logic Simulation
      if (input.includes('吃什么') || input.includes('eat')) {
         if (lastContext) {
            reply = i18n.language === 'zh-CN'
              ? '考虑到你之前吃了火锅，今天建议吃点清淡的沙拉或者蒸鱼哦。'
              : 'Since you had hotpot recently, I suggest something light like a salad or steamed fish today.';
         } else {
            reply = i18n.language === 'zh-CN'
              ? '想吃点什么类型的？中餐还是西餐？'
              : 'What kind of food are you in the mood for? Chinese or Western?';
         }
      } else if (emotion === 'sad') {
        reply = i18n.language === 'zh-CN'
          ? '听起来你有点累了。今天就别管卡路里了，好好休息，喝杯热牛奶吧。'
          : 'You sound a bit tired. Forget about calories for now, get some rest and have a warm milk.';
      } else {
        reply = i18n.language === 'zh-CN'
          ? `我听到了"${input}"。作为你的 AI 助手，我会一直陪着你。`
          : `I heard "${input}". As your AI assistant, I'm here for you.`;
      }

      saveContext('assistant', reply);
      setAiResponse(reply);
      speak(reply, emotion); // Pass emotion to TTS
      
    } catch (err) {
      speak(t('ai_fallback'));
    } finally {
      setMode('online');
    }
  };

  // 5. Advanced TTS (Web Speech fallback + Mock OpenAI TTS)
  const speak = async (text: string, emotionOverride?: string) => {
    // Stop previous
    window.speechSynthesis.cancel();

    // Try OpenAI TTS (Simulated API Call)
    // In production: const audio = await axios.post('https://api.openai.com/v1/audio/speech', { model: 'tts-1', voice: 'shimmer', input: text });
    // For now, we use Web Speech API with pitch adjustment for emotion
    
    const u = new SpeechSynthesisUtterance(text);
    u.lang = i18n.language;
    u.rate = 1.0;
    
    // Emotion-based Pitch/Rate adjustment
    if (emotionOverride === 'sad') {
      u.pitch = 0.8; // Lower pitch for soothing
      u.rate = 0.9;  // Slower rate
    } else if (emotionOverride === 'happy') {
      u.pitch = 1.2; // Higher pitch for excitement
      u.rate = 1.1;
    } else {
      u.pitch = 1.0;
    }

    window.speechSynthesis.speak(u);
  };

  const triggerWakeUp = () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setMode('online');
    speak(t('ai_intro'));
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
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

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
    i18n.changeLanguage(newLang);
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
        
        {/* Emotion Indicator (Debug) */}
        {isListening && transcript && (
           <motion.div 
             initial={{ scale: 0 }} animate={{ scale: 1 }}
             className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-white/20 ${
               emotion === 'sad' ? 'bg-blue-400' : emotion === 'happy' ? 'bg-yellow-400' : emotion === 'angry' ? 'bg-red-400' : 'bg-slate-400'
             }`}
           >
             {emotion === 'sad' && <Frown size={16} className="text-white" />}
             {emotion === 'happy' && <Smile size={16} className="text-white" />}
             {(emotion === 'neutral' || emotion === 'angry') && <Meh size={16} className="text-white" />}
           </motion.div>
        )}

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
            <div className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border max-w-sm ml-auto ${
               emotion === 'sad' ? 'border-blue-200 dark:border-blue-800' : 'border-slate-200 dark:border-slate-700'
            }`}>
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
