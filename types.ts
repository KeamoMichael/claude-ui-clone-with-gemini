export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export enum GeminiModel {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
}

export interface RecentItem {
  id: string;
  title: string;
  timeAgo: string;
  icon?: string; // Just a placeholder for icon type logic
}

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  plan: 'Free' | 'Pro' | 'Team';
}

export interface Artifact {
  id: string;
  title: string;
  type: 'code' | 'text' | 'image';
  language?: string;
  content: string;
}