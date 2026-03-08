
import React, { useState, useEffect } from 'react';
import { getParentWellnessAdvice } from '../services/gemini';

const ParentWellness: React.FC = () => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWellness = async () => {
      try {
        const data = await getParentWellnessAdvice();
        setAdvice(data);
      } finally {
        setLoading(false);
      }
    };
    fetchWellness();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-stone-800 font-display">Parent Sanctuary</h2>
        <p className="text-stone-500 text-lg">Nurturing the one who nurtures everyone else.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 space-y-4">
          <h3 className="text-xl font-bold text-emerald-800 font-display">Micro-Moments of Zen</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-emerald-100 rounded w-full"></div>
              <div className="h-4 bg-emerald-100 rounded w-5/6"></div>
              <div className="h-4 bg-emerald-100 rounded w-4/5"></div>
            </div>
          ) : (
            <div className="text-emerald-700 leading-relaxed whitespace-pre-wrap italic">
              {advice}
            </div>
          )}
        </div>

        <div className="bg-sky-50 rounded-3xl p-8 border border-sky-100 space-y-4">
          <h3 className="text-xl font-bold text-sky-800 font-display">Breath Work</h3>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-24 h-24 bg-sky-200/50 rounded-full flex items-center justify-center animate-pulse duration-[4000ms] scale-110">
              <div className="w-16 h-16 bg-sky-400/50 rounded-full flex items-center justify-center">
                 <span className="text-sky-900 font-bold">Breathe</span>
              </div>
            </div>
            <p className="text-sky-700 text-center text-sm">4-7-8 Breathing Technique: <br/> Inhale (4s), Hold (7s), Exhale (8s)</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
        <h3 className="text-2xl font-bold text-stone-800 font-display mb-6">Mental Health Toolkit</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Journal Prompt', text: "What's one thing I did today that made me proud of my patience?", icon: '✍️' },
            { title: 'Affirmation', text: "I am exactly the parent my child needs today.", icon: '🌟' },
            { title: 'Self-Care Idea', text: "Step outside for 2 minutes and feel the air on your skin.", icon: '👣' },
            { title: 'Boundary Setting', text: "It's okay to say 'I need a 5-minute break' to my kids.", icon: '✋' },
            { title: 'Gratitude', text: "Three things that went well today, no matter how small.", icon: '🙏' },
            { title: 'Mindfulness', text: "Notice 5 things you can see, 4 you can touch, 3 you can hear.", icon: '👁️' },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-colors">
              <span className="text-2xl mb-2 block">{item.icon}</span>
              <h4 className="font-bold text-stone-800 mb-1">{item.title}</h4>
              <p className="text-sm text-stone-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-stone-400 text-sm">
          Feeling overwhelmed? Text <b>HOME</b> to <b>741741</b> for the Crisis Text Line (US).
        </p>
      </div>
    </div>
  );
};

export default ParentWellness;
