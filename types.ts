export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  displayUrl: string;
}

export interface FetchedUrl {
  url: string;
  title: string;
  content: string;
  timestamp: number;
}

export enum SearchStatus {
  IDLE = 'idle',
  SEARCHING = 'searching',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  searchResults?: SearchResult[];
  searchStatus?: SearchStatus;
  fetchedUrls?: FetchedUrl[];
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