
import React, { useState, useEffect } from 'react';
import { UserProfile, View } from '../types';
import { getDailyOneLiner } from '../services/gemini';
import { trackEvent } from '../services/analytics';

const GrowingPlant = ({ className = "" }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} animate-pulse`}>
    <path d="M12 22V10" stroke="#4E8B83" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 18C12 18 6 18 6 13C6 10 12 10 12 18Z" fill="#4E8B83" fillOpacity="0.4" stroke="#4E8B83" strokeWidth="1.5"/>
    <path d="M12 14C12 14 18 14 18 9C18 6 12 6 12 14Z" fill="#4E8B83" fillOpacity="0.2" stroke="#4E8B83" strokeWidth="1.5"/>
  </svg>
);

interface DashboardProps {
  profile: UserProfile;
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, setView }) => {
  const [oneLiner, setOneLiner] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);
  const [votedExpert, setVotedExpert] = useState(false);

  useEffect(() => {
    const fetchTip = async () => {
      setLoadingTip(true);
      try {
        const randomChild = profile.children[Math.floor(Math.random() * profile.children.length)];
        const allChallenges = randomChild.challenges.length > 0 ? randomChild.challenges : ["Positive Connection"];
        const randomChallenge = allChallenges[Math.floor(Math.random() * allChallenges.length)];
        
        const tip = await getDailyOneLiner(randomChild, randomChallenge);
        setOneLiner(tip);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTip(false);
      }
    };
    fetchTip();
  }, [profile.children]);

  const handleAction = (view: View) => {
    trackEvent('dashboard_action', { target: view });
    setView(view);
  };

  const handleVoteExpert = () => {
    setVotedExpert(!votedExpert);
    trackEvent('expert_interest_vote', { interested: !votedExpert });
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto text-center">
      <header className="space-y-4 md:space-y-6 relative">
        <div className="flex items-center justify-center gap-4 md:gap-8">
          <GrowingPlant />
          <h1 className="text-4xl md:text-7xl font-bold text-[#2E2E2E] font-display tracking-tight leading-tight">
            Let's <span className="text-[#4E8B83]">Bloom Together</span>
          </h1>
          <GrowingPlant className="-scale-x-100" />
        </div>
        <div className="space-y-2">
          <p className="text-sm md:text-xl lg:text-2xl text-[#3B3B3B]/80 font-medium px-4 whitespace-nowrap font-display">
            Practical, personalized guidance for your child’s everyday social-emotional moments
          </p>
          <p className="text-[9px] md:text-xs text-[#3B3B3B]/40 font-medium px-4 max-w-2xl mx-auto italic">
            Guidance is tailored using AI to your child’s age, interests, and challenges.
          </p>
        </div>
      </header>

      <section className="bg-white p-3 md:p-6 rounded-[2rem] card-shadow border border-[#EEF5F4] text-center max-w-2xl mx-auto relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#4E8B83]"></div>
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className="text-[10px] font-bold text-[#4E8B83] uppercase tracking-[0.3em]">Daily Bloom Micro-Moment</span>
          {loadingTip && <div className="w-1.5 h-1.5 bg-[#4E8B83] rounded-full animate-pulse"></div>}
        </div>
        {oneLiner ? (
          <div className="px-4">
            <p className="text-lg md:text-xl text-[#3B3B3B] leading-relaxed italic font-display font-medium">
              "{oneLiner}"
            </p>
          </div>
        ) : (
          <div className="h-6 bg-gray-50 rounded-full w-2/3 mx-auto animate-pulse"></div>
        )}
      </section>

      <section className="space-y-8 pt-4 max-w-5xl mx-auto">
        <button
          onClick={() => handleAction(View.RIGHT_NOW)}
          className="w-full bg-[#4E8B83] p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-[#4E8B83]/10 border border-white/20 card-hover group relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl rotate-12 transition-transform group-hover:rotate-45">🆘</div>
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-3xl md:text-5xl font-bold font-display tracking-tight">What should I do right now?</h3>
            <p className="text-sm md:text-lg font-bold opacity-90 uppercase tracking-[0.3em]">Immediate 3-Step Action Plan</p>
          </div>
        </button>

        <h2 className="text-xl md:text-2xl font-bold text-[#3B3B3B]/30 font-display uppercase tracking-widest">Explore More</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <button
            onClick={() => handleAction(View.ADVICE_ACTIVITIES)}
            className="bg-white p-6 md:p-10 rounded-[2.5rem] card-shadow border border-[#EEF5F4] card-hover flex flex-col items-center gap-4 group relative"
          >
            <div className="w-16 h-16 bg-[#FAF9F6] border-2 border-[#EEF5F4] rounded-[1.5rem] flex items-center justify-center text-4xl transition-all group-hover:scale-105 shadow-sm">🎨</div>
            <div className="space-y-0.5">
              <h3 className="text-xl md:text-2xl font-bold text-[#4E8B83] font-display">Help my child</h3>
              <p className="text-[10px] text-[#3B3B3B]/40 font-bold uppercase tracking-widest">Scripts & Activities</p>
            </div>
          </button>
          
          <button
            onClick={() => handleAction(View.COACH_AI)}
            className="bg-white p-6 md:p-10 rounded-[2.5rem] card-shadow border border-[#EEF5F4] card-hover flex flex-col items-center gap-4 group relative"
          >
            <div className="w-16 h-16 bg-[#FAF9F6] border-2 border-[#EEF5F4] rounded-[1.5rem] flex items-center justify-center text-4xl transition-all group-hover:scale-105 shadow-sm">🤖</div>
            <div className="space-y-0.5">
              <h3 className="text-xl md:text-2xl font-bold text-[#4E8B83] font-display">Ask a Question</h3>
              <p className="text-[10px] text-[#3B3B3B]/40 font-bold uppercase tracking-widest">24/7 Support</p>
            </div>
          </button>

          <button
            onClick={() => handleAction(View.SELF_CARE)}
            className="bg-white p-6 md:p-10 rounded-[2.5rem] card-shadow border border-[#EEF5F4] card-hover flex flex-col items-center gap-4 group relative"
          >
            <div className="w-16 h-16 bg-[#FAF9F6] border-2 border-[#EEF5F4] rounded-[1.5rem] flex items-center justify-center text-4xl transition-all group-hover:scale-105 shadow-sm">🧘</div>
            <div className="space-y-0.5">
              <h3 className="text-xl md:text-2xl font-bold text-[#2E2E2E] font-display">Help me calm down</h3>
              <p className="text-[10px] text-[#3B3B3B]/40 font-bold uppercase tracking-widest">Your Safe Space</p>
            </div>
          </button>
        </div>

        <div className="mt-12 md:mt-16 p-8 md:p-12 rounded-[3.5rem] bg-[#EEF5F4]/30 border border-[#EEF5F4] max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <h4 className="text-2xl md:text-3xl font-black text-[#2E2E2E] font-display">Need deeper support?</h4>
            <p className="text-sm md:text-lg text-[#3B3B3B]/60 font-medium">Professional support with professional experts — coming soon.</p>
          </div>
          <label className="flex items-center justify-center gap-4 cursor-pointer group">
            <div className={`w-6 h-6 rounded-md border-2 border-[#4E8B83] flex items-center justify-center transition-all ${votedExpert ? 'bg-[#4E8B83]' : 'bg-white'}`}>
              {votedExpert && <span className="text-white text-sm font-bold">✓</span>}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={votedExpert} 
              onChange={handleVoteExpert} 
            />
            <span className="text-sm md:text-base font-bold text-[#4E8B83] group-hover:opacity-80 transition-opacity">I’d use this if it were available</span>
          </label>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
