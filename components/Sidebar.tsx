import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  LayoutGrid,
  Library,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Globe,
  HelpCircle,
  ArrowUpCircle,
  Download,
  Info,
  LogOut,
  ChevronUp
} from 'lucide-react';
import { User, ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  startNewChat: () => void;
  user: User;
  recentChats: ChatSession[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, startNewChat, user, recentChats }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className={`
        relative h-screen bg-claude-sidebar border-r border-claude-border shrink-0
        transition-[width] duration-500 ease-[cubic-bezier(0.2,0,0,1)]
        ${isOpen ? 'w-[280px]' : 'w-14'} 
      `}
    >
      {/* Inner container */}
      <div className={`h-full flex flex-col overflow-hidden ${isOpen ? 'w-[280px]' : 'w-14'}`}>
        
        {/* Header / Toggle */}
        <div className={`h-14 flex items-center shrink-0 relative ${isOpen ? 'px-3.5 justify-between' : 'justify-center'}`}>
            {isOpen && (
              <div 
                className={`
                  font-serif text-lg font-semibold text-claude-text select-none
                  transition-opacity duration-300 delay-100 opacity-100
                `}
              >
                Claude
              </div>
            )}
            
            <button 
              onClick={toggleSidebar}
              className={`
                z-20 p-1 hover:bg-[#E4E2DD] rounded-md text-gray-500 transition-colors
                ${isOpen ? '' : 'mt-4'}
              `}
            >
              {isOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={20} />}
            </button>
        </div>

        {/* Navigation & Content - Only visible when open */}
        {isOpen && (
          <>
            {/* Primary Navigation */}
            <div className="px-3 space-y-1 mt-1 fade-in">
              <button 
                onClick={startNewChat}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#E4E2DD] transition-colors text-claude-text group"
              >
                <div className="bg-claude-accent text-white rounded-full p-0.5 shrink-0">
                  <Plus size={14} strokeWidth={3} />
                </div>
                <span className="font-medium whitespace-nowrap opacity-100">
                  New chat
                </span>
              </button>

              <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-[#E4E2DD] transition-colors group text-claude-text">
                <MessageSquare size={18} className="text-gray-500 shrink-0" />
                <span className="whitespace-nowrap opacity-100">
                  Chats
                </span>
              </button>

              <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-[#E4E2DD] transition-colors group text-claude-text">
                <Library size={18} className="text-gray-500 shrink-0" />
                <span className="whitespace-nowrap opacity-100">
                  Projects
                </span>
              </button>

              <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-[#E4E2DD] transition-colors group text-claude-text">
                <LayoutGrid size={18} className="text-gray-500 shrink-0" />
                <span className="whitespace-nowrap opacity-100">
                  Artifacts
                </span>
              </button>
            </div>

            {/* Recents List */}
            <div className="flex-1 overflow-y-auto mt-6 px-3 opacity-100 fade-in">
              <h3 className="text-xs font-medium text-gray-400 px-3 mb-2">Recents</h3>
              {recentChats.length === 0 ? (
                <div className="px-3 text-[13px] text-gray-400 italic">No recent chats</div>
              ) : (
                <ul className="space-y-0.5">
                    {recentChats.map(item => (
                      <li key={item.id}>
                        <button className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#E4E2DD] truncate transition-colors">
                          <span className="truncate block opacity-90 text-[13px]">{item.title}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* User Footer with Popup Menu */}
            <div className="p-3 mt-auto relative fade-in" ref={profileRef}>
              {showProfileMenu && (
                <div className="absolute bottom-full left-3 w-[260px] mb-2 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#E5E2DA] z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-3 border-b border-gray-100">
                    <div className="text-[13px] font-medium text-gray-700 truncate">{user.email}</div>
                  </div>
                  
                  <div className="py-1.5">
                    <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <Settings size={16} className="text-gray-500" />
                        <span>Settings</span>
                      </div>
                      <span className="text-[11px] text-gray-400">↑+Ctrl+,</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <Globe size={16} className="text-gray-500" />
                        <span>Language</span>
                      </div>
                      <ChevronUp size={14} className="text-gray-400 rotate-90" />
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors">
                      <HelpCircle size={16} className="text-gray-500" />
                      <span>Get help</span>
                    </button>
                  </div>

                  <div className="h-px bg-gray-100 mx-3 my-0.5" />

                  <div className="py-1.5">
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors">
                      <ArrowUpCircle size={16} className="text-gray-500" />
                      <span>Upgrade plan</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors">
                      <Download size={16} className="text-gray-500" />
                      <span>Download Claude for Windows</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <Info size={16} className="text-gray-500" />
                        <span>Learn more</span>
                      </div>
                      <ChevronUp size={14} className="text-gray-400 rotate-90" />
                    </button>
                  </div>

                  <div className="h-px bg-gray-100 mx-3 my-0.5" />

                  <div className="py-1.5">
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-[13px] text-gray-700 transition-colors">
                      <LogOut size={16} className="text-gray-500" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}

              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[#E4E2DD] cursor-pointer transition-colors ${showProfileMenu ? 'bg-[#E4E2DD]' : ''}`}
              >
                  <div className="w-7 h-7 rounded-full bg-[#333333] text-white flex items-center justify-center font-medium text-xs shrink-0">
                      {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 opacity-100">
                      <div className="font-medium text-xs truncate text-claude-text">{user.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">Free plan</div>
                  </div>
                  <ChevronUp size={12} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </>
        )}
        
        {/* Closed State - Just icon at top (handled in header) */}
        {!isOpen && (
            <div className="flex-1 flex flex-col items-center mt-4 gap-4">
                 <button 
                    onClick={startNewChat}
                    className="p-2 rounded-lg hover:bg-[#E4E2DD] text-claude-text transition-colors"
                    title="New Chat"
                 >
                    <Plus size={20} />
                 </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;