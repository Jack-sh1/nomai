import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PremiumFeatures from '../components/PremiumFeatures';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-700 dark:text-slate-200" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">设置</h1>
      </header>

      <main className="p-6 space-y-8">
        {/* Account Section */}
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">账户</h2>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-1 border border-slate-100 dark:border-slate-800">
            <button 
              onClick={signOut}
              className="w-full flex items-center gap-3 p-4 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-red-500 font-medium"
            >
              <LogOut size={18} />
              退出登录
            </button>
          </div>
        </section>

        {/* Premium Features Section */}
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">AI 高级功能</h2>
          <PremiumFeatures />
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
