import React from 'react';
import { MessageSquare } from 'lucide-react';

const mockGridItems = [
  { id: 1, title: 'Summarizing Preferences', time: '13 minutes ago' },
  { id: 2, title: 'Rendering an SVG Robot', time: '3 hours ago' },
  { id: 3, title: 'Avoiding Sharing Sensitive Information', time: '23 hours ago' },
  { id: 4, title: 'Assistance Available', time: '23 hours ago' },
  { id: 5, title: 'Friendly Robot Illustration', time: '23 hours ago' },
  { id: 6, title: 'Cyberpunk City Illustration', time: '2 days ago' },
];

const RecentChatsGrid: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mt-12 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <MessageSquare size={16} />
            Your recent chats
        </h2>
        <button className="text-sm text-gray-500 hover:text-gray-800">View all →</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {mockGridItems.map((item) => (
          <div 
            key={item.id} 
            className="group bg-white p-4 rounded-xl border border-claude-border shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-24"
          >
            <h3 className="font-medium text-claude-text text-sm line-clamp-2 leading-relaxed">
              {item.title}
            </h3>
            <span className="text-xs text-gray-400 group-hover:text-gray-500">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentChatsGrid;