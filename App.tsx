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
import AuthScreen from './components/AuthScreen';
import { trackEvent } from './services/analytics';
import { syncProfileToCloud } from './services/backend';
import { AuthUser, getCurrentUser, signOut } from './services/auth';

const profileStorageKey = (email: string) => `mindbloom_profile_v5_${email.toLowerCase()}`;

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  useEffect(() => {
    const existingUser = getCurrentUser();
    setUser(existingUser);

    if (existingUser) {
      const saved = localStorage.getItem(profileStorageKey(existingUser.email));
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    }

    setIsLoading(false);
  }, []);

  const handleAuthenticated = (authUser: AuthUser) => {
    setUser(authUser);
    const saved = localStorage.getItem(profileStorageKey(authUser.email));
    setProfile(saved ? JSON.parse(saved) : null);
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
    setProfile(null);
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    if (!user) return;

    const normalizedProfile: UserProfile = {
      ...newProfile,
      email: user.email,
      username: user.username,
      name: newProfile.name || user.username,
    };

    setProfile(normalizedProfile);
    localStorage.setItem(profileStorageKey(user.email), JSON.stringify(normalizedProfile));

    setSyncStatus('syncing');
    const success = await syncProfileToCloud(normalizedProfile);
    setSyncStatus(success ? 'synced' : 'error');
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-[#FDFBF7] font-display text-4xl font-black text-[#7D9D85] animate-pulse">MindBloom...🌻</div>;
  }

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  if (!profile || !profile.onboarded) {
    return (
      <Onboarding
        onComplete={handleUpdateProfile}
        initialName={user.username}
        email={user.email}
        username={user.username}
      />
    );
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
    <>
      <button
        onClick={handleSignOut}
        className="fixed top-3 right-3 z-[60] bg-white border border-[#EEF5F4] rounded-full px-3 py-1 text-xs font-bold text-[#4E8B83]"
      >
        Sign out
      </button>
      <Layout currentView={currentView} setView={setCurrentView} syncStatus={syncStatus}>
        {renderView()}
      </Layout>
    </>
  );
};

export default App;
