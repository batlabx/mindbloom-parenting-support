
import React, { useState } from 'react';
import { UserProfile } from '../types';
import Modal from './Modal';

interface Props {
  profile: UserProfile;
  onBack: () => void;
}

const ExpertComingSoon: React.FC<Props> = ({ profile, onBack }) => {
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <button onClick={onBack} className="text-amber-700 font-bold flex items-center gap-2 mb-4 hover:translate-x-[-4px] transition-transform">← Back to Hub</button>
      
      <div className="text-center space-y-6">
        <h2 className="text-4xl font-bold text-emerald-900 font-display">Ask An Expert</h2>
        <p className="text-stone-600">For complex developmental concerns, our team of clinical specialists is coming soon to provide responses within 24 hours.</p>
        
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-stone-100 space-y-6">
          <div className="space-y-4">
            <h4 className="font-bold text-stone-700 text-left px-2">Submit Your Concern</h4>
            <textarea
              className="w-full h-48 p-6 bg-stone-50 border border-stone-100 rounded-3xl outline-none focus:ring-4 focus:ring-amber-100 transition-all"
              placeholder="Describe your situation in clinical detail. What have you tried? What are your child's triggers?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-5 bg-amber-500 text-white rounded-[2rem] font-bold text-xl hover:bg-amber-600 shadow-lg transition-all"
          >
            Submit for Specialist Queue
          </button>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Feature Coming Soon">
        <div className="text-center space-y-6">
          <div className="text-6xl">🎓</div>
          <p className="text-xl text-stone-800 font-display">Expert Specialist access is a premium feature launching in MindBloom v2.</p>
          <p className="text-stone-500 leading-relaxed">We have saved your query: <br/><span className="italic text-stone-400">"{query.substring(0, 50)}..."</span></p>
          <p className="text-amber-700 font-bold">You will be notified as soon as our clinical team is ready!</p>
          <button 
            onClick={() => { setShowModal(false); setQuery(''); }}
            className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold hover:bg-amber-600 transition-colors"
          >
            Got it
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ExpertComingSoon;
