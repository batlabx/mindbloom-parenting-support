import React, { useState } from 'react';
import { UserProfile, Child, RightNowAdvice, FavoriteItem } from '../types';
import { getRightNowAdvice } from '../services/gemini';
import { trackEvent } from '../services/analytics';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
}

const RightNowView: React.FC<Props> = ({ profile, onUpdateProfile, onBack }) => {
  const [selectedChild, setSelectedChild] = useState<Child>(profile.children[0]);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [advice, setAdvice] = useState<RightNowAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [activeDefinition, setActiveDefinition] = useState<{term: string, definition: string} | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);

  const handleActionRequest = async (challenge: string) => {
    setSelectedChallenge(challenge);
    setLoading(true);
    setAdvice(null);
    setExpandedStep(null);
    setActiveDefinition(null);
    setFeedbackGiven(null);
    trackEvent('right_now_request', { challenge, childAge: selectedChild.age });
    try {
      const res = await getRightNowAdvice(profile.name, selectedChild, challenge);
      setAdvice(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (val: string) => {
    setFeedbackGiven(val);
    trackEvent('right_now_feedback', { challenge: selectedChallenge, rating: val });
  };

  const saveToFavorites = () => {
    if (!advice) return;
    const content = `1. ${advice.step1}: ${advice.summary1}\n2. ${advice.step2}: ${advice.summary2}\n3. ${advice.step3}: ${advice.summary3}`;
    const newItem: FavoriteItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'right_now',
      title: `Action Plan: ${selectedChallenge}`,
      content,
      childContext: `${selectedChild.name} (Age ${selectedChild.age})`,
      dateSaved: new Date().toISOString()
    };
    onUpdateProfile({ ...profile, favorites: [...profile.favorites, newItem] });
    trackEvent('favorite_saved', { type: 'right_now' });
    alert("Saved to your Bloom List!");
  };

  const TextWithGlossary = ({ text, className }: { text?: string, className?: string }) => {
    if (!text || !advice?.glossary) return <p className={className}>{text}</p>;
    
    let parts: React.ReactNode[] = [text];
    advice.glossary.forEach(item => {
      const newParts: React.ReactNode[] = [];
      parts.forEach(part => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }
        const regex = new RegExp(`(${item.term})`, 'gi');
        const split = part.split(regex);
        split.forEach(s => {
          if (s.toLowerCase() === item.term.toLowerCase()) {
            newParts.push(
              <span 
                key={`${item.term}-${Math.random()}`}
                onClick={(e) => { e.stopPropagation(); setActiveDefinition(item); }}
                className="cursor-help border-b-2 border-dashed border-[#4E8B83] text-[#4E8B83] font-bold hover:bg-[#EEF5F4] transition-colors px-0.5 rounded"
              >
                {s}
              </span>
            );
          } else if (s) {
            newParts.push(s);
          }
        });
      });
      parts = newParts;
    });

    return <p className={className}>{parts}</p>;
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10 animate-in fade-in duration-500 relative">
      
      {/* GLOSSARY TOOLTIP */}
      {activeDefinition && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm" onClick={() => setActiveDefinition(null)}>
          <div className="bg-[#2E2E2E] text-white p-8 rounded-[3rem] shadow-2xl relative border-2 border-[#4E8B83]/30 max-w-sm" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveDefinition(null)} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
            <h5 className="font-display font-bold text-[#4E8B83] uppercase text-xs tracking-[0.3em] mb-2">{activeDefinition.term}</h5>
            <p className="text-base font-medium leading-relaxed">{activeDefinition.definition}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center px-4">
        <button onClick={onBack} className="text-[#4E8B83] font-bold flex items-center gap-3 hover:translate-x-[-4px] transition-transform font-display text-lg uppercase tracking-wider">
          <span className="text-2xl">←</span> Back
        </button>
      </div>

      <div className="flex flex-col items-center gap-8 bg-white p-10 rounded-[4rem] card-shadow border border-[#EEF5F4]">
        
        {/* PROMINENT CHILD SELECTION AT TOP */}
        <div className="flex flex-col items-center gap-4 w-full">
          <span className="text-xs font-black text-[#4E8B83] uppercase tracking-[0.4em]">Who needs an action plan?</span>
          <div className="flex flex-wrap justify-center bg-[#FAF9F6] p-4 rounded-[3rem] border-2 border-[#EEF5F4] gap-3 shadow-inner">
            {profile.children.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedChild(c); setAdvice(null); }}
                className={`px-10 py-4 rounded-2xl text-sm font-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-sm ${
                  selectedChild.id === c.id 
                  ? 'bg-[#4E8B83] text-white shadow-xl shadow-[#4E8B83]/30 scale-105' 
                  : 'bg-white text-[#3B3B3B]/30 hover:text-[#4E8B83] border border-[#EEF5F4]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-[#2E2E2E] font-display tracking-tight leading-tight">Rapid Action Plan</h2>
          <p className="text-[#3B3B3B]/50 font-bold uppercase tracking-[0.3em] text-[11px]">3 steps. Zero fluff. For {selectedChild.name}.</p>
        </div>

        {!advice && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full pt-4">
            {selectedChild.challenges.map(c => (
              <button
                key={c}
                onClick={() => handleActionRequest(c)}
                className="bg-white p-6 rounded-[2.5rem] border-2 border-[#EEF5F4] text-[#3B3B3B] font-bold hover:bg-[#4E8B83] hover:text-white transition-all text-center flex items-center justify-center min-h-[140px] shadow-sm hover:shadow-lg font-display text-lg"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="h-64 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-8 border-[#EEF5F4] border-t-[#4E8B83] rounded-full animate-spin"></div>
            <p className="text-[#4E8B83] font-black uppercase tracking-widest animate-pulse">Building Your Gentle Plan...</p>
          </div>
        )}

        {advice && (
          <div className="space-y-6 w-full animate-in slide-in-from-bottom-10 duration-700">
            {[
              { step: advice.step1, summary: advice.summary1, detail: advice.detail1, num: 1 },
              { step: advice.step2, summary: advice.summary2, detail: advice.detail2, num: 2 },
              { step: advice.step3, summary: advice.summary3, detail: advice.detail3, num: 3 },
            ].map((item) => (
              <div key={item.num} className="bg-white rounded-[3.5rem] border-2 border-[#EEF5F4] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div 
                  className={`p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer group transition-colors ${expandedStep === item.num ? 'bg-[#EEF5F4]/50' : 'hover:bg-[#FAF9F6]'}`}
                  onClick={() => setExpandedStep(expandedStep === item.num ? null : item.num)}
                >
                  <div className="flex items-start gap-8">
                    <div className="w-16 h-16 bg-[#4E8B83] text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black shadow-lg shadow-[#4E8B83]/20 flex-shrink-0">
                      {item.num}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl md:text-3xl font-black font-display text-[#2E2E2E]">{item.step}</h4>
                      <TextWithGlossary text={item.summary} className="text-lg md:text-xl font-medium text-[#3B3B3B]/60 leading-relaxed font-display" />
                    </div>
                  </div>
                  <div className={`mt-6 md:mt-0 text-[#4E8B83] font-black text-xs uppercase tracking-[0.3em] transition-all bg-white/50 px-6 py-3 rounded-full border border-[#EEF5F4] group-hover:bg-[#4E8B83] group-hover:text-white ${expandedStep === item.num ? 'bg-[#4E8B83] text-white' : ''}`}>
                    {expandedStep === item.num ? 'Hide Details' : 'See Full Details'}
                  </div>
                </div>
                {expandedStep === item.num && (
                  <div className="px-10 pb-10 animate-in fade-in slide-in-from-top-4 duration-400">
                    <div className="p-10 bg-[#FAF9F6] rounded-[2.5rem] border border-[#EEF5F4] shadow-inner">
                       <h6 className="text-xs font-black text-[#4E8B83] uppercase tracking-[0.4em] mb-6">Detailed Strategy:</h6>
                       <div className="font-display text-lg md:text-2xl text-[#3B3B3B] leading-relaxed whitespace-pre-wrap">
                          <TextWithGlossary text={item.detail} />
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-[#FAF9F6] p-12 rounded-[3.5rem] border border-[#EEF5F4] text-center space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#3B3B3B]/30 uppercase tracking-[0.4em]">Did this plan help?</p>
                {feedbackGiven ? (
                  <p className="text-[#4E8B83] font-black text-xl animate-in zoom-in duration-300 uppercase tracking-widest">Thank you! 🌸</p>
                ) : (
                  <div className="flex justify-center gap-3">
                    {['Yes', 'Kind of', 'No'].map(val => (
                      <button 
                        key={val} 
                        onClick={() => handleFeedback(val)} 
                        className="px-8 py-2.5 rounded-full bg-white border-2 border-[#EEF5F4] text-[11px] font-black text-[#3B3B3B]/60 hover:bg-white hover:border-[#4E8B83]/20 transition-all font-display"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[#4E8B83] font-bold font-display text-2xl leading-relaxed">
                “This was quick help for right now. For long-term ideas, try Help my child.”
              </p>
              <div className="h-1.5 w-16 bg-[#EEF5F4] mx-auto rounded-full"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                onClick={saveToFavorites}
                className="flex-1 bg-white border-2 border-[#4E8B83] text-[#4E8B83] py-6 rounded-[2.5rem] font-black font-display text-xl hover:bg-[#EEF5F4] transition-all shadow-sm"
              >
                ⭐ Save This Plan
              </button>
              <button 
                onClick={() => { setAdvice(null); setSelectedChallenge(''); setFeedbackGiven(null); }}
                className="flex-1 bg-[#4E8B83] text-white py-6 rounded-[2.5rem] font-black font-display text-xl shadow-xl shadow-[#4E8B83]/20 hover:scale-[1.02] transition-transform"
              >
                Done / New Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightNowView;