import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2, Mic, Activity, Lock, Check } from 'lucide-react';
import PremiumModal from './PremiumModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { showToast } from '../utils/toast';

const VOICES = [
  { id: 'alloy', name: 'Alloy', desc: '全能均衡', color: 'bg-slate-500' },
  { id: 'shimmer', name: 'Shimmer', desc: '清澈明亮', color: 'bg-rose-500' },
  { id: 'nova', name: 'Nova', desc: '活力女性', color: 'bg-emerald-500' },
  { id: 'echo', name: 'Echo', desc: '沉稳男性', color: 'bg-blue-500' },
];

const PremiumFeatures: React.FC = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeVoice, setActiveVoice] = useState('shimmer');
  const [isRecording, setIsRecording] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);

  // Load Premium Status
  useEffect(() => {
    if (!user) return;
    const checkPremium = async () => {
      const { data } = await supabase.from('profiles').select('is_premium, voice_style').eq('id', user.id).single();
      if (data) {
        setIsPremium(data.is_premium || false);
        if (data.voice_style) setActiveVoice(data.voice_style);
      }
    };
    checkPremium();
  }, [user]);

  // Handle Feature Click (Gatekeeper)
  const handleFeatureClick = () => {
    if (!isPremium) {
      setShowModal(true);
      return false;
    }
    return true;
  };

  // 1. Voice Store Logic
  const playSample = (_voiceId: string) => {
    // Mock sample playback
    const u = new SpeechSynthesisUtterance('NomAi 高级语音测试');
    window.speechSynthesis.speak(u);
  };

  const selectVoice = async (voiceId: string) => {
    if (!handleFeatureClick()) return;
    
    setActiveVoice(voiceId);
    await supabase.from('profiles').update({ voice_style: voiceId }).eq('id', user?.id);
    showToast.success(`已切换至 ${VOICES.find(v => v.id === voiceId)?.name} 音色`);
  };

  // 2. Custom Wake Word Logic (Mock Training)
  const startTraining = async () => {
    if (!handleFeatureClick()) return;

    setIsRecording(true);
    setTrainProgress(0);

    // Simulate transfer learning process
    const interval = setInterval(() => {
      setTrainProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRecording(false);
          showToast.success('唤醒词模型训练完成！');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="space-y-8">
      {/* Voice Store Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Volume2 size={20} className="text-emerald-500" />
          声音商店
          {!isPremium && <LockBadge />}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {VOICES.map(voice => (
            <button
              key={voice.id}
              onClick={() => selectVoice(voice.id)}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                activeVoice === voice.id 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${voice.color} mb-3 flex items-center justify-center text-white`}>
                {activeVoice === voice.id ? <Check size={16} /> : <Play size={14} fill="currentColor" onClick={(e) => { e.stopPropagation(); playSample(voice.id); }} />}
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-200">{voice.name}</div>
              <div className="text-xs text-slate-400">{voice.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Emotion Visualizer Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Activity size={20} className="text-rose-500" />
          实时情绪波形
          {!isPremium && <LockBadge />}
        </h3>
        <div className="relative h-32 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
          {!isPremium ? (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-white p-4 text-center">
              <Lock size={24} className="mb-2 text-slate-400" />
              <p className="text-sm font-medium">解锁高级版以查看实时情绪分析</p>
              <button onClick={() => setShowModal(true)} className="mt-2 text-xs text-emerald-400 font-bold hover:underline">去开通</button>
            </div>
          ) : (
            <VoiceVisualizer />
          )}
          {/* Mock Visualizer Background */}
          <div className="flex gap-1 items-center h-16 opacity-50">
             {[...Array(20)].map((_, i) => (
               <motion.div
                 key={i}
                 animate={{ height: [10, 40, 10] }}
                 transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
                 className="w-1 bg-emerald-500 rounded-full"
               />
             ))}
          </div>
        </div>
      </section>

      {/* Custom Wake Word Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Mic size={20} className="text-blue-500" />
          自定义唤醒词
          {!isPremium && <LockBadge />}
        </h3>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">当前唤醒词</div>
              <div className="text-xs text-slate-400">默认: "Hi Nomi"</div>
            </div>
            <button 
              onClick={startTraining}
              className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors ${
                isRecording ? 'bg-slate-400 cursor-wait' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? `训练中 ${trainProgress}%` : '录制新词'}
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            需要录制 3-5 次您的声音以训练本地模型。模型仅保存在本机浏览器中。
          </p>
        </div>
      </section>

      <PremiumModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={() => setIsPremium(true)} 
      />
    </div>
  );
};

const LockBadge = () => (
  <span className="bg-amber-100 text-amber-600 text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wide">
    PRO
  </span>
);

const VoiceVisualizer = () => {
  // Real implementation would use Canvas API + AnalyserNode
  // This is a placeholder for the logic structure
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-xs text-slate-500 font-mono">LIVE WAVEFORM ACTIVE</span>
    </div>
  );
};

export default PremiumFeatures;
