import React, { useState } from 'react';
import { UserProfile, DailyLog, Child } from '../types';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
}

const ProgressTracker: React.FC<Props> = ({ profile, onUpdateProfile, onBack }) => {
  const [selectedChildId, setSelectedChildId] = useState(profile.children[0]?.id || '');
  const [logType, setLogType] = useState<'win' | 'challenge' | 'note'>('win');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😊');

  const moods = ['😊', '😌', '😤', '😢', '😴', '🥳'];

  const handleAddLog = () => {
    if (!content.trim()) return;

    const newLog: DailyLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      childId: selectedChildId,
      type: logType,
      content: content.trim(),
      mood: mood
    };

    const updatedProfile = {
      ...profile,
      logs: [newLog, ...(profile.logs || [])]
    };

    onUpdateProfile(updatedProfile);
    setContent('');
  };

  const filteredLogs = (profile.logs || []).filter(log => log.childId === selectedChildId);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-[#3D5A42] font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform">← Back to Hub</button>
        <div className="bg-[#7D9D85]/10 text-[#3D5A42] px-5 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-widest border border-[#7D9D85]/20">Growth Tracker</div>
      </div>

      <header className="text-center space-y-3">
        <h2 className="text-4xl font-bold text-slate-800 font-display">Family Growth Timeline</h2>
        <p className="text-slate-500">Documenting small wins and meaningful milestones.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Log Input */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6 sticky top-28">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">Log a Moment</h3>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Child</label>
              <select 
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#7D9D85]"
              >
                {profile.children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Entry Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['win', 'challenge', 'note'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setLogType(type)}
                    className={`py-2 rounded-lg text-[10px] font-bold capitalize border transition-all ${
                      logType === type ? 'bg-[#3D5A42] border-[#3D5A42] text-white' : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mood</label>
              <div className="flex justify-between px-1">
                {moods.map(m => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`text-xl p-1 rounded-full transition-all ${mood === m ? 'bg-slate-100 scale-110' : 'grayscale opacity-40'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Details</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-28 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#7D9D85] text-sm"
                placeholder="What happened today?"
              />
            </div>

            <button
              onClick={handleAddLog}
              disabled={!content.trim()}
              className="w-full bg-[#3D5A42] text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md disabled:opacity-40"
            >
              Add Entry
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end border-b border-slate-100 pb-2">
            <h3 className="text-xl font-bold text-slate-800">History for {profile.children.find(c => c.id === selectedChildId)?.name}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{filteredLogs.length} Records</span>
          </div>

          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="bg-white p-16 rounded-[2rem] border-2 border-dashed border-slate-100 text-center space-y-3">
                <div className="text-4xl">📝</div>
                <p className="text-slate-400 text-sm font-medium">No records found. Start your journey by logging a moment.</p>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 flex gap-5 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-14">
                    <span className="text-2xl mb-1">{log.mood}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                      log.type === 'win' ? 'bg-yellow-50 text-yellow-700' : 
                      log.type === 'challenge' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {log.type}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 text-sm leading-relaxed mb-2">{log.content}</p>
                    <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
                      {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;