
import React from 'react';
import { UserProfile, View, FavoriteItem } from '../types';
import { trackEvent } from '../services/analytics';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
}

const FavoritesView: React.FC<Props> = ({ profile, onUpdateProfile, onBack }) => {
  const removeFavorite = (id: string) => {
    const updated = profile.favorites.filter(f => f.id !== id);
    onUpdateProfile({ ...profile, favorites: updated });
    trackEvent('favorite_removed');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-emerald-700 font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform">← Back to Hub</button>
        <h2 className="text-4xl font-bold text-emerald-900 font-display text-center flex-1">My Favorites</h2>
      </div>

      {profile.favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-stone-100 space-y-4">
          <span className="text-6xl">⭐</span>
          <p className="text-stone-400 font-display text-xl">You haven't saved any favorites yet.</p>
          <button onClick={onBack} className="text-emerald-600 font-bold underline">Go find some advice!</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.favorites.map((fav) => (
            <div key={fav.id} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-4 relative group">
              <div className="flex justify-between items-start">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  fav.type === 'activity' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'
                }`}>
                  {fav.type}
                </span>
                <button 
                  onClick={() => removeFavorite(fav.id)}
                  className="text-stone-300 hover:text-red-500 transition-colors"
                >✕</button>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 leading-tight">{fav.title}</h3>
              {fav.childContext && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">For: {fav.childContext}</p>}
              
              <div className="bg-stone-50 p-6 rounded-2xl italic text-slate-600 text-sm leading-relaxed">
                "{fav.content}"
              </div>
              
              <p className="text-[9px] text-stone-300 font-bold uppercase">Saved on {new Date(fav.dateSaved).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
