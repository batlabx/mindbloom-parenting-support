
import React, { useState, useEffect } from 'react';
import { UserProfile, View, SyncStatus } from './types';
import Onboarding from './components/Onboarding';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AdviceActivities from './components/AdviceActivities';
import CoachAIView from './components/CoachAIView';
import SelfCareHub from './components/SelfCareHub';
import FavoritesView from './components/FavoritesView';
import RightNowView from './components/RightNowView';
import { trackEvent } from './services/analytics';
import { syncProfileToCloud } from './services/backend';

const STORAGE_KEY = 'mindbloom_profile_v4';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setProfile(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));

    setSyncStatus('syncing');
    const success = await syncProfileToCloud(newProfile);
    setSyncStatus(success ? 'synced' : 'error');
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#FDFBF7] font-display text-4xl font-black text-[#7D9D85] animate-pulse">MindBloom...🌻</div>;

  if (!profile || !profile.onboarded) {
    return <Onboarding onComplete={handleUpdateProfile} />;
  }

  const renderView = () => {
    trackEvent('view_change', { view: currentView });
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard profile={profile} setView={setCurrentView} />;
      case View.ADVICE_ACTIVITIES:
        return <AdviceActivities profile={profile} onUpdateProfile={handleUpdateProfile} onBack={() => setCurrentView(View.DASHBOARD)} />;
      case View.COACH_AI:
        return <CoachAIView profile={profile} onUpdateProfile={handleUpdateProfile} onBack={() => setCurrentView(View.DASHBOARD)} />;
      case View.SELF_CARE:
        return <SelfCareHub profile={profile} onUpdateProfile={handleUpdateProfile} onBack={() => setCurrentView(View.DASHBOARD)} />;
      case View.FAVORITES:
        return <FavoritesView profile={profile} onUpdateProfile={handleUpdateProfile} onBack={() => setCurrentView(View.DASHBOARD)} />;
      case View.RIGHT_NOW:
        return <RightNowView profile={profile} onUpdateProfile={handleUpdateProfile} onBack={() => setCurrentView(View.DASHBOARD)} />;
      default:
        return <Dashboard profile={profile} setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView} syncStatus={syncStatus}>
      {renderView()}
    </Layout>
  );
};

export default App;
