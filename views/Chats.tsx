
import React from 'react';
import { Chat, User } from '../types';
import { getAllUsers } from '../services/storage';
import { Search, Users, Bell } from 'lucide-react';

interface ChatsProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
  onOpenNotifications: () => void;
  notificationCount: number;
}

export const Chats: React.FC<ChatsProps> = ({ chats, onSelectChat, onOpenNotifications, notificationCount }) => {
  
  const allUsers = getAllUsers();

  const getChatDisplay = (chat: Chat) => {
    if (chat.isGroup) {
        return {
            name: chat.groupName || 'Group Event',
            image: chat.groupImage || 'https://picsum.photos/100/100?blur',
            isGroup: true
        };
    }
    const user = allUsers.find(u => u.id === chat.userId);
    return {
        name: user ? user.name : 'Unknown User',
        image: user ? user.images[0] : 'https://via.placeholder.com/100',
        isGroup: false
    };
  };

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col">
       <div className="p-6 pt-safe pb-4 shadow-sm z-10 transition-colors bg-white">
         <div className="flex justify-between items-center mb-4 mt-4">
             <h1 className="text-3xl font-serif font-bold text-rose-900">
                 Messages
             </h1>
             <button 
                onClick={onOpenNotifications}
                className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors relative"
             >
                <Bell size={20} />
                {notificationCount > 0 && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
             </button>
         </div>
         <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
             <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 text-sm bg-rose-50 ring-rose-200 border border-rose-100"
             />
         </div>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar pb-[100px] bg-rose-50">
          {chats.length === 0 ? (
              <div className="text-center text-rose-400 mt-20">
                  <p className="font-medium">No connections yet.</p>
              </div>
          ) : (
              chats.map(chat => {
                  const display = getChatDisplay(chat);
                  return (
                    <button 
                        key={chat.id} 
                        onClick={() => onSelectChat(chat)}
                        className="w-full bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]"
                    >
                        <div className="relative">
                            <img src={display.image} alt={display.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                            {chat.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 animate-pulse">
                                    {chat.unreadCount}
                                </div>
                            )}
                            {display.isGroup && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white text-white">
                                    <Users size={10} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-slate-800">{display.name}</h3>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                                {chat.lastMessage}
                            </p>
                        </div>
                    </button>
                  );
              })
          )}
       </div>
    </div>
  );
};
