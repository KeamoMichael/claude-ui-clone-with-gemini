import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  ChevronDown,
  SlidersHorizontal,
  Plus,
  Globe,
  PenTool,
  Timer,
  Settings,
  History,
  Check,
  ChevronRight,
  ArrowLeft,
  Share,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Star,
  Pencil,
  Trash2,
  FolderPlus,
  Code,
  ExternalLink,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GeminiModel, Message, Artifact, SearchResult, SearchStatus, FetchedUrl } from '../types';
import { streamMessage, streamMessageWithSearch } from '../services/geminiService';
import { performWebSearch, fetchUrlContent, shouldPerformWebSearch } from '../services/searchService';

interface ChatInterfaceProps {
  user: { name: string };
  onChatStart: (title: string) => void;
  onArtifactOpen: (artifact: Artifact) => void;
  isArtifactOpen: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

// Spark/Star Icon for the Greeting and Model Message
const SparkIcon = ({ className, isAnimating }: { className?: string; isAnimating?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {isAnimating && (
      <style>
        {`
          @keyframes crayon-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          .spark-arm-1 { animation: crayon-pulse 1.2s infinite ease-in-out 0s; }
          .spark-arm-2 { animation: crayon-pulse 1.2s infinite ease-in-out 0.15s; }
          .spark-arm-3 { animation: crayon-pulse 1.2s infinite ease-in-out 0.3s; }
          .spark-arm-4 { animation: crayon-pulse 1.2s infinite ease-in-out 0.45s; }
        `}
      </style>
    )}
    <g fill="currentColor">
      <rect x="10.75" y="3" width="2.5" height="18" rx="1.25" className={isAnimating ? "spark-arm-1" : ""} />
      <rect x="10.75" y="3" width="2.5" height="18" rx="1.25" transform="rotate(45 12 12)" className={isAnimating ? "spark-arm-2" : ""} />
      <rect x="10.75" y="3" width="2.5" height="18" rx="1.25" transform="rotate(90 12 12)" className={isAnimating ? "spark-arm-3" : ""} />
      <rect x="10.75" y="3" width="2.5" height="18" rx="1.25" transform="rotate(135 12 12)" className={isAnimating ? "spark-arm-4" : ""} />
    </g>
  </svg>
);

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

// Tooltip Component
const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="group relative flex items-center">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1F1F1F] text-white text-[12px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60] shadow-sm">
        {content}
      </div>
    </div>
  );
};

// Component to render code blocks as Artifact Cards
const CodeBlockRenderer = ({ inline, className, children, onArtifactFound }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  // If it's a block of code (not inline), we want to treat it as a potential artifact
  if (!inline && language) {
    useEffect(() => {
      if (code.length > 20) {
        onArtifactFound({
          id: Date.now().toString(),
          title: `Generated ${language} code`,
          type: 'code',
          language: language,
          content: code
        });
      }
    }, [code.length]);

    // Render the "Preview Card"
    return (
      <div className="my-3 border border-[#E5E2DA] rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <div className="px-4 py-3 bg-[#FAFAF8] border-b border-[#E5E2DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
              <Code size={16} className="text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">Generated Code</div>
              <div className="text-xs text-gray-500 capitalize">{language}</div>
            </div>
          </div>
          <div className="text-xs font-medium text-claude-accent opacity-0 group-hover:opacity-100 transition-opacity">
            View Code
          </div>
        </div>
        <div className="p-3 bg-white">
          <div className="text-xs text-gray-500 font-mono line-clamp-3 leading-relaxed opacity-70">
            {code}
          </div>
        </div>
      </div>
    );
  }

  return !inline && match ? (
    <div className="my-2 rounded-md bg-gray-100 p-2 font-mono text-xs overflow-x-auto">
      <code>{children}</code>
    </div>
  ) : (
    <code className={`${className} bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-[#E45649]`}>
      {children}
    </code>
  );
};

// Search Status Indicator Component
const SearchStatusIndicator: React.FC<{ status: string }> = ({ status }) => (
  <div className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E5E2DA] rounded-xl mb-3 animate-in fade-in duration-300">
    <Globe size={16} className="text-gray-500" />
    <span className="text-sm text-gray-600">{status}</span>
    <Loader2 size={14} className="text-gray-400 animate-spin ml-auto" />
  </div>
);

