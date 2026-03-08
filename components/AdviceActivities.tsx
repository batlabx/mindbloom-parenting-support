import React, { useState } from 'react';
import { UserProfile, Child, DailyTip, FavoriteItem } from '../types';
import { getChallengeAdvice } from '../services/gemini';
import Modal from './Modal';
import { trackEvent } from '../services/analytics';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
}

const AdviceActivities: React.FC<Props> = ({ profile, onUpdateProfile, onBack }) => {
  const [selectedChild, setSelectedChild] = useState<Child>(profile.children[0]);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [advice, setAdvice] = useState<DailyTip | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [newChallengeInput, setNewChallengeInput] = useState('');
  const [isAddingChallenge, setIsAddingChallenge] = useState(false);
  const [activeDefinition, setActiveDefinition] = useState<{term: string, definition: string} | null>(null);

  const handleChallengeClick = async (challenge: string) => {
    setSelectedChallenge(challenge);
    setLoading(true);
    setFeedbackGiven(null);
    setSavedItems(new Set());
    setActiveDefinition(null);
    trackEvent('advice_request', { challenge, childAge: selectedChild.age });
    try {
      const res = await getChallengeAdvice(profile.name, selectedChild, challenge);
      setAdvice(res);
      setShowMainModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (val: string) => {
    setFeedbackGiven(val);
    trackEvent('advice_feedback', { challenge: selectedChallenge, rating: val });
  };

  const handleAddCustomChallenge = () => {
    if (!newChallengeInput.trim()) {
      setIsAddingChallenge(false);
      return;
    }

    const trimmedChallenge = newChallengeInput.trim();
    if (selectedChild.challenges.includes(trimmedChallenge)) {
      setNewChallengeInput('');
      setIsAddingChallenge(false);
      return;
    }

    const updatedChildren = profile.children.map(c => {
      if (c.id === selectedChild.id) {
        return { ...c, challenges: [...c.challenges, trimmedChallenge] };
      }
      return c;
    });

    const updatedChild = updatedChildren.find(c => c.id === selectedChild.id)!;
    onUpdateProfile({ ...profile, children: updatedChildren });
    setSelectedChild(updatedChild);
    setNewChallengeInput('');
    setIsAddingChallenge(false);
  };

  const saveToFavorites = (type: 'advice' | 'script' | 'activity', content: string) => {
    const key = `${type}-${content.substring(0, 10)}`;
    if (savedItems.has(key)) return;

    const newItem: FavoriteItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: `${selectedChallenge} (${type})`,
      content,
      childContext: `${selectedChild.name} (Age ${selectedChild.age})`,
      dateSaved: new Date().toISOString()
    };
    
    onUpdateProfile({ ...profile, favorites: [...profile.favorites, newItem] });
    setSavedItems(prev => new Set(prev).add(key));
  };

  const isSaved = (type: string, content: string) => {
    const key = `${type}-${content.substring(0, 10)}`;
    return savedItems.has(key);
  };

  const renderContentWithGlossary = (text?: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    
    return lines.map((line, idx) => {
      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*');
      const cleanLine = isBullet ? line.trim().substring(1).trim() : line;
      
      let parts: React.ReactNode[] = [cleanLine];
      if (advice?.glossary) {
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
                    onClick={() => setActiveDefinition(item)}
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
      }

      if (isBullet) {
        return (
          <div key={idx} className="flex gap-4 mb-3 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4E8B83] mt-2.5 flex-shrink-0"></div>
            <p className={displayFontClass}>{parts}</p>
          </div>
        );
      }
      
      return <p key={idx} className={`${displayFontClass} mb-4`}>{parts}</p>;
    });
  };

  const displayFontClass = "font-display font-medium text-lg md:text-xl leading-relaxed text-[#3B3B3B]";

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      <div className="px-4">
        <button onClick={onBack} className="text-[#4E8B83] font-bold flex items-center gap-3 hover:translate-x-[-4px] transition-transform font-display text-lg uppercase tracking-wider">
          <span className="text-2xl">←</span> Back
        </button>
      </div>
      
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] card-shadow border border-[#EEF5F4] min-h-[60vh] flex flex-col items-center justify-start space-y-12 animate-in fade-in duration-500">
        
        <div className="w-full flex flex-col items-center gap-8">
           <div className="flex flex-col items-center gap-4 w-full">
             <div className="h-1.5 w-24 bg-[#4E8B83] rounded-full opacity-20"></div>
             <span className="text-xs font-black text-[#4E8B83] uppercase tracking-[0.4em]">Who are we blooming with?</span>
             <div className="flex flex-wrap justify-center bg-[#FAF9F6] p-4 rounded-[3rem] border-2 border-[#EEF5F4] gap-3 max-w-2xl">
                {profile.children.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChild(c)}
                    className={`px-12 py-5 rounded-[1.5rem] text-sm font-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-sm ${
                      selectedChild.id === c.id 
                      ? 'bg-[#4E8B83] text-white shadow-xl shadow-[#4E8B83]/30 scale-110' 
                      : 'bg-white text-[#3B3B3B]/30 hover:text-[#4E8B83] border border-[#EEF5F4]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
             </div>
           </div>

          <header className="text-center space-y-4 pt-4 w-full">
            <h2 className="text-4xl md:text-6xl font-bold text-[#2E2E2E] font-display">Pick a Challenge</h2>
            <p className="text-[#3B3B3B]/50 font-medium text-lg md:text-xl leading-relaxed whitespace-normal break-words">Choose an area where {selectedChild.name} could use some gentle support.</p>
          </header>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedChild.challenges.map(c => (
            <button
              key={c}
              disabled={loading}
              onClick={() => handleChallengeClick(c)}
              className="px-4 py-8 rounded-[2rem] text-sm font-bold bg-[#FAF9F6] border border-[#EEF5F4] text-[#3B3B3B] hover:bg-[#4E8B83] hover:text-white transition-all transform hover:-translate-y-1 shadow-sm flex items-center justify-center text-center leading-snug"
            >
              {c}
            </button>
          ))}
          
          {isAddingChallenge ? (
            <div className="col-span-2 flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
              <input
                autoFocus
                type="text"
                value={newChallengeInput}
                onChange={(e) => setNewChallengeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomChallenge()}
                placeholder="What's the challenge?"
                className="flex-1 px-6 py-5 rounded-[2rem] text-sm font-bold border-2 border-[#4E8B83] outline-none text-[#3B3B3B] shadow-inner bg-white"
              />
              <button 
                onClick={handleAddCustomChallenge}
                className="w-14 h-14 bg-[#4E8B83] text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg"
              >✓</button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingChallenge(true)}
              className="px-4 py-8 rounded-[2rem] text-sm font-bold border-2 border-dashed border-[#4E8B83]/40 text-[#4E8B83] hover:bg-[#EEF5F4] transition-all flex items-center justify-center text-center"
            >+ Add Custom</button>
          )}
        </div>
        
        {loading && (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#EEF5F4] border-t-[#4E8B83] rounded-full animate-spin"></div>
            <p className="text-[#4E8B83] font-bold text-xs tracking-widest uppercase animate-pulse">Consulting Specialist AI...</p>
          </div>
        )}
      </div>

      <Modal isOpen={showMainModal} onClose={() => setShowMainModal(false)} title={selectedChallenge}>
        <div className="space-y-8 relative">
          
          <div className="text-center -mt-4 mb-2">
            <span className="bg-[#FAF9F6] text-[#4E8B83] px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.15em] border border-[#EEF5F4] shadow-sm">
              Developmentally appropriate for age {selectedChild.age}
            </span>
          </div>

          {activeDefinition && (
            <div className="absolute top-0 left-0 w-full z-50 animate-in slide-in-from-top-4">
              <div className="bg-[#2E2E2E] text-white p-6 rounded-[2rem] shadow-2xl relative border-2 border-[#4E8B83]/30">
                <button onClick={() => setActiveDefinition(null)} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
                <h5 className="font-display font-bold text-[#4E8B83] uppercase text-xs tracking-widest mb-1">{activeDefinition.term}</h5>
                <p className="text-sm font-medium leading-relaxed">{activeDefinition.definition}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 p-5 bg-[#FAF9F6] rounded-[2rem] border border-[#EEF5F4] text-[11px] font-bold text-[#3B3B3B]/70 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="text-[#4E8B83]">💡</span> <span className="text-[10px]">Tap highlighted words for easy definitions</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#EEF5F4] p-6 rounded-t-[2.5rem] border-x border-t border-[#EEF5F4]">
              <h4 className="font-black text-[#4E8B83] uppercase text-2xl md:text-3xl tracking-tight flex items-center gap-3 font-display">
                <span className="text-3xl">💡</span> Gentle Strategy
              </h4>
              <button 
                onClick={() => saveToFavorites('advice', advice?.content || '')}
                className={`text-[9px] font-bold border-2 px-3 py-1.5 rounded-full transition-all uppercase tracking-wider ${
                  isSaved('advice', advice?.content || '') 
                  ? 'bg-[#4E8B83] text-white border-[#4E8B83]' 
                  : 'text-[#4E8B83] border-[#4E8B83]/20 hover:bg-white'
                }`}
              >
                {isSaved('advice', advice?.content || '') ? 'Saved ⭐' : 'Save'}
              </button>
            </div>
            <div className="p-8 bg-white border-x border-b border-[#EEF5F4] rounded-b-[2.5rem] shadow-sm">
              {renderContentWithGlossary(advice?.content)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#F1F1F1] p-6 rounded-t-[2.5rem] border-x border-t border-[#F1F1F1]">
              <h5 className="font-black text-[#2E2E2E] text-2xl md:text-3xl uppercase tracking-tight flex items-center gap-3 font-display">
                <span className="text-3xl">💬</span> The Script
              </h5>
              <button 
                onClick={() => saveToFavorites('script', advice?.script || '')}
                className={`text-[9px] font-bold border-2 px-3 py-1.5 rounded-full transition-all uppercase tracking-wider ${
                  isSaved('script', advice?.script || '') 
                  ? 'bg-[#2E2E2E] text-white border-[#2E2E2E]' 
                  : 'text-[#2E2E2E] border-[#2E2E2E]/20 hover:bg-white'
                }`}
              >
                {isSaved('script', advice?.script || '') ? 'Saved ⭐' : 'Save'}
              </button>
            </div>
            <div className="p-8 bg-white border-x border-b border-[#F1F1F1] rounded-b-[2.5rem] shadow-sm italic">
              {renderContentWithGlossary(advice?.script ? `"${advice.script}"` : undefined)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#FAF9F6] p-6 rounded-t-[2.5rem] border-x border-t border-gray-100">
              <h5 className="font-black text-[#3B3B3B]/60 text-2xl md:text-3xl uppercase tracking-tight flex items-center gap-3 font-display">
                <span className="text-3xl">🎨</span> Bloom Activity
              </h5>
              <button 
                onClick={() => saveToFavorites('activity', `${advice?.activity}\n\n${advice?.details}`)}
                className={`text-[9px] font-bold border-2 px-3 py-1.5 rounded-full transition-all uppercase tracking-wider ${
                  isSaved('activity', `${advice?.activity}\n\n${advice?.details}`) 
                  ? 'bg-[#4E8B83] text-white border-[#4E8B83]' 
                  : 'text-[#4E8B83] border-[#4E8B83]/20 hover:bg-white'
                }`}
              >
                {isSaved('activity', `${advice?.activity}\n\n${advice?.details}`) ? 'Saved ⭐' : 'Save'}
              </button>
            </div>
            <div className="p-8 bg-white border-x border-b border-gray-100 rounded-b-[2.5rem] shadow-sm space-y-4">
              <h6 className="text-[#4E8B83] font-black uppercase text-xs tracking-widest">{advice?.activity}</h6>
              <div className="whitespace-pre-wrap">
                {renderContentWithGlossary(advice?.details || advice?.activity)}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 text-center space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-[#3B3B3B]/30 uppercase tracking-[0.4em]">Did this help?</p>
              {feedbackGiven ? (
                <p className="text-[#4E8B83] font-black text-xl animate-in zoom-in duration-300 uppercase tracking-widest">Thank you! 🌸</p>
              ) : (
                <div className="flex justify-center gap-3">
                  {['Yes', 'Kind of', 'No'].map(val => (
                    <button 
                      key={val} 
                      onClick={() => handleFeedback(val)} 
                      className="px-8 py-2.5 rounded-full bg-white border-2 border-[#EEF5F4] text-[11px] font-black text-[#3B3B3B]/60 hover:bg-[#FAF9F6] hover:border-[#4E8B83]/20 transition-all font-display"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#FAF9F6] p-8 rounded-[2.5rem] border border-[#EEF5F4]">
              <p className="text-[#4E8B83] font-bold font-display text-xl leading-relaxed">If things feel urgent in the moment, try "What should I do right now?"</p>
            </div>
            <button onClick={() => setShowMainModal(false)} className="w-full bg-[#4E8B83] text-white py-6 rounded-[2.5rem] font-bold font-display text-xl shadow-xl shadow-[#4E8B83]/20 hover:scale-[1.02] transition-transform">I'm Ready</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdviceActivities;