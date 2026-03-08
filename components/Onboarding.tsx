
import React, { useState, useMemo } from 'react';
import { UserProfile, Child } from '../types';
import { trackEvent } from '../services/analytics';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const GrowingPlant = ({ className = "" }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} animate-pulse`}>
    <path d="M12 22V10" stroke="#4E8B83" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 18C12 18 6 18 6 13C6 10 12 10 12 18Z" fill="#4E8B83" fillOpacity="0.4" stroke="#4E8B83" strokeWidth="1.5"/>
    <path d="M12 14C12 14 18 14 18 9C18 6 12 6 12 14Z" fill="#4E8B83" fillOpacity="0.2" stroke="#4E8B83" strokeWidth="1.5"/>
  </svg>
);

const CHALLENGE_MAP = {
  '0-5': ['Big Emotions', 'Tantrums', 'Separation Anxiety', 'Listening Skills', 'Sleep Routines', 'Activity Transitions', 'Picky Eating', 'Turn Taking', 'Screen Limits', 'Independence Struggles'],
  '6-10': ['Emotional Regulation', 'Friendship Issues', 'Self Confidence', 'Homework Resistance', 'Respectful Listening', 'Disappointment Tolerance', 'Screen Balance', 'Honesty', 'Sibling Conflict', 'Teacher Expectations'],
  '11-15': ['Mood Swings', 'Peer Pressure', 'Communication Breakdown', 'Boundary Testing', 'Self Esteem', 'Motivation Struggles', 'Screen Time', 'Friend Drama', 'Authority Resistance', 'Stress Management'],
  '16-18': ['Independence Tension', 'Trust Building', 'Accountability', 'Emotional Control', 'Decision Making', 'Social Comparison', 'Time Management', 'Conflict Resolution', 'Life Readiness', 'Relationship Shifts']
};

const INTERESTS_MAP = {
  '0-5': ['Reading', 'Science', 'Friends', 'Creative Arts', 'Dolls/Cars', 'Building', 'Outdoor Play', 'Dance/Music', 'Pretend Play', 'Puzzles'],
  '6-10': ['Reading', 'Science', 'Friends', 'Creative Arts', 'Building', 'Games', 'Technology', 'Sports', 'Outdoor Play', 'Puzzles'],
  '11-15': ['Reading', 'Science', 'Friends', 'Creative Arts', 'Technology', 'Coding', 'Gaming', 'Debate', 'Social Media', 'Drama'],
  '16-18': ['Reading', 'Science', 'Friends', 'Creative Arts', 'Technology', 'Coding', 'Gaming', 'Travel', 'Career', 'Fitness']
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [parentName, setParentName] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [step, setStep] = useState<'parent' | 'child'>('parent');
  const [tempChild, setTempChild] = useState<Partial<Child>>({ 
    name: '', 
    age: undefined, 
    challenges: [], 
    interests: [] 
  });
  const [customChallenge, setCustomChallenge] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  
  const [customInterest, setCustomInterest] = useState('');
  const [isAddingCustomInterest, setIsAddingCustomInterest] = useState(false);

  const currentChallenges = useMemo(() => {
    const age = Number(tempChild.age) || 0;
    let base = [];
    if (age <= 5) base = [...CHALLENGE_MAP['0-5']];
    else if (age <= 10) base = [...CHALLENGE_MAP['6-10']];
    else if (age <= 15) base = [...CHALLENGE_MAP['11-15']];
    else base = [...CHALLENGE_MAP['16-18']];
    
    const customOnes = (tempChild.challenges || []).filter(c => !base.includes(c));
    return [...base, ...customOnes];
  }, [tempChild.age, tempChild.challenges]);

  const currentInterests = useMemo(() => {
    const age = Number(tempChild.age) || 0;
    let base = [];
    if (age <= 5) base = [...INTERESTS_MAP['0-5']];
    else if (age <= 10) base = [...INTERESTS_MAP['6-10']];
    else if (age <= 15) base = [...INTERESTS_MAP['11-15']];
    else base = [...INTERESTS_MAP['16-18']];

    const customOnes = (tempChild.interests || []).filter(i => !base.includes(i));
    return [...base, ...customOnes];
  }, [tempChild.age, tempChild.interests]);

  const toggleItem = (item: string, key: 'challenges' | 'interests') => {
    const current = (tempChild[key] as string[]) || [];
    setTempChild({
      ...tempChild, 
      [key]: current.includes(item) ? current.filter(i => i !== item) : [...current, item]
    });
  };

  const handleAddCustomChallenge = () => {
    if (!customChallenge.trim()) {
      setIsAddingCustom(false);
      return;
    }
    const current = (tempChild.challenges as string[]) || [];
    if (!current.includes(customChallenge.trim())) {
      setTempChild({
        ...tempChild,
        challenges: [...current, customChallenge.trim()]
      });
    }
    setCustomChallenge('');
    setIsAddingCustom(false);
  };

  const handleAddCustomInterest = () => {
    if (!customInterest.trim()) {
      setIsAddingCustomInterest(false);
      return;
    }
    const current = (tempChild.interests as string[]) || [];
    if (!current.includes(customInterest.trim())) {
      setTempChild({
        ...tempChild,
        interests: [...current, customInterest.trim()]
      });
    }
    setCustomInterest('');
    setIsAddingCustomInterest(false);
  };

  const handleAddChild = () => {
    if (!tempChild.name || tempChild.age === undefined) return;
    const newChild: Child = {
      id: Math.random().toString(36).substr(2, 9),
      name: tempChild.name,
      age: Number(tempChild.age),
      challenges: tempChild.challenges || [],
      interests: tempChild.interests || []
    };
    setChildren([...children, newChild]);
    setTempChild({ name: '', age: undefined, challenges: [], interests: [] });
    setIsAddingCustom(false);
    setIsAddingCustomInterest(false);
    trackEvent('child_added', { age: newChild.age });
  };

  const handleFinish = () => {
    let finalChildren = [...children];
    if (tempChild.name && tempChild.age !== undefined && !children.some(c => c.name === tempChild.name)) {
      finalChildren.push({
        id: Math.random().toString(36).substr(2, 9),
        name: tempChild.name,
        age: Number(tempChild.age),
        challenges: tempChild.challenges || [],
        interests: tempChild.interests || []
      });
    }
    
    onComplete({ 
      name: parentName, 
      children: finalChildren, 
      onboarded: true,
      favorites: [],
      chatHistory: [],
      logs: []
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 py-12">
      <div className="max-w-4xl w-full bg-white rounded-[4rem] shadow-3xl shadow-[#2E2E2E]/5 p-10 md:p-16 space-y-12 border border-[#EEF5F4] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 text-6xl opacity-10 animate-spin-slow text-[#4E8B83]">🌸</div>
        
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-8">
            <GrowingPlant />
            <h2 className="text-5xl md:text-6xl font-black text-[#2E2E2E] font-display tracking-tight leading-tight">Mind<span className="text-[#4E8B83]">Bloom</span></h2>
            <GrowingPlant className="-scale-x-100" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[#2E2E2E] text-2xl font-bold font-display leading-tight whitespace-normal break-words">
              Personalized, practical support for hard parenting moments
            </p>
            <p className="text-[#3B3B3B]/60 text-sm font-medium">For everyday, non-medical emotional and behavioral challenges</p>
          </div>
        </div>

        {step === 'parent' ? (
          <div className="space-y-12 animate-in fade-in zoom-in duration-600 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-24">
              <p className="text-[#4E8B83] text-2xl font-bold font-display leading-tight">
                Get personalized guidance in seconds
              </p>
              
              <section className="space-y-6 w-full max-w-sm">
                <label className="text-xs font-black uppercase tracking-[0.5em] text-[#4E8B83] block text-center">What's your name?</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full p-6 bg-[#FAF9F6] border-2 border-[#EEF5F4] rounded-[2rem] focus:ring-8 focus:ring-[#EEF5F4]/5 outline-none text-3xl text-center font-display font-black text-[#2E2E2E] transition-all"
                  placeholder="Name"
                />
              </section>
            </div>
            
            <button
              onClick={() => setStep('child')}
              disabled={!parentName}
              className="w-full bg-[#4E8B83] text-white p-6 rounded-[2rem] font-black text-2xl hover:scale-[1.02] transition-all shadow-xl shadow-[#4E8B83]/20 disabled:opacity-50 font-display"
            >
              Get Started →
            </button>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-600">
            {children.length > 0 && (
              <div className="space-y-4 text-center">
                <p className="text-[10px] font-black text-[#4E8B83] uppercase tracking-[0.4em]">Your Growing Bloom List</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {children.map(c => (
                    <div key={c.id} className="bg-[#FAF9F6] text-[#3B3B3B] px-8 py-3 rounded-full text-sm font-black border-2 border-[#EEF5F4] shadow-sm">
                      {c.name} ({c.age})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <section className="space-y-10">
              <h3 className="text-4xl font-black text-[#2E2E2E] font-display text-center">
                {children.length === 0 ? "Tell us about your child" : "Add another child"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-[#4E8B83] px-4">Name</label>
                  <input
                    type="text"
                    placeholder="Child's Name"
                    className="w-full p-6 bg-[#FAF9F6] border-2 border-[#EEF5F4] rounded-[2rem] outline-none font-bold text-[#2E2E2E] focus:border-[#4E8B83]"
                    value={tempChild.name}
                    onChange={(e) => setTempChild({...tempChild, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-[#4E8B83] px-4">Age</label>
                  <input
                    type="number"
                    placeholder="Age"
                    className="w-full p-6 bg-[#FAF9F6] border-2 border-[#EEF5F4] rounded-[2rem] outline-none font-bold text-[#2E2E2E] focus:border-[#4E8B83]"
                    value={tempChild.age === undefined ? '' : tempChild.age}
                    onChange={(e) => setTempChild({...tempChild, age: e.target.value === '' ? undefined : Number(e.target.value)})}
                  />
                </div>
              </div>

              {tempChild.name && tempChild.age !== undefined && (
                <div className="space-y-12 pt-6 animate-in fade-in duration-600">
                  <div className="space-y-6 text-center">
                    <p className="text-xs font-black text-[#4E8B83] uppercase tracking-[0.4em]">What are you working on?</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {currentChallenges.map(c => (
                        <button
                          key={c}
                          onClick={() => toggleItem(c, 'challenges')}
                          className={`px-6 py-3 rounded-full text-xs font-black border-2 transition-all ${
                            tempChild.challenges?.includes(c) 
                            ? 'bg-[#4E8B83] border-[#4E8B83] text-white shadow-lg' 
                            : 'bg-white border-[#EEF5F4] text-[#3B3B3B]/40 hover:border-[#4E8B83]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                      
                      {isAddingCustom ? (
                        <div className="flex items-center gap-3 animate-in slide-in-from-left-4">
                          <input 
                            type="text"
                            value={customChallenge}
                            onChange={(e) => setCustomChallenge(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomChallenge()}
                            placeholder="Challenge..."
                            className="px-6 py-2 border-2 border-[#4E8B83] rounded-full text-xs outline-none font-black"
                            autoFocus
                          />
                          <button onClick={handleAddCustomChallenge} className="text-[#4E8B83] font-black text-sm">Add</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsAddingCustom(true)}
                          className="px-6 py-3 rounded-full text-xs font-black border-2 border-dashed border-[#4E8B83]/30 text-[#4E8B83]/60 hover:border-[#4E8B83]/50"
                        >
                          + Add Custom
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 text-center">
                    <p className="text-xs font-black text-[#3B3B3B]/40 uppercase tracking-[0.4em]">Interests</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {currentInterests.map(i => (
                        <button
                          key={i}
                          onClick={() => toggleItem(i, 'interests')}
                          className={`px-6 py-3 rounded-full text-xs font-black border-2 transition-all ${
                            tempChild.interests?.includes(i) 
                            ? 'bg-[#2E2E2E] border-[#2E2E2E] text-white shadow-lg' 
                            : 'bg-white border-[#EEF5F4] text-[#3B3B3B]/40 hover:border-[#2E2E2E]'
                          }`}
                        >
                          {i}
                        </button>
                      ))}
                      
                      {isAddingCustomInterest ? (
                        <div className="flex items-center gap-3 animate-in slide-in-from-left-4">
                          <input 
                            type="text"
                            value={customInterest}
                            onChange={(e) => setCustomInterest(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomInterest()}
                            placeholder="Interest..."
                            className="px-6 py-2 border-2 border-[#4E8B83] rounded-full text-xs outline-none font-black"
                            autoFocus
                          />
                          <button onClick={handleAddCustomInterest} className="text-[#4E8B83] font-black text-sm">Add</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsAddingCustomInterest(true)}
                          className="px-6 py-3 rounded-full text-xs font-black border-2 border-dashed border-[#4E8B83]/30 text-[#4E8B83]/60 hover:border-[#4E8B83]/50"
                        >
                          + Add Custom
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <button
                onClick={handleAddChild}
                disabled={!tempChild.name || tempChild.age === undefined}
                className="flex-1 bg-white text-[#4E8B83] border-4 border-[#EEF5F4] p-6 rounded-[2rem] font-black text-xl hover:bg-[#EEF5F4] transition-all disabled:opacity-30 font-display"
              >
                + Add Another
              </button>
              <button
                onClick={handleFinish}
                disabled={children.length === 0 && (!tempChild.name || tempChild.age === undefined)}
                className="flex-1 bg-[#4E8B83] text-white p-6 rounded-[2rem] font-black text-xl hover:opacity-90 transition-all shadow-xl shadow-[#4E8B83]/20 disabled:opacity-50 font-display"
              >
                Let's Bloom
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