// Search Results Card Component
interface SearchResultsCardProps {
  results: SearchResult[];
  onFetchUrl: (url: string) => void;
}

const SearchResultsCard: React.FC<SearchResultsCardProps> = ({ results, onFetchUrl }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (results.length === 0) return null;

  return (
    <div className="mb-3 border border-[#E5E2DA] rounded-xl bg-white overflow-hidden shadow-sm animate-in fade-in duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-[#FAFAF8] border-b border-[#E5E2DA] flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="p-3 space-y-2">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => onFetchUrl(result.url)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#0F62FE] transition-colors line-clamp-1">
                  {result.title}
                </h4>
                <ExternalLink size={12} className="text-gray-400 shrink-0 mt-0.5" />
              </div>
              <p className="text-xs text-gray-500 mb-1">{result.displayUrl}</p>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{result.snippet}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Fetched Content Card Component
interface FetchedContentCardProps {
  fetchedUrls: FetchedUrl[];
}

const FetchedContentCard: React.FC<FetchedContentCardProps> = ({ fetchedUrls }) => {
  if (fetchedUrls.length === 0) return null;

  return (
    <div className="mb-3 space-y-2">
      {fetchedUrls.map((fetched, index) => (
        <div
          key={index}
          className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E2DA] rounded-xl animate-in fade-in duration-300"
        >
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center border border-green-200 shrink-0">
            <Check size={16} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              Fetched {fetched.title}
            </div>
            <a
              href={fetched.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-[#0F62FE] transition-colors flex items-center gap-1 mt-0.5"
            >
              {new URL(fetched.url).hostname}
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onChatStart, onArtifactOpen, isArtifactOpen, isSidebarOpen, toggleSidebar }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatTitle, setChatTitle] = useState<string>('New Chat');

  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.PRO);

  const [streamingContent, setStreamingContent] = useState('');

  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [toolsMenuView, setToolsMenuView] = useState<'main' | 'styles'>('main');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showTitleMenu, setShowTitleMenu] = useState(false);

  const [useWebSearch, setUseWebSearch] = useState(true);
  const [useExtendedThinking, setUseExtendedThinking] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState('Normal');
  const styles = ['Normal', 'Learning', 'Concise', 'Explanatory', 'Formal'];

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const titleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isTyping]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setShowToolsMenu(false);
        setToolsMenuView('main');
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
      if (titleMenuRef.current && !titleMenuRef.current.contains(event.target as Node)) {
        setShowTitleMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    if (messages.length === 0) {
      const newTitle = input.split(' ').slice(0, 5).join(' ') + (input.split(' ').length > 5 ? '...' : '');
      setChatTitle(newTitle);
      onChatStart(newTitle);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setStreamingContent('');
    setShowToolsMenu(false);
    setShowModelMenu(false);
    setShowTitleMenu(false);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      // Check if web search should be performed
      const shouldSearch = useWebSearch && shouldPerformWebSearch(userMessage.content);

      let searchResults: SearchResult[] = [];
      let fetchedUrls: FetchedUrl[] = [];

      if (shouldSearch) {
        // Create a placeholder message with search status
        const searchingMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: '',
          timestamp: Date.now(),
          searchStatus: SearchStatus.SEARCHING,
          searchResults: [],
          fetchedUrls: []
        };
        setMessages(prev => [...prev, searchingMessage]);

        // Perform web search
        searchResults = await performWebSearch(userMessage.content);

        // Update message with search results
        setMessages(prev => prev.map(msg =>
          msg.id === searchingMessage.id
            ? { ...msg, searchStatus: SearchStatus.COMPLETED, searchResults }
            : msg
        ));

        // Auto-fetch top 2 results
        if (searchResults.length > 0) {
          const urlsToFetch = searchResults.slice(0, 2);
          for (const result of urlsToFetch) {
            try {
              const fetched = await fetchUrlContent(result.url);
              fetchedUrls.push({
                url: result.url,
                title: fetched.title,
                content: fetched.content,
                timestamp: Date.now()
              });

              // Update message with fetched URLs
              setMessages(prev => prev.map(msg =>
                msg.id === searchingMessage.id
                  ? { ...msg, fetchedUrls: [...(msg.fetchedUrls || []), fetchedUrls[fetchedUrls.length - 1]] }
                  : msg
              ));
            } catch (error) {
              console.error('Failed to fetch URL:', result.url, error);
            }
          }
        }
      }

      // Stream AI response
      let streamResult;
      if (shouldSearch && (searchResults.length > 0 || fetchedUrls.length > 0)) {
        streamResult = await streamMessageWithSearch(
          selectedModel,
          userMessage.content,
          searchResults,
          fetchedUrls,
          history
        );
      } else {
        streamResult = await streamMessage(selectedModel, userMessage.content, history);
      }

      let fullResponse = "";

      for await (const chunk of streamResult) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          setStreamingContent(prev => prev + text);
        }
      }

      const modelMessage: Message = {
        id: shouldSearch ? (Date.now() + 2).toString() : (Date.now() + 1).toString(),
        role: 'model',
        content: fullResponse,
        timestamp: Date.now()
      };

      setMessages(prev => {
        // If we performed search, replace the search message with the final response
        if (shouldSearch) {
          const searchMsgIndex = prev.findIndex(m => m.searchStatus === SearchStatus.COMPLETED);
          if (searchMsgIndex !== -1) {
            const searchMsg = prev[searchMsgIndex];
            return [
              ...prev.slice(0, searchMsgIndex),
              { ...modelMessage, searchResults: searchMsg.searchResults, fetchedUrls: searchMsg.fetchedUrls },
              ...prev.slice(searchMsgIndex + 1)
            ];
          }
        }
        return [...prev, modelMessage];
      });
      setStreamingContent('');
    } catch (error) {
      console.error("Failed to send message", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm sorry, I encountered an error connecting to Gemini.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFetchUrl = async (url: string, messageId: string) => {
    try {
      const fetched = await fetchUrlContent(url);
      const newFetchedUrl: FetchedUrl = {
        url,
        title: fetched.title,
        content: fetched.content,
        timestamp: Date.now()
      };

      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, fetchedUrls: [...(msg.fetchedUrls || []), newFetchedUrl] }
          : msg
      ));
    } catch (error) {
      console.error('Failed to fetch URL:', url, error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;
  const menuPositionClass = hasMessages ? "bottom-full mb-2" : "top-full mt-2";

  const getModelName = (model: GeminiModel) => {
    if (model === GeminiModel.PRO) return "Nexa 2.0 Pro";
    if (model === GeminiModel.FLASH) return "Nexa 1.5 Fast";
    return "Model";
  }

  const inputUI = (
    <div className={`relative w-full ${isArtifactOpen ? 'max-w-2xl px-0' : 'max-w-3xl'} mx-auto z-20 transition-all duration-500`}>
      <div className="bg-white rounded-2xl border border-[#E5E2DA] shadow-sm focus-within:ring-1 focus-within:ring-black/5 focus-within:border-gray-300 transition-all">
        <div className="p-3 pb-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can I help you today?"
            className="w-full max-h-60 bg-transparent border-none outline-none resize-none text-claude-text text-[15px] placeholder:text-gray-400 font-sans min-h-[48px] py-1"
            rows={1}
          />

          <div className="flex items-center justify-between mt-2 select-none">
            <div className="flex items-center gap-1">
              <Tooltip content="Attach artifacts">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </Tooltip>

              <div className="relative">
                <Tooltip content="Search and tools">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowToolsMenu(!showToolsMenu);
                      setToolsMenuView('main');
                    }}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors ${showToolsMenu ? 'bg-gray-100 text-gray-800' : ''}`}
                  >
                    <SlidersHorizontal size={16} />
                  </button>
                </Tooltip>

                {showToolsMenu && (
                  <div
                    ref={toolsMenuRef}
                    className={`absolute left-0 w-[280px] bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-100 origin-top-left ${menuPositionClass}`}
                  >
                    {toolsMenuView === 'main' ? (
                      <>
                        <button
                          onClick={() => setToolsMenuView('styles')}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <PenTool size={16} className="text-gray-500 group-hover:text-gray-700" />
                            <span>Use style</span>
                          </div>
                          <ChevronDown size={14} className="text-gray-400 -rotate-90" />
                        </button>

                        <div className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-[13px] text-gray-700 transition-colors group" onClick={() => setUseExtendedThinking(!useExtendedThinking)}>
                          <div className="flex items-center gap-3">
                            <Timer size={16} className="text-gray-500 group-hover:text-gray-700" />
                            <div>
                              <div className="leading-none font-medium text-gray-700">Extended thinking</div>
                              {useExtendedThinking && <div className="text-[10px] text-gray-400 mt-0.5 font-normal">3 remaining until Dec 5</div>}
                            </div>
                          </div>
                          <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${useExtendedThinking ? 'bg-claude-accent' : 'bg-gray-200'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${useExtendedThinking ? 'left-[18px]' : 'left-0.5'}`} />
                          </div>
                        </div>

                        <div className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-[13px] text-gray-700 transition-colors group" onClick={() => setUseWebSearch(!useWebSearch)}>
                          <div className="flex items-center gap-3">
                            <Globe size={16} className="text-gray-500 group-hover:text-gray-700" />
                            <span className="font-medium text-gray-700">Web search</span>
                          </div>
                          <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${useWebSearch ? 'bg-[#0F62FE]' : 'bg-gray-200'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${useWebSearch ? 'left-[18px]' : 'left-0.5'}`} />
                          </div>
                        </div>

                        <div className="h-px bg-gray-100 my-1 mx-3" />

                        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors group">
                          <Plus size={16} className="text-gray-500 group-hover:text-gray-700" />
                          <span>Add connectors</span>
                          <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium border border-blue-100 ml-auto">PRO</span>
                        </button>

                        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors group">
                          <Settings size={16} className="text-gray-500 group-hover:text-gray-700" />
                          <span>Manage connectors</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-1 py-1">
                          <button
                            onClick={() => setToolsMenuView('main')}
                            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg text-[13px] font-medium text-gray-600 transition-colors bg-gray-50 mb-1"
                          >
                            <ArrowLeft size={14} className="text-gray-500" />
                            <span>Use style</span>
                          </button>
                        </div>

                        {styles.map(style => (
                          <button
                            key={style}
                            onClick={() => setSelectedStyle(style)}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <PenTool size={16} className="text-gray-500 group-hover:text-gray-700" />
                              <span>{style}</span>
                            </div>
                            {selectedStyle === style && (
                              <Check size={14} className="text-[#3B82F6]" strokeWidth={2.5} />
                            )}
                          </button>
                        ))}

                        <div className="h-px bg-gray-100 my-1 mx-3" />

                        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors group">
                          <Plus size={16} className="text-gray-500 group-hover:text-gray-700" />
                          <span>Create & edit styles</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Tooltip content="Recent chats">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <History size={16} />
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Tooltip content="Select model">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowModelMenu(!showModelMenu); }}
                    className={`text-xs text-gray-500 font-medium flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors ${showModelMenu ? 'bg-gray-100 text-gray-800' : ''}`}
                  >
                    <span>{getModelName(selectedModel)}</span>
                    <ChevronDown size={12} strokeWidth={2.5} className="text-gray-400" />
                  </button>
                </Tooltip>

                {showModelMenu && (
                  <div
                    ref={modelMenuRef}
                    className={`absolute right-0 w-[300px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-100 origin-top-right ${menuPositionClass}`}
                  >
                    <button
                      onClick={() => { setSelectedModel(GeminiModel.PRO); setShowModelMenu(false); }}
                      className={`w-full flex flex-col items-start px-4 py-3 hover:bg-gray-50 text-left transition-colors relative ${selectedModel === GeminiModel.PRO ? 'bg-[#F5F4F0]' : ''}`}
                    >
                      <div className="w-full flex items-center justify-between mb-0.5">
                        <span className="text-[13px] font-medium text-gray-900">Nexa 2.0 Pro</span>
                        {selectedModel === GeminiModel.PRO && <Check size={14} className="text-[#3B82F6]" strokeWidth={3} />}
                      </div>
                      <span className="text-[12px] text-gray-500">Advanced reasoning and analysis</span>
                    </button>

                    <button
                      onClick={() => { setSelectedModel(GeminiModel.FLASH); setShowModelMenu(false); }}
                      className={`w-full flex flex-col items-start px-4 py-3 hover:bg-gray-50 text-left transition-colors relative ${selectedModel === GeminiModel.FLASH ? 'bg-[#F5F4F0]' : ''}`}
                    >
                      <div className="w-full flex items-center justify-between mb-0.5">
                        <span className="text-[13px] font-medium text-gray-900">Nexa 1.5 Fast</span>
                        {selectedModel === GeminiModel.FLASH && <Check size={14} className="text-[#3B82F6]" strokeWidth={3} />}
                      </div>
                      <span className="text-[12px] text-gray-500">Lightning-fast responses</span>
                    </button>
                  </div>
                )}
              </div>

              <Tooltip content="Send message">
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${input.trim() && !isTyping
                    ? 'bg-claude-accent text-white hover:bg-[#333333]'
                    : 'bg-[#EAE8E3] text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <ArrowUp size={16} strokeWidth={3} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full relative bg-claude-bg overflow-hidden transition-all duration-500">

      {/* Sticky Header for Active Chat */}
      {hasMessages && (
        <div className={`h-14 flex items-center justify-between px-4 border-b border-transparent z-30 bg-claude-bg/95 backdrop-blur-sm sticky top-0 transition-all pl-4`}>
          <div className="relative">
            <button
              onClick={() => setShowTitleMenu(!showTitleMenu)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-200/50 transition-colors text-claude-text font-medium text-sm ${showTitleMenu ? 'bg-gray-200/50' : ''}`}
            >
              <span className="max-w-[200px] truncate">{chatTitle}</span>
              <ChevronDown size={14} className="text-gray-400 shrink-0" />
            </button>

            {/* Title Dropdown Menu */}
            {showTitleMenu && (
              <div
                ref={titleMenuRef}
                className="absolute top-full left-0 mt-1 w-[200px] bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
              >
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors">
                  <Star size={16} className="text-gray-500" />
                  <span>Star</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors">
                  <Pencil size={16} className="text-gray-500" />
                  <span>Rename</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors">
                  <FolderPlus size={16} className="text-gray-500" />
                  <span>Add to project</span>
                </button>

                <div className="h-px bg-gray-100 my-1 mx-3" />

                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-[#B94A48] transition-colors">
                  <Trash2 size={16} className="text-[#B94A48]" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DA] hover:bg-gray-50 text-xs font-medium text-gray-600 transition-colors">
            Share
          </button>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {hasMessages && (
          <div className={`mx-auto w-full px-4 md:px-0 pb-48 pt-6 transition-all duration-300 ${isArtifactOpen ? 'max-w-2xl' : 'max-w-3xl'}`}>
            <div className="space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-4">
                  {msg.role === 'user' && (
                    <>
                      <div className="w-8 h-8 rounded-full bg-[#333333] flex items-center justify-center text-white shrink-0 text-xs font-medium mt-1">
                        {user.name.charAt(0)}
                      </div>
                      <div className="bg-[#F0EFEA] text-claude-text px-4 py-2.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed">
                        <ReactMarkdown className="prose prose-stone prose-sm max-w-none text-claude-text">
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </>
                  )}

                  {msg.role === 'model' && (
                    <div className="flex flex-col gap-2 w-full max-w-full">
                      {/* Search Status Indicator */}
                      {msg.searchStatus === SearchStatus.SEARCHING && (
                        <SearchStatusIndicator status="Searching the web" />
                      )}

                      {/* Search Results */}
                      {msg.searchResults && msg.searchResults.length > 0 && (
                        <SearchResultsCard
                          results={msg.searchResults}
                          onFetchUrl={(url) => handleFetchUrl(url, msg.id)}
                        />
                      )}

                      {/* Fetched URLs */}
                      {msg.fetchedUrls && msg.fetchedUrls.length > 0 && (
                        <FetchedContentCard fetchedUrls={msg.fetchedUrls} />
                      )}

                      {/* Message Content */}
                      {msg.content && (
                        <div className="text-claude-text text-[15px] leading-relaxed pl-1">
                          <ReactMarkdown
                            className="prose prose-stone prose-sm max-w-none text-claude-text"
                            components={{
                              code: (props) => (
                                <CodeBlockRenderer {...props} onArtifactFound={onArtifactOpen} />
                              )
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {msg.content && (
                        <div className="flex items-center gap-4 mt-1 pl-1 select-none">
                          <SparkIcon className="w-5 h-5 text-claude-accent" />
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><Copy size={14} /></button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><RotateCcw size={14} /></button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><ThumbsUp size={14} /></button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><ThumbsDown size={14} /></button>
                          </div>
                          <span className="text-[11px] text-[#999999] ml-auto">Nexa can make mistakes. Please double-check responses.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {(streamingContent || isTyping) && (
                <div className="flex gap-4 fade-in">
                  <div className="flex flex-col gap-2 w-full max-w-full">
                    {streamingContent && (
                      <div className="text-claude-text text-[15px] leading-relaxed pl-1">
                        <ReactMarkdown
                          className="prose prose-stone prose-sm max-w-none text-claude-text"
                          components={{
                            code: (props) => (
                              <CodeBlockRenderer {...props} onArtifactFound={onArtifactOpen} />
                            )
                          }}
                        >
                          {streamingContent}
                        </ReactMarkdown>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-1 pl-1 select-none">
                      <SparkIcon className="w-5 h-5 text-claude-accent" isAnimating={true} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {!hasMessages && (
          <div className="min-h-full flex flex-col items-center pt-64 px-4 pb-20">
            <div className="mb-12">
              <div className="bg-[#E2E2E2] px-3 py-1.5 rounded-md text-[11px] font-medium text-gray-500 border border-transparent">
                Free plan · <span className="underline decoration-gray-400/50 cursor-pointer">Upgrade</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-8 fade-in">
              <SparkIcon className="w-8 h-8 text-claude-accent" />
              <h1 className="font-serif text-[32px] text-[#2D2D2D] tracking-tight">
                Good afternoon, {user.name}
              </h1>
            </div>

            {inputUI}
          </div>
        )}
      </div>

      {hasMessages && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-claude-bg via-claude-bg to-transparent pt-10">
          <div className={`mx-auto w-full ${isArtifactOpen ? 'max-w-2xl' : 'max-w-3xl'} transition-all duration-300`}>
            {inputUI}
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatInterface;