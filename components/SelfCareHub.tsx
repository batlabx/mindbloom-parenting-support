import React, { useState } from 'react';
import { getSelfCareContent } from '../services/gemini';
import { UserProfile, FavoriteItem } from '../types';
import Modal from './Modal';
import { trackEvent } from '../services/analytics';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
}

const SelfCareHub: React.FC<Props> = ({ profile, onUpdateProfile, onBack }) => {
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [content, setContent] = useState<{ title: string; content: string } | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleSelect = async (category: string) => {
    setLoadingCategory(category);
    setFeedbackGiven(false);
    setContent(null); 
    trackEvent('self_care_request', { category });
    try {
      const res = await getSelfCareContent(category);
      setContent(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCategory(null);
    }
  };

  const saveToFavorites = () => {
    if (!content) return;
    const newItem: FavoriteItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'self_care',
      title: `Zen: ${content.title}`,
      content: content.content,
      dateSaved: new Date().toISOString()
    };
    onUpdateProfile({ ...profile, favorites: [...profile.favorites, newItem] });
    trackEvent('favorite_saved', { type: 'self_care' });
  };

  const handleFeedback = (val: string) => {
    setFeedbackGiven(true);
    trackEvent('self_care_feedback', { feedback: val });
  };

  const categories = [
    { label: 'Calm Down Tools', icon: '❄️', color: 'bg-white border-[#EEF5F4] text-[#4E8B83]' },
    { label: 'Grounding', icon: '🧘', color: 'bg-white border-[#EEF5F4] text-[#4E8B83]' },
    { label: 'Affirmations', icon: '✨', color: 'bg-white border-[#EEF5F4] text-[#2E2E2E]' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10">
      <button onClick={onBack} className="text-[#4E8B83] font-bold flex items-center gap-3 mb-4 hover:translate-x-[-4px] transition-transform font-display text-lg uppercase tracking-wider">
        <span className="text-2xl">←</span> Back
      </button>
      
      <div className="text-center space-y-8 bg-white p-12 rounded-[4rem] card-shadow border border-[#EEF5F4]">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-[#2E2E2E] font-display tracking-tight leading-tight text-center">Parent Safe Space</h2>
          <div className="text-[#3B3B3B]/60 text-lg leading-relaxed max-w-lg mx-auto font-medium">
            <p>You cannot pour from an empty cup.</p>
            <p className="mt-2">Take a micro-moment for your own peace.</p>
          </div>
        </div>

        {/* NORMALIZING MESSAGING BOX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
           <div className="p-6 bg-[#FAF9F6] border border-[#EEF5F4] rounded-[2rem] space-y-2">
              <span className="text-[#4E8B83] font-black text-[10px] uppercase tracking-widest">Reminder</span>
              <p className="text-[#3B3B3B] font-display text-sm leading-snug">“You’re not failing. These moments are hard because you care.”</p>
           </div>
           <div className="p-6 bg-[#FAF9F6] border border-[#EEF5F4] rounded-[2rem] space-y-2">
              <span className="text-[#4E8B83] font-black text-[10px] uppercase tracking-widest">Normalizing</span>
              <p className="text-[#3B3B3B] font-display text-sm leading-snug">“One messy moment doesn’t define your parenting.”</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleSelect(cat.label)}
              disabled={!!loadingCategory}
              className={`p-10 rounded-[3rem] border-2 flex flex-col items-center justify-center space-y-6 shadow-sm hover:scale-105 transition-all relative overflow-hidden group ${cat.color}`}
            >
              {loadingCategory === cat.label ? (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Finding Zen...</span>
                </div>
              ) : (
                <>
                  <span className="text-5xl group-hover:animate-float">{cat.icon}</span>
                  <span className="font-black text-xs uppercase tracking-widest leading-tight">{cat.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={!!content} onClose={() => setContent(null)} title={content?.title || ''}>
        <div className="text-center space-y-10 py-6">
          <div className="p-12 bg-[#FAF9F6] rounded-[3.5rem] text-2xl md:text-3xl font-display text-[#3B3B3B] border-2 border-[#EEF5F4] shadow-inner leading-relaxed font-medium">
            {content?.content}
          </div>
          <div className="space-y-6">
            <button onClick={saveToFavorites} className="text-[#4E8B83] font-black text-xs uppercase tracking-[0.4em] hover:underline decoration-2">⭐ Save to Bloom List</button>
            <button onClick={() => setContent(null)} className="w-full bg-[#4E8B83] text-white py-6 rounded-[2.5rem] font-black font-display text-xl shadow-xl shadow-[#4E8B83]/20 hover:scale-[1.02] transition-transform">I Feel Centered</button>
          </div>
          
          <div className="pt-8 border-t border-gray-100 space-y-6">
            <p className="text-[10px] font-black text-[#3B3B3B]/30 uppercase tracking-[0.5em]">Did this micro-moment help?</p>
            {feedbackGiven ? (
              <p className="text-[#4E8B83] font-black text-xl animate-in zoom-in duration-300 uppercase tracking-widest">Thank you! 🌸</p>
            ) : (
              <div className="flex justify-center gap-4">
                {['Yes', 'Kind of', 'No'].map(val => (
                  <button 
                    key={val} 
                    onClick={() => handleFeedback(val)} 
                    className="px-10 py-3 rounded-full bg-white border-2 border-gray-100 text-xs font-black text-[#3B3B3B]/60 hover:bg-[#FAF9F6] hover:border-[#EEF5F4] transition-all font-display"
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SelfCareHub;