import React from 'react';
import { View, SyncStatus } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
  syncStatus?: SyncStatus;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, syncStatus = 'synced' }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Home', icon: '🏠' },
    { id: View.FAVORITES, label: 'Saved', icon: '⭐' },
    { id: View.ADVICE_ACTIVITIES, label: 'Play', icon: '🎨' },
    { id: View.COACH_AI, label: 'Coach', icon: '🤖' },
    { id: View.SELF_CARE, label: 'Zen', icon: '🧘' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#3B3B3B]">
      <nav className="fixed top-4 left-0 right-0 z-50 px-6">
        <div className="max-w-4xl mx-auto glass border border-[#EEF5F4] px-6 py-2 rounded-full flex items-center justify-between shadow-xl shadow-[#2E2E2E]/5">
          <div className="flex items-center space-x-2.5 cursor-pointer group" onClick={() => setView(View.DASHBOARD)}>
            <div className="w-7 h-7 bg-[#4E8B83] rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#4E8B83]/20 transition-transform group-hover:scale-105">M</div>
            <h1 className="text-base font-bold text-[#2E2E2E] font-display tracking-tight hidden sm:block">MindBloom</h1>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                    currentView === item.id 
                    ? 'bg-[#4E8B83] text-white shadow-lg shadow-[#4E8B83]/20' 
                    : 'text-[#3B3B3B]/60 hover:bg-[#EEF5F4] hover:text-[#4E8B83]'
                  }`}
                >
                  <span className={`${currentView === item.id ? 'inline' : 'hidden sm:inline'} mr-1`}>{item.icon}</span>
                  <span className={currentView === item.id ? 'inline' : 'hidden md:inline'}>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/50 border border-[#EEF5F4]">
              <div className={`w-1 h-1 rounded-full ${
                syncStatus === 'syncing' ? 'bg-[#4E8B83] animate-pulse' : 
                syncStatus === 'error' ? 'bg-red-400' : 'bg-[#4E8B83]'
              }`} />
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#3B3B3B]/40 hidden lg:block">
                {syncStatus === 'syncing' ? 'Saving' : syncStatus === 'error' ? 'Error' : 'Synced'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {children}
      </main>

      <footer className="mt-4 border-t border-[#EEF5F4] py-10 px-6 text-center max-w-5xl mx-auto">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-2xl animate-float">🌿</div>
          <p className="uppercase tracking-[0.1em] font-bold text-[#4E8B83] text-[9px]">Dedicated to helping families thrive—wherever they are</p>
          <div className="h-1 w-10 bg-[#EEF5F4] rounded-full"></div>
          <div className="text-[10px] text-[#3B3B3B]/60 leading-relaxed max-w-4xl font-medium space-y-1">
            <p>All advice, tips, and activities provided by MindBloom are AI-generated and for informational purposes only.</p>
            <p>This is not professional medical, psychological, or therapeutic advice.</p>
            <p>Always consult with qualified professionals for specific concerns about your child's health and development.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;