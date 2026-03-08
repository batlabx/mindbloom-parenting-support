import React, { useState } from 'react';
import { UserProfile, Child } from '../types';
import { getExpertResponse } from '../services/gemini';
import { trackEvent } from '../services/analytics';

interface ExpertSectionProps {
  profile: UserProfile;
}

const ExpertSection: React.FC<ExpertSectionProps> = ({ profile }) => {
  const [selectedChildId, setSelectedChildId] = useState(profile.children[0]?.id || '');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!question || !selectedChildId) return;
    setLoading(true);
    setResponse(null);
    setSubmitted(false);
    setFeedbackGiven(null);

    const child = profile.children.find(c => c.id === selectedChildId);
    if (!child) return;

    try {
      const result = await getExpertResponse(question, child);
      setResponse(result);
      setSubmitted(true);
      trackEvent('expert_query', { childAge: child.age });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (val: string) => {
    setFeedbackGiven(val);
    trackEvent('expert_feedback', { rating: val });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[3rem] shadow-xl border border-[#EEF5F4] p-8 md:p-12">
        <header className="mb-10 space-y-4">
          <div className="inline-block bg-[#EEF5F4] text-[#4E8B83] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Clinical Insights
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2E2E2E] font-display">Ask a MindBloom Specialist</h2>
          <p className="text-[#3B3B3B]/50 max-w-xl font-medium">Deep clinical context for your child's specific developmental milestones.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-[#3B3B3B]/30">Child context</label>
              <div className="flex flex-wrap gap-2">
                {profile.children.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedChildId(c.id); setSubmitted(false); }}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all border ${
                      selectedChildId === c.id ? 'bg-[#4E8B83] text-white' : 'bg-white border-[#EEF5F4] text-[#3B3B3B]/40'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-[#3B3B3B]/30">Your query</label>
              <textarea
                className="w-full h-48 p-6 bg-[#FAF9F6] border border-[#EEF5F4] rounded-[2rem] outline-none focus:ring-4 focus:ring-[#4E8B83]/10 transition-all font-medium"
                placeholder="Describe your concern in detail..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !question}
              className="w-full py-5 bg-[#4E8B83] text-white rounded-[2rem] font-bold text-lg hover:bg-[#4E8B83]/90 transition-all disabled:opacity-50 shadow-lg shadow-[#4E8B83]/20"
            >
              {loading ? 'Reviewing Query...' : 'Submit to Specialist'}
            </button>
          </div>

          <div className="bg-[#FAF9F6] rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px] border border-[#EEF5F4]">
            {!submitted && !loading ? (
              <>
                <div className="text-5xl animate-float">📄</div>
                <h4 className="text-xl font-bold text-[#2E2E2E] font-display">Your Report Awaits</h4>
                <p className="text-sm text-[#3B3B3B]/50 font-medium">The specialist will provide a research-backed breakdown of your situation.</p>
              </>
            ) : loading ? (
              <div className="animate-pulse space-y-6 w-full">
                <div className="h-4 bg-white/50 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-white/50 rounded w-full"></div>
                <div className="h-4 bg-white/50 rounded w-5/6 mx-auto"></div>
              </div>
            ) : (
              <div className="text-left w-full space-y-8 animate-in fade-in duration-500 overflow-y-auto max-h-[400px] pr-2">
                <div className="flex justify-between items-center border-b border-[#EEF5F4] pb-4">
                  <h4 className="text-xl font-bold text-[#4E8B83] font-display">Specialist Analysis</h4>
                  <div className="bg-[#4E8B83] text-white text-[8px] font-black uppercase px-2 py-1 rounded">Confidential</div>
                </div>
                <div className="text-[#3B3B3B] leading-relaxed whitespace-pre-wrap text-base font-medium">
                  {response}
                </div>
                
                <div className="pt-8 border-t border-[#EEF5F4] space-y-4">
                  <p className="text-[10px] font-black text-[#3B3B3B]/30 uppercase tracking-[0.4em] text-center">Did this analysis help?</p>
                  {feedbackGiven ? (
                    <p className="text-[#4E8B83] font-black text-xl text-center animate-in zoom-in duration-300 uppercase tracking-widest">Thank you! 🌸</p>
                  ) : (
                    <div className="flex justify-center gap-3">
                      {['Yes', 'Kind of', 'No'].map(val => (
                        <button 
                          key={val} 
                          onClick={() => handleFeedback(val)} 
                          className="px-8 py-2 rounded-full bg-white border-2 border-[#EEF5F4] text-[10px] font-black text-[#3B3B3B]/60 hover:bg-[#EEF5F4] transition-all"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertSection;