
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserProfile, ChatMessage, FavoriteItem } from '../types';
import { getAiChatResponse } from '../services/gemini';
import { trackEvent } from '../services/analytics';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
}

const AGE_BASED_SUGGESTIONS = {
  '0-5': [
    "How do I handle a grocery store tantrum?",
    "Tips for easier bedtime transitions?",
    "What's a good script for sharing toys?",
    "How to handle separation anxiety at daycare?"
  ],
  '6-10': [
    "How to talk about friendship drama?",
    "Script for homework resistance?",
    "Helping my child handle losing a game?",
    "Building confidence after a school mistake?"
  ],
  '11-15': [
    "Tips for communicating through mood swings?",
    "Setting healthy screen time boundaries?",
    "How to support them with peer pressure?",
    "Script for discussing social media safety?"
  ],
  '16-18': [
    "Helping them manage future-related stress?",
    "Balancing independence with family rules?",
    "Conflict resolution script for older teens?",
    "Supporting them through relationship shifts?"
  ]
};

const CoachAIView: React.FC<Props> = ({ profile, onUpdateProfile, onBack }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<number, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [profile.chatHistory, loading]);

  const pastUserQuestions = useMemo(() => {
    return profile.chatHistory
      .filter(m => m.role === 'user')
      .slice(-6)
      .reverse();
  }, [profile.chatHistory]);

  const relevantSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    profile.children.forEach(child => {
      if (child.age <= 5) AGE_BASED_SUGGESTIONS['0-5'].forEach(s => suggestions.add(s));
      else if (child.age <= 10) AGE_BASED_SUGGESTIONS['6-10'].forEach(s => suggestions.add(s));
      else if (child.age <= 15) AGE_BASED_SUGGESTIONS['11-15'].forEach(s => suggestions.add(s));
      else AGE_BASED_SUGGESTIONS['16-18'].forEach(s => suggestions.add(s));
    });
    // Shuffle and pick 4
    return Array.from(suggestions).sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [profile.children]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;
    
    setError(null);
    const userMsg: ChatMessage = { 
      role: 'user', 
      content: textToSend, 
      timestamp: new Date().toISOString() 
    };
    
    const updatedHistory = [...profile.chatHistory, userMsg];
    onUpdateProfile({ ...profile, chatHistory: updatedHistory });
    setInput('');
    setLoading(true);
    trackEvent('coach_query', { length: textToSend.length });

    try {
      const resText = await getAiChatResponse(updatedHistory.map(m => ({ role: m.role, content: m.content })), textToSend, profile.children);
      const aiMsg: ChatMessage = { 
        role: 'assistant', 
        content: resText, 
        timestamp: new Date().toISOString() 
      };
      onUpdateProfile({ ...profile, chatHistory: [...updatedHistory, aiMsg] });
    } catch (e: any) {
      console.error(e);
      const msg = e.message?.includes('429') ? "MindBloom is very busy right now. Please wait a moment and try again." : "Something went wrong. Please check your connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const saveToFavorites = (content: string) => {
    const newItem: FavoriteItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'advice',
      title: "Coach Insight",
      content,
      dateSaved: new Date().toISOString()
    };
    onUpdateProfile({ ...profile, favorites: [...profile.favorites, newItem] });
    trackEvent('favorite_saved', { type: 'coach_advice' });
  };

  const handleFeedback = (idx: number, val: string) => {
    setFeedbackState(prev => ({ ...prev, [idx]: val }));
    trackEvent('coach_feedback', { messageIndex: idx, rating: val });
  };

  const clearHistory = () => {
    if (confirm("Reset conversation history?")) {
      onUpdateProfile({ ...profile, chatHistory: [] });
      setFeedbackState({});
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2 flex flex-col h-[85vh]">
      <div className="flex justify-between items-center mb-6 px-6">
        <button onClick={onBack} className="text-[#4E8B83] font-bold flex items-center gap-2 font-display text-lg uppercase tracking-wider group">
          <span className="text-xl transition-transform group-hover:-translate-x-1">←</span> Home
        </button>
        <div className="flex items-center gap-6">
          {profile.chatHistory.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-[10px] font-bold text-[#3B3B3B]/30 hover:text-red-400 uppercase tracking-widest transition-colors"
            >
              Clear
            </button>
          )}
          <h2 className="text-3xl font-bold text-[#2E2E2E] font-display">Coach AI</h2>
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-[3rem] card-shadow border border-[#EEF5F4] overflow-hidden flex flex-col">
        {pastUserQuestions.length > 0 && (
          <div className="bg-[#FAF9F6] px-6 py-3 border-b border-[#EEF5F4] flex items-center gap-4 overflow-x-auto no-scrollbar">
            <span className="text-[8px] font-black text-[#3B3B3B]/30 uppercase tracking-[0.3em] whitespace-normal break-words">Past Topics:</span>
            {pastUserQuestions.map((q, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(q.content)}
                className="text-[10px] font-bold bg-white border border-[#EEF5F4] px-4 py-1.5 rounded-full text-[#4E8B83] hover:bg-[#4E8B83] hover:text-white transition-all whitespace-normal break-words shadow-sm"
              >
                {q.content.length > 20 ? q.content.substring(0, 20) + '...' : q.content}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {profile.chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-8">
               <div className="w-24 h-24 bg-[#FAF9F6] border-2 border-[#EEF5F4] rounded-[2rem] flex items-center justify-center text-6xl animate-float shadow-xl shadow-[#4E8B83]/5">🤖</div>
               <div className="space-y-6">
                 <div className="space-y-2">
                   <p className="font-display text-3xl text-[#2E2E2E] font-bold">"How can I help you bloom today?"</p>
                   <p className="text-[#3B3B3B]/40 font-bold uppercase tracking-[0.3em] text-[10px]">Ask about scripts, tantrums, or transitions.</p>
                 </div>
                 
                 <div className="space-y-4 pt-4">
                   <p className="text-[9px] font-black text-[#4E8B83] uppercase tracking-[0.4em]">Try asking...</p>
                   <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                     {relevantSuggestions.map((suggestion, idx) => (
                       <button
                         key={idx}
                         onClick={() => handleSend(suggestion)}
                         className="px-6 py-3 bg-white border border-[#EEF5F4] rounded-2xl text-xs font-bold text-[#3B3B3B] hover:border-[#4E8B83] hover:text-[#4E8B83] transition-all text-left shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-2"
                         style={{ animationDelay: `${idx * 100}ms` }}
                       >
                         {suggestion}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          ) : (
            profile.chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[90%] md:max-w-[80%] space-y-3`}>
                  <div className={`p-6 rounded-[2rem] shadow-sm font-medium leading-relaxed text-lg ${
                    msg.role === 'user' 
                    ? 'bg-[#4E8B83] text-white rounded-tr-none shadow-lg shadow-[#4E8B83]/20' 
                    : 'bg-[#FAF9F6] text-[#3B3B3B] rounded-tl-none border border-[#EEF5F4]'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-6 ml-6">
                      <button 
                        onClick={() => saveToFavorites(msg.content)} 
                        className="text-[9px] font-bold text-[#4E8B83] uppercase tracking-widest hover:text-[#2E2E2E] transition-colors flex items-center gap-2"
                      >
                        <span>⭐</span> Save
                      </button>
                      
                      {feedbackState[i] ? (
                        <span className="text-[9px] font-black text-[#4E8B83] uppercase tracking-widest">Helpful: {feedbackState[i]}</span>
                      ) : (
                        <div className="flex items-center gap-3">
                           <span className="text-[8px] font-black text-[#3B3B3B]/20 uppercase tracking-widest">Was this helpful?</span>
                           <div className="flex gap-1.5">
                             {['Yes', 'No'].map(v => (
                               <button 
                                 key={v}
                                 onClick={() => handleFeedback(i, v)}
                                 className="text-[9px] font-bold text-[#3B3B3B]/30 hover:text-[#4E8B83] transition-colors border-b border-transparent hover:border-[#4E8B83]/20"
                               >
                                 {v}
                               </button>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#FAF9F6] px-8 py-4 rounded-full border border-[#EEF5F4] flex gap-2 items-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-[#4E8B83] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#4E8B83] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-[#4E8B83] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-6 md:p-10 bg-[#FAF9F6] border-t border-[#EEF5F4]">
          <div className="flex gap-4 max-w-4xl mx-auto">
            <input
              type="text"
              className="flex-1 p-5 bg-white border border-[#EEF5F4] rounded-[2rem] outline-none focus:ring-4 focus:ring-[#4E8B83]/10 text-lg font-medium shadow-inner transition-all placeholder-[#3B3B3B]/30"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-[#4E8B83] text-white w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-bold hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-[#4E8B83]/30"
            >
              <span className="text-3xl">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachAIView;
