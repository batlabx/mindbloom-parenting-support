
export interface Child {
  id: string;
  name: string;
  age: number;
  challenges: string[];
  interests: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DailyLog {
  id: string;
  date: string;
  childId: string;
  type: 'win' | 'challenge' | 'note';
  content: string;
  mood: string;
}

export interface FavoriteItem {
  id: string;
  type: 'advice' | 'script' | 'activity' | 'self_care' | 'right_now';
  title: string;
  content: string;
  childContext?: string;
  dateSaved: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

export interface UserProfile {
  name: string;
  children: Child[];
  onboarded: boolean;
  favorites: FavoriteItem[];
  chatHistory: ChatMessage[];
  logs: DailyLog[];
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  ADVICE_ACTIVITIES = 'ADVICE_ACTIVITIES',
  COACH_AI = 'COACH_AI',
  SELF_CARE = 'SELF_CARE',
  FAVORITES = 'FAVORITES',
  RIGHT_NOW = 'RIGHT_NOW'
}

export interface DailyTip {
  title: string;
  content: string;
  activity: string;
  script?: string;
  details?: string;
  glossary?: { term: string; definition: string }[];
}

export interface RightNowAdvice {
  step1: string;
  summary1: string;
  detail1: string;
  step2: string;
  summary2: string;
  detail2: string;
  step3: string;
  summary3: string;
  detail3: string;
  glossary?: { term: string; definition: string }[];
}

export type SelfCareCategory = 'Calm Down Tools' | 'Grounding' | 'Affirmations';
