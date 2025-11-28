import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ArtifactPanel from './components/ArtifactPanel';
import SettingsModal from './components/SettingsModal';
import { User, ChatSession, Artifact } from './types';

// Mock User Data
const mockUser: User = {
  name: "Keamogetswe",
  email: "michaelkeamo@gmail.com",
  avatarUrl: "",
  plan: "Free"
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const [resetChatTrigger, setResetChatTrigger] = useState(0);
  const [recentChats, setRecentChats] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('nexa_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);

  // Split Pane State
  const [chatWidth, setChatWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('nexa_chats', JSON.stringify(recentChats));
  }, [recentChats]);

  const startNewChat = () => {
    setResetChatTrigger(prev => prev + 1);
    setIsArtifactOpen(false);
    setCurrentArtifact(null);
    setCurrentChatId(null);
    setInitialMessages([]);
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const handleChatStart = (title: string, messages: any[]) => {
    if (currentChatId) {
      // Update existing chat
      setRecentChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages, updatedAt: Date.now() }
          : chat
      ));
    } else {
      // Create new chat
      const newChat: ChatSession = {
        id: Date.now().toString(),
        title: title,
        messages: messages,
        updatedAt: Date.now()
      };
      setRecentChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
    }
  };

  const loadChat = (chatId: string) => {
    const chat = recentChats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chat.id);
      setInitialMessages(chat.messages);
      setResetChatTrigger(prev => prev + 1);
      if (!isSidebarOpen) setIsSidebarOpen(true);
    }
  };

  const handleArtifactOpen = (artifact: Artifact) => {
    if (!isArtifactOpen) {
      setIsSidebarOpen(false); // Close sidebar on artifact open
      setIsArtifactOpen(true);
      setChatWidth(50); // Reset split to 50/50
    }
    setCurrentArtifact(artifact);
  };

  const handleArtifactClose = () => {
    setIsArtifactOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Resize Handlers
  const startResizing = () => {
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      // Calculate width of chat relative to the container (excluding sidebar if it's external, but here sidebar is sibling)
      // Actually, we are resizing the middle chat pane relative to the remaining space.

      // Let's assume the container is the flex parent of Chat and Artifact.
      // We need to calculate mouse X relative to that container.
      const rect = containerRef.current.getBoundingClientRect();
      const newChatWidth = ((e.clientX - rect.left) / containerWidth) * 100;

      // Clamp values
      if (newChatWidth > 20 && newChatWidth < 80) {
        setChatWidth(newChatWidth);
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div className="flex h-screen w-screen bg-claude-bg text-claude-text font-sans overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={mockUser}
        startNewChat={startNewChat}
        recentChats={recentChats}
        startNewChat={startNewChat}
        recentChats={recentChats}
        onLoadChat={loadChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area (Chat + [Resizer + Artifact]) */}
      <div
        ref={containerRef}
        className="flex-1 relative flex min-w-0 transition-all duration-300"
      >
        {/* Chat Interface - Flexible Width */}
        <div
          className="h-full relative"
          style={{
            width: isArtifactOpen ? `${chatWidth}%` : '100%',
            flexShrink: 0
          }}
        >
          <ChatInterface
            key={resetChatTrigger}
            user={mockUser}
            onChatStart={handleChatStart}
            onArtifactOpen={handleArtifactOpen}
            isArtifactOpen={isArtifactOpen}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            initialMessages={initialMessages}
          />
        </div>

        {/* Resize Handle and Artifact Panel */}
        {isArtifactOpen && (
          <>
            <div
              className="w-1 cursor-col-resize hover:bg-claude-accent/50 bg-transparent z-50 transition-colors"
              onMouseDown={startResizing}
            />
            <div
              className="flex-1 min-w-0"
              style={{ width: `${100 - chatWidth}%` }}
            >
              <ArtifactPanel
                isOpen={isArtifactOpen}
                artifact={currentArtifact}
                onClose={handleArtifactClose}
              />
            </div>
          </>
        )}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={mockUser}
      />
    </div>
  );
};

export default App;